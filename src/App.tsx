import './App.css'
import Home from './routes/Home'
import TranscriptionPage from './routes/TranscriptionPage'
import { ImageProvider } from './context/ImageContext'; // Import your context

function App() {
  return (
    <>
      <ImageProvider>
        {/* <Home/> */}
        <TranscriptionPage />
      </ImageProvider>
    </>
  )
}

export default App
