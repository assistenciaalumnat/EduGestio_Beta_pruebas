type AttendanceStatus = "present" | "absent" | "late" | "justified" | "excused"

type AttendanceRange = "today" | "thisWeek" | "thisMonth"

type TrendDirection = "up" | "down" | "equal"

interface Student {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
  level: string
  students: Student[]
}

interface Subject {
  id: string
  name: string
}

interface ScheduleTemplateRecord {
  status: AttendanceStatus
  justification?: string
  recordedOffsetMinutes?: number
}

interface ScheduleTemplate {
  id: string
  groupId: string
  subjectId: string
  teacher: string
  location: string
  dayOffset: number
  startHour: number
  startMinute: number
  durationMinutes: number
  records?: Record<string, ScheduleTemplateRecord>
}

interface SessionStudentRecord {
  id: string
  studentId: string
  studentName: string
  status: AttendanceStatus
  justification?: string
  recordedAt: Date
}

interface AttendanceSession {
  id: string
  groupId: string
  groupName: string
  subjectId: string
  subjectName: string
  teacher: string
  location: string
  start: Date
  end: Date
  records: SessionStudentRecord[]
}

interface AttendanceRecord {
  id: string
  sessionId: string
  sessionStart: Date
  sessionEnd: Date
  studentId: string
  studentName: string
  groupId: string
  groupName: string
  subjectId: string
  subjectName: string
  status: AttendanceStatus
  justification?: string
  recordedAt: Date
}

interface PendingGroup {
  groupId: string
  groupName: string
  missingStudents: number
  totalStudents: number
}

interface PendingJustification {
  recordId: string
  studentName: string
  groupName: string
  subjectName: string
  date: Date
  sessionId: string
}

interface UpcomingClass {
  sessionId: string
  groupName: string
  subjectName: string
  teacher: string
  location: string
  start: Date
  end: Date
}

interface AttendanceSummary {
  totalSessions: number
  totalExpectedAttendances: number
  recordedAttendances: number
  present: number
  absent: number
  late: number
  justified: number
  excused: number
  attendanceRate: number
  trend: {
    previousRate: number
    difference: number
    direction: TrendDirection
  }
}

interface AttendanceDashboardData {
  range: AttendanceRange
  summary: AttendanceSummary
  pendingGroups: PendingGroup[]
  pendingJustifications: PendingJustification[]
  nextClass: UpcomingClass | null
  records: AttendanceRecord[]
  sessions: AttendanceSession[]
}

const GROUPS: Group[] = [
  {
    id: "group-3eso-a",
    name: "3º ESO A",
    level: "3º ESO",
    students: [
      { id: "student-ana-garcia", name: "Ana García" },
      { id: "student-luis-martin", name: "Luis Martín" },
      { id: "student-marc-puig", name: "Marc Puig" },
      { id: "student-julia-ros", name: "Júlia Ros" },
    ],
  },
  {
    id: "group-2eso-b",
    name: "2º ESO B",
    level: "2º ESO",
    students: [
      { id: "student-sara-ruiz", name: "Sara Ruiz" },
      { id: "student-alejandro-cano", name: "Alejandro Cano" },
      { id: "student-nora-vidal", name: "Nora Vidal" },
      { id: "student-pau-domenech", name: "Pau Domènech" },
    ],
  },
  {
    id: "group-4eso-c",
    name: "4º ESO C",
    level: "4º ESO",
    students: [
      { id: "student-marta-perez", name: "Marta Pérez" },
      { id: "student-joan-gimenez", name: "Joan Giménez" },
      { id: "student-ines-ferrer", name: "Inés Ferrer" },
      { id: "student-adrian-llopis", name: "Adrián Llopis" },
    ],
  },
]

const SUBJECTS: Subject[] = [
  { id: "subject-math", name: "Matemáticas" },
  { id: "subject-language", name: "Lengua Castellana" },
  { id: "subject-science", name: "Ciencias Naturales" },
  { id: "subject-history", name: "Historia" },
  { id: "subject-technology", name: "Tecnología" },
]

const SUBJECTS_BY_ID = new Map(SUBJECTS.map((subject) => [subject.id, subject]))
const GROUPS_BY_ID = new Map(GROUPS.map((group) => [group.id, group]))

const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  {
    id: "session-math-today",
    groupId: "group-3eso-a",
    subjectId: "subject-math",
    teacher: "Clara López",
    location: "Aula 101",
    dayOffset: 0,
    startHour: 8,
    startMinute: 0,
    durationMinutes: 60,
    records: {
      "student-ana-garcia": { status: "present", recordedOffsetMinutes: 6 },
      "student-luis-martin": { status: "present", recordedOffsetMinutes: 6 },
      "student-marc-puig": { status: "late", justification: "Retraso en el transporte", recordedOffsetMinutes: 15 },
      "student-julia-ros": { status: "justified", justification: "Cita médica", recordedOffsetMinutes: 20 },
    },
  },
  {
    id: "session-language-today",
    groupId: "group-2eso-b",
    subjectId: "subject-language",
    teacher: "Jaume Serra",
    location: "Aula 102",
    dayOffset: 0,
    startHour: 9,
    startMinute: 15,
    durationMinutes: 60,
    records: {
      "student-sara-ruiz": { status: "present", recordedOffsetMinutes: 8 },
      "student-alejandro-cano": { status: "absent" },
    },
  },
  {
    id: "session-science-today",
    groupId: "group-4eso-c",
    subjectId: "subject-science",
    teacher: "Salvador Martí",
    location: "Laboratorio 1",
    dayOffset: 0,
    startHour: 10,
    startMinute: 30,
    durationMinutes: 60,
    records: {
      "student-marta-perez": { status: "present", recordedOffsetMinutes: 5 },
      "student-joan-gimenez": { status: "present", recordedOffsetMinutes: 7 },
      "student-ines-ferrer": { status: "absent" },
      "student-adrian-llopis": { status: "excused", justification: "Compromiso deportivo" },
    },
  },
  {
    id: "session-math-yesterday",
    groupId: "group-3eso-a",
    subjectId: "subject-math",
    teacher: "Clara López",
    location: "Aula 101",
    dayOffset: -1,
    startHour: 8,
    startMinute: 0,
    durationMinutes: 60,
    records: {
      "student-ana-garcia": { status: "present", recordedOffsetMinutes: 5 },
      "student-luis-martin": { status: "absent" },
      "student-marc-puig": { status: "present", recordedOffsetMinutes: 5 },
      "student-julia-ros": { status: "late", recordedOffsetMinutes: 18 },
    },
  },
  {
    id: "session-language-yesterday",
    groupId: "group-2eso-b",
    subjectId: "subject-language",
    teacher: "Jaume Serra",
    location: "Aula 102",
    dayOffset: -1,
    startHour: 9,
    startMinute: 15,
    durationMinutes: 60,
    records: {
      "student-sara-ruiz": { status: "present", recordedOffsetMinutes: 6 },
      "student-alejandro-cano": { status: "absent" },
      "student-nora-vidal": { status: "late", recordedOffsetMinutes: 25 },
    },
  },
  {
    id: "session-science-yesterday",
    groupId: "group-4eso-c",
    subjectId: "subject-science",
    teacher: "Salvador Martí",
    location: "Laboratorio 1",
    dayOffset: -1,
    startHour: 10,
    startMinute: 30,
    durationMinutes: 60,
    records: {
      "student-marta-perez": { status: "present", recordedOffsetMinutes: 10 },
      "student-joan-gimenez": { status: "present", recordedOffsetMinutes: 11 },
      "student-ines-ferrer": { status: "present", recordedOffsetMinutes: 12 },
      "student-adrian-llopis": { status: "justified", justification: "Informe médico", recordedOffsetMinutes: 20 },
    },
  },
  {
    id: "session-technology-two-days-ago",
    groupId: "group-3eso-a",
    subjectId: "subject-technology",
    teacher: "Núria Bosch",
    location: "Taller de Tecnología",
    dayOffset: -2,
    startHour: 11,
    startMinute: 45,
    durationMinutes: 60,
    records: {
      "student-ana-garcia": { status: "present", recordedOffsetMinutes: 7 },
      "student-luis-martin": { status: "present", recordedOffsetMinutes: 7 },
      "student-marc-puig": { status: "present", recordedOffsetMinutes: 8 },
      "student-julia-ros": { status: "present", recordedOffsetMinutes: 9 },
    },
  },
  {
    id: "session-history-three-days-ago",
    groupId: "group-2eso-b",
    subjectId: "subject-history",
    teacher: "Maribel Costa",
    location: "Aula 203",
    dayOffset: -3,
    startHour: 12,
    startMinute: 0,
    durationMinutes: 60,
    records: {
      "student-sara-ruiz": { status: "present", recordedOffsetMinutes: 5 },
      "student-alejandro-cano": { status: "late", recordedOffsetMinutes: 20, justification: "Transporte escolar" },
      "student-nora-vidal": { status: "present", recordedOffsetMinutes: 6 },
      "student-pau-domenech": { status: "present", recordedOffsetMinutes: 8 },
    },
  },
  {
    id: "session-science-next-day",
    groupId: "group-4eso-c",
    subjectId: "subject-science",
    teacher: "Salvador Martí",
    location: "Laboratorio 1",
    dayOffset: 1,
    startHour: 9,
    startMinute: 0,
    durationMinutes: 60,
  },
  {
    id: "session-language-next-day",
    groupId: "group-2eso-b",
    subjectId: "subject-language",
    teacher: "Jaume Serra",
    location: "Aula 102",
    dayOffset: 1,
    startHour: 11,
    startMinute: 0,
    durationMinutes: 60,
  },
]

const ATTENDANCE_RANGES: AttendanceRange[] = ["today", "thisWeek", "thisMonth"]

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date)
  result.setMinutes(result.getMinutes() + minutes)
  return result
}

function startOfWeek(date: Date): Date {
  const result = startOfDay(date)
  const day = result.getDay()
  const distanceToMonday = (day + 6) % 7
  result.setDate(result.getDate() - distanceToMonday)
  return result
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getRangeBoundaries(range: AttendanceRange, referenceDate: Date) {
  if (range === "today") {
    const start = startOfDay(referenceDate)
    const end = addDays(start, 1)
    return { start, end }
  }

  if (range === "thisWeek") {
    const start = startOfWeek(referenceDate)
    const end = addDays(start, 7)
    return { start, end }
  }

  const start = startOfMonth(referenceDate)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1)
  return { start, end }
}

function getPreviousRangeBoundaries(range: AttendanceRange, referenceDate: Date) {
  const current = getRangeBoundaries(range, referenceDate)
  const duration = current.end.getTime() - current.start.getTime()
  const previousEnd = new Date(current.start.getTime())
  const previousStart = new Date(previousEnd.getTime() - duration)
  return { start: previousStart, end: previousEnd }
}

function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date < end
}

function buildAttendanceSessions(referenceDate: Date): AttendanceSession[] {
  const today = startOfDay(referenceDate)

  return SCHEDULE_TEMPLATES.map((template) => {
    const sessionStartBase = addMinutes(addDays(today, template.dayOffset), template.startHour * 60 + template.startMinute)
    const sessionEnd = addMinutes(sessionStartBase, template.durationMinutes)
    const group = GROUPS_BY_ID.get(template.groupId)
    const subject = SUBJECTS_BY_ID.get(template.subjectId)

    const records: SessionStudentRecord[] = group
      ? Object.entries(template.records ?? {}).reduce<SessionStudentRecord[]>((accumulator, [studentId, record]) => {
          const student = group.students.find((item) => item.id === studentId)
          if (!student) {
            return accumulator
          }

          const recordedAt = addMinutes(sessionStartBase, record.recordedOffsetMinutes ?? 10)
          accumulator.push({
            id: `${template.id}-${student.id}`,
            studentId: student.id,
            studentName: student.name,
            status: record.status,
            justification: record.justification,
            recordedAt,
          })
          return accumulator
        }, [])
      : []

    return {
      id: template.id,
      groupId: template.groupId,
      groupName: group?.name ?? template.groupId,
      subjectId: template.subjectId,
      subjectName: subject?.name ?? template.subjectId,
      teacher: template.teacher,
      location: template.location,
      start: sessionStartBase,
      end: sessionEnd,
      records,
    }
  })
}

function flattenSessions(sessions: AttendanceSession[]): AttendanceRecord[] {
  const flattened: AttendanceRecord[] = []

  sessions.forEach((session) => {
    session.records.forEach((record) => {
      flattened.push({
        id: record.id,
        sessionId: session.id,
        sessionStart: session.start,
        sessionEnd: session.end,
        studentId: record.studentId,
        studentName: record.studentName,
        groupId: session.groupId,
        groupName: session.groupName,
        subjectId: session.subjectId,
        subjectName: session.subjectName,
        status: record.status,
        justification: record.justification,
        recordedAt: record.recordedAt,
      })
    })
  })

  return flattened.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
}

function calculateAttendanceCounts(records: AttendanceRecord[]) {
  return records.reduce(
    (totals, record) => {
      totals.recordedAttendances += 1

      switch (record.status) {
        case "present":
          totals.present += 1
          break
        case "absent":
          totals.absent += 1
          break
        case "late":
          totals.late += 1
          break
        case "justified":
          totals.justified += 1
          break
        case "excused":
          totals.excused += 1
          break
      }

      if (record.status === "present" || record.status === "late" || record.status === "justified" || record.status === "excused") {
        totals.positiveAttendances += 1
      }

      return totals
    },
    {
      recordedAttendances: 0,
      present: 0,
      absent: 0,
      late: 0,
      justified: 0,
      excused: 0,
      positiveAttendances: 0,
    },
  )
}

function calculateAttendanceRate(positiveAttendances: number, totalAttendances: number) {
  if (totalAttendances === 0) {
    return 0
  }

  return (positiveAttendances / totalAttendances) * 100
}

function calculateTrend(currentRate: number, previousRate: number): { difference: number; previousRate: number; direction: TrendDirection } {
  const difference = currentRate - previousRate
  const direction: TrendDirection = difference > 0.0001 ? "up" : difference < -0.0001 ? "down" : "equal"
  return { difference, previousRate, direction }
}

function sumExpectedAttendances(sessions: AttendanceSession[], rangeStart: Date, rangeEnd: Date) {
  return sessions.reduce((total, session) => {
    if (!isWithinRange(session.start, rangeStart, rangeEnd)) {
      return total
    }

    const group = GROUPS_BY_ID.get(session.groupId)
    if (!group) {
      return total
    }

    return total + group.students.length
  }, 0)
}

function getPendingGroupsForDate(sessions: AttendanceSession[], targetDate: Date): PendingGroup[] {
  const rangeStart = startOfDay(targetDate)
  const rangeEnd = addDays(rangeStart, 1)
  const groupedRecords = new Map<string, Set<string>>()

  sessions.forEach((session) => {
    if (!isWithinRange(session.start, rangeStart, rangeEnd)) {
      return
    }

    const existing = groupedRecords.get(session.groupId) ?? new Set<string>()
    session.records.forEach((record) => existing.add(record.studentId))
    groupedRecords.set(session.groupId, existing)
  })

  const pendingGroups: PendingGroup[] = []

  groupedRecords.forEach((recordedIds, groupId) => {
    const group = GROUPS_BY_ID.get(groupId)
    if (!group) {
      return
    }

    const missingStudents = group.students.length - recordedIds.size
    if (missingStudents > 0) {
      pendingGroups.push({
        groupId: group.id,
        groupName: group.name,
        missingStudents,
        totalStudents: group.students.length,
      })
    }
  })

  return pendingGroups.sort((a, b) => b.missingStudents - a.missingStudents)
}

function getPendingJustifications(records: AttendanceRecord[]): PendingJustification[] {
  return records
    .filter((record) => record.status === "absent" && !record.justification)
    .map((record) => ({
      recordId: record.id,
      studentName: record.studentName,
      groupName: record.groupName,
      subjectName: record.subjectName,
      date: record.sessionStart,
      sessionId: record.sessionId,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

function getNextClass(sessions: AttendanceSession[], referenceDate: Date): UpcomingClass | null {
  const upcomingSessions = sessions
    .filter((session) => session.start.getTime() >= referenceDate.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  if (upcomingSessions.length === 0) {
    return null
  }

  const session = upcomingSessions[0]
  return {
    sessionId: session.id,
    groupName: session.groupName,
    subjectName: session.subjectName,
    teacher: session.teacher,
    location: session.location,
    start: session.start,
    end: session.end,
  }
}

function filterRecordsByRange(records: AttendanceRecord[], range: AttendanceRange, referenceDate: Date) {
  const { start, end } = getRangeBoundaries(range, referenceDate)
  return records.filter((record) => isWithinRange(record.sessionStart, start, end))
}

function buildSummary(
  sessions: AttendanceSession[],
  records: AttendanceRecord[],
  range: AttendanceRange,
  referenceDate: Date,
): AttendanceSummary {
  const { start, end } = getRangeBoundaries(range, referenceDate)
  const currentRecords = records.filter((record) => isWithinRange(record.sessionStart, start, end))
  const currentCounts = calculateAttendanceCounts(currentRecords)
  const currentRate = calculateAttendanceRate(currentCounts.positiveAttendances, currentCounts.recordedAttendances)

  const previousRange = getPreviousRangeBoundaries(range, referenceDate)
  const previousRecords = records.filter((record) => isWithinRange(record.sessionStart, previousRange.start, previousRange.end))
  const previousCounts = calculateAttendanceCounts(previousRecords)
  const previousRate = calculateAttendanceRate(previousCounts.positiveAttendances, previousCounts.recordedAttendances)
  const trend = calculateTrend(currentRate, previousRate)

  const totalSessions = sessions.filter((session) => isWithinRange(session.start, start, end)).length
  const totalExpectedAttendances = sumExpectedAttendances(sessions, start, end)

  return {
    totalSessions,
    totalExpectedAttendances,
    recordedAttendances: currentCounts.recordedAttendances,
    present: currentCounts.present,
    absent: currentCounts.absent,
    late: currentCounts.late,
    justified: currentCounts.justified,
    excused: currentCounts.excused,
    attendanceRate: currentRate,
    trend,
  }
}

function ensureRange(range?: AttendanceRange): AttendanceRange {
  if (range && ATTENDANCE_RANGES.includes(range)) {
    return range
  }
  return "today"
}

export function getAttendanceDashboardData(options?: {
  range?: AttendanceRange
  referenceDate?: Date
}): AttendanceDashboardData {
  const range = ensureRange(options?.range)
  const referenceDate = options?.referenceDate ? new Date(options.referenceDate) : new Date()
  const sessions = buildAttendanceSessions(referenceDate)
  const records = flattenSessions(sessions)
  const summary = buildSummary(sessions, records, range, referenceDate)
  const pendingGroups = getPendingGroupsForDate(sessions, referenceDate)
  const pendingJustifications = getPendingJustifications(records)
  const nextClass = getNextClass(sessions, referenceDate)
  const rangeRecords = filterRecordsByRange(records, range, referenceDate)

  return {
    range,
    summary,
    pendingGroups,
    pendingJustifications,
    nextClass,
    records: rangeRecords,
    sessions,
  }
}

export type {
  AttendanceDashboardData,
  AttendanceRange,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  AttendanceSummary,
  PendingGroup,
  PendingJustification,
  UpcomingClass,
}

export { ATTENDANCE_RANGES }
