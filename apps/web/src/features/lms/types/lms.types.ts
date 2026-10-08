export type MaterialType = 'pdf' | 'document' | 'video' | 'image' | 'link';

export interface CourseSummary {
  id: string;
  sectionId: string;
  subjectId: string;
  teacher: string | null;
  subject: { id: string; name: string; code: string };
  section: { id: string; name: string; schoolClass: { id: string; name: string; level: number } };
  academicYear: { id: string; name: string };
  _count: { materials: number; assignments: number };
}

export interface Material {
  id: string;
  title: string;
  description: string | null;
  type: MaterialType;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  url: string | null;
  isPublished: boolean;
  createdAt: string;
  _count: { comments: number };
}

export interface SubmissionSummary {
  status: 'submitted' | 'graded';
  isLate: boolean;
  submittedAt: string;
  grade: { marks: string; feedback?: string | null } | null;
}

export interface AssignmentSummary {
  id: string;
  title: string;
  dueAt: string;
  maxMarks: string;
  allowLate: boolean;
  mode: 'file' | 'text' | 'file_or_text';
  isPublished?: boolean;
  _count?: { submissions: number };
  submissions?: SubmissionSummary[];
  course?: { id: string; subject: { name: string } };
}

export interface CourseDetail extends Omit<CourseSummary, '_count'> {
  canManage: boolean;
  materials: Material[];
  assignments: AssignmentSummary[];
}

export interface Comment {
  id: string;
  parentCommentId: string | null;
  body: string | null;
  isPinned: boolean;
  deleted: boolean;
  createdAt: string;
  author: { id: string; name: string; isStaff: boolean };
  canDelete: boolean;
}

export interface Submission extends SubmissionSummary {
  id: string;
  studentId: string;
  textBody: string | null;
  fileName: string | null;
  hasFile: boolean;
  grade: { marks: string; feedback: string | null; gradedAt: string } | null;
}

export interface AssignmentDetail {
  id: string;
  title: string;
  instructions: string;
  dueAt: string;
  maxMarks: string;
  allowLate: boolean;
  mode: 'file' | 'text' | 'file_or_text';
  isPublished: boolean;
  fileName: string | null;
  course: Omit<CourseSummary, '_count' | 'teacher'>;
  canManage: boolean;
  roster?: { id: string; firstName: string; lastName: string; admissionNo: string; rollNo: number | null; submission: Submission | null }[];
  submission?: Submission | null;
}

export type RosterRow = NonNullable<AssignmentDetail['roster']>[number];

export interface ChildRef {
  id: string;
  firstName: string;
  lastName: string;
}
