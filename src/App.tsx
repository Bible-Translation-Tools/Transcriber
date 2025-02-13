import './App.css'
import TranscriptionPage from './routes/TranscriptionPage'
import { ImageProvider } from './context/ImageContext'; // Import your context

function App() {
  return (
    <>
      <ImageProvider>
        <TranscriptionPage />
      </ImageProvider>
    </>
  )
}

export default App
