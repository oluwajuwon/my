export interface ProjectSection {
  heading: string;
  body: string[];
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
  featured: boolean;
  period?: string;
  sections?: ProjectSection[];
}
