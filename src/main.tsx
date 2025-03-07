import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css'
import Home from './routes/Home'
import { ImageProvider } from './context/ImageContext';
import TranscriptionPage from './routes/TranscriptionPage.tsx';

function Test() {

    const [thing, setThing] = useState({});

    useEffect(() => {
      (async () => {
        const response = await fetch(`/api/v1/`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data); // Process the JSON data
        console.log(response)
        setThing(data)
      })();
    }, [])

    return (
      <p>
         {`${JSON.stringify(thing)}` }
      </p>
    )
}

const Main = () => {
  return (
    <Router>
      <Routes>
        <Route path="/test" element={<Test />} />
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
