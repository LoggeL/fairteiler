import { useState, useEffect } from 'react'

interface SavedGroup {
  id: string
  name: string
  code: string
}

export function useRecentGroups() {
  const [groups, setGroups] = useState<SavedGroup[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('fairteiler_groups')
    if (saved) {
      try {
        setGroups(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved groups', e)
      }
    }
  }, [])

  const addGroup = (group: SavedGroup) => {
    setGroups(prev => {
      const filtered = prev.filter(g => g.id !== group.id)
      const updated = [group, ...filtered].slice(0, 10) // Keep last 10
      localStorage.setItem('fairteiler_groups', JSON.stringify(updated))
      return updated
    })
  }

  return { groups, addGroup }
}
