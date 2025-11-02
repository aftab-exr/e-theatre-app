import { Routes, Route } from 'react-router-dom'

// We'll create these pages in the next step
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RoomPage from './pages/RoomPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rooms/:roomId" element={<RoomPage />} />
    </Routes>
  )
}

export default App