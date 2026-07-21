import { useState } from 'react'
import { Cloud, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react'

function PageFrame({ children }) {
  return (
    <main style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px',
      background: 'radial-gradient(circle at 50% 0%, var(--accent-glow), transparent 36%), var(--bg-base)',
    }}>
      <section style={{ width: 'min(100%, 510px)', textAlign: 'center' }}>
        <div className="font-display" style={{ fontSize: '22px', color: 'var(--accent)', letterSpacing: '.08em' }}>
          THE GENTLE ART
        </div>
        <div className="font-mono" style={{ marginTop: '3px', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '.12em' }}>
          TRACKER
        </div>
        <div style={{
          marginTop: '24px', padding: 'clamp(28px, 6vw, 46px)', border: '1px solid var(--border)',
          borderRadius: '18px', background: 'var(--bg-card)', boxShadow: '0 20px 60px rgba(0,0,0,.08)',
        }}>
          {children}
        </div>
      </section>
    </main>
  )
}

function Waiting({ message }) {
  return (
    <PageFrame>
      <LoaderCircle size={30} style={{ marginBottom: '16px', color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
      <p className="font-display" style={{ margin: '0 0 6px', fontSize: '28px', color: 'var(--text-primary)' }}>ONE MOMENT</p>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>{message}</p>
    </PageFrame>
  )
}

function readableError(error) {
  if (!error) return ''
  if (error.includes('auth/unauthorized-domain')) {
    return 'This website still needs to be approved in Firebase. Add freddiebaruch.github.io under Authentication → Settings → Authorized domains.'
  }
  if (error.includes('auth/popup-closed-by-user')) return 'Sign-in was cancelled. Please try again when you are ready.'
  return 'We could not sign you in just yet. Please try again.'
}

export default function AuthGate({ store, children }) {
  const [working, setWorking] = useState(false)
  const {
    user, authLoading, dataLoading, migrationRequired, error,
    signInWithGoogle, migrateLocalData, startFresh,
  } = store

  async function handleSignIn() {
    setWorking(true)
    try {
      await signInWithGoogle()
    } catch {
      // The store keeps a friendly error message for the sign-in screen.
    } finally {
      setWorking(false)
    }
  }

  async function handleMigration(action) {
    setWorking(true)
    try {
      await action()
    } catch {
      // The store keeps a friendly error message for the migration screen.
    } finally {
      setWorking(false)
    }
  }

  if (authLoading || (user && dataLoading)) {
    return <Waiting message={authLoading ? 'Preparing secure sign-in…' : 'Opening your private training record…'} />
  }

  if (!user) {
    return (
      <PageFrame>
        <div style={{ width: '62px', height: '62px', display: 'grid', placeItems: 'center', margin: '0 auto 18px', borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--accent-dim)' }}>
          <Cloud size={29} strokeWidth={1.35} />
        </div>
        <p className="home-kicker" style={{ marginBottom: '10px' }}>YOUR PRIVATE TRAINING SPACE</p>
        <h1 className="font-display" style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '42px', lineHeight: '.95' }}>SIGN IN TO TRAIN</h1>
        <p style={{ maxWidth: '330px', margin: '0 auto 25px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.65 }}>
          Keep your techniques, sessions, game plan, profile, and competitions safely connected to your own account.
        </p>
        <button onClick={handleSignIn} disabled={working} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px 16px',
          border: '1px solid var(--border)', borderRadius: '9px', background: 'var(--bg-elevated)', color: 'var(--text-primary)',
          cursor: working ? 'wait' : 'pointer', font: "500 14px 'DM Sans', sans-serif", opacity: working ? .72 : 1,
        }}>
          {working ? <LoaderCircle size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <span style={{ display: 'grid', width: '18px', height: '18px', placeItems: 'center', borderRadius: '50%', background: '#fff', color: '#4285f4', fontWeight: 700 }}>G</span>}
          {working ? 'Opening Google…' : 'Continue with Google'}
        </button>
        {error && <p role="alert" style={{ margin: '14px 0 0', color: 'var(--red)', fontSize: '12px', lineHeight: 1.55 }}>{readableError(error)}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '21px', color: 'var(--text-muted)', fontSize: '11px' }}>
          <ShieldCheck size={13} /> Only you can access your saved training data.
        </div>
      </PageFrame>
    )
  }

  if (migrationRequired) {
    return (
      <PageFrame>
        <Sparkles size={30} style={{ marginBottom: '15px', color: 'var(--accent)' }} />
        <p className="home-kicker" style={{ marginBottom: '10px' }}>WELCOME, {user.displayName?.split(' ')[0]?.toUpperCase() || 'PRACTITIONER'}</p>
        <h1 className="font-display" style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: '38px', lineHeight: '.95' }}>BRING YOUR DATA?</h1>
        <p style={{ margin: '0 auto 22px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.65 }}>
          We found existing tracker data on this device. Would you like to attach it to <strong>{user.email}</strong>?
        </p>
        <button onClick={() => handleMigration(migrateLocalData)} disabled={working} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid var(--accent-dim)', background: 'var(--accent-glow)', color: 'var(--accent)', cursor: working ? 'wait' : 'pointer', font: "500 13px 'DM Sans', sans-serif" }}>
          {working ? 'Saving…' : 'Move my existing data'}
        </button>
        <button onClick={() => handleMigration(startFresh)} disabled={working} style={{ width: '100%', padding: '10px', marginTop: '7px', border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: working ? 'wait' : 'pointer', font: "400 12px 'DM Sans', sans-serif" }}>
          Start with a fresh tracker instead
        </button>
        {error && <p role="alert" style={{ margin: '13px 0 0', color: 'var(--red)', fontSize: '12px' }}>{error}</p>}
      </PageFrame>
    )
  }

  return children
}
