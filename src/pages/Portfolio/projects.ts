import { Project } from './types';
import fff from './images/fff.jpg';
import activo from './images/activo.png';
import kotigo from './images/kotigo.jpg';
import Secp from './images/secp.jpg';
import maka from './images/makaranta.png';
import pace from './images/pace.png';

export const projects: Project[] = [
  {
    id: 1,
    name: 'Pace Africa',
    description: 'A recruitment platform for job seekers and employers in Africa',
    technologies: ['javascript', 'react', 'redux', 'amazon chime'],
    role: 'Frontend',
    image: pace,
    url: '',
  },
  {
    id: 2,
    name: 'Makaranta',
    description: 'A student management platform for teachers and also learning management system for teachers',
    technologies: ['javascript', 'react', 'ant design', 'GraphQL'],
    role: 'Frontend',
    image: maka,
    url: '',
  },
  {
    id: 3,
    name: 'Fast Food Fast',
    description: 'A Food ordering platform for restaurants',
    technologies: ['javascript', 'react', 'redux', 'postgres'],
    role: 'Full Stack',
    image: fff,
    url: '',
  },
  {
    id: 4,
    name: 'Activo',
    description: 'An asset management platform for companies',
    technologies: ['javascript', 'react', 'redux', 'postgres'],
    role: 'Frontend',
    image: activo,
    url: '',
  },
  {
    id: 5,
    name: 'Kotigo',
    description: 'A platform for connecting teachers and students',
    technologies: ['javascript', 'react', 'redux', 'postgres'],
    role: 'Frontend',
    image: kotigo,
    url: '',
  },
  {
    id: 6,
    name: 'SECP',
    description: 'A platform for managing student enrollment and course registration',
    technologies: ['javascript', 'react', 'redux', 'postgres'],
    role: 'Frontend',
    image: Secp,
    url: '',
  }
];
