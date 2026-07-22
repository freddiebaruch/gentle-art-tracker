import { useState, useContext } from 'react'
import { Plus, Search, ChevronDown, ChevronUp, Trash2, Edit3, ExternalLink, X, Video, Network, LayoutGrid, Link2, ArrowRight } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import { CATEGORIES, CONNECTION_TYPES, GRIP_TYPES, CONFIDENCE_LABELS } from '../constants'

const EMPTY_FORM = {
  name: '', category: 'guard', confidence: 5,
  grips: [], notes: '', videos: [''], lastTrained: ''
}

function getCategory(categoryId) {
  return CATEGORIES.find(category => category.id === categoryId)
}

function getConnectionType(typeId) {
  return CONNECTION_TYPES.find(type => type.id === typeId) || { label: 'Connection' }
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
    setForm(f => { const videos = [...(f.videos || [])]; videos[i] = val; return { ...f, videos } })
  }

  function removeVideo(i) {
    setForm(f => ({ ...f, videos: f.videos.filter((_, idx) => idx !== i) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, videos: (form.videos || []).filter(video => video.trim()) })
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
            {CATEGORIES.map(category => <option key={category.id} value={category.id}>{category.icon} {category.label}</option>)}
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
          {(form.grips || []).map((grip, i) => <GripTag key={i} grip={grip} onRemove={() => removeGrip(i)} />)}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select className="input-field" style={{ maxWidth: '110px' }}
            value={gripInput.type} onChange={e => setGripInput(grip => ({ ...grip, type: e.target.value }))}>
            {GRIP_TYPES.map(type => <option key={type}>{type}</option>)}
          </select>
          <input className="input-field" placeholder="e.g. Cross-collar sleeve"
            value={gripInput.detail} onChange={e => setGripInput(grip => ({ ...grip, detail: e.target.value }))}
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
        {(form.videos || ['']).map((video, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            <input className="input-field" placeholder="YouTube / Instagram URL"
              value={video} onChange={e => updateVideo(i, e.target.value)} />
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

function ConnectionEditor({ source, techniques, onSave, onCancel }) {
  const availableTargets = techniques.filter(technique => technique.id !== source.id)
  const [targetId, setTargetId] = useState(availableTargets[0]?.id || '')
  const [type, setType] = useState('attack')

  if (availableTargets.length === 0) {
    return (
      <div className="connection-editor connection-editor-empty">
        <div>
          <span className="connection-editor-kicker">Technique connections</span>
          <strong>Add another technique first</strong>
          <p>Connections are made between techniques already in your library.</p>
        </div>
        <button type="button" onClick={onCancel} className="connection-editor-close" aria-label="Close connection editor"><X size={16} /></button>
      </div>
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!targetId) return
    onSave({ fromId: source.id, toId: targetId, type })
  }

  return (
    <form className="connection-editor" onSubmit={handleSubmit}>
      <div className="connection-editor-heading">
        <div>
          <span className="connection-editor-kicker">Build a pathway</span>
          <strong>Connect {source.name}</strong>
        </div>
        <button type="button" onClick={onCancel} className="connection-editor-close" aria-label="Close connection editor"><X size={16} /></button>
      </div>
      <div className="connection-editor-grid">
        <div>
          <label>From</label>
          <div className="connection-editor-source">
            <span>{getCategory(source.category)?.icon}</span>
            {source.name}
          </div>
        </div>
        <div>
          <label>Relationship</label>
          <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
            {CONNECTION_TYPES.map(connectionType => <option key={connectionType.id} value={connectionType.id}>{connectionType.label}</option>)}
          </select>
        </div>
        <div>
          <label>To</label>
          <select className="input-field" value={targetId} onChange={e => setTargetId(e.target.value)}>
            {availableTargets.map(technique => <option key={technique.id} value={technique.id}>{getCategory(technique.category)?.icon} {technique.name}</option>)}
          </select>
        </div>
      </div>
      <div className="connection-editor-footer">
        <span>{getConnectionType(type).helper}</span>
        <button type="submit"><Link2 size={14} /> Save connection</button>
      </div>
    </form>
  )
}

function TechniqueCard({ technique, connectionCount, onConnect, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const category = getCategory(technique.category)

  return (
    <div className="technique-card">
      <div className="technique-card-header">
        <div className="technique-card-summary">
          <div className="technique-card-title">
            <span className="technique-card-icon" aria-hidden="true">{category?.icon}</span>
            <span>{technique.name}</span>
          </div>
          <div className="technique-card-meta">
            <span className="technique-category">{category?.label}</span>
            {connectionCount > 0 && <span className="technique-connection-count"><Network size={12} /> {connectionCount} link{connectionCount !== 1 ? 's' : ''}</span>}
            {technique.lastTrained && <span className="technique-last-trained">Trained {technique.lastTrained}</span>}
          </div>
        </div>
        <div className="technique-card-actions">
          <button onClick={() => onConnect(technique)} aria-label={`Connect ${technique.name}`} title="Connect techniques"><Link2 size={15} /></button>
          <button onClick={() => onEdit(technique)} aria-label={`Edit ${technique.name}`}><Edit3 size={15} /></button>
          <button onClick={() => onDelete(technique.id)} aria-label={`Delete ${technique.name}`}><Trash2 size={15} /></button>
        </div>
      </div>

      <ConfidenceBar value={technique.confidence || 0} />

      {technique.grips?.length > 0 && (
        <div className="technique-grips">
          {technique.grips.map((grip, i) => <GripTag key={i} grip={grip} />)}
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
              {technique.notes && <p>{technique.notes}</p>}
              {technique.videos?.filter(video => video).map((video, i) => (
                <a key={i} href={video} target="_blank" rel="noreferrer" className="technique-video-link">
                  <Video size={13} />
                  <span>{video}</span>
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

function FocusNode({ technique, onFocus, active = false }) {
  const category = getCategory(technique.category)
  return (
    <button type="button" onClick={() => onFocus(technique.id)} className={`network-technique-node ${active ? 'active' : ''}`}>
      <span className="network-node-icon" aria-hidden="true">{category?.icon}</span>
      <span className="network-node-copy">
        <strong>{technique.name}</strong>
        <small>{category?.label}</small>
      </span>
    </button>
  )
}

function ConnectionArm({ connection, direction, techniquesById, onFocus }) {
  const linkedTechnique = techniquesById[direction === 'in' ? connection.fromId : connection.toId]
  if (!linkedTechnique) return null
  const type = getConnectionType(connection.type)

  return (
    <div className={`network-arm network-arm-${direction}`}>
      {direction === 'out' && <span className="network-arm-relation">{type.label}<ArrowRight size={14} /></span>}
      <FocusNode technique={linkedTechnique} onFocus={onFocus} />
      {direction === 'in' && <span className="network-arm-relation"><ArrowRight size={14} />{type.label}</span>}
    </div>
  )
}

function TechniqueNetwork({ techniques, connections, focusedTechniqueId, onFocus, onStartConnection, onDeleteConnection }) {
  const [showAll, setShowAll] = useState(false)
  const focusedTechnique = techniques.find(technique => technique.id === focusedTechniqueId) || techniques[0]
  const techniquesById = Object.fromEntries(techniques.map(technique => [technique.id, technique]))
  const incoming = connections.filter(connection => connection.toId === focusedTechnique?.id && techniquesById[connection.fromId])
  const outgoing = connections.filter(connection => connection.fromId === focusedTechnique?.id && techniquesById[connection.toId])
  const visibleIncoming = showAll ? incoming : incoming.slice(0, 4)
  const visibleOutgoing = showAll ? outgoing : outgoing.slice(0, 4)
  const hiddenCount = Math.max(0, incoming.length - visibleIncoming.length) + Math.max(0, outgoing.length - visibleOutgoing.length)
  const focusedConnections = [...incoming, ...outgoing]

  return (
    <section className="network-view" aria-label="Technique network">
      <div className="network-toolbar">
        <div>
          <span className="network-kicker">Focus map</span>
          <h2>Study one decision at a time.</h2>
          <p>Only direct links are shown, so your network stays useful instead of becoming a maze.</p>
        </div>
        <div className="network-toolbar-actions">
          <label className="network-focus-select">
            <span>Focus technique</span>
            <select className="input-field" value={focusedTechnique?.id || ''} onChange={e => { onFocus(e.target.value); setShowAll(false) }}>
              {techniques.map(technique => <option key={technique.id} value={technique.id}>{getCategory(technique.category)?.icon} {technique.name}</option>)}
            </select>
          </label>
          <button type="button" className="network-add-connection" onClick={() => onStartConnection(focusedTechnique)}>
            <Link2 size={15} /> Add connection
          </button>
        </div>
      </div>

      <div className="network-map">
        <div className="network-map-column network-map-incoming">
          <div className="network-map-label">Into {focusedTechnique.name}</div>
          {visibleIncoming.length > 0 ? visibleIncoming.map(connection => (
            <ConnectionArm key={connection.id} connection={connection} direction="in" techniquesById={techniquesById} onFocus={onFocus} />
          )) : <p className="network-empty-column">No routes into this move yet.</p>}
        </div>

        <div className="network-map-focus">
          <span className="network-focus-halo" aria-hidden="true" />
          <span className="network-focus-label">Your focus</span>
          <FocusNode technique={focusedTechnique} onFocus={onFocus} active />
          <span className="network-focus-count">{focusedConnections.length} direct connection{focusedConnections.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="network-map-column network-map-outgoing">
          <div className="network-map-label">From {focusedTechnique.name}</div>
          {visibleOutgoing.length > 0 ? visibleOutgoing.map(connection => (
            <ConnectionArm key={connection.id} connection={connection} direction="out" techniquesById={techniquesById} onFocus={onFocus} />
          )) : <p className="network-empty-column">No options linked from this move yet.</p>}
        </div>
      </div>

      {hiddenCount > 0 && (
        <button type="button" className="network-show-more" onClick={() => setShowAll(true)}>Show {hiddenCount} more direct link{hiddenCount !== 1 ? 's' : ''}</button>
      )}
      {showAll && (incoming.length > 4 || outgoing.length > 4) && (
        <button type="button" className="network-show-more" onClick={() => setShowAll(false)}>Show fewer links</button>
      )}

      <div className="network-register">
        <div className="network-register-heading">
          <div>
            <span className="network-kicker">Link register</span>
            <h3>Connections around {focusedTechnique.name}</h3>
          </div>
          <span>{focusedConnections.length}</span>
        </div>
        {focusedConnections.length === 0 ? (
          <p className="network-register-empty">Start with one meaningful connection. You can add another whenever it becomes useful.</p>
        ) : (
          <div className="network-register-list">
            {focusedConnections.map(connection => {
              const from = techniquesById[connection.fromId]
              const to = techniquesById[connection.toId]
              return (
                <div key={connection.id} className="network-register-row">
                  <button type="button" onClick={() => onFocus(from.id)}>{from.name}</button>
                  <span className="network-register-type">{getConnectionType(connection.type).label}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                  <button type="button" onClick={() => onFocus(to.id)}>{to.name}</button>
                  <button type="button" className="network-remove-link" onClick={() => onDeleteConnection(connection.id)} aria-label={`Remove link from ${from.name} to ${to.name}`}><X size={14} /></button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default function TechniqueLibrary() {
  const { techniques, connections, addTechnique, updateTechnique, deleteTechnique, addConnection, deleteConnection } = useContext(StoreContext)
  const [view, setView] = useState('cards')
  const [showForm, setShowForm] = useState(false)
  const [editingTechnique, setEditingTechnique] = useState(null)
  const [connectingTechnique, setConnectingTechnique] = useState(null)
  const [focusedTechniqueId, setFocusedTechniqueId] = useState('')
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

  function focusTechnique(id) {
    setFocusedTechniqueId(id)
    setConnectingTechnique(null)
  }

  function saveConnection(connection) {
    addConnection(connection)
    setConnectingTechnique(null)
    setFocusedTechniqueId(connection.fromId)
  }

  const filtered = techniques
    .filter(technique => {
      const matchCategory = activeCategory === 'all' || technique.category === activeCategory
      const matchSearch = !search || technique.name.toLowerCase().includes(search.toLowerCase()) || technique.notes?.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
    .sort((a, b) => {
      if (sortBy === 'confidence') return (b.confidence || 0) - (a.confidence || 0)
      if (sortBy === 'recent') return new Date(b.lastTrained || 0) - new Date(a.lastTrained || 0)
      return a.name.localeCompare(b.name)
    })

  return (
    <div>
      <div className="library-header">
        <div>
          <h1 className="font-display">TECHNIQUE LIBRARY</h1>
          <p className="font-mono">{techniques.length} technique{techniques.length !== 1 ? 's' : ''} catalogued · {connections.length} connection{connections.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTechnique(null); setConnectingTechnique(null) }} className="library-add-technique">
          <Plus size={15} /> Add Technique
        </button>
      </div>

      <div className="library-view-toggle" role="tablist" aria-label="Technique library views">
        <button type="button" role="tab" aria-selected={view === 'cards'} className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}><LayoutGrid size={15} /> Cards</button>
        <button type="button" role="tab" aria-selected={view === 'network'} className={view === 'network' ? 'active' : ''} onClick={() => { setView('network'); setFocusedTechniqueId(current => current || techniques[0]?.id || '') }}><Network size={15} /> Network</button>
      </div>

      {showForm && !editingTechnique && <TechniqueForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      {editingTechnique && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--accent)' }}>EDITING:</span>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{editingTechnique.name}</span>
            <button onClick={() => setEditingTechnique(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto' }}><X size={15} /></button>
          </div>
          <TechniqueForm initial={editingTechnique} onSave={handleSave} onCancel={() => setEditingTechnique(null)} />
        </div>
      )}

      {connectingTechnique && (
        <ConnectionEditor key={connectingTechnique.id} source={connectingTechnique} techniques={techniques} onSave={saveConnection} onCancel={() => setConnectingTechnique(null)} />
      )}

      {view === 'cards' && (
        <>
          <div className="library-category-filters">
            <button onClick={() => setActiveCategory('all')} className={`tag-pill ${activeCategory === 'all' ? 'active' : ''}`}>All ({techniques.length})</button>
            {CATEGORIES.map(category => (
              <button key={category.id} onClick={() => setActiveCategory(category.id)} className={`tag-pill ${activeCategory === category.id ? 'active' : ''}`}>
                {category.icon} {category.label} ({techniques.filter(technique => technique.category === category.id).length})
              </button>
            ))}
          </div>

          <div className="library-search-row">
            <div className="library-search-box">
              <Search size={13} />
              <input className="input-field" placeholder="Search techniques..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field library-sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="confidence">Sort: Confidence</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="library-empty-state">
              <div>🥋</div>
              <p className="font-display">{techniques.length === 0 ? 'START YOUR LIBRARY' : 'NO RESULTS'}</p>
              <span>{techniques.length === 0 ? 'Add your first technique above' : 'Try a different search or filter'}</span>
            </div>
          ) : (
            <div className="technique-grid">
              {filtered.map(technique => (
                <TechniqueCard key={technique.id} technique={technique}
                  connectionCount={connections.filter(connection => connection.fromId === technique.id || connection.toId === technique.id).length}
                  onConnect={techniqueToConnect => { setConnectingTechnique(techniqueToConnect); setEditingTechnique(null); setShowForm(false) }}
                  onEdit={techniqueToEdit => { setEditingTechnique(techniqueToEdit); setShowForm(false); setConnectingTechnique(null) }}
                  onDelete={deleteTechnique} />
              ))}
            </div>
          )}
        </>
      )}

      {view === 'network' && techniques.length > 0 && (
        <TechniqueNetwork techniques={techniques} connections={connections} focusedTechniqueId={focusedTechniqueId} onFocus={focusTechnique}
          onStartConnection={technique => setConnectingTechnique(technique)} onDeleteConnection={deleteConnection} />
      )}

      {view === 'network' && techniques.length === 0 && (
        <div className="library-empty-state">
          <div>🕸️</div>
          <p className="font-display">YOUR MAP STARTS HERE</p>
          <span>Add a technique, then connect it to the next part of your game.</span>
        </div>
      )}
    </div>
  )
}
