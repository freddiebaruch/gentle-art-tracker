import { useState } from 'react'
import './home.css'
import { StoreContext } from './store/StoreContext'
import { useStore } from './store/useStore'
import Nav from './components/Nav'
import Home from './components/Home'
import TechniqueLibrary from './components/TechniqueLibrary'
import SessionLog from './components/SessionLog'
import GameHub from './components/GameHub'
import CompetitionHub from './components/CompetitionHub'

export default function App() {
  const store = useStore()
  const [activeHub, setActiveHub] = useState('home')

  return (
    <StoreContext.Provider value={store}>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Nav activeHub={activeHub} setActiveHub}{setActiveHub} profile={store.profile} />
        <main className="app-main" style={{ paddingTop: '56px' }}>
          <div className={activeHub === 'home' ? 'app-content app-content-home' : 'app-content'}>
            {activeHub === 'home' && <Home onNavigate={setActiveHub} />}
            {activeHub === 'library' && <TechniqueLibrary />}
            {activeHub === 'session' && <SessionLog />}
            {activeHub === 'game' && <GameHub />}
            {activeHub === 'competitions' && <CompetitionHub />}
          </div>
        </main>
      </div>
    </StoreContext.Provider>
  )
}
