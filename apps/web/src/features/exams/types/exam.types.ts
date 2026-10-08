export interface Band {
  grade: string;
  minPercent: number;
  remark: string;
}

export interface ExamSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  term: { name: string } | null;
  academicYear: { name: string };
  _count: { subjects: number; reportCards: number };
}

export interface Paper {
  id: string;
  classId: string;
  subjectId: string;
  examDate: string | null;
  maxMarks: string;
  passMarks: string;
  subject: { id: string; name: string; code: string };
  schoolClass: { id: string; name: string; level: number };
  _count: { results: number };
}

export interface ExamDetail extends Omit<ExamSummary, '_count' | 'term'> {
  term: { id: string; name: string } | null;
  academicYear: { id: string; name: string };
  gradingScale: { bands: Band[] };
  subjects: Paper[];
}

export interface ProgressRow {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subject: string;
  teacher: string | null;
  students: number;
  entered: number;
}

export interface CardLine {
  subject: string;
  maxMarks: number;
  passMarks: number;
  marks: number | null;
  isAbsent: boolean;
  grade: string;
  passed: boolean;
}

export interface ReportCardRow {
  id: string;
  studentId: string;
  totalMarks: string;
  totalMax: string;
  percentage: string;
  grade: string;
  passed: boolean;
  rank: number | null;
  remarks: string | null;
  student: { id: string; firstName: string; lastName: string; admissionNo: string };
  section: { id: string; name: string; schoolClass: { name: string } };
}

export interface MyReportCard {
  id: string;
  percentage: string;
  grade: string;
  passed: boolean;
  rank: number | null;
  exam: { id: string; name: string; startDate: string; academicYear: { name: string } };
  section: { name: string; schoolClass: { name: string } };
}

export interface ReportCardView {
  school: string;
  sectionSize: number;
  card: {
    id: string;
    totalMarks: string;
    totalMax: string;
    percentage: string;
    grade: string;
    passed: boolean;
    rank: number | null;
    remarks: string | null;
    lines: CardLine[];
    generatedAt: string;
    student: { firstName: string; lastName: string; admissionNo: string };
    section: { name: string; schoolClass: { name: string } };
    exam: { name: string; status: string; startDate: string; endDate: string; academicYear: { name: string }; gradingScale: { bands: Band[] } };
  };
}

export interface Marksheet {
  exam: { id: string; name: string; status: 'draft' | 'published' };
  section: { id: string; name: string; schoolClass: { name: string } };
  paper: { maxMarks: string; passMarks: string; subject: { name: string } };
  rows: { id: string; firstName: string; lastName: string; admissionNo: string; rollNo: number | null; marks: string | null; isAbsent: boolean; remarks: string | null }[];
}

export interface MarkEntry {
  studentId: string;
  isAbsent: boolean;
  marks: string | null;
  remarks: string | null;
}

export interface PaperInput {
  subjectId: string;
  examDate: string | null;
  maxMarks: string;
  passMarks: string;
}

export type ExamAction = 'report-cards' | 'publish' | 'unpublish';
