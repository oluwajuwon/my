import fff from './images/fff.jpg';
import activo from './images/activo.png';
import kotigo from './images/kotigo.jpg';
import Secp from './images/secp.jpg';
import maka from './images/makaranta.png'
import pace from './images/pace.png'

export const projects = [
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
    role: 'full-stack',
    image: fff,
    url: '',
  },
  {
    id: 4,
    name: 'Activo',
    description: 'An asset management platform built to manage all assets of all staff members',
    technologies: ['typescript', 'javascript', 'react', 'redux', 'postgres'],
    role: 'front-end',
    image: activo,
    url: '',
  },
  {
    id: 5,
    name: 'Kotigo',
    description: 'A mobile application for listening to e-books',
    technologies: ['javascript', 'react','react-native' ,'redux', 'react-nagivation'],
    role: 'Mobile',
    image: kotigo,
    url: '',
  },
  {
    id: 6,
    name: 'SECP',
    description: 'A web application for finding student debtors in various schools',
    technologies: ['javascript', 'nodeJS', 'expressJS', 'postgreSQL' ,'sequelize'],
    role: 'back-end',
    image: Secp,
    url: '',
  }
]