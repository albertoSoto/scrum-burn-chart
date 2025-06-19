import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Get the base URL from the environment or use the repository name for GitHub Pages
const getBasename = () => {
  // In production (GitHub Pages), use the repository name as the basename
  if (import.meta.env.PROD) {
    return '/scrum-burn-check';
  }
  return '/';
};

root.render(
  <StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
