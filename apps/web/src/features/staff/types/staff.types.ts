import { type CampusRef } from '@/types/common';

// --- Staff -------------------------------------------------------------------------

export type StaffType = 'teaching' | 'non_teaching';

export type EmployeeStatus = 'active' | 'on_leave' | 'resigned' | 'terminated';

export type EmploymentType = 'full_time' | 'part_time' | 'contract';

export interface EmployeeListItem {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  staffType: StaffType;
  designation: string;
  department: string | null;
  employmentType: EmploymentType;
  joinDate: string;
  status: EmployeeStatus;
  userId: string | null;
  campus: CampusRef;
}

export interface TeacherAssignment {
  id: string;
  academicYear: { id: string; name: string; isCurrent: boolean };
  subject: { id: string; name: string; code: string };
  section: { id: string; name: string; schoolClass: { name: string; level: number }; campus: { code: string } };
  employee?: { id: string; employeeNo: string; firstName: string; lastName: string };
}

export interface EmployeeDetail extends EmployeeListItem {
  gender: 'male' | 'female' | 'other' | null;
  dateOfBirth: string | null;
  campusId: string;
  profile: {
    address: string | null;
    nationalId: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    bloodGroup: string | null;
  } | null;
  teacherProfile: { specialization: string | null; bio: string | null } | null;
  qualifications: { id: string; degree: string; institution: string; yearCompleted: number | null; grade: string | null }[];
  experiences: { id: string; organization: string; role: string; startDate: string; endDate: string | null }[];
  statusHistory: { id: string; fromStatus: EmployeeStatus | null; toStatus: EmployeeStatus; reason: string | null; changedAt: string }[];
  teacherAssignments: TeacherAssignment[];
  user: { id: string; email: string; status: string; lastLoginAt: string | null; userRoles: { role: { key: string; name: string } }[] } | null;
}

export interface StaffSummary {
  teaching: number;
  nonTeaching: number;
  onLeave: number;
  withLogin: number;
  total: number;
}
