/**
 * Unified relative time formatter used by ActivityFeed and Activity page.
 * Returns sub-minute granularity for recent events.
 */
export function getRelativeTime(dateStr) {
    if (!dateStr) return '—'
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    const seconds = Math.floor((now - then) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(months / 12)}y ago`
}
