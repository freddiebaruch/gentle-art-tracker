import { useState, useContext, useEffect, useMemo, useRef } from 'react'
import { Plus, Search, ChevronDown, ChevronUp, Trash2, Edit3, ExternalLink, X, Video, Network, LayoutGrid, Link2, ArrowRight, ZoomIn, ZoomOut, Maximize2, RotateCcw, PanelLeftClose, PanelLeftOpen, MousePointer2 } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import { CATEGORIES, CONNECTION_TYPES, GRIP_TYPES, CONFIDENCE_LABELS } from '../constants'

const EMPTY_FORM = {
  name: '', category: 'guard', confidence: 5,
  grips: [], notes: '', videos: [''], lastTrained: '',
  playbook: {
    purpose: '', objective: '', controlChecklist: [], dangerSignals: [], refinements: [], personalCues: '',
  },
}

const PLAYBOOK_SECTIONS = [
  { id: 'controlChecklist', label: 'Control checklist', helper: 'The non-negotiables you should be able to feel and check.', placeholder: 'e.g. Break their posture before attacking' },
  { id: 'dangerSignals', label: 'Key dangers', helper: 'What tells you the position is slipping or unsafe.', placeholder: 'e.g. Do not let them stand upright' },
  { id: 'refinements', label: 'Refinements', helper: 'Details to layer in once the basics are reliable.', placeholder: 'e.g. Change angle before chasing the submission' },
]

function normalisePlaybook(playbook = {}) {
  const safePlaybook = playbook && typeof playbook === 'object' ? playbook : {}
  return {
    ...EMPTY_FORM.playbook,
    ...safePlaybook,
    controlChecklist: Array.isArray(safePlaybook.controlChecklist) ? safePlaybook.controlChecklist : [],
    dangerSignals: Array.isArray(safePlaybook.dangerSignals) ? safePlaybook.dangerSignals : [],
    refinements: Array.isArray(safePlaybook.refinements) ? safePlaybook.refinements : [],
  }
}

function playbookHasContent(playbook) {
  if (!playbook) return false
  return Boolean(
    playbook.purpose?.trim()
    || playbook.objective?.trim()
    || playbook.personalCues?.trim()
    || playbook.controlChecklist?.some(item => item?.trim())
    || playbook.dangerSignals?.some(item => item?.trim())
    || playbook.refinements?.some(item => item?.trim()),
  )
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

function PlaybookListEditor({ section, items, onChange }) {
  const visibleItems = items.length > 0 ? items : ['']

  function updateItem(index, value) {
    const nextItems = [...visibleItems]
    nextItems[index] = value
    onChange(nextItems)
  }

  function removeItem(index) {
    onChange(visibleItems.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="playbook-list-editor">
      <div className="playbook-field-heading">
        <div>
          <label>{section.label}</label>
          <p>{section.helper}</p>
        </div>
      </div>
      <div className="playbook-list-inputs">
        {visibleItems.map((item, index) => (
          <div key={`${section.id}-${index}`} className="playbook-list-input-row">
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <input
              className="input-field"
              placeholder={section.placeholder}
              value={item}
              onChange={event => updateItem(index, event.target.value)}
            />
            {(visibleItems.length > 1 || item) && (
              <button type="button" onClick={() => removeItem(index)} aria-label={`Remove ${section.label.toLowerCase()} item`}><X size={14} /></button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="playbook-add-item" onClick={() => onChange([...items, ''])}><Plus size={13} /> Add point</button>
    </div>
  )
}

function PlaybookSection({ label, children }) {
  return (
    <section className="technique-playbook-section">
      <span>{label}</span>
      {children}
    </section>
  )
}

function TechniquePlaybook({ playbook }) {
  if (!playbookHasContent(playbook)) return null
  const safePlaybook = normalisePlaybook(playbook)
  const listSections = PLAYBOOK_SECTIONS.filter(section => safePlaybook[section.id].some(item => item?.trim()))

  return (
    <div className="technique-playbook-readonly">
      <div className="technique-playbook-readonly-heading">
        <span>Technique playbook</span>
        <small>Keep this move consistent under pressure.</small>
      </div>
      <div className="technique-playbook-readonly-strategy">
        {safePlaybook.purpose && <PlaybookSection label="Purpose"><p>{safePlaybook.purpose}</p></PlaybookSection>}
        {safePlaybook.objective && <PlaybookSection label="Main job"><p>{safePlaybook.objective}</p></PlaybookSection>}
      </div>
      {listSections.length > 0 && (
        <div className="technique-playbook-readonly-lists">
          {listSections.map(section => (
            <PlaybookSection key={section.id} label={section.label}>
              <ul>{safePlaybook[section.id].filter(item => item?.trim()).map((item, index) => <li key={`${section.id}-${index}`}>{item}</li>)}</ul>
            </PlaybookSection>
          ))}
        </div>
      )}
      {safePlaybook.personalCues && (
        <div className="technique-playbook-cue-readonly">
          <span>Personal cue</span>
          <strong>{safePlaybook.personalCues}</strong>
        </div>
      )}
    </div>
  )
}

function TechniqueForm({ initial = EMPTY_FORM, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial, playbook: normalisePlaybook(initial.playbook) })
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

  function updatePlaybook(field, value) {
    setForm(current => ({ ...current, playbook: { ...current.playbook, [field]: value } }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    const playbook = normalisePlaybook(form.playbook)
    onSave({
      ...form,
      notes: form.notes.trim(),
      videos: (form.videos || []).filter(video => video.trim()),
      playbook: {
        ...playbook,
        purpose: playbook.purpose.trim(),
        objective: playbook.objective.trim(),
        personalCues: playbook.personalCues.trim(),
        controlChecklist: playbook.controlChecklist.filter(item => item?.trim()),
        dangerSignals: playbook.dangerSignals.filter(item => item?.trim()),
        refinements: playbook.refinements.filter(item => item?.trim()),
      },
    })
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

      <section className="technique-playbook-form">
        <div className="technique-playbook-form-heading">
          <div>
            <span>Technique playbook</span>
            <strong>Keep the important details easy to find.</strong>
          </div>
          <p>Pathways such as attacks, entries, and transitions belong in the Network.</p>
        </div>

        <div className="technique-playbook-strategy">
          <div>
            <label>Purpose</label>
            <p>Why this position or technique matters in your game.</p>
            <textarea className="input-field" placeholder="e.g. Slow the fight down, control posture, and create reliable attacks."
              value={form.playbook.purpose} onChange={event => updatePlaybook('purpose', event.target.value)} />
          </div>
          <div>
            <label>Main job / next objective</label>
            <p>What you are trying to make happen from here.</p>
            <textarea className="input-field" placeholder="e.g. Break posture, create an angle, and force a reaction."
              value={form.playbook.objective} onChange={event => updatePlaybook('objective', event.target.value)} />
          </div>
        </div>

        <div className="technique-playbook-list-grid">
          {PLAYBOOK_SECTIONS.map(section => (
            <PlaybookListEditor key={section.id} section={section} items={form.playbook[section.id]}
              onChange={items => updatePlaybook(section.id, items)} />
          ))}
        </div>

        <div className="technique-playbook-cues">
          <label>Personal cue</label>
          <p>A short reminder you want in your head during a round.</p>
          <input className="input-field" placeholder='e.g. "Control first, then attack."'
            value={form.playbook.personalCues} onChange={event => updatePlaybook('personalCues', event.target.value)} />
        </div>
      </section>

      <div className="legacy-notes-field">
        <label style={label}>Unsorted notes (optional)</label>
        <p>Keep older thoughts here temporarily; move the useful ones into the playbook when you are ready.</p>
        <textarea className="input-field" placeholder="Anything that does not yet fit a playbook section..."
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
  const hasPlaybook = playbookHasContent(technique.playbook)
  const hasVideos = technique.videos?.some(video => video)
  const hasDetails = hasPlaybook || technique.notes || hasVideos

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

      {hasDetails && (
        <>
          <button onClick={() => setExpanded(!expanded)} className="technique-details-toggle">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Close playbook' : hasPlaybook ? 'Study playbook' : 'Details'}
          </button>

          {expanded && (
            <div className="technique-details">
              <TechniquePlaybook playbook={technique.playbook} />
              {technique.notes && (
                <div className="technique-legacy-notes">
                  <span>Unsorted notes</span>
                  <p>{technique.notes}</p>
                </div>
              )}
              {hasVideos && technique.videos.filter(video => video).map((video, i) => (
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

const BOARD_WIDTH = 1500
const BOARD_HEIGHT = 1000
const BOARD_CENTRE = { x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2 }
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 }

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function pointAt(angle, distance) {
  const radians = (angle * Math.PI) / 180
  return {
    x: Math.round(BOARD_CENTRE.x + Math.cos(radians) * distance),
    y: Math.round(BOARD_CENTRE.y + Math.sin(radians) * distance),
  }
}

function placeAcrossArc(ids, startAngle, endAngle, distance, positions) {
  ids.forEach((id, index) => {
    const ratio = ids.length === 1 ? 0.5 : index / (ids.length - 1)
    positions[id] = pointAt(startAngle + (endAngle - startAngle) * ratio, distance)
  })
}

function createBoardPositions(techniques, connections, focusedId) {
  const positions = { [focusedId]: BOARD_CENTRE }
  const incomingOnly = []
  const outgoingOnly = []
  const bothWays = []
  const directIds = new Set()

  techniques.forEach(technique => {
    if (technique.id === focusedId) return
    const hasIncoming = connections.some(connection => connection.fromId === technique.id && connection.toId === focusedId)
    const hasOutgoing = connections.some(connection => connection.fromId === focusedId && connection.toId === technique.id)
    if (!hasIncoming && !hasOutgoing) return
    directIds.add(technique.id)
    if (hasIncoming && hasOutgoing) bothWays.push(technique.id)
    else if (hasIncoming) incomingOnly.push(technique.id)
    else outgoingOnly.push(technique.id)
  })

  placeAcrossArc(incomingOnly, 135, 225, 300, positions)
  placeAcrossArc(outgoingOnly, -45, 45, 300, positions)
  placeAcrossArc(bothWays, 70, 110, 300, positions)

  const backgroundIds = techniques
    .filter(technique => technique.id !== focusedId && !directIds.has(technique.id))
    .map(technique => technique.id)
  placeAcrossArc(backgroundIds, 232, 488, 430, positions)

  return positions
}

function FocusBoardNode({ technique, position, focused, direct, onFocus, onPointerDown }) {
  const category = getCategory(technique.category)
  return (
    <button
      type="button"
      className={`focus-board-node ${focused ? 'is-focused' : ''} ${direct ? 'is-direct' : ''} ${!focused && !direct ? 'is-background' : ''}`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onPointerDown={event => onPointerDown(event, technique.id)}
      onClick={() => onFocus(technique.id)}
      aria-label={`Focus ${technique.name}`}
    >
      <span className="focus-board-node-icon" aria-hidden="true">{category?.icon}</span>
      <span className="focus-board-node-copy">
        <strong>{technique.name}</strong>
        <small>{category?.label}</small>
      </span>
      {focused && <span className="focus-board-node-status">Focus</span>}
    </button>
  )
}

function BoardConnection({ connection, from, to, fromPosition, toPosition, highlighted }) {
  if (!from || !to || !fromPosition || !toPosition) return null
  const type = getConnectionType(connection.type)
  const middleX = (fromPosition.x + toPosition.x) / 2
  const middleY = (fromPosition.y + toPosition.y) / 2
  const curveOffset = highlighted ? 32 : 18
  const controlX = middleX + (fromPosition.y - toPosition.y) * 0.1
  const controlY = middleY + (toPosition.x - fromPosition.x) * 0.1 + curveOffset
  const relationWidth = Math.max(52, type.label.length * 7 + 20)

  return (
    <g className={`focus-board-connection ${highlighted ? 'is-highlighted' : ''}`}>
      <path d={`M ${fromPosition.x} ${fromPosition.y} Q ${controlX} ${controlY} ${toPosition.x} ${toPosition.y}`} markerEnd={highlighted ? 'url(#focus-board-arrow)' : undefined} />
      {highlighted && (
        <g transform={`translate(${middleX - relationWidth / 2} ${middleY - 12})`} className="focus-board-connection-label">
          <rect width={relationWidth} height="24" rx="12" />
          <text x={relationWidth / 2} y="16" textAnchor="middle">{type.label}</text>
        </g>
      )}
    </g>
  )
}

function ConnectionDrawerRow({ connection, techniquesById, onFocus, onDelete }) {
  const from = techniquesById[connection.fromId]
  const to = techniquesById[connection.toId]
  if (!from || !to) return null

  return (
    <div className="focus-board-drawer-row">
      <button type="button" onClick={() => onFocus(from.id)}>{from.name}</button>
      <span>{getConnectionType(connection.type).label}</span>
      <ArrowRight size={12} aria-hidden="true" />
      <button type="button" onClick={() => onFocus(to.id)}>{to.name}</button>
      <button type="button" className="focus-board-remove-link" onClick={() => onDelete(connection.id)} aria-label={`Remove link from ${from.name} to ${to.name}`}><X size={13} /></button>
    </div>
  )
}

function FocusBoardCanvas({ techniques, connections, focusedTechnique, techniquesById, defaultPositions, savedBoard, onFocus, onStartConnection, onDeleteConnection, onSaveLayout, onResetLayout }) {
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [nodePositions, setNodePositions] = useState(() => ({ ...defaultPositions, ...(savedBoard?.positions || {}) }))
  const [viewport, setViewport] = useState(() => ({ ...DEFAULT_VIEWPORT, ...(savedBoard?.viewport || {}) }))
  const positionsRef = useRef({ ...defaultPositions, ...(savedBoard?.positions || {}) })
  const viewportRef = useRef({ ...DEFAULT_VIEWPORT, ...(savedBoard?.viewport || {}) })
  const dragRef = useRef(null)
  const draggedRef = useRef(false)
  const saveTimerRef = useRef(null)

  useEffect(() => () => {
    window.clearTimeout(saveTimerRef.current)
  }, [])

  if (!focusedTechnique) return null

  const focusedConnections = connections.filter(connection => (
    (connection.fromId === focusedTechnique.id || connection.toId === focusedTechnique.id)
    && techniquesById[connection.fromId]
    && techniquesById[connection.toId]
  ))
  const directIds = new Set(focusedConnections.flatMap(connection => [connection.fromId, connection.toId]))
  const backgroundConnections = connections.filter(connection => (
    connection.fromId !== focusedTechnique.id
    && connection.toId !== focusedTechnique.id
    && techniquesById[connection.fromId]
    && techniquesById[connection.toId]
  ))
  const orderedTechniques = [...techniques].sort((first, second) => {
    const firstRank = first.id === focusedTechnique.id ? 0 : directIds.has(first.id) ? 1 : 2
    const secondRank = second.id === focusedTechnique.id ? 0 : directIds.has(second.id) ? 1 : 2
    return firstRank - secondRank || first.name.localeCompare(second.name)
  })

  function positionFor(id) {
    return nodePositions[id] || defaultPositions[id] || BOARD_CENTRE
  }

  function saveBoard(focusId = focusedTechnique.id) {
    onSaveLayout(focusId, { positions: positionsRef.current, viewport: viewportRef.current })
  }

  function scheduleBoardSave() {
    window.clearTimeout(saveTimerRef.current)
    const focusId = focusedTechnique.id
    saveTimerRef.current = window.setTimeout(() => saveBoard(focusId), 350)
  }

  function setBoardViewport(nextViewport, save = false) {
    viewportRef.current = nextViewport
    setViewport(nextViewport)
    if (save) saveBoard()
  }

  function changeZoom(amount) {
    const nextViewport = {
      ...viewportRef.current,
      zoom: clamp(Number((viewportRef.current.zoom + amount).toFixed(2)), 0.55, 1.7),
    }
    setBoardViewport(nextViewport, true)
  }

  function handleWheel(event) {
    event.preventDefault()
    const amount = event.deltaY > 0 ? -0.08 : 0.08
    const nextViewport = {
      ...viewportRef.current,
      zoom: clamp(Number((viewportRef.current.zoom + amount).toFixed(2)), 0.55, 1.7),
    }
    setBoardViewport(nextViewport)
    scheduleBoardSave()
  }

  function handleCanvasPointerDown(event) {
    if (event.button !== 0 || event.target !== event.currentTarget) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    draggedRef.current = false
    dragRef.current = {
      type: 'canvas',
      startX: event.clientX,
      startY: event.clientY,
      viewport: viewportRef.current,
    }
  }

  function handleNodePointerDown(event, techniqueId) {
    if (event.button !== 0) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const position = positionFor(techniqueId)
    draggedRef.current = {
      type: 'node',
      techniqueId,
      startX: event.clientX,
      startY: event.clientY,
      position,
      zoom: viewportRef.current.zoom,
    }
    draggedRef.current.moved = false
    draggedRef.current.draggedTechniqueId = techniqueId
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag) return
    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    if (Math.hypot(deltaX, deltaY) > 4) {
      drag.moved = true
      draggedRef.current = true
    }

    if (drag.type === 'canvas') {
      setBoardViewport({ ...drag.viewport, x: drag.viewport.x + deltaX, y: drag.viewport.y + deltaY })
      return
    }

    const nextPositions = {
      ...positionsRef.current,
      [drag.techniqueId]: {
        x: clamp(Math.round(drag.position.x + deltaX / drag.zoom), 70, BOARD_WIDTH - 70),
        y: clamp(Math.round(drag.position.y + deltaY / drag.zoom), 70, BOARD_HEIGHT - 70),
      },
    }
    positionsRef.current = nextPositions
    setNodePositions(nextPositions)
  }

  function handlePointerUp() {
    if (!dragRef.current) return
    saveBoard()
    dragRef.current = null
    window.setTimeout(() => { draggedRef.current = false }, 0)
  }

  function handleFocus(techniqueId) {
    if (draggedRef.current) return
    onFocus(techniqueId)
  }

  function handleReset() {
    const nextPositions = defaultPositions
    positionsRef.current = nextPositions
    viewportRef.current = DEFAULT_VIEWPORT
    setNodePositions(nextPositions)
    setViewport(DEFAULT_VIEWPORT)
    onResetLayout(focusedTechnique.id)
  }

  return (
    <section className="network-view focus-board-view" aria-label="Technique network board">
      <div className="network-toolbar">
        <div>
          <span className="network-kicker">Focus mode</span>
          <h2>See the choices around one position.</h2>
          <p>Direct links stay clear; the wider game is kept quietly in the background until you need it.</p>
        </div>
        <div className="network-toolbar-actions">
          <label className="network-focus-select">
            <span>Focus technique</span>
            <select className="input-field" value={focusedTechnique.id} onChange={event => onFocus(event.target.value)}>
              {techniques.map(technique => <option key={technique.id} value={technique.id}>{getCategory(technique.category)?.icon} {technique.name}</option>)}
            </select>
          </label>
          <button type="button" className="network-add-connection" onClick={() => onStartConnection(focusedTechnique)}>
            <Link2 size={15} /> Add pathway
          </button>
        </div>
      </div>

      <div className={`focus-board ${drawerOpen ? '' : 'drawer-collapsed'}`}>
        <aside className="focus-board-drawer" aria-label="Focused pathways">
          <div className="focus-board-drawer-topline">
            <span>Pathways</span>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Hide pathways panel"><PanelLeftClose size={15} /></button>
          </div>
          <div className="focus-board-drawer-focus">
            <span>Studying</span>
            <strong>{focusedTechnique.name}</strong>
            <small>{focusedConnections.length} direct link{focusedConnections.length !== 1 ? 's' : ''}</small>
          </div>
          <div className="focus-board-drawer-list">
            {focusedConnections.length === 0 ? (
              <p>Start with one meaningful pathway. It will appear here and on the map.</p>
            ) : focusedConnections.map(connection => (
              <ConnectionDrawerRow key={connection.id} connection={connection} techniquesById={techniquesById} onFocus={onFocus} onDelete={onDeleteConnection} />
            ))}
          </div>
          <button type="button" className="focus-board-new-pathway" onClick={() => onStartConnection(focusedTechnique)}><Plus size={14} /> New pathway</button>
        </aside>

        <div
          className="focus-board-canvas"
          onWheel={handleWheel}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {!drawerOpen && <button type="button" className="focus-board-open-drawer" onClick={() => setDrawerOpen(true)} aria-label="Show pathways panel"><PanelLeftOpen size={16} /></button>}
          <div className="focus-board-canvas-copy">
            <span>Focused study</span>
            <p><MousePointer2 size={12} /> Drag nodes or canvas · scroll to zoom</p>
          </div>
          <div
            className="focus-board-world"
            style={{ transform: `translate(calc(-50% + ${viewport.x}px), calc(-50% + ${viewport.y}px)) scale(${viewport.zoom})` }}
          >
            <svg className="focus-board-lines" width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} aria-hidden="true">
              <defs>
                <marker id="focus-board-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto">
                  <path d="M0,0 L0,7 L7,3.5 z" />
                </marker>
              </defs>
              {backgroundConnections.map(connection => (
                <BoardConnection key={connection.id} connection={connection} from={techniquesById[connection.fromId]} to={techniquesById[connection.toId]} fromPosition={positionFor(connection.fromId)} toPosition={positionFor(connection.toId)} />
              ))}
              {focusedConnections.map(connection => (
                <BoardConnection key={connection.id} connection={connection} from={techniquesById[connection.fromId]} to={techniquesById[connection.toId]} fromPosition={positionFor(connection.fromId)} toPosition={positionFor(connection.toId)} highlighted />
              ))}
            </svg>
            {orderedTechniques.map(technique => (
              <FocusBoardNode
                key={technique.id}
                technique={technique}
                position={positionFor(technique.id)}
                focused={technique.id === focusedTechnique.id}
                direct={directIds.has(technique.id)}
                onFocus={handleFocus}
                onPointerDown={handleNodePointerDown}
              />
            ))}
          </div>

          <div className="focus-board-controls" aria-label="Canvas controls">
            <button type="button" onClick={() => changeZoom(0.1)} aria-label="Zoom in"><ZoomIn size={16} /></button>
            <span>{Math.round(viewport.zoom * 100)}%</span>
            <button type="button" onClick={() => changeZoom(-0.1)} aria-label="Zoom out"><ZoomOut size={16} /></button>
            <button type="button" onClick={() => setBoardViewport(DEFAULT_VIEWPORT, true)} aria-label="Centre map"><Maximize2 size={16} /></button>
            <button type="button" onClick={handleReset} aria-label="Reset focused map"><RotateCcw size={15} /></button>
          </div>
        </div>
      </div>
    </section>
  )
}

function TechniqueNetwork({ techniques, connections, focusedTechniqueId, networkLayout, onFocus, onStartConnection, onDeleteConnection, onSaveLayout, onResetLayout }) {
  const focusedTechnique = techniques.find(technique => technique.id === focusedTechniqueId) || techniques[0]
  const techniquesById = useMemo(() => Object.fromEntries(techniques.map(technique => [technique.id, technique])), [techniques])
  const defaultPositions = useMemo(
    () => createBoardPositions(techniques, connections, focusedTechnique?.id),
    [connections, focusedTechnique?.id, techniques],
  )

  if (!focusedTechnique) return null

  return (
    <FocusBoardCanvas
      key={focusedTechnique.id}
      techniques={techniques}
      connections={connections}
      focusedTechnique={focusedTechnique}
      techniquesById={techniquesById}
      defaultPositions={defaultPositions}
      savedBoard={networkLayout?.boards?.[focusedTechnique.id]}
      onFocus={onFocus}
      onStartConnection={onStartConnection}
      onDeleteConnection={onDeleteConnection}
      onSaveLayout={onSaveLayout}
      onResetLayout={onResetLayout}
    />
  )
}

export default function TechniqueLibrary() {
  const { techniques, connections, networkLayout, addTechnique, updateTechnique, deleteTechnique, addConnection, deleteConnection, saveNetworkBoard, resetNetworkBoard } = useContext(StoreContext)
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
        <TechniqueNetwork techniques={techniques} connections={connections} focusedTechniqueId={focusedTechniqueId} networkLayout={networkLayout} onFocus={focusTechnique}
          onStartConnection={technique => setConnectingTechnique(technique)} onDeleteConnection={deleteConnection}
          onSaveLayout={saveNetworkBoard} onResetLayout={resetNetworkBoard} />
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
