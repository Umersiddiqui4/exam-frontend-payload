"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"

export type ApplicationData = {
  id: string
  candidateId: string
  date: string
  name: string
  email: string
  whatsapp: string
  emergencyContact: string
  status: string
  examId: number // Added examId to link applications to exams
  examName: string; 
  passportUrl?: string
  submittedDate: string
  fullName: string
  poBox: string
  district: string
  city: string
  province: string
  country: string
  dateOfPassingPart1: string
  countryOfOrigin: string
  registrationAuthority: string
  registrationNumber: string
  dateOfRegistration: string
  preferenceDate1: string
  preferenceDate2: string
  preferenceDate3: string
}

export const columns: ColumnDef<ApplicationData>[] = [
  {
    accessorKey: "previousOsceAttempts",
    header: "S/No",
  },
  {
    accessorKey: "candidateId",
    header: "Candidate ID#",
  },
  {
    accessorKey: "submittedDate",
    header: "Application Date",
    cell: ({ row }) => {
      const rawDate = row.getValue("submittedDate") as string;
      const date = new Date(rawDate);
      return date.toLocaleDateString(); // only date shown, no time
    },
  },
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "whatsapp",
    header: "WhatsApp",
  },
  {
    accessorKey: "emergencyContact",
    header: "Emergency Contact",
  },
  {
    accessorKey: "examName",
    header: "Exam",
    cell: ({ row }) => {
      const examName = row.getValue("examName") as string

      return (
        <Badge
          variant="outline"
          className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
        >
           {examName}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <Badge
          variant="outline"
          className={
            status === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              : status === "rejected"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
                : status === "pending"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
          }
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: () => {
      return (
        <button className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
          <FileText className="h-4 w-4" />
        </button>
      )
    },
  },
]
