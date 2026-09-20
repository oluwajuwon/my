import activo from "./images/activo-optimized.jpg";
import fff from "./images/fff.jpg";
import kotigo from "./images/kotigo.jpg";
import maka from "./images/makaranta-optimized.jpg";
import pace from "./images/pace-optimized.jpg";
import Secp from "./images/secp.jpg";
import { Project } from "./types";

export const projects: Project[] = [
  {
    id: 1,
    slug: "pace-africa",
    name: "Pace Africa",
    category: "Recruitment platform",
    description: "A recruitment platform connecting job seekers and employers across Africa.",
    technologies: ["JavaScript", "React", "Redux", "Amazon Chime"],
    role: "Frontend engineering",
    image: pace,
    featured: true,
  },
  {
    id: 2,
    slug: "makaranta",
    name: "Makaranta",
    category: "Education platform",
    description: "A student management and learning platform for teachers.",
    technologies: ["JavaScript", "React", "Ant Design", "GraphQL"],
    role: "Frontend engineering",
    image: maka,
    featured: true,
  },
  {
    id: 3,
    slug: "activo",
    name: "Activo",
    category: "Asset management",
    description: "An asset management platform built for companies.",
    technologies: ["JavaScript", "React", "Redux", "PostgreSQL"],
    role: "Frontend engineering",
    image: activo,
    featured: true,
  },
  {
    id: 4,
    slug: "fast-food-fast",
    name: "Fast Food Fast",
    category: "Food ordering",
    description: "A food ordering platform for restaurants.",
    technologies: ["JavaScript", "React", "Redux", "PostgreSQL"],
    role: "Full-stack engineering",
    image: fff,
    featured: false,
  },
  {
    id: 5,
    slug: "kotigo",
    name: "Kotigo",
    category: "Education platform",
    description: "A platform for connecting teachers and students.",
    technologies: ["JavaScript", "React", "Redux", "PostgreSQL"],
    role: "Frontend engineering",
    image: kotigo,
    featured: false,
  },
  {
    id: 6,
    slug: "secp",
    name: "SECP",
    category: "Student administration",
    description: "A platform for managing student enrolment and course registration.",
    technologies: ["JavaScript", "React", "Redux", "PostgreSQL"],
    role: "Frontend engineering",
    image: Secp,
    featured: false,
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const archivedProjects = projects.filter((project) => !project.featured);
export const getProjectBySlug = (slug?: string) => projects.find((project) => project.slug === slug);
