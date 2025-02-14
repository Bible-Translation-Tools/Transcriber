import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css'
import Home from './routes/Home'
import { ImageProvider } from './context/ImageContext';
import TranscriptionPage from './routes/TranscriptionPage.tsx';


const Main = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/transcriber" element={<TranscriptionPage />} />
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ImageProvider>
      <Main />
    </ImageProvider>
  </StrictMode>,
);
