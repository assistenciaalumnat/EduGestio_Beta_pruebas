"use client"

import { useMemo, useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { useToast } from "@/hooks/use-toast"
import { useScheduleSubjects } from "@/lib/schedule-subjects"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type GradesByRaId = Record<string, string>

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export default function QualificacionsPage() {
  const { toast } = useToast()
  const { subjects } = useScheduleSubjects()

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [grades, setGrades] = useState<GradesByRaId>({})

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  )

  const ras = selectedSubject?.ras ?? []

  const percentTotal = useMemo(
    () => ras.reduce((acc, ra) => acc + (Number(ra.percentage) || 0), 0),
    [ras],
  )

  // Nota final ponderada sobre 100%
  const finalGrade = useMemo(() => {
    if (ras.length === 0) return null

    let sumWeighted = 0
    let sumPercentUsed = 0

    for (const ra of ras) {
      const raw = grades[ra.id]
      if (raw == null || raw.trim() === "") continue

      const g = Number(raw)
      if (!Number.isFinite(g)) continue

      const p = Number(ra.percentage) || 0
      const grade010 = clamp(g, 0, 10)

      sumWeighted += grade010 * (p / 100)
      sumPercentUsed += p
    }

    if (sumPercentUsed === 0) return null
    return sumWeighted
  }, [ras, grades])

  // Nota normalizada por los % realmente introducidos (útil si aún faltan notas)
  const finalGradeNormalized = useMemo(() => {
    if (ras.length === 0) return null

    let sumWeighted = 0
    let sumPercentUsed = 0

    for (const ra of ras) {
      const raw = grades[ra.id]
      if (raw == null || raw.trim() === "") continue

      const g = Number(raw)
      if (!Number.isFinite(g)) continue

      const p = Number(ra.percentage) || 0
      const grade010 = clamp(g, 0, 10)

      sumWeighted += grade010 * (p / 100)
      sumPercentUsed += p
    }

    if (sumPercentUsed === 0) return null
    return sumWeighted / (sumPercentUsed / 100)
  }, [ras, grades])

  const handleSelectSubject = (id: string) => {
    setSelectedSubjectId(id)
    setGrades({})
  }

  const setGrade = (raId: string, value: string) => {
    setGrades((prev) => ({ ...prev, [raId]: value }))
  }

  const clearGrades = () => {
    setGrades({})
    toast({
      title: "Notes esborrades",
      description: "S’han netejat les notes introduïdes.",
    })
  }

  const warnIfPercentNot100 = () => {
    if (!selectedSubject) return
    if (ras.length === 0) return

    if (Math.round(percentTotal) !== 100) {
      toast({
        title: "Atenció",
        description: `Els percentatges dels RA sumen ${percentTotal}%. El més habitual és 100%.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Correcte",
        description: "Els percentatges dels RA sumen 100%.",
      })
    }
  }

  return (
    <PageLayout
      title="Qualificacions"
      description="Selecciona una matèria, introdueix les notes dels RA i calcula la nota final ponderada."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearGrades} disabled={!selectedSubject || ras.length === 0}>
            Netejar notes
          </Button>
          <Button variant="secondary" onClick={warnIfPercentNot100} disabled={!selectedSubject || ras.length === 0}>
            Comprovar %
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar matèria</CardTitle>
          <CardDescription>En triar una matèria, apareixeran tots els seus RA.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Matèria</Label>
            <Select value={selectedSubjectId} onValueChange={handleSelectSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Tria una matèria..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubject && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{selectedSubject.type}</Badge>
              <span className="text-muted-foreground">
                Ubicació: {selectedSubject.defaultLocation || "—"}
              </span>
              <span className="text-muted-foreground">RA: {ras.length}</span>
              <span className="text-muted-foreground">Total %: {percentTotal}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RA i notes</CardTitle>
          <CardDescription>Introdueix una nota (0–10) per a cada RA. La nota final es calcula segons el percentatge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedSubject ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Selecciona una matèria per començar.
            </div>
          ) : ras.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aquesta matèria no té RA registrats. Afegeix-los a Materies.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RA</TableHead>
                      <TableHead className="w-[120px] text-right">%</TableHead>
                      <TableHead className="w-[120px] text-right">Hores</TableHead>
                      <TableHead className="w-[180px] text-right">Nota (0–10)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ras.map((ra) => (
                      <TableRow key={ra.id}>
                        <TableCell className="font-medium">{ra.name}</TableCell>
                        <TableCell className="text-right">{ra.percentage}</TableCell>
                        <TableCell className="text-right">{ra.hours}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            value={grades[ra.id] ?? ""}
                            onChange={(e) => setGrade(ra.id, e.target.value)}
                            inputMode="decimal"
                            placeholder="Ex: 7.5"
                            className="text-right"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Nota final (sobre 10)</CardTitle>
                    <CardDescription>Ponderada sobre el 100%.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-3xl font-bold">
                    {finalGrade == null ? "—" : finalGrade.toFixed(2)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Nota normalitzada</CardTitle>
                    <CardDescription>Només amb els RA que tenen nota.</CardDescription>
                  </CardHeader>
                  <CardContent className="text-3xl font-bold">
                    {finalGradeNormalized == null ? "—" : finalGradeNormalized.toFixed(2)}
                  </CardContent>
                </Card>
              </div>

              {Math.round(percentTotal) !== 100 && (
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  ⚠️ Els percentatges sumen <b>{percentTotal}%</b>. El més habitual és 100%.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  )
}
