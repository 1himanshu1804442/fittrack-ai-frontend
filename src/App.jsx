import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import History from './History'

function App() {
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('jwtToken') || null)
  const [activeUserId, setActiveUserId] = useState(localStorage.getItem('userId') || null)
  const [showRegister, setShowRegister] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')

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
    if (currentView === 'history') {
      return <History jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
    }
    return <Dashboard jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
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