"use client"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"

export default function AsistenciaPage() {
  const { t } = useI18n()

  return (
    <PageLayout title={t("attendance.title")} description={t("attendance.description")}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("attendance.todayAttendance")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">{t("attendance.comparedToYesterday")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("attendance.pendingGroups")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">{t("attendance.unregisteredGroups")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("attendance.nextClass")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10:15</div>
            <p className="text-xs text-muted-foreground">{t("attendance.mathClass")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("attendance.justifications")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">{t("attendance.pendingReview")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lista" className="mt-6">
        <TabsList>
          <TabsTrigger value="lista">{t("attendance.completeList")}</TabsTrigger>
          <TabsTrigger value="grupos">{t("attendance.splitGroups")}</TabsTrigger>
          <TabsTrigger value="historial">{t("attendance.history")}</TabsTrigger>
        </TabsList>
        <TabsContent value="lista" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline">{t("attendance.today")}</Button>
              <Button variant="outline">{t("attendance.thisWeek")}</Button>
              <Button variant="outline">{t("attendance.thisMonth")}</Button>
            </div>
            <Button>{t("attendance.registerAttendance")}</Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{"Selecciona un grup i assignatura"}</CardTitle>
              <div className="flex space-x-2">
                <select className="border border-gray-300 p-2 rounded" defaultValue="">
                  <option disabled value="">Assignatures</option>
                  <option value="catala">Llengua Catalana</option>
                  <option value="castella">Llengua Castellana</option>
                  <option value="matematiques">Matemàtiques</option>
                  <option value="historia">Història</option>
                  <option value="musica">Música</option>
                  <option value="biologia">Biologia</option>
                </select>

                <select className="border border-gray-300 p-2 rounded" defaultValue="">
                  <option disabled value="">Grups</option>
                  <option value="1a">1 A</option>
                  <option value="1b">1 B</option>
                  <option value="4a">4 A</option>
                  <option value="4b">4 B</option>
                  <option value="1bta">BT1 A</option>
                  <option value="1btb">BT1 B</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">{t("attendance.selectGroupToViewList")}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="grupos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("attendance.splitGroups")}</CardTitle>
              <CardDescription>{t("attendance.manageSplitGroups")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">{t("attendance.selectSplitGroup")}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("attendance.attendanceHistory")}</CardTitle>
              <CardDescription>{t("attendance.checkHistoryByStudentOrGroup")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">{t("attendance.selectStudentOrGroup")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
