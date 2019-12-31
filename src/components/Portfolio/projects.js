import fff from './images/fff.jpg';
import activo from './images/activo.png';
import kotigo from './images/kotigo.jpg';
import Secp from './images/secp.jpg';

export const projects = [
  {
    id: 1,
    name: 'Fast Food Fast',
    description: 'A Food ordering platform for restaurants',
    technologies: ['javascript', 'react', 'redux', 'postgres'],
    role: 'full-stack',
    image: fff,
    url: '',
  },
  {
    id: 2,
    name: 'Activo',
    description: 'An asset management platform built to manage all assets of all staff members',
    technologies: ['typescript', 'javascript', 'react', 'redux', 'postgres'],
    role: 'front-end',
    image: activo,
    url: '',
  },
  {
    id: 3,
    name: 'Kotigo',
    description: 'A mobile application for listening to e-books',
    technologies: ['javascript', 'react','react-native' ,'redux', 'react-nagivation'],
    role: 'Mobile',
    image: kotigo,
    url: '',
  },
  {
    id: 3,
    name: 'SECP',
    description: 'A web application for finding student debtors in various schools',
    technologies: ['javascript', 'nodeJS', 'expressJS', 'postgreSQL' ,'sequelize'],
    role: 'back-end',
    image: Secp,
    url: '',
  }
]