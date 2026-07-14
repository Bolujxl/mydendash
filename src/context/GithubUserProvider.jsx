import { useState, useEffect, useCallback, useMemo } from 'react'
import { GithubUserContext } from './GithubUserContext'

const GH_USER_KEY = 'devdash_github_user'
const DEFAULT_USER = 'bolujxl'

function readUsername() {
    try {
        return localStorage.getItem(GH_USER_KEY) || DEFAULT_USER
    } catch {
        return DEFAULT_USER
    }
}

export function GithubUserProvider({ children }) {
    const [username, setUsernameState] = useState(readUsername)

    // React to changes made by other code paths (e.g. storage events from other tabs)
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === GH_USER_KEY) {
                setUsernameState(e.newValue || DEFAULT_USER)
            }
        }
        window.addEventListener('storage', onStorage)
        return () => window.removeEventListener('storage', onStorage)
    }, [])

    const setUsername = useCallback((name) => {
        const trimmed = (name || '').trim() || DEFAULT_USER
        try { localStorage.setItem(GH_USER_KEY, trimmed) } catch { /* noop */ }
        setUsernameState(trimmed)
    }, [])

    const clearUsername = useCallback(() => {
        try { localStorage.removeItem(GH_USER_KEY) } catch { /* noop */ }
        setUsernameState('')
    }, [])

    const value = useMemo(
        () => ({ username, setUsername, clearUsername }),
        [username, setUsername, clearUsername]
    )

    return (
        <GithubUserContext.Provider value={value}>
            {children}
        </GithubUserContext.Provider>
    )
}
