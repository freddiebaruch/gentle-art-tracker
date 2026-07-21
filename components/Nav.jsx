import { useState } from 'react'
import { User } from 'lucide-react'
import ProfilePanel from './ProfilePanel'
import { BELTS } from '../constants'

export default function Nav({ activeHub, setActiveHub, profile, user, onSignOut }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const belt = BELTS.find(b => b.id === profile.belt) || BELTS[0]

  const hubs = [
    { id: 'library', label: 'Technique Library' },
    { id: 'session', label: 'Session Log' },
    { id: 'game', label: 'Your Game' },
    { id: 'competitions', label: 'Competitions' },
  ]

  return (
    <>
      <nav className="app-nav" style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '56px',
      }}>
        <button className="app-brand" onClick={() => setActiveHub('home')} aria-label="Go to home" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="font-display" style={{ fontSize: '18px', color: 'var(--accent)', letterSpacing: '0.08em' }}>
            GET A GRIP
          </div>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>JIU-JITSU TRAINING</div>
        </button>

        <div className="hub-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {hubs.map(hub => (
            <button key={hub.id} onClick={() => setActiveHub(hub.id)} style={{
              color: activeHub === hub.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeHub === hub.id ? 'var(--accent)' : 'transparent'}`,
              cursor: 'pointer', padding: '6px 14px', fontSize: '13px',
              fontWeight: '500', fontFamily: "'DM Sans', sans-serif",
              transition: 'color 0.15s',
            }}>
              {hub.label}
            </button>
          ))}
        </div>

        <button className="profile-trigger" onClick={() => setProfileOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '100px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          cursor: 'pointer', color: 'var(--text-primary)',
          boxShadow: 'none',
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: belt.color, color: belt.textColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '700',
          }}>
            {profile.stripes ?? '—'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif" }}>
            {profile.name || user?.displayName || 'Profile'}
          </span>
          <User size={13} style={{ color: 'var(--text-muted)' }} />
        </button>
      </nav>

      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} user={user} onSignOut={onSignOut} />}
    </>
  )
}
