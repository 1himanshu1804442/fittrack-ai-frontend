import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'

function App() {
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken') || null)
  const [activeUserId, setActiveUserId] = useState(localStorage.getItem('userId') || null)
  const [showRegister, setShowRegister] = useState(false)

  const handleLoginSuccess = (token, userId) => {
    localStorage.setItem('jwtToken', token)
    localStorage.setItem('userId', userId)
    setJwtToken(token)
    setActiveUserId(userId)
  }

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('userId')
    setJwtToken(null)
    setActiveUserId(null)
  }

  if (jwtToken && activeUserId) {
    return <Dashboard jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} />
  }

  return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
      <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setShowRegister(true)}
      />
  )
}

export default App