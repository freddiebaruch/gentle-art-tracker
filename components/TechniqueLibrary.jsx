import { useState, useContext } from 'react'
import { Plus, Search, ChevronDown, ChevronUp, Trash2, Edit3, ExternalLink, X, Video } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import { CATEGORIES, GRIP_TYPES, CONFIDENCE_LABELS } from '../constants'

const EMPTY_FORM = {
  name: '', category: 'guard', confidence: 5,
  grips: [], notes: '', videos: [''], lastTrained: ''
}

function ConfidenceBar({ value }) {
  const pct = (value / 10) * 100
  const color = value >= 7 ? 'var(--green)' : value >= 4 ? 'var(--accent)' : 'var(--red)'
  return (
    <div className="technique-confidence" aria-label={`Confidence: ${value} out of 10, ${CONFIDENCE_LABELS[value]}`}>
      <div className="technique-confidence-copy">
        <span className="technique-confidence-label">Confidence</span>
        <span className="technique-confidence-level">{CONFIDENCE_LABELS[value]}</span>
      </div>
      <div className="technique-confidence-track" aria-hidden="true">
        <div className="technique-confidence-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="technique-confidence-score" style={{ color }}>
        {value}<small>/10</small>
      </span>
    </div>
  )
}

function GripTag({ grip, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)',
      color: 'var(--accent)', borderRadius: '100px', padding: '2px 10px',
      fontSize: '11px', fontFamily: "'DM Mono', monospace",
    }}>
      {grip.type}: {grip.detail}
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', lineHeight: 1 }}>
          <X size={10} />
        </button>
      )}
    </span>
  )
}

function TechniqueForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial })
  const [gripInput, setGripInput] = useState({ type: 'Sleeve', detail: '' })

  function addGrip() {
    if (!gripInput.detail.trim()) return
    setForm(f => ({ ...f, grips: [...(f.grips || []), { ...gripInput }] }))
    setGripInput(g => ({ ...g, detail: '' }))
  }

  function removeGrip(i) {
    setForm(f => ({ ...f, grips: f.grips.filter((_, idx) => idx !== i) }))
  }

  function addVideo() {
    setForm(f => ({ ...f, videos: [...(f.videos || []), ''] }))
  }

  function updateVideo(i, val) {
    setForm(f => { const v = [...(f.videos || [])]; v[i] = val; return { ...f, videos: v } })
  }

  function removeVideo(i) {
    setForm(f => ({ ...f, videos: f.videos.filter((_, idx) => idx !== i) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, videos: (form.videos || []).filter(v => v.trim()) })
  }

  const card = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px' }
  const label = { display: 'block', fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace", marginBottom: '4px', textTransform: 'uppercase' }
  const row2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }

  return (
    <form onSubmit={handleSubmit} style={{ ...card, marginBottom: '20px' }}>
      <div style={row2}>
        <div>
          <label style={label}>Name *</label>
          <input className="input-field" placeholder="e.g. Knee Cut Pass"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label style={label}>Category</label>
          <select className="input-field" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={label}>Confidence</label>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--accent)' }}>
            {form.confidence}/10 — {CONFIDENCE_LABELS[form.confidence]}
          </span>
        </div>
        <input type="range" min={1} max={10} value={form.confidence}
          onChange={e => setForm(f => ({ ...f, confidence: +e.target.value }))}
          style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={label}>Gi Grips</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {(form.grips || []).map((g, i) => <GripTag key={i} grip={g} onRemove={() => removeGrip(i)} />)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="input-field" style={{ maxWidth: '110px' }}
            value={gripInput.type} onChange={e => setGripInput(g => ({ ...g, type: e.target.value }))}>
            {GRIP_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input className="input-field" placeholder="e.g. Cross-collar sleeve"
            value={gripInput.detail} onChange={e => setGripInput(g => ({ ...g, detail: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGrip() } }} />
          <button type="button" onClick={addGrip} style={{
            padding: '8px 12px', borderRadius: '6px', whiteSpace: 'nowrap', cursor: 'pointer',
            background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
          }}>+ Add</button>
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={label}>Notes & Cues</label>
        <textarea className="input-field" placeholder="Personal cues, setups, common mistakes..."
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={label}>Reference Videos</label>
        {(form.videos || ['']).map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <input className="input-field" placeholder="YouTube / Instagram URL"
              value={v} onChange={e => updateVideo(i, e.target.value)} />
            {(form.videos || []).length > 1 && (
              <button type="button" onClick={() => removeVideo(i)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addVideo} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
          fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'DM Sans', sans-serif",
        }}>
          <Plus size={12} /> Add another video
        </button>
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label style={label}>Last Trained</label>
        <input type="date" className="input-field" value={form.lastTrained}
          onChange={e => setForm(f => ({ ...f, lastTrained: e.target.value }))} />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{
          flex: 1, padding: '9px', borderRadius: '8px', cursor: 'pointer',
          background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)',
          color: 'var(--accent)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: '500',
        }}>Save Technique</button>
        <button type="button" onClick={onCancel} style={{
          padding: '9px 20px', borderRadius: '8px', cursor: 'pointer',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
        }}>Cancel</button>
      </div>
    </form>
  )
}

function TechniqueCard({ technique, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORIES.find(c => c.id === technique.category)

  return (
    <div className="technique-card">
      <div className="technique-card-header">
        <div className="technique-card-summary">
          <div className="technique-card-title">
            <span className="technique-card-icon" aria-hidden="true">{cat?.icon}</span>
            <span>{technique.name}</span>
          </div>
          <div className="technique-card-meta">
            <span className="technique-category">{cat?.label}</span>
            {technique.lastTrained && (
              <span className="technique-last-trained">
                Trained {technique.lastTrained}
              </span>
            )}
          </div>
        </div>
        <div className="technique-card-actions">
          <button onClick={() => onEdit(technique)}
            aria-label={`Edit ${technique.name}`}>
            <Edit3 size={15} />
          </button>
          <button onClick={() => onDelete(technique.id)}
            aria-label={`Delete ${technique.name}`}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <ConfidenceBar value={technique.confidence || 0} />

      {technique.grips?.length > 0 && (
        <div className="technique-grips">
          {technique.grips.map((g, i) => <GripTag key={i} grip={g} />)}
        </div>
      )}

      {(technique.notes || technique.videos?.length > 0) && (
        <>
          <button onClick={() => setExpanded(!expanded)} className="technique-details-toggle">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Less' : 'Details'}
          </button>

          {expanded && (
            <div className="technique-details">
              {technique.notes && (
                <p>
                  {technique.notes}
                </p>
              )}
              {technique.videos?.filter(v => v).map((v, i) => (
                <a key={i} href={v} target="_blank" rel="noreferrer" className="technique-video-link">
                  <Video size={13} />
                  <span>{v}</span>
                  <ExternalLink size={11} />
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function TechniqueLibrary() {
  const { techniques, addTechnique, updateTechnique, deleteTechnique } = useContext(StoreContext)
  const [showForm, setShowForm] = useState(false)
  const [editingTechnique, setEditingTechnique] = useState(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  function handleSave(data) {
    if (editingTechnique) {
      updateTechnique(editingTechnique.id, data)
      setEditingTechnique(null)
    } else {
      addTechnique(data)
      setShowForm(false)
    }
  }

  const filtered = techniques
    .filter(t => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory
      const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.notes?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'confidence') return (b.confidence || 0) - (a.confidence || 0)
      if (sortBy === 'recent') return new Date(b.lastTrained || 0) - new Date(a.lastTrained || 0)
      return a.name.localeCompare(b.name)
    })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '38px', margin: '0 0 4px', color: 'var(--text-primary)' }}>TECHNIQUE LIBRARY</h1>
          <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
            {techniques.length} technique{techniques.length !== 1 ? 's' : ''} catalogued
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTechnique(null) }} style={{
          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
          borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
          background: 'var(--accent-glow)', border: '1px solid var(--accent-dim)', color: 'var(--accent)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <Plus size={15} /> Add Technique
        </button>
      </div>

      {showForm && !editingTechnique && (
        <TechniqueForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {editingTechnique && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent)' }}>EDITING:</span>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{editingTechnique.name}</span>
            <button onClick={() => setEditingTechnique(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}>
              <X size={15} />
            </button>
          </div>
          <TechniqueForm initial={editingTechnique} onSave={handleSave} onCancel={() => setEditingTechnique(null)} />
        </div>
      )}

      {/* Category Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        <button onClick={() => setActiveCategory('all')}
          className={`tag-pill ${activeCategory === 'all' ? 'active' : ''}`}>
          All ({techniques.length})
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`tag-pill ${activeCategory === cat.id ? 'active' : ''}`}>
            {cat.icon} {cat.label} ({techniques.filter(t => t.category === cat.id).length})
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-field" style={{ paddingLeft: '30px' }} placeholder="Search techniques..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" style={{ maxWidth: '160px' }}
          value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="confidence">Sort: Confidence</option>
          <option value="recent">Sort: Recent</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥋</div>
          <p className="font-display" style={{ fontSize: '24px', color: 'var(--text-muted)', margin: '0 0 8px' }}>
            {techniques.length === 0 ? 'START YOUR LIBRARY' : 'NO RESULTS'}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {techniques.length === 0 ? 'Add your first technique above' : 'Try a different search or filter'}
          </p>
        </div>
      ) : (
        <div className="technique-grid">
          {filtered.map(t => (
            <TechniqueCard key={t.id} technique={t}
              onEdit={t => { setEditingTechnique(t); setShowForm(false) }}
              onDelete={deleteTechnique} />
          ))}
        </div>
      )}
    </div>
  )
}
