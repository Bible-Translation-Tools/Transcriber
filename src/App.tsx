import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './routes/Home'
import UploadImages from './components/UploadImages'
import TranscriptionPage from './routes/TranscriptionPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Home/> */}
      <TranscriptionPage/>
    </>
  )
}

export default App
