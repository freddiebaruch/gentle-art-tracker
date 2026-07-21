import { useContext } from 'react'
import { ArrowRight } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import { CATEGORIES, getGameTier, CONFIDENCE_LABELS } from '../constants'

function TierCard({ technique }) {
  const cat = CATEGORIES.find(c => c.id === technique.category)
  const daysSince = technique.lastTrained
    ? Math.floor((Date.now() - new Date(technique.lastTrained)) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>{cat?.icon}</span>
          <span style={{ fontSize: '12px', fontWeight: '500' }}>{technique.name}</span>
        </div>
        <span className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)' }}>
          {technique.confidence}/10
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="tag-pill">{cat?.label}</span>
        {daysSince !== null && (
          <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
          </span>
        )}
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {CONFIDENCE_LABELS[technique.confidence]}
        </span>
      </div>
    </div>
  )
}

function Tier({ label, sublabel, color, techniques, emptyMsg }) {
  return (
    <div style={{ background: '#ffffff', border: `1px solid ${color}22`, borderRadius: '10px', padding: '20px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
        <span className="font-display" style={{ fontSize: '48px', color, lineHeight: 1 }}>{label}-Game</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sublabel}</span>
        <span className="font-mono" style={{ marginLeft: 'auto', fontSize: '12px', color }}>
          {techniques.length} move{techniques.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ height: '1px', background: `linear-gradient(90deg, ${color}55, transparent)`, marginBottom: '14px' }} />
      {techniques.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', margin: 0 }}>{emptyMsg}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
          {techniques.map(t => <TierCard key={t.id} technique={t} />)}
        </div>
      )}
    </div>
  )
}

function FlowNode({ label, category, conf }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--accent-dim)',
      borderRadius: '8px', padding: '10px 14px', textAlign: 'center', minWidth: '140px',
    }}>
      <div style={{ fontSize: '16px', marginBottom: '3px' }}>{CATEGORIES.find(c => c.id === category)?.icon || '🥋'}</div>
      <div style={{ fontSize: '12px', fontWeight: '500' }}>{label}</div>
      <div className="font-mono" style={{ fontSize: '10px', color: 'var(--accent)', marginTop: '2px' }}>{conf}/10</div>
    </div>
  )
}

function StrategyMap({ techniques }) {
  const aGame = techniques.filter(t => getGameTier(t) === 'A')
  const entries = aGame.filter(t => t.category === 'takedown' || t.category === 'guard-pull')
  const passes = aGame.filter(t => t.category === 'pass')
  const sweeps = aGame.filter(t => t.category === 'sweep')
  const finishes = aGame.filter(t => t.category === 'submission' || t.category === 'back-take')

  if (entries.length === 0 && passes.length === 0 && finishes.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '30px 0', margin: 0 }}>
        Build your A-Game first — techniques need confidence 7+ and recent training dates
      </p>
    )
  }

  const col = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }
  const colLabel = { fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }
  const emptyNode = {
    background: 'var(--bg-elevated)', border: '1px dashed var(--border)', borderRadius: '8px',
    padding: '10px 14px', textAlign: 'center', minWidth: '140px', fontSize: '12px', color: 'var(--text-muted)',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
      <div style={col}>
        <div style={colLabel}>ENTRY</div>
        {entries.slice(0, 2).map(t => <FlowNode key={t.id} label={t.name} category={t.category} conf={t.confidence} />)}
        {entries.length === 0 && <div style={emptyNode}>No entry moves</div>}
      </div>
      <ArrowRight size={16} style={{ color: 'var(--border)', flexShrink: 0 }} />
      <div style={col}>
        <div style={colLabel}>PASSING / SWEEPS</div>
        {[...passes, ...sweeps].slice(0, 3).map(t => <FlowNode key={t.id} label={t.name} category={t.category} conf={t.confidence} />)}
        {passes.length === 0 && sweeps.length === 0 && <div style={emptyNode}>No passes</div>}
      </div>
      <ArrowRight size={16} style={{ color: 'var(--border)', flexShrink: 0 }} />
      <div style={col}>
        <div style={colLabel}>FINISH</div>
        {finishes.slice(0, 3).map(t => <FlowNode key={t.id} label={t.name} category={t.category} conf={t.confidence} />)}
        {finishes.length === 0 && <div style={emptyNode}>No finishes</div>}
      </div>
    </div>
  )
}

export default function GameHub() {
  const { techniques } = useContext(StoreContext)
  const aGame = techniques.filter(t => getGameTier(t) === 'A')
  const bGame = techniques.filter(t => getGameTier(t) === 'B')
  const cGame = techniques.filter(t => getGameTier(t) === 'C')

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 className="font-display" style={{ fontSize: '38px', margin: '0 0 4px', color: 'var(--text-primary)' }}>GAME HUB</h1>
        <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
          Auto-sorted by confidence and recency
        </p>
      </div>

      {techniques.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🗺️</div>
          <p className="font-display" style={{ fontSize: '28px', color: 'var(--text-muted)', margin: '0 0 8px' }}>BUILD YOUR GAME</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Add techniques to your library. The Game Hub will sort and map them automatically.
          </p>
        </div>
      ) : (
        <>
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '12px' }}>
            <div className="font-display" style={{ fontSize: '18px', color: 'var(--accent)', marginBottom: '2px' }}>STRATEGY MAP</div>
            <p className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Your A-Game flow — entry to finish
            </p>
            <StrategyMap techniques={techniques} />
          </div>

          <Tier label="A" sublabel="Confidence 7+ · Trained in last 21 days" color="#27ae60" techniques={aGame}
            emptyMsg="No A-Game moves yet. Hit confidence 7+ and train recently." />
          <Tier label="B" sublabel="Confidence 4–6 · Training regularly" color="#c8a96e" techniques={bGame}
            emptyMsg="No B-Game moves yet." />
          <Tier label="C" sublabel="New techniques · Low confidence · The Lab" color="#c0392b" techniques={cGame}
            emptyMsg="No C-Game moves. Add new techniques to experiment with." />
        </>
      )}
    </div>
  )
}
