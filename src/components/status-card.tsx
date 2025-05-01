"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatusCardProps {
  title: string
  value: number
  color: string
  onClick: () => void
  active: boolean
}

export function StatusCard({ title, value, color, onClick, active }: StatusCardProps) {
  return (
    <Card
      className={cn(
        "border-0 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden dark:bg-slate-900 dark:border-slate-800",
        active ? "ring-2 ring-slate-600 dark:ring-slate-400" : "",
      )}
      onClick={onClick}
    >
      <div className={`h-2 ${color}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium dark:text-slate-200">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold dark:text-slate-100">{value}</div>
      </CardContent>
    </Card>
  )
}
