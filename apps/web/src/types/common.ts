export interface CampusRef {
  id: string;
  name: string;
  code: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type Relation = 'father' | 'mother' | 'guardian' | 'grandparent' | 'sibling' | 'other';

export type Gender = 'male' | 'female' | 'other';

export interface SectionRef {
  id: string;
  name: string;
  schoolClass: { id: string; name: string; level: number };
  campus: CampusRef;
}
