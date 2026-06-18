import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard'
import History from './History'
import Analytics from './Analytics'
import AIWorkout from './AIWorkout'
import Nutrition from './Nutrition'

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

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#161B22', color: '#fff', border: '1px solid #374151' } }} />
      {jwtToken && activeUserId ? (
        currentView === 'history' ? (
          <History jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
        ) : currentView === 'analytics' ? (
          <Analytics jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
        ) : currentView === 'ai-workout' ? (
          <AIWorkout jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
        ) : currentView === 'nutrition' ? (
          <Nutrition jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
        ) : (
          <Dashboard jwtToken={jwtToken} activeUserId={activeUserId} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} />
        )
      ) : showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
          <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />
      )}
    </>
  )
}

export default App