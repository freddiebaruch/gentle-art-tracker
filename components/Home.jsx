import { useContext } from 'react'
import { ArrowUpRight, BookOpen, Mic, Swords, Trophy } from 'lucide-react'
import { StoreContext } from '../store/StoreContext'
import GiIllustration from './GiIllustration'

const hubs = [
  {
    id: 'library',
    number: '01',
    eyebrow: 'YOUR KNOWLEDGE',
    title: 'Technique\nLibrary',
    description: 'Catalogue positions, grips, details, and references.',
    Icon: BookOpen,
  },
  {
    id: 'session',
    number: '02',
    eyebrow: 'AFTER TRAINING',
    title: 'Session\nLog',
    description: 'Capture the rounds, lessons, and moments worth keeping.',
    Icon: Mic,
  },
  {
    id: 'game',
    number: '03',
    eyebrow: 'YOUR STRATEGY',
    title: 'Your\nGame',
    description: 'See the game you have now and the game you are building.',
    Icon: Swords,
  },
  {
    id: 'competitions',
    number: '04',
    eyebrow: 'COMPETE WITH INTENT',
    title: 'Competitions',
    description: 'Plan events, record results, and keep match notes together.',
    Icon: Trophy,
  },
]

export default function Home({ onNavigate }) {
  const { profile, techniques, sessions } = useContext(StoreContext)
  const firstName = profile.name?.trim().split(/\s+/)[0]
  const competitions = profile.competitions || []

  return (
    <section className="home-page fade-up">
      <div className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">GET A GRIP</p>
          <h1 className="home-title">
            Train with<br />
            <em>intention.</em>
          </h1>
          <p className="home-intro">
            {firstName ? `Welcome back, ${firstName}. ` : ''}
            Your personal place to collect what you learn on the mat and shape it into a game.
          </p>
          <div className="home-hero-line" />
          <p className="home-motto">ONE ROUND. ONE DETAIL. ONE BETTER VERSION OF YOUR GAME.</p>
        </div>

        <div className="home-gi-stage" aria-hidden="true">
          <span className="home-stage-label">THE DAILY UNIFORM</span>
          <GiIllustration />
          <span className="home-stage-corner home-stage-corner-one" />
          <span className="home-stage-corner home-stage-corner-two" />
        </div>
      </div>

      <div className="home-status-bar" aria-label="Training overview">
        <div>
          <span className="home-status-number">{techniques.length}</span>
          <span className="home-status-label">Techniques</span>
        </div>
        <div>
          <span className="home-status-number">{sessions.length}</span>
          <span className="home-status-label">Sessions</span>
        </div>
        <div>
          <span className="home-status-number">{competitions.length}</span>
          <span className="home-status-label">Competitions</span>
        </div>
        <p>Pick up where you left off.</p>
      </div>

      <div className="home-hubs-heading">
        <div>
          <p className="home-kicker">YOUR TRAINING SPACE</p>
          <h2 className="font-display">CHOOSE A HUB</h2>
        </div>
        <span className="font-mono">04 PATHS / ONE PRACTICE</span>
      </div>

      <div className="home-hub-grid">
        {hubs.map(({ id, number, eyebrow, title, description, Icon }) => (
          <button key={id} className={`home-hub-card home-hub-card-${id}`} data-number={number} onClick={() => onNavigate(id)}>
            <span className="home-hub-number font-mono">{number}</span>
            <Icon className="home-hub-icon" size={24} strokeWidth={1.6} aria-hidden="true" />
            <span className="home-hub-eyebrow font-mono">{eyebrow}</span>
            <span className="home-hub-title font-display">{title.split('\n').map((line, index) => <span key={line}>{line}{index === 0 && <br />}</span>)}</span>
            <span className="home-hub-description">{description}</span>
            <span className="home-hub-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span>
          </button>
        ))}
      </div>
    </section>
  )
}
