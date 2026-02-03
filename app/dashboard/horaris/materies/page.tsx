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

  // RA local UI state
  const [raEditingId, setRaEditingId] = useState<string | null>(null)
  const [raForm, setRaForm] = useState<{ name: string; percentage: string; hours: string }>({
    name: "",
    percentage: "",
    hours: "",
  })

  const lectiveCount = useMemo(
    () => subjects.filter((subject) => subject.type === "lective").length,
    [subjects],
  )
  const nonLectiveCount = subjects.length - lectiveCount

  const currentSubject = useMemo(
    () => (editingId ? subjects.find((s) => s.id === editingId) : null),
    [editingId, subjects],
  )

  const openCreateDialog = () => {
    setEditingId(null)
    setFormState(EMPTY_FORM)
    setIsDialogOpen(true)
    // RA: only meaningful in edit mode, but reset anyway
    setRaEditingId(null)
    setRaForm({ name: "", percentage: "", hours: "" })
  }

  const openEditDialog = (id: string) => {
    const subject = subjects.find((item) => item.id === id)
    if (!subject) return

    setEditingId(id)
    setFormState({
      name: subject.name,
      type: subject.type,
      defaultLocation: subject.defaultLocation ?? "",
    })

    // reset RA editor state when opening
    setRaEditingId(null)
    setRaForm({ name: "", percentage: "", hours: "" })

    setIsDialogOpen(true)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = formState.name.trim()
    const trimmedLocation = formState.defaultLocation.trim()

    if (!trimmedName) {
      toast({
        title: t("subjects.validationTitle"),
        description: t("subjects.validationName"),
        variant: "destructive",
      })
      return
    }

    const duplicate = subjects.some(
      (subject) =>
        subject.name.toLowerCase() === trimmedName.toLowerCase() &&
        subject.id !== editingId,
    )

    if (duplicate) {
      toast({
        title: t("subjects.validationTitle"),
        description: t("subjects.validationDuplicate"),
        variant: "destructive",
      })
      return
    }

    if (editingId) {
      // keep existing RAs
      const existing = subjects.find((s) => s.id === editingId)
      editSubject(editingId, {
        name: trimmedName,
        type: formState.type,
        defaultLocation: trimmedLocation,
        ras: existing?.ras ?? [],
      } as any) // if TS complains, ensure your ScheduleSubject includes ras
      toast({
        title: t("subjects.editSuccessTitle"),
        description: t("subjects.editSuccessDescription"),
      })
    } else {
      addSubject({
        name: trimmedName,
        type: formState.type,
        defaultLocation: trimmedLocation,
        ras: [],
      } as any)
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

  const resetRaForm = () => {
    setRaEditingId(null)
    setRaForm({ name: "", percentage: "", hours: "" })
  }

  const handleRaSubmit = () => {
    if (!editingId) {
      toast({
        title: t("subjects.validationTitle"),
        description: "Guarda la matèria abans d’afegir RA.",
        variant: "destructive",
      })
      return
    }

    const name = raForm.name.trim()
    const percentage = Number(raForm.percentage)
    const hours = Number(raForm.hours)

    if (!name) {
      toast({
        title: t("subjects.validationTitle"),
        description: "El nom del RA és obligatori.",
        variant: "destructive",
      })
      return
    }

    if (!Number.isFinite(percentage) || percentage < 0) {
      toast({
        title: t("subjects.validationTitle"),
        description: "Percentatge no vàlid.",
        variant: "destructive",
      })
      return
    }

    if (!Number.isFinite(hours) || hours < 0) {
      toast({
        title: t("subjects.validationTitle"),
        description: "Hores no vàlides.",
        variant: "destructive",
      })
      return
    }

    // avoid duplicate RA names inside the same subject
    const duplicate = (currentSubject?.ras ?? []).some(
      (r) =>
        r.name.toLowerCase() === name.toLowerCase() && r.id !== raEditingId,
    )

    if (duplicate) {
      toast({
        title: t("subjects.validationTitle"),
        description: "Ja existeix un RA amb aquest nom en esta matèria.",
        variant: "destructive",
      })
      return
    }

    if (raEditingId) {
      editRA(editingId, raEditingId, { name, percentage, hours })
      toast({ title: "RA actualitzat", description: "S’han guardat els canvis del RA." })
    } else {
      addRA(editingId, { name, percentage, hours })
      toast({ title: "RA creat", description: "S’ha afegit un nou RA a la matèria." })
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
    toast({ title: "RA eliminat", description: "S’ha eliminat el RA." })
  }

  return (
    <>
      <PageLayout
        title={t("subjects.title")}
        description={t("subjects.description")}
        actions={
          <div className="flex flex-wrap gap-2">
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
                  <AlertDialogAction onClick={handleReset}>{t("subjects.resetConfirm")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("subjects.totalSubjects")}</CardTitle>
              <CardDescription>{t("subjects.totalDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("subjects.lectiveSubjects")}</CardTitle>
              <CardDescription>{t("subjects.lectiveDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lectiveCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-medium">{t("subjects.nonLectiveSubjects")}</CardTitle>
              <CardDescription>{t("subjects.nonLectiveDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{nonLectiveCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("subjects.listTitle")}</CardTitle>
            <CardDescription>{t("subjects.listDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
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
                  {subjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        {t("subjects.emptyState")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>
                          <Badge variant={subject.type === "lective" ? "default" : "secondary"}>
                            {t(`schedules.${subject.type}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>{subject.defaultLocation || t("subjects.noLocation")}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(subject.id)}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            {t("common.edit")}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                {t("common.delete")}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t("subjects.deleteDialogTitle")}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("subjects.deleteDialogDescription", { name: subject.name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(subject.id)}>
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </PageLayout>

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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="subject-name">{t("subjects.formName")}</Label>
              <Input
                id="subject-name"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-type">{t("subjects.formType")}</Label>
              <Select
                value={formState.type}
                onValueChange={(value: ScheduleSubjectType) => setFormState((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="subject-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lective">{t("schedules.lective")}</SelectItem>
                  <SelectItem value="non_lective">{t("schedules.non_lective")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-location">{t("subjects.formLocation")}</Label>
              <Input
                id="subject-location"
                value={formState.defaultLocation}
                onChange={(event) => setFormState((prev) => ({ ...prev, defaultLocation: event.target.value }))}
                placeholder={t("subjects.formLocationPlaceholder")}
              />
            </div>

            {/* ✅ RA Section (only useful when editing an existing subject) */}
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">RA de la matèria</div>
                  <div className="text-xs text-muted-foreground">
                    Afegix resultats d’aprenentatge amb percentatge i hores.
                  </div>
                  {!editingId && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      (Guarda la matèria per a poder afegir RA.)
                    </div>
                  )}
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={resetRaForm}>
                  Nou RA
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="ra-name">Nom RA</Label>
                  <Input
                    id="ra-name"
                    value={raForm.name}
                    onChange={(e) => setRaForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ex: RA1 - Interpretar plànols"
                    disabled={!editingId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ra-percentage">Percentatge (%)</Label>
                  <Input
                    id="ra-percentage"
                    inputMode="decimal"
                    value={raForm.percentage}
                    onChange={(e) => setRaForm((p) => ({ ...p, percentage: e.target.value }))}
                    placeholder="Ex: 25"
                    disabled={!editingId}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ra-hours">Hores</Label>
                  <Input
                    id="ra-hours"
                    inputMode="decimal"
                    value={raForm.hours}
                    onChange={(e) => setRaForm((p) => ({ ...p, hours: e.target.value }))}
                    placeholder="Ex: 18"
                    disabled={!editingId}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {raEditingId ? <Badge variant="secondary">Editant RA</Badge> : <Badge variant="outline">Nou RA</Badge>}
                <Button type="button" onClick={handleRaSubmit} disabled={!editingId}>
                  {raEditingId ? "Guardar RA" : "Afegir RA"}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead className="w-[140px]">%</TableHead>
                      <TableHead className="w-[140px]">Hores</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(currentSubject?.ras ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Encara no hi ha RA en esta matèria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      (currentSubject?.ras ?? []).map((ra) => (
                        <TableRow key={ra.id}>
                          <TableCell className="font-medium">{ra.name}</TableCell>
                          <TableCell>{ra.percentage}</TableCell>
                          <TableCell>{ra.hours}</TableCell>
                          <TableCell className="space-x-2 text-right">
                            <Button type="button" variant="outline" size="sm" onClick={() => openEditRA(ra)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              {t("common.edit")}
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm">
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  {t("common.delete")}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Eliminar RA</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Segur que vols eliminar el RA “{ra.name}”?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteRA(ra.id)}>
                                    {t("common.delete")}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
