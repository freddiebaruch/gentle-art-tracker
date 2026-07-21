import { useState, useContext } from 'react'
import { X, Plus, Trash2, Trophy, ExternalLink, LogOut } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import { BELTS, COMPETITION_RESULTS } from '../constants'

export default function ProfilePanel({ onClose, user, onSignOut }) {
  const { profile, updateProfile, addCompetition, deleteCompetition } = useContext(StoreContext)
  const [compForm, setCompForm] = useState({ tournament: '', date: '', weightClass: '', result: 'Gold 🥇', notes: '', footage: '' })
  const [showCompForm, setShowCompForm] = useState(false)
  const belt = BELTS.find(b => b.id === profile.belt) || BELTS[0]

  function handleSaveComp(e) {
    e.preventDefault()
    if (!compForm.tournament) return
    addCompetition(compForm)
    setCompForm({ tournament: '', date: '', weightClass: '', result: 'Gold 🥇', notes: '', footage: '' })
    setShowCompForm(false)
  }

  const label = { display: 'block', fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", marginBottom: '4px', textTransform: 'uppercase' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)' }} />
      <div style={{
        position: 'relative', width: '380px', height: '100%', overflowY: 'auto',
        background: 'var(--bg-card)', borderLeft: '1px solid var(--border)',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <div className="font-display" style={{ fontSize: '24px', color: 'var(--accent)' }}>PRACTITIONER</div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '20px', borderRadius: '9px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)' }} />
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ overflow: 'hidden', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || 'Signed-in practitioner'}</div>
                <div style={{ overflow: 'hidden', color: 'var(--text-muted)', fontSize: '10px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
              </div>
              <button onClick={() => { onClose(); void onSignOut() }} title="Log out" style={{ display: 'grid', placeItems: 'center', padding: '6px', border: 0, borderRadius: '5px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Belt Display */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ flex: 1, height: '28px', borderRadius: '4px', background: belt.color, position: 'relative', overflow: 'hidden' }}>
                {Array.from({ length: profile.stripes || 0 }).map((_, i) => (
                  <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, width: '10px', right: `${8 + i * 15}px`, background: 'rgba(255,255,255,0.5)' }} />
                ))}
              </div>
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {belt.label} / {profile.stripes || 0} stripe{profile.stripes !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {BELTS.map(b => (
                <button key={b.id} onClick={() => updateProfile({ belt: b.id })}
                  title={b.label} style={{
                    width: '24px', height: '24px', borderRadius: '4px', background: b.color,
                    border: `2px solid ${profile.belt === b.id ? 'var(--accent)' : 'transparent'}`,
                    cursor: 'pointer',
                  }} />
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>Stripes:</span>
                {[0,1,2,3,4].map(n => (
                  <button key={n} onClick={() => updateProfile({ stripes: n })} style={{
                    width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
                    background: profile.stripes === n ? 'var(--accent-glow)' : 'var(--bg-card)',
                    border: `1px solid ${profile.stripes === n ? 'var(--accent-dim)' : 'var(--border)'}`,
                    color: profile.stripes === n ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: "'DM Mono', monospace",
                  }}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            {[
              { key: 'name', label: 'Name', placeholder: 'Your name' },
              { key: 'gym', label: 'Gym', placeholder: 'Academy name' },
              { key: 'coach', label: 'Head Coach', placeholder: 'Coach name' },
              { key: 'height', label: 'Height', placeholder: "e.g. 5'11\"" },
              { key: 'weight', label: 'Weight', placeholder: 'e.g. 82kg' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '10px' }}>
                <label style={label}>{f.label}</label>
                <input className="input-field" placeholder={f.placeholder}
                  value={profile[f.key] || ''}
                  onChange={e => updateProfile({ [f.key]: e.target.value })} />
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trophy size={13} style={{ color: 'var(--accent)' }} />
                <span className="font-display" style={{ fontSize: '18px', color: 'var(--accent)' }}>COMPETITIONS</span>
              </div>
              <button onClick={() => setShowCompForm(!showCompForm)} style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                borderRadius: '6px', cursor: 'pointer', fontSize: '11px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif",
              }}>
                <Plus size={11} /> Add
              </button>
            </div>

            {showCompForm && (
              <form onSubmit={handleSaveComp} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <input className="input-field" placeholder="Tournament name *"
                    value={compForm.tournament} onChange={e => setCompForm(p => ({ ...p, tournament: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <input type="date" className="input-field"
                    value={compForm.date} onChange={e => setCompForm(p => ({ ...p, date: e.target.value }))} />
                  <input className="input-field" placeholder="Weight class"
                    value={compForm.weightClass} onChange={e => setCompForm(p => ({ ...p, weightClass: e.target.value }))} />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <select className="input-field" value={compForm.result} onChange={e => setCompForm(p => ({ ...p, result: e.target.value }))}>
                    {COMPETITION_RESULTS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <input className="input-field" placeholder="Match notes"
                    value={compForm.notes} onChange={e => setCompForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <input className="input-field" placeholder="Footage URL"
                    value={compForm.footage} onChange={e => setCompForm(p => ({ ...p, footage: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{
                    flex: 1, padding: '7px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                    background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)', color: 'var(--accent)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>Save</button>
                  <button type="button" onClick={() => setShowCompForm(false)} style={{
                    padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>Cancel</button>
                </div>
              </form>
            )}

            {(!profile.competitions || profile.competitions.length === 0) && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '16px 0' }}>No competitions yet</p>
            )}
            {profile.competitions?.map(comp => (
              <div key={comp.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{comp.tournament}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{comp.date}</span>
                      {comp.weightClass && <span className="tag-pill">{comp.weightClass}</span>}
                      <span style={{ fontSize: '12px' }}>{comp.result}</span>
                    </div>
                    {comp.notes && <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{comp.notes}</p>}
                    {comp.footage && (
                      <a href={comp.footage} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent)', marginTop: '4px', textDecoration: 'none' }}>
                        <ExternalLink size={10} /> Footage
                      </a>
                    )}
                  </div>
                  <button onClick={() => deleteCompetition(comp.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
