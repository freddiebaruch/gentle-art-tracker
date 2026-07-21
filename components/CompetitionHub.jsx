import { useContext, useState } from 'react'
import { CalendarDays, ExternalLink, Plus, Trophy, Trash2 } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import { COMPETITION_RESULTS } from '../constants'

const emptyCompetition = {
  tournament: '',
  date: '',
  weightClass: '',
  result: 'Gold 🥇',
  notes: '',
  footage: '',
}

export default function CompetitionHub() {
  const { profile, addCompetition, deleteCompetition } = useContext(StoreContext)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyCompetition)
  const competitions = [...(profile.competitions || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  function saveCompetition(event) {
    event.preventDefault()
    if (!form.tournament.trim()) return
    addCompetition(form)
    setForm(emptyCompetition)
    setShowForm(false)
  }

  return (
    <section className="competition-page fade-up">
      <header className="competition-header">
        <div>
          <p className="home-kicker">COMPETE WITH INTENT</p>
          <h1 className="font-display">COMPETITIONS</h1>
          <p>Keep events, results, match notes, and footage in one calm corner of your training record.</p>
        </div>
        <div className="competition-medal-mark" aria-hidden="true"><Trophy size={34} strokeWidth={1.25} /></div>
      </header>

      <div className="competition-toolbar">
        <div>
          <span className="font-display">{competitions.length}</span>
          <span className="font-mono"> EVENT{competitions.length === 1 ? '' : 'S'} RECORDED</span>
        </div>
        <button className="competition-add-button" onClick={() => setShowForm(current => !current)}>
          <Plus size={16} /> {showForm ? 'Close form' : 'Add competition'}
        </button>
      </div>

      {showForm && (
        <form className="competition-form" onSubmit={saveCompetition}>
          <div className="competition-form-heading">
            <div>
              <p className="home-kicker">NEW EVENT</p>
              <h2 className="font-display">PUT IT ON THE CALENDAR</h2>
            </div>
          </div>
          <div className="competition-form-grid">
            <label className="competition-field competition-field-wide">
              <span>Tournament name <b>*</b></span>
              <input className="input-field" required placeholder="e.g. London Open" value={form.tournament} onChange={event => setForm(current => ({ ...current, tournament: event.target.value }))} />
            </label>
            <label className="competition-field">
              <span>Date</span>
              <input className="input-field" type="date" value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} />
            </label>
            <label className="competition-field">
              <span>Weight class</span>
              <input className="input-field" placeholder="e.g. Adult / 82kg" value={form.weightClass} onChange={event => setForm(current => ({ ...current, weightClass: event.target.value }))} />
            </label>
            <label className="competition-field">
              <span>Result</span>
              <select className="input-field" value={form.result} onChange={event => setForm(current => ({ ...current, result: event.target.value }))}>
                {COMPETITION_RESULTS.map(result => <option key={result}>{result}</option>)}
              </select>
            </label>
            <label className="competition-field">
              <span>Footage link</span>
              <input className="input-field" type="url" placeholder="https://..." value={form.footage} onChange={event => setForm(current => ({ ...current, footage: event.target.value }))} />
            </label>
            <label className="competition-field competition-field-wide">
              <span>Match notes</span>
              <textarea className="input-field" placeholder="What worked? What do you want to return to in the room?" value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} />
            </label>
          </div>
          <div className="competition-form-actions">
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit">Save competition</button>
          </div>
        </form>
      )}

      {competitions.length === 0 ? (
        <div className="competition-empty">
          <Trophy size={46} strokeWidth={1} />
          <p className="font-display">YOUR NEXT TEST AWAITS</p>
          <span>Add an event when you are ready. Every competition is another lesson for your game.</span>
        </div>
      ) : (
        <div className="competition-list">
          {competitions.map((competition, index) => (
            <article className="competition-card" key={competition.id}>
              <div className="competition-card-count font-mono">{String(index + 1).padStart(2, '0')}</div>
              <div className="competition-card-main">
                <div className="competition-card-topline">
                  <span className="competition-result">{competition.result}</span>
                  {competition.date && <span className="competition-date"><CalendarDays size={13} /> {new Date(`${competition.date}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </div>
                <h2>{competition.tournament}</h2>
                {competition.weightClass && <span className="tag-pill">{competition.weightClass}</span>}
                {competition.notes && <p>{competition.notes}</p>}
                {competition.footage && <a href={competition.footage} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Watch match footage</a>}
              </div>
              <button className="competition-delete" onClick={() => deleteCompetition(competition.id)} aria-label={`Delete ${competition.tournament}`} title="Delete competition"><Trash2 size={15} /></button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
