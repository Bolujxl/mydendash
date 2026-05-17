import { useEffect, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

const token = import.meta.env.VITE_GITHUB_TOKEN

function fetchJson(url, signal) {
  const options = { signal }
  if (token && url.includes('api.github.com')) {
    options.headers = { Authorization: `Bearer ${token}` }
  }
  return fetch(url, options).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return res.json()
  })
}

export default function useFetch(url) {
  const isGitHub = url && url.includes('api.github.com')
  const cancelled = useRef(false)

  const cached = useQuery({
    queryKey: [url],
    queryFn: ({ signal }) => fetchJson(url, signal),
    enabled: isGitHub && !!url,
    staleTime: url?.includes('/events') ? 2 * 60 * 1000 : 5 * 60 * 1000,
  })

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isGitHub) return
    cancelled.current = false

    if (!url) {
      queueMicrotask(() => {
        if (!cancelled.current) {
          setData(null)
          setLoading(false)
          setError(null)
        }
      })
      return () => { cancelled.current = true }
    }

    const controller = new AbortController()

    const doFetch = async () => {
      if (cancelled.current) return
      setLoading(true)
      setError(null)
      try {
        const json = await fetchJson(url, controller.signal)
        if (!cancelled.current) {
          setData(json)
          setLoading(false)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        if (!cancelled.current) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    doFetch()

    return () => {
      cancelled.current = true
      controller.abort()
    }
  }, [url, isGitHub])

  if (isGitHub) {
    return {
      data: cached.data ?? null,
      loading: cached.isLoading,
      error: cached.error?.message || null,
    }
  }

  return { data, loading, error }
}