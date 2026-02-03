import { useCallback, useEffect, useMemo, useState } from "react"

export type ScheduleSubjectType = "lective" | "non_lective"

export type SubjectRA = {
  id: string
  name: string
  percentage: number
  hours: number
}

export type ScheduleSubject = {
  id: string
  name: string
  type: ScheduleSubjectType
  defaultLocation?: string
  ras: SubjectRA[]
}

const DEFAULT_SUBJECTS_DATA: ScheduleSubject[] = [
  { id: "subject-mathematics", name: "Matemàtiques", type: "lective", defaultLocation: "Aula 101", ras: [] },
  { id: "subject-catalan", name: "Llengua Catalana", type: "lective", defaultLocation: "Aula 102", ras: [] },
  { id: "subject-spanish", name: "Llengua Castellana", type: "lective", defaultLocation: "Aula 103", ras: [] },
  { id: "subject-english", name: "Anglès", type: "lective", defaultLocation: "Aula 201", ras: [] },
  { id: "subject-science", name: "Ciències Naturals", type: "lective", defaultLocation: "Laboratori 1", ras: [] },
  { id: "subject-social-science", name: "Ciències Socials", type: "lective", defaultLocation: "Aula 202", ras: [] },
  { id: "subject-pe", name: "Educació Física", type: "lective", defaultLocation: "Pista esportiva", ras: [] },
  { id: "subject-music", name: "Música", type: "lective", defaultLocation: "Aula de Música", ras: [] },
  { id: "subject-technology", name: "Tecnologia", type: "lective", defaultLocation: "Taller de Tecnologia", ras: [] },
  { id: "subject-cycle-meeting", name: "Reunió de Cicle", type: "non_lective", defaultLocation: "Sala de professors", ras: [] },
  { id: "subject-pedagogic-coordination", name: "Coordinació Pedagògica", type: "non_lective", defaultLocation: "Sala de reunions", ras: [] },
]

const STORAGE_KEY = "edu-gestio-schedule-subjects"
const STORAGE_EVENT = "schedule-subjects-updated"

const isBrowser = typeof window !== "undefined"

type UpdateArg = ScheduleSubject[] | ((prev: ScheduleSubject[]) => ScheduleSubject[])

type CustomEventDetail = {
  subjects: ScheduleSubject[]
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
}

export const DEFAULT_SUBJECTS: ScheduleSubject[] = DEFAULT_SUBJECTS_DATA

export function loadScheduleSubjects(): ScheduleSubject[] {
  if (!isBrowser) {
    return DEFAULT_SUBJECTS
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SUBJECTS

    const parsed = JSON.parse(raw) as any

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_SUBJECTS
    }

    return parsed.map((subject) => ({
      id: subject.id || createId("subject"),
      name: subject.name || "Assignatura",
      type: subject.type === "non_lective" ? "non_lective" : "lective",
      defaultLocation: subject.defaultLocation || "",
      ras: Array.isArray(subject.ras)
        ? subject.ras
          .filter(Boolean)
          .map((ra: any) => ({
            id: ra.id || createId("ra"),
            name: String(ra.name ?? "").trim() || "RA",
            percentage: Number.isFinite(Number(ra.percentage)) ? Number(ra.percentage) : 0,
            hours: Number.isFinite(Number(ra.hours)) ? Number(ra.hours) : 0,
          }))
        : [],
    }))
  } catch (error) {
    console.error("Failed to parse schedule subjects", error)
    return DEFAULT_SUBJECTS
  }
}

export function saveScheduleSubjects(value: UpdateArg): ScheduleSubject[] {
  const nextSubjects = typeof value === "function" ? value(loadScheduleSubjects()) : value

  if (isBrowser) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSubjects))
    const event = new CustomEvent<CustomEventDetail>(STORAGE_EVENT, {
      detail: { subjects: nextSubjects },
    })
    window.dispatchEvent(event)
  }

  return nextSubjects
}

export function subscribeToScheduleSubjects(callback: (subjects: ScheduleSubject[]) => void) {
  if (!isBrowser) return () => { }

  const handleCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent<CustomEventDetail>).detail
    if (detail?.subjects) callback(detail.subjects)
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        callback(JSON.parse(event.newValue) as ScheduleSubject[])
      } catch (error) {
        console.error("Failed to read schedule subjects from storage", error)
      }
    }
  }

  window.addEventListener(STORAGE_EVENT, handleCustomEvent)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(STORAGE_EVENT, handleCustomEvent)
    window.removeEventListener("storage", handleStorage)
  }
}

export function useScheduleSubjects() {
  const [subjects, setSubjects] = useState<ScheduleSubject[]>(DEFAULT_SUBJECTS)

  useEffect(() => {
    if (!isBrowser) {
      setSubjects(DEFAULT_SUBJECTS)
      return
    }

    setSubjects(loadScheduleSubjects())
    const unsubscribe = subscribeToScheduleSubjects((next) => setSubjects(next))
    return unsubscribe
  }, [])

  const updateSubjects = useCallback((value: UpdateArg) => {
    setSubjects((prev) => {
      const next = typeof value === "function" ? value(prev) : value
      saveScheduleSubjects(next)
      return next
    })
  }, [])

  const addSubject = useCallback(
    (subject: Omit<ScheduleSubject, "id">) => {
      updateSubjects((prev) => {
        const subjectExists = prev.some(
          (item) => item.name.trim().toLowerCase() === subject.name.trim().toLowerCase(),
        )
        if (subjectExists) return prev

        const nextSubject: ScheduleSubject = {
          ...subject,
          id: createId("subject"),
          ras: subject.ras ?? [],
        }
        return [...prev, nextSubject]
      })
    },
    [updateSubjects],
  )

  const editSubject = useCallback(
    (id: string, value: Omit<ScheduleSubject, "id">) => {
      updateSubjects((prev) =>
        prev.map((subject) =>
          subject.id === id
            ? {
              ...subject,
              name: value.name,
              type: value.type,
              defaultLocation: value.defaultLocation,
              ras: value.ras ?? subject.ras ?? [],
            }
            : subject,
        ),
      )
    },
    [updateSubjects],
  )

  const removeSubject = useCallback(
    (id: string) => {
      updateSubjects((prev) => prev.filter((subject) => subject.id !== id))
    },
    [updateSubjects],
  )

  const resetSubjects = useCallback(() => {
    updateSubjects(DEFAULT_SUBJECTS)
  }, [updateSubjects])

  // ✅ FIX: addRA idempotente (evita doble inserción en dev Strict Mode)
  const addRA = useCallback(
    (subjectId: string, ra: Omit<SubjectRA, "id">) => {
      const raWithId: SubjectRA = { id: createId("ra"), ...ra }

      updateSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s

          const exists = (s.ras ?? []).some((r) => r.id === raWithId.id)
          if (exists) return s

          return { ...s, ras: [...(s.ras ?? []), raWithId] }
        }),
      )
    },
    [updateSubjects],
  )

  const editRA = useCallback(
    (subjectId: string, raId: string, patch: Partial<Omit<SubjectRA, "id">>) => {
      updateSubjects((prev) =>
        prev.map((s) =>
          s.id === subjectId
            ? { ...s, ras: (s.ras ?? []).map((r) => (r.id === raId ? { ...r, ...patch } : r)) }
            : s,
        ),
      )
    },
    [updateSubjects],
  )

  const removeRA = useCallback(
    (subjectId: string, raId: string) => {
      updateSubjects((prev) =>
        prev.map((s) =>
          s.id === subjectId ? { ...s, ras: (s.ras ?? []).filter((r) => r.id !== raId) } : s,
        ),
      )
    },
    [updateSubjects],
  )

  const indexedSubjects = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }, [subjects])

  return {
    subjects,
    subjectsById: indexedSubjects,
    addSubject,
    editSubject,
    removeSubject,
    resetSubjects,
    addRA,
    editRA,
    removeRA,
  }
}
