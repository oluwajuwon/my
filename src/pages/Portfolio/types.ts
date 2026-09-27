export type WorkImageOrientation = "portrait" | "landscape" | "square";

export interface WorkImage {
  src: string;
  alt: string;
  caption?: string;
  orientation?: WorkImageOrientation;
  width?: number;
  height?: number;
}

export interface WorkSection {
  heading: string;
  body: string[];
}

export interface WorkExperience {
  slug: string;
  company: string;
  product?: string;
  role?: string;
  period?: string;
  location?: string;
  current?: boolean;
  category?: string;
  summary?: string;
  focus?: string[];
  technologies?: string[];
  images?: WorkImage[];
  overview?: string[];
  roleSummary?: string[];
  productDescription?: string[];
  challenge?: string[];
  whatIWorkedOn?: string[];
  engineering?: string[];
  selectedProblems?: string[];
  impact?: string[];
  sections?: WorkSection[];
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  technologies: string[];
  role: string;
  image: string;
  url?: string;
  period?: string;
  sections?: WorkSection[];
}
