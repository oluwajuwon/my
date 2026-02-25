import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import Aduke from './pages/Aduke';
import Contact from './pages/Contact';
import NewHome from './pages/NewHome';
import NotFound from './pages/NotFound';
import Portfolio from './pages/Portfolio';
import Stories from './pages/Stories';
import * as serviceWorker from './serviceWorker';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <NewHome /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'contact', element: <Contact /> },
      { path: 'stories', element: <Stories /> },
      { path: 'aduke/*', element: <Aduke /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RouterProvider router={router} />
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
