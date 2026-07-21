import { useCallback, useEffect, useRef, useState } from 'react'
import { getFirebaseServices } from '../lib/firebase'

const LEGACY_STORAGE_KEY = 'gentle-art-tracker-v1'
const CACHE_STORAGE_KEY = 'gentle-art-tracker-v2'
const LEGACY_MIGRATED_KEY = 'gentle-art-tracker-v1-migrated'

const DEFAULT_PROFILE = {
  name: '',
  gym: '',
  coach: '',
  height: '',
  weight: '',
  belt: 'white',
  stripes: 0,
  competitions: [],
}

const DEFAULT_STATE = {
  profile: DEFAULT_PROFILE,
  techniques: [],
  sessions: [],
}

function normalizeState(value) {
  return {
    ...DEFAULT_STATE,
    ...value,
    profile: {
      ...DEFAULT_PROFILE,
      ...(value?.profile || {}),
      competitions: Array.isArray(value?.profile?.competitions) ? value.profile.competitions : [],
    },
    techniques: Array.isArray(value?.techniques) ? value.techniques : [],
    sessions: Array.isArray(value?.sessions) ? value.sessions : [],
  }
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readLegacyState() {
  return normalizeState(readJson(LEGACY_STORAGE_KEY) || {})
}

function hasMeaningfulData(state) {
  const profile = state.profile || {}
  return state.techniques.length > 0
    || state.sessions.length > 0
    || profile.competitions.length > 0
    || ['name', 'gym', 'coach', 'height', 'weight'].some(key => Boolean(profile[key]))
    || profile.belt !== DEFAULT_PROFILE.belt
    || profile.stripes !== DEFAULT_PROFILE.stripes
}

function blankStateFor(user) {
  return normalizeState({
    profile: { name: user?.displayName || '' },
  })
}

function cacheState(userId, state) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify({ ownerId: userId, state }))
  } catch {
    // Cloud saving still works if a browser blocks local storage.
  }
}

function markLegacyHandled() {
  try {
    localStorage.setItem(LEGACY_MIGRATED_KEY, 'true')
  } catch {
    // This only avoids showing the one-time migration prompt again.
  }
}

function legacyHasBeenHandled() {
  try {
    return localStorage.getItem(LEGACY_MIGRATED_KEY) === 'true'
  } catch {
    return false
  }
}

export function useStore() {
  const [state, setState] = useState(DEFAULT_STATE)
  const stateRef = useRef(DEFAULT_STATE)
  const migrationRef = useRef(null)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [migrationRequired, setMigrationRequired] = useState(false)
  const [error, setError] = useState('')

  const setLocalState = useCallback((next, ownerId) => {
    const safeState = normalizeState(next)
    stateRef.current = safeState
    setState(safeState)
    if (ownerId) cacheState(ownerId, safeState)
    return safeState
  }, [])

  const writeState = useCallback(async (ownerId, next) => {
    const { db, firestoreApi } = await getFirebaseServices()
    const trackerRef = firestoreApi.doc(db, 'users', ownerId, 'private', 'tracker')
    await firestoreApi.setDoc(trackerRef, {
      schemaVersion: 1,
      state: normalizeState(next),
      updatedAt: firestoreApi.serverTimestamp(),
    })
  }, [])

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    getFirebaseServices()
      .then(({ auth, authApi }) => {
        if (cancelled) return
        unsubscribe = authApi.onAuthStateChanged(auth, currentUser => {
          setUser(currentUser)
          setAuthLoading(false)
          if (!currentUser) {
            migrationRef.current = null
            setDataLoading(false)
            setMigrationRequired(false)
          } else {
            setDataLoading(true)
            setMigrationRequired(false)
            setError('')
          }
        })
      })
      .catch(() => {
        if (!cancelled) {
          setError('Firebase could not be reached. Please check your connection and try again.')
          setAuthLoading(false)
        }
      })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false

    if (!user) {
      return () => {}
    }

    getFirebaseServices()
      .then(({ db, firestoreApi }) => {
        if (cancelled) return
        const trackerRef = firestoreApi.doc(db, 'users', user.uid, 'private', 'tracker')
        unsubscribe = firestoreApi.onSnapshot(trackerRef, snapshot => {
          if (snapshot.exists()) {
            const remoteState = normalizeState(snapshot.data().state || {})
            migrationRef.current = null
            setLocalState(remoteState, user.uid)
            setMigrationRequired(false)
          } else {
            const legacyState = readLegacyState()
            const shouldOfferMigration = hasMeaningfulData(legacyState) && !legacyHasBeenHandled()

            if (shouldOfferMigration) {
              migrationRef.current = legacyState
              setLocalState(legacyState, user.uid)
              setMigrationRequired(true)
            } else {
              const freshState = blankStateFor(user)
              migrationRef.current = null
              setLocalState(freshState, user.uid)
              void writeState(user.uid, freshState).catch(() => {
                if (!cancelled) setError('Your new tracker could not be saved. Please check the Firebase rules and try again.')
              })
            }
          }
          setDataLoading(false)
        }, () => {
          if (!cancelled) {
            setError('Your private training record could not be opened. Please check the Firebase rules and try again.')
            setDataLoading(false)
          }
        })
      })
      .catch(() => {
        if (!cancelled) {
          setError('Firebase could not be reached. Please check your connection and try again.')
          setDataLoading(false)
        }
      })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [setLocalState, user, writeState])

  const signInWithGoogle = useCallback(async () => {
    setError('')
    try {
      const { auth, authApi } = await getFirebaseServices()
      const provider = new authApi.GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await authApi.signInWithPopup(auth, provider)
    } catch (signInError) {
      setError(signInError.code || signInError.message || 'Sign-in could not be completed.')
      throw signInError
    }
  }, [])

  const signOut = useCallback(async () => {
    setError('')
    const { auth, authApi } = await getFirebaseServices()
    await authApi.signOut(auth)
  }, [])

  const migrateLocalData = useCallback(async () => {
    if (!user || !migrationRef.current) return
    setError('')
    try {
      await writeState(user.uid, migrationRef.current)
      markLegacyHandled()
      migrationRef.current = null
      setMigrationRequired(false)
    } catch {
      setError('We could not save this data yet. Please try again after checking the Firebase rules.')
      throw new Error('Migration failed')
    }
  }, [user, writeState])

  const startFresh = useCallback(async () => {
    if (!user) return
    const freshState = blankStateFor(user)
    setError('')
    try {
      await writeState(user.uid, freshState)
      markLegacyHandled()
      migrationRef.current = null
      setLocalState(freshState, user.uid)
      setMigrationRequired(false)
    } catch {
      setError('We could not create your tracker yet. Please try again after checking the Firebase rules.')
      throw new Error('Fresh tracker setup failed')
    }
  }, [setLocalState, user, writeState])

  const update = useCallback((updater) => {
    if (!user) return
    const previous = stateRef.current
    const next = normalizeState(typeof updater === 'function' ? updater(previous) : { ...previous, ...updater })
    setLocalState(next, user.uid)
    void writeState(user.uid, next).catch(() => {
      setError('Your latest change is still on this device, but could not be saved to the cloud. Please try again.')
    })
  }, [setLocalState, user, writeState])

  const addTechnique = useCallback((technique) => {
    update(previous => ({
      ...previous,
      techniques: [...previous.techniques, { ...technique, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
    }))
  }, [update])

  const updateTechnique = useCallback((id, changes) => {
    update(previous => ({
      ...previous,
      techniques: previous.techniques.map(technique => technique.id === id ? { ...technique, ...changes } : technique),
    }))
  }, [update])

  const deleteTechnique = useCallback((id) => {
    update(previous => ({ ...previous, techniques: previous.techniques.filter(technique => technique.id !== id) }))
  }, [update])

  const addSession = useCallback((session) => {
    update(previous => ({
      ...previous,
      sessions: [{ ...session, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...previous.sessions],
    }))
  }, [update])

  const updateSession = useCallback((id, changes) => {
    update(previous => ({
      ...previous,
      sessions: previous.sessions.map(session => session.id === id ? { ...session, ...changes } : session),
    }))
  }, [update])

  const deleteSession = useCallback((id) => {
    update(previous => ({ ...previous, sessions: previous.sessions.filter(session => session.id !== id) }))
  }, [update])

  const updateProfile = useCallback((changes) => {
    update(previous => ({ ...previous, profile: { ...previous.profile, ...changes } }))
  }, [update])

  const addCompetition = useCallback((competition) => {
    update(previous => ({
      ...previous,
      profile: {
        ...previous.profile,
        competitions: [...previous.profile.competitions, { ...competition, id: crypto.randomUUID() }],
      },
    }))
  }, [update])

  const deleteCompetition = useCallback((id) => {
    update(previous => ({
      ...previous,
      profile: {
        ...previous.profile,
        competitions: previous.profile.competitions.filter(competition => competition.id !== id),
      },
    }))
  }, [update])

  return {
    ...state,
    user,
    authLoading,
    dataLoading,
    migrationRequired,
    error,
    signInWithGoogle,
    signOut,
    migrateLocalData,
    startFresh,
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
