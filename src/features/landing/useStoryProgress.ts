import { useEffect, useRef, useState, type RefObject } from 'react'
import { sectionProgress, storyAt } from '../../lib/fireflies/story.ts'

export interface StoryProgress {
  /** Live scroll progress through the section, 0 to 1. Read it every frame; it never re-renders. */
  progress: RefObject<number>
  /** Current chapter and week. These re-render, but only when they change. */
  chapter: number
  week: number
}

/** Tracks how far the visitor has scrolled through `section`. */
export function useStoryProgress(section: RefObject<HTMLElement | null>): StoryProgress {
  const progress = useRef(0)
  const [chapter, setChapter] = useState(0)
  const [week, setWeek] = useState(1)

  useEffect(() => {
    const update = () => {
      const element = section.current
      if (!element) return
      const box = element.getBoundingClientRect()
      const value = sectionProgress(box.top, box.height, window.innerHeight)
      progress.current = value
      const frame = storyAt(value)
      setChapter(frame.chapter)
      setWeek(frame.week)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [section])

  return { progress, chapter, week }
}
