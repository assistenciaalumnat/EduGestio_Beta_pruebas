"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Check,
  CircleHelp,
  Clock,
  ListChecks,
  Save,
  UserPlus,
  Users,
} from "lucide-react";

// Tipos de datos
type AttendanceStatus = "present" | "absent" | "late" | "excused" | null;

export type Student = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Group = {
  id: string;
  name: string;
};

export type Subject = {
  id: string;
  name: string;
};

export type AttendanceRecord = Record<string, AttendanceStatus>;

// Props
interface AttendancePanelProps {
  date?: string;
  groups: Group[];
  subjects: Subject[];
  students: Student[];
  defaultGroupId?: string;
  defaultSubjectId?: string;
  onGroupChange?: (groupId: string) => void;
  onSave?: (payload: {
    date: string;
    groupId: string;
    subjectId: string;
    attendance: AttendanceRecord;
  }) => Promise<void> | void;
}

// Utilidad
const formatDate = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toISOString().slice(0, 10);
};

// Componente principal
export default function AttendancePanel({
  date,
  groups,
  subjects,
  students,
  defaultGroupId,
  defaultSubjectId,
  onGroupChange,
  onSave,
}: AttendancePanelProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>(
    defaultGroupId ?? groups[0]?.id ?? ""
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    defaultSubjectId ?? subjects[0]?.id ?? ""
  );
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(date));
  const [search, setSearch] = useState("");

  const [attendance, setAttendance] = useState<AttendanceRecord>(() => {
    const base: AttendanceRecord = {};
    for (const s of students) base[s.id] = null;
    return base;
  });

  const filtered = useMemo(
    () =>
      students.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      ),
    [students, search]
  );

  const counters = useMemo(() => {
    return Object.values(attendance).reduce(
      (acc, v) => {
        if (!v) return acc;
        acc[v]++;
        return acc;
      },
      { present: 0, absent: 0, late: 0, excused: 0 } as Record<
        Exclude<AttendanceStatus, null>,
        number
      >
    );
  }, [attendance]);

  const setAll = (status: Exclude<AttendanceStatus, null>) => {
    const next: AttendanceRecord = {};
    for (const s of students) next[s.id] = status;
    setAttendance(next);
  };

  const clearAll = () => {
    const next: AttendanceRecord = {};
    for (const s of students) next[s.id] = null;
    setAttendance(next);
  };

  const save = async () => {
    if (!onSave) return;
    await onSave({
      date: selectedDate,
      groupId: selectedGroup,
      subjectId: selectedSubject,
      attendance,
    });
  };

  return (
    <div className="space-y-6">
      {/* Filtros y cabecera */}
      <Card className="border border-muted/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Control d'assistència
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-sm opacity-80">Grup</label>
            <Select value={selectedGroup} onValueChange={(groupId) => {
              setSelectedGroup(groupId);
              onGroupChange?.(groupId);
            }}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Selecciona un grup" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm opacity-80">Assignatura</label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Selecciona" />
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
          <div>
            <label className="text-sm opacity-80">Data</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm opacity-80">Cerca alumne</label>
            <Input
              placeholder="Nom de l'estudiant"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Acciones globales */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setAll("present")}>
          <ListChecks className="mr-2 h-4 w-4" /> Marcar tots presents
        </Button>
        <Button variant="secondary" onClick={() => setAll("absent")}>
          <CircleHelp className="mr-2 h-4 w-4" /> Marcar tots absents
        </Button>
        <Button variant="secondary" onClick={() => setAll("late")}>
          <Clock className="mr-2 h-4 w-4" /> Marcar tots tardança
        </Button>
        <Button variant="ghost" onClick={clearAll}>
          Netejar
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline">Presents: {counters.present}</Badge>
          <Badge variant="outline">Absents: {counters.absent}</Badge>
          <Badge variant="outline">Retards: {counters.late}</Badge>
          <Badge variant="outline">Justificats: {counters.excused}</Badge>
          <Button onClick={save}>
            <Save className="mr-2 h-4 w-4" /> Desar assistència
          </Button>
        </div>
      </div>

      {/* Taula d'estudiants */}
      <Card className="border border-muted/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>Alumne</TableHead>
                <TableHead className="w-[460px]">Assistència</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs opacity-70">
                    {String(i + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                        {s.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="leading-tight">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs opacity-70">ID: {s.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tabs
                      value={attendance[s.id] ?? undefined}
                      onValueChange={(val) =>
                        setAttendance((prev) => ({
                          ...prev,
                          [s.id]: val as AttendanceStatus,
                        }))
                      }
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="present" className="data-[state=active]:font-semibold">
                          <Check className="mr-1 h-4 w-4" /> Present
                        </TabsTrigger>
                        <TabsTrigger value="absent" className="data-[state=active]:font-semibold">
                          Falta
                        </TabsTrigger>
                        <TabsTrigger value="late" className="data-[state=active]:font-semibold">
                          Retard
                        </TabsTrigger>
                        <TabsTrigger value="excused" className="data-[state=active]:font-semibold">
                          Justificada
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="present" />
                      <TabsContent value="absent" />
                      <TabsContent value="late" />
                      <TabsContent value="excused" />
                    </Tabs>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 text-sm opacity-70">
        <UserPlus className="mt-0.5 h-4 w-4" />
        Pots afegir alumnes des del mòdul de Persones o carregar-los via API.
      </div>
    </div>
  );
}
