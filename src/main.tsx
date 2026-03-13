import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { TokenStudioProvider } from './context/TokenStudioContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TokenStudioProvider>
      <App />
    </TokenStudioProvider>
  </StrictMode>
);
