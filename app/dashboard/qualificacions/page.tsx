"use client"

import { PageLayout } from "@/components/page-layout"
import { useI18n } from "@/lib/i18n-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function QualificacionsPage() {
  const { t } = useI18n()

  return (
    <PageLayout
      title={t("qualifications.title")}
      description={t("qualifications.description")}
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("qualifications.title")}</CardTitle>
          <CardDescription>{t("qualifications.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Qualifications page coming soon...</p>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
