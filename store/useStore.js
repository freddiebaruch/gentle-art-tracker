import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'gentle-art-tracker-v1'

const DEFAULT_STATE = {
  profile: {
    name: '',
    gym: '',
    coach: '',
    height: '',
    weight: '',
    belt: 'white',
    stripes: 0,
    competitions: [],
  },
  techniques: [],
  sessions: [],
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return DEFAULT_STATE
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function useStore() {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const update = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      return next
    })
  }, [])

  // Techniques
  const addTechnique = useCallback((technique) => {
    update(prev => ({
      ...prev,
      techniques: [...prev.techniques, { ...technique, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
    }))
  }, [update])

  const updateTechnique = useCallback((id, changes) => {
    update(prev => ({
      ...prev,
      techniques: prev.techniques.map(t => t.id === id ? { ...t, ...changes } : t)
    }))
  }, [update])

  const deleteTechnique = useCallback((id) => {
    update(prev => ({
      ...prev,
      techniques: prev.techniques.filter(t => t.id !== id)
    }))
  }, [update])

  // Sessions
  const addSession = useCallback((session) => {
    update(prev => ({
      ...prev,
      sessions: [{ ...session, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...prev.sessions]
    }))
  }, [update])

  const updateSession = useCallback((id, changes) => {
    update(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, ...changes } : s)
    }))
  }, [update])

  const deleteSession = useCallback((id) => {
    update(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== id)
    }))
  }, [update])

  // Profile
  const updateProfile = useCallback((changes) => {
    update(prev => ({ ...prev, profile: { ...prev.profile, ...changes } }))
  }, [update])

  const addCompetition = useCallback((comp) => {
    update(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        competitions: [...prev.profile.competitions, { ...comp, id: crypto.randomUUID() }]
      }
    }))
  }, [update])

  const deleteCompetition = useCallback((id) => {
    update(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        competitions: prev.profile.competitions.filter(c => c.id !== id)
      }
    }))
  }, [update])

  return {
    ...state,
    addTechnique,
    updateTechnique,
    deleteTechnique,
    addSession,
    updateSession,
    deleteSession,
    updateProfile,
    addCompetition,
    deleteCompetition,
  }
}
