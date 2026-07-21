import { useState } from 'react'
import { StoreContext } from './store/StoreContext'
import { useStore } from './store/useStore'
import Nav from './components/Nav'
import TechniqueLibrary from './components/TechniqueLibrary'
import SessionLog from './components/SessionLog'
import GameHub from './components/GameHub'

export default function App() {
  const store = useStore()
  const [activeHub, setActiveHub] = useState('library')

  return (
    <StoreContext.Provider value={store}>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Nav activeHub={activeHub} setActiveHub={setActiveHub} profile={store.profile} />
        <main style={{ paddingTop: '56px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
            {activeHub === 'library' && <TechniqueLibrary />}
            {activeHub === 'session' && <SessionLog />}
            {activeHub === 'game' && <GameHub />}
          </div>
        </main>
      </div>
    </StoreContext.Provider>
  )
}
