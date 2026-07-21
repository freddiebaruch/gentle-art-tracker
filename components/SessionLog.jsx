import { useState, useContext, useRef, useCallback } from 'react'
import { Mic, MicOff, Trash2, Tag, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import { CATEGORIES } from '../constants'

function useVoice(onTranscript) {
  const recognitionRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (e) => {
      let full = ''
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript
      onTranscript(full)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    rec.start()
    setListening(true)
  }, [onTranscript])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, supported, start, stop }
}

function SessionCard({ session, techniques, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const tagged = techniques.filter(t => session.taggedTechniques?.includes(t.id))

  return (
    <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '10px' }}>
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {session.date || new Date(session.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {session.duration && <span className="tag-pill">{session.duration}</span>}
              {session.sessionType && <span className="tag-pill">{session.sessionType}</span>}
            </div>
            {session.title && <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>{session.title}</div>}
          </div>
          <button onClick={() => onDelete(session.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <Trash2 size={13} />
          </button>
        </div>

        {tagged.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
            {tagged.map(t => {
              const cat = CATEGORIES.find(c => c.id === t.category)
              return <span key={t.id} className="tag-pill active">{cat?.icon} {t.name}</span>
            })}
          </div>
        )}

        {session.transcript && (
          <button onClick={() => setExpanded(!expanded)} style={{
            display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px',
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '11px', fontFamily: "'DM Sans', sans-serif",
          }}>
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {expanded ? 'Hide notes' : 'Session notes'}
          </button>
        )}
      </div>

      {expanded && session.transcript && (
        <div style={{ padding: '0 14px 14px' }}>
          <p style={{
            fontSize: '12px', lineHeight: '1.7', color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border)', paddingTop: '12px', margin: 0,
          }}>{session.transcript}</p>
        </div>
      )}
    </div>
  )
}

export default function SessionLog() {
  const { sessions, techniques, addSession, deleteSession, updateTechnique } = useContext(StoreContext)
  const [transcript, setTranscript] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [duration, setDuration] = useState('')
  const [sessionType, setSessionType] = useState('')
  const [taggedIds, setTaggedIds] = useState([])
  const [showTagPanel, setShowTagPanel] = useState(false)
  const [tagSearch, setTagSearch] = useState('')

  const { listening, supported, start, stop } = useVoice(t => setTranscript(t))

  function handleSave() {
    if (!transcript.trim() && !title.trim()) return
    addSession({ title, date, duration, sessionType, transcript, taggedTechniques: taggedIds })
    taggedIds.forEach(id => updateTechnique(id, { lastTrained: date }))
    setTranscript(''); setTitle(''); setDuration(''); setSessionType(''); setTaggedIds([]); setShowTagPanel(false)
  }

  const canSave = transcript.trim() || title.trim()
  const label = { display: 'block', fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", marginBottom: '4px', textTransform: 'uppercase' }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 className="font-display" style={{ fontSize: '38px', margin: '0 0 4px', color: 'var(--text-primary)' }}>SESSION LOG</h1>
        <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {/* Entry Card */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
        <div className="font-mono" style={{ fontSize: '10px', color: 'var(--accent)', marginBottom: '14px' }}>NEW SESSION</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div><label style={label}>Date</label><input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} /></div>
          <div><label style={label}>Title</label><input className="input-field" placeholder="e.g. Monday Gi" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div><label style={label}>Duration</label><input className="input-field" placeholder="90 min" value={duration} onChange={e => setDuration(e.target.value)} /></div>
          <div><label style={label}>Type</label>
            <select className="input-field" value={sessionType} onChange={e => setSessionType(e.target.value)}>
              <option value="">Any</option>
              {['Drilling','Sparring','Comp Prep','Open Mat','Class','Private'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={label}>Session Notes</label>
            {supported ? (
              <button onClick={() => listening ? stop() : start()}
                className={listening ? 'recording-pulse' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                  borderRadius: '100px', cursor: 'pointer', fontSize: '12px',
                  fontFamily: "'DM Sans', sans-serif",
                  background: listening ? 'rgba(192,57,43,0.12)' : 'var(--bg-elevated)',
                  border: `1px solid ${listening ? 'var(--red)' : 'var(--border)'}`,
                  color: listening ? 'var(--red)' : 'var(--text-secondary)',
                }}>
                {listening ? <MicOff size={13} /> : <Mic size={13} />}
                {listening ? 'Stop' : 'Dictate'}
              </button>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Voice not supported</span>
            )}
          </div>
          <textarea className="input-field" rows={5}
            placeholder="Speak or type freely... e.g. 'Spent 3 rounds in half guard, hit the knee cut twice from torreando...'"
            value={transcript} onChange={e => setTranscript(e.target.value)} />
          {listening && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--red)', animation: 'pulse-record 1s ease infinite' }} />
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--red)' }}>Listening...</span>
            </div>
          )}
        </div>

        {/* Tag Techniques */}
        <div style={{ marginBottom: '14px' }}>
          <button onClick={() => setShowTagPanel(!showTagPanel)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
            color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>
            <Tag size={13} /> Tag Techniques
            {taggedIds.length > 0 && (
              <span style={{
                background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)', color: 'var(--accent)',
                borderRadius: '100px', padding: '1px 8px', fontSize: '10px', fontFamily: "'DM Mono', monospace",
              }}>{taggedIds.length} tagged</span>
            )}
          </button>

          {showTagPanel && (
            <div style={{ marginTop: '10px', padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <input className="input-field" style={{ marginBottom: '10px' }} placeholder="Search techniques..."
                value={tagSearch} onChange={e => setTagSearch(e.target.value)} />
              {techniques.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>Add techniques to your library first</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                  {techniques.filter(t => !tagSearch || t.name.toLowerCase().includes(tagSearch.toLowerCase())).map(t => {
                    const cat = CATEGORIES.find(c => c.id === t.category)
                    const tagged = taggedIds.includes(t.id)
                    return (
                      <button key={t.id}
                        onClick={() => setTaggedIds(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])}
                        className={`tag-pill ${tagged ? 'active' : ''}`}>
                        {cat?.icon} {t.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={!canSave} style={{
          width: '100%', padding: '10px', borderRadius: '8px', cursor: canSave ? 'pointer' : 'not-allowed',
          fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: '500',
          background: canSave ? 'var(--accent-glow)' : 'var(--bg-elevated)',
          border: `1px solid ${canSave ? 'var(--accent-dim)' : 'var(--border)'}`,
          color: canSave ? 'var(--accent)' : 'var(--text-muted)',
        }}>Save Session</button>
      </div>

      {sessions.length > 0 && (
        <div>
          <h2 className="font-display" style={{ fontSize: '20px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>HISTORY</h2>
          {sessions.map(s => <SessionCard key={s.id} session={s} techniques={techniques} onDelete={deleteSession} />)}
        </div>
      )}
    </div>
  )
}
