"use client"

import { ReactNode } from "react"

interface AttendancePanelProps {
  children?: ReactNode
}

export function AttendancePanel({ children }: AttendancePanelProps) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  )
}
