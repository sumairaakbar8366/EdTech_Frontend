import type { ImportSpec } from '@/components/shared/ImportDialog';
import { academicsService } from '@/features/academics/services/academicsService';
import type { Campus, Room, SchoolClass, Subject } from '@/features/academics/types/academics.types';
import { campusService } from '@/features/campuses/services/campusService';
import { parseNumber } from '@/lib/importParsers';
import type { ExportColumn } from '@/lib/spreadsheet';

import { ACADEMICS_KEY } from '@/features/academics/hooks/useAcademics';

export const SUBJECT_EXPORT: ExportColumn<Subject>[] = [
  { header: 'Code', value: (s) => s.code },
  { header: 'Name', value: (s) => s.name },
  { header: 'Taught in classes', value: (s) => s._count?.classSubjects ?? null },
];

export const SUBJECT_IMPORT: ImportSpec<{ name: string; code: string }, { existing: Subject[] }> = {
  title: 'Import subjects',
  name: 'Subjects',
  columns: [
    { key: 'name', header: 'Name', required: true, example: 'General Knowledge' },
    { key: 'code', header: 'Code', required: true, hint: 'Letters, digits, hyphens (max 20)', example: 'GK' },
  ],
  prepare: async () => ({ existing: await academicsService.subjects() }),
  toPayload: (r, { existing }) => {
    const code = r.code!.toUpperCase().replace(/\s+/g, '-');
    if (!/^[A-Z0-9-]{1,20}$/.test(code)) return `Code "${r.code}" must be up to 20 letters, digits or hyphens`;
    if (existing.some((s) => s.code === code)) return `Subject code ${code} already exists`;
    return { name: r.name!, code };
  },
  create: (p) => academicsService.saveSubject(undefined, p),
  invalidate: [ACADEMICS_KEY],
};

export const ROOM_EXPORT: ExportColumn<Room>[] = [
  { header: 'Campus', value: (r) => r.campus.name },
  { header: 'Name', value: (r) => r.name },
  { header: 'Capacity', value: (r) => r.capacity },
];

function campusOf(campuses: Campus[], value: string): Campus | undefined {
  return value ? campuses.find((c) => [c.name, c.code].some((x) => x.toLowerCase() === value.toLowerCase())) : campuses[0];
}

export const ROOM_IMPORT: ImportSpec<{ campusId: string; name: string; capacity?: number }, { campuses: Campus[]; rooms: Room[] }> = {
  title: 'Import rooms',
  name: 'Rooms',
  columns: [
    { key: 'name', header: 'Name', required: true, example: 'Science Lab' },
    { key: 'campus', header: 'Campus', hint: 'Name or code; empty = first campus', example: 'Main Campus' },
    { key: 'capacity', header: 'Capacity', hint: 'Number of seats', example: '35' },
  ],
  prepare: async () => {
    const [campuses, rooms] = await Promise.all([campusService.list(), academicsService.rooms()]);
    return { campuses, rooms };
  },
  toPayload: (r, { campuses, rooms }) => {
    const campus = campusOf(campuses, r.campus ?? '');
    if (!campus) return `Campus "${r.campus}" not found`;
    if (rooms.some((x) => x.campusId === campus.id && x.name.toLowerCase() === r.name!.toLowerCase())) return `Room "${r.name}" already exists at ${campus.name}`;
    const capacity = r.capacity ? parseNumber(r.capacity) : null;
    if (r.capacity && (capacity === null || !Number.isInteger(capacity) || capacity < 1)) return `Capacity "${r.capacity}" should be a whole number`;
    return { campusId: campus.id, name: r.name!, ...(capacity && { capacity }) };
  },
  create: (p) => academicsService.createRoom(p),
  invalidate: [ACADEMICS_KEY],
};

/** One row per section (classes without sections get one row). */
export interface ClassRow { className: string; level: number; section: string; campus: string; capacity: number | null }
export function classRows(classes: SchoolClass[]): ClassRow[] {
  return classes.flatMap((c) =>
    c.sections.length
      ? c.sections.map((s) => ({ className: c.name, level: c.level, section: s.name, campus: s.campus.name, capacity: s.capacity }))
      : [{ className: c.name, level: c.level, section: '', campus: '', capacity: null }],
  );
}
export const CLASS_EXPORT: ExportColumn<ClassRow>[] = [
  { header: 'Class', value: (r) => r.className },
  { header: 'Level', value: (r) => r.level },
  { header: 'Section', value: (r) => r.section },
  { header: 'Campus', value: (r) => r.campus },
  { header: 'Capacity', value: (r) => r.capacity },
];

interface ClassCtx { classes: SchoolClass[]; campuses: Campus[] }
/** Creates the class if it is new (by name), then the section if given. */
export const CLASS_IMPORT: ImportSpec<{ className: string; level: number; section: string; campusId: string; capacity?: number }, ClassCtx> = {
  title: 'Import classes & sections',
  name: 'Classes and sections',
  notes: ['Existing classes are matched by name; a row only adds the missing class and/or section.'],
  columns: [
    { key: 'className', header: 'Class', required: true, example: 'Grade 6' },
    { key: 'level', header: 'Level', required: true, hint: 'Order number 1–100 (Grade 6 = 6)', example: '6' },
    { key: 'section', header: 'Section', hint: 'e.g. A; empty = class only', example: 'A' },
    { key: 'campus', header: 'Campus', hint: 'Name or code; empty = first campus', example: 'Main Campus' },
    { key: 'capacity', header: 'Capacity', hint: 'Seats in the section', example: '30' },
  ],
  prepare: async () => {
    const [classes, campuses] = await Promise.all([academicsService.classes(), campusService.list()]);
    return { classes, campuses };
  },
  toPayload: (r, { classes, campuses }) => {
    const level = parseNumber(r.level!);
    if (level === null || !Number.isInteger(level) || level < 1 || level > 100) return `Level "${r.level}" should be a whole number 1–100`;
    const campus = campusOf(campuses, r.campus ?? '');
    if (!campus) return `Campus "${r.campus}" not found`;
    const cls = classes.find((c) => c.name.toLowerCase() === r.className!.toLowerCase());
    if (cls && (!r.section || cls.sections.some((s) => s.name.toLowerCase() === r.section!.toLowerCase() && s.campusId === campus.id))) return 'Already exists';
    const capacity = r.capacity ? parseNumber(r.capacity) : null;
    if (r.capacity && (capacity === null || !Number.isInteger(capacity) || capacity < 1)) return `Capacity "${r.capacity}" should be a whole number`;
    return { className: r.className!, level, section: r.section ?? '', campusId: campus.id, ...(capacity && { capacity }) };
  },
  create: async (p) => {
    // Re-read so a class created by an earlier row is reused.
    let cls = (await academicsService.classes()).find((c) => c.name.toLowerCase() === p.className.toLowerCase());
    if (!cls) {
      await academicsService.saveClass(undefined, { name: p.className, level: p.level });
      cls = (await academicsService.classes()).find((c) => c.name.toLowerCase() === p.className.toLowerCase())!;
    }
    if (p.section) await academicsService.createSection({ classId: cls.id, campusId: p.campusId, name: p.section, ...(p.capacity && { capacity: p.capacity }) });
  },
  invalidate: [ACADEMICS_KEY],
};
