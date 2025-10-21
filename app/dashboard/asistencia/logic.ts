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
