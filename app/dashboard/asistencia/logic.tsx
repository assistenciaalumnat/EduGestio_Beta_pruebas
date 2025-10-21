import studentsData from "./students.json"

export interface Student {
  id: string
  name: string
  surname: string
}

export interface Group {
  id: string
  name: string
  students: Student[]
}

export function getStudentsByGroup(groupId: string): Student[] {
  const group = studentsData.groups.find((g: Group) => g.id === groupId)
  return group ? group.students : []
}

export function renderStudentRows(groupId: string) {
  const students = getStudentsByGroup(groupId)

  if (students.length === 0) {
    return null
  }

  return students.map((student: Student) => (
    <div
      key={student.id}
      className="flex items-center justify-between border-b border-gray-200 py-2 px-3 hover:bg-gray-50 rounded"
    >
      <span className="font-medium text-sm">{student.id}</span>
      <span className="text-gray-700">
        {student.name} {student.surname}
      </span>
    </div>
  ))
}
