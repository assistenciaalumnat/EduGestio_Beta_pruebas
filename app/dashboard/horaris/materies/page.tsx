"use client"

import { useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Undo2 } from "lucide-react"

import { PageLayout } from "@/components/page-layout"
import { useI18n } from "@/lib/i18n-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useScheduleSubjects } from "@/lib/schedule-subjects"
import type { ScheduleSubjectType, SubjectRA } from "@/lib/schedule-subjects"

type SubjectFormState = {
  name: string
  type: ScheduleSubjectType
  defaultLocation: string
}

const EMPTY_FORM: SubjectFormState = {
  name: "",
  type: "lective",
  defaultLocation: "",
}

export default function MateriesPage() {
  const { t } = useI18n()
  const { toast } = useToast()

  const {
    subjects,
    addSubject,
    editSubject,
    removeSubject,
    resetSubjects,
    addRA,
    editRA,
    removeRA,
  } = useScheduleSubjects()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formState, setFormState] = useState<SubjectFormState>(EMPTY_FORM)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  // RA UI state
  const [raEditingId, setRaEditingId] = useState<string | null>(null)
  const [raForm, setRaForm] = useState({ name: "", percentage: "", hours: "" })

  const lectiveCount = useMemo(
    () => subjects.filter((s) => s.type === "lective").length,
    [subjects],
  )
  const nonLectiveCount = subjects.length - lectiveCount

  const currentSubject = useMemo(
    () => (editingId ? subjects.find((s) => s.id === editingId) : null),
    [editingId, subjects],
  )

  /* -------------------- SUBJECT CRUD -------------------- */

  const openCreateDialog = () => {
    setEditingId(null)
    setFormState(EMPTY_FORM)
    setIsDialogOpen(true)
    resetRaForm()
  }

  const openEditDialog = (id: string) => {
    const subject = subjects.find((s) => s.id === id)
    if (!subject) return

    setEditingId(id)
    setFormState({
      name: subject.name,
      type: subject.type,
      defaultLocation: subject.defaultLocation ?? "",
    })
    resetRaForm()
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const name = formState.name.trim()
    const location = formState.defaultLocation.trim()

    if (!name) {
      toast({
        title: t("subjects.validationTitle"),
        description: t("subjects.validationName"),
        variant: "destructive",
      })
      return
    }

    if (editingId) {
      editSubject(editingId, {
        name,
        type: formState.type,
        defaultLocation: location,
        ras: currentSubject?.ras ?? [],
      })
      toast({
        title: t("subjects.editSuccessTitle"),
        description: t("subjects.editSuccessDescription"),
      })
    } else {
      addSubject({
        name,
        type: formState.type,
        defaultLocation: location,
        ras: [],
      })
      toast({
        title: t("subjects.createSuccessTitle"),
        description: t("subjects.createSuccessDescription"),
      })
    }

    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    removeSubject(id)
    toast({
      title: t("subjects.deleteSuccessTitle"),
      description: t("subjects.deleteSuccessDescription"),
    })
  }

  const handleReset = () => {
    resetSubjects()
    toast({
      title: t("subjects.resetSuccessTitle"),
      description: t("subjects.resetSuccessDescription"),
    })
    setIsResetDialogOpen(false)
  }

  /* -------------------- RA CRUD -------------------- */

  const resetRaForm = () => {
    setRaEditingId(null)
    setRaForm({ name: "", percentage: "", hours: "" })
  }

  const handleRaSubmit = () => {
    if (!editingId) return

    const name = raForm.name.trim()
    const percentage = raForm.percentage.trim()
    const hours = raForm.hours.trim()

    if (!name || !percentage || !hours) return

    const percentageNum = Number(percentage)
    const hoursNum = Number(hours)

    if (!Number.isFinite(percentageNum) || percentageNum < 0 || !Number.isFinite(hoursNum) || hoursNum < 0) return

    if (raEditingId) {
      editRA(editingId, raEditingId, { name, percentage: percentageNum, hours: hoursNum })
    } else {
      addRA(editingId, { name, percentage: percentageNum, hours: hoursNum })
    }

    resetRaForm()
  }

  const openEditRA = (ra: SubjectRA) => {
    setRaEditingId(ra.id)
    setRaForm({
      name: ra.name,
      percentage: String(ra.percentage),
      hours: String(ra.hours),
    })
  }

  const handleDeleteRA = (raId: string) => {
    if (!editingId) return
    removeRA(editingId, raId)
  }

  /* -------------------- UI -------------------- */

  return (
    <>
      <PageLayout
        title={t("subjects.title")}
        description={t("subjects.description")}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t("subjects.newSubject")}
            </Button>
            <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Undo2 className="mr-2 h-4 w-4" />
                  {t("subjects.resetSubjects")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("subjects.resetDialogTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("subjects.resetDialogDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    {t("subjects.resetConfirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      >
        {/* stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("subjects.totalSubjects")}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{subjects.length}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("subjects.lectiveSubjects")}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{lectiveCount}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("subjects.nonLectiveSubjects")}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{nonLectiveCount}</CardContent>
          </Card>
        </div>

        {/* table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("subjects.listTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("subjects.tableName")}</TableHead>
                  <TableHead>{t("subjects.tableType")}</TableHead>
                  <TableHead>{t("subjects.tableLocation")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>
                      <Badge>{t(`schedules.${subject.type}`)}</Badge>
                    </TableCell>
                    <TableCell>{subject.defaultLocation}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => openEditDialog(subject.id)}>
                        <Pencil className="mr-2 h-3 w-3" />
                        {t("common.edit")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(subject.id)}>
                        <Trash2 className="mr-2 h-3 w-3" />
                        {t("common.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </PageLayout>

      {/* -------------------- DIALOG -------------------- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("subjects.editDialogTitle") : t("subjects.createDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {editingId ? t("subjects.editDialogDescription") : t("subjects.createDialogDescription")}
            </DialogDescription>
          </DialogHeader>

          {/* FORM MATERIA */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t("subjects.formName")}</Label>
              <Input value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
            </div>

            <div>
              <Label>{t("subjects.formType")}</Label>
              <Select value={formState.type} onValueChange={(v) => setFormState({ ...formState, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lective">{t("schedules.lective")}</SelectItem>
                  <SelectItem value="non_lective">{t("schedules.non_lective")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("subjects.formLocation")}</Label>
              <Input
                value={formState.defaultLocation}
                onChange={(e) => setFormState({ ...formState, defaultLocation: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </form>

          {/* -------- RA SECTION (FUERA DEL FORM) -------- */}
          <div className="mt-6 space-y-3 border rounded-lg p-3">
            <h4 className="font-medium">RA</h4>

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Nom"
                value={raForm.name}
                onChange={(e) => setRaForm({ ...raForm, name: e.target.value })}
                disabled={!editingId}
              />
              <Input
                placeholder="%"
                value={raForm.percentage}
                onChange={(e) => setRaForm({ ...raForm, percentage: e.target.value })}
                disabled={!editingId}
              />
              <Input
                placeholder="Hores"
                value={raForm.hours}
                onChange={(e) => setRaForm({ ...raForm, hours: e.target.value })}
                disabled={!editingId}
              />
            </div>

            <Button type="button" onClick={handleRaSubmit} disabled={!editingId}>
              {raEditingId ? "Guardar RA" : "Afegir RA"}
            </Button>

            <Table>
              <TableBody>
                {(currentSubject?.ras ?? []).map((ra) => (
                  <TableRow key={ra.id}>
                    <TableCell>{ra.name}</TableCell>
                    <TableCell>{ra.percentage}%</TableCell>
                    <TableCell>{ra.hours}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => openEditRA(ra)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteRA(ra.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
