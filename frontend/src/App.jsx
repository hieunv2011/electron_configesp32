import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WifiConfigForm from './components/WifiConfigForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <WifiConfigForm />
    </>
  )
}

export default App
