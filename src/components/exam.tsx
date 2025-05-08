"use client"
import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FileText, Edit, Calendar, MapPin, Users, Clock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { cn } from "@/lib/utils"
import { addExam, selectExams, toggleBlockExam, updateExam } from "@/redux/examDataSlice"
import { useDispatch, useSelector } from "react-redux"

interface ExamData {
  id: string
  name: string
  location: string
  openingDate: string
  closingDate: string
  slot1: string
  slot2: string
  slot3: string
  applicationsLimit: number
  waitingLimit: number
  formLink: string
  isBlocked: boolean
  receivingApplicationsCount: number
}

interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  applicationsDateRange: z.object({
    from: z.string().min(1, "Required"),
    to: z.string().min(1, "Required"),
  }),
  applicationsLimit: z.string().min(1, "Required"),
  waitingLimit: z.string().min(1, "Required"),
  slot1DateRange: z.object({
    from: z.string().min(1, "Required"),
    to: z.string().min(1, "Required"),
  }),
  slot2DateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
  slot3DateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
})

type FormValues = z.infer<typeof formSchema>

function DateRangePickerWithRange({
  className,
  value,
  onChange,
  isError = false,
}: {
  className?: string
  value: { from: string; to: string }
  onChange: (value: { from: string; to: string }) => void
  isError?: boolean
}) {
  const [date, setDate] = useState<DateRange>({
    from: value.from ? new Date(value.from) : undefined,
    to: value.to ? new Date(value.to) : undefined,
  })

  // Use a ref to track if we're handling a prop change
  const isUpdatingFromProps = useRef(false)

  // Only update local state when props change and values are different
  useEffect(() => {
    const newFrom = value.from ? new Date(value.from) : undefined
    const newTo = value.to ? new Date(value.to) : undefined

    const currentFromStr = date.from ? date.from.toLocaleDateString("en-CA") : ""
    const currentToStr = date.to ? date.to.toLocaleDateString("en-CA") : ""

    if (value.from !== currentFromStr || value.to !== currentToStr) {
      isUpdatingFromProps.current = true
      setDate({
        from: newFrom,
        to: newTo,
      })
    }
  }, [value.from, value.to])

  // Handle user interactions with the date picker
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate || { from: undefined, to: undefined })

    if (newDate?.from || newDate?.to) {
      onChange({
        from: newDate.from ? format(newDate.from, "yyyy-MM-dd") : "",
        to: newDate.to ? format(newDate.to, "yyyy-MM-dd") : "",
      })
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className={isError ? "border border-red-500 rounded-md" : ""}>
        <DatePickerWithRange date={date} setDate={handleDateChange} />
      </div>
    </div>
  )
}

const defaultFormState = {
  name: "",
  location: "",
  applicationsDateRange: { from: "", to: "" },
  applicationsLimit: "",
  waitingLimit: "",
  slot1DateRange: { from: "", to: "" },
  slot2DateRange: { from: "", to: "" },
  slot3DateRange: { from: "", to: "" },
}

export function Exam() {
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const dispatch = useDispatch()
  const exams = useSelector(selectExams)

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormState,
    mode: "onSubmit",
  })

  const { formState } = form
  const { errors } = formState

  // Handle date range changes
  const handleDateRangeChange = (
    field: "applicationsDateRange" | "slot1DateRange" | "slot2DateRange" | "slot3DateRange",
    value: { from: string; to: string },
  ) => {
    form.setValue(field, value, { shouldValidate: false })
  }

  const onSubmit = (data: FormValues) => {
    if (editMode && editId !== null) {
      // Update existing exam
      const examToUpdate = exams.find((exam) => exam.id === editId)
      if (examToUpdate) {
        dispatch(
          updateExam({
            ...examToUpdate,
            name: data.name,
            location: data.location,
            openingDate: data.applicationsDateRange.from,
            closingDate: data.applicationsDateRange.to,
            slot1: `${data.slot1DateRange.from} | ${data.slot1DateRange.to}`,
            slot2: data.slot2DateRange.from ? `${data.slot2DateRange.from} | ${data.slot2DateRange.to}` : "",
            slot3: data.slot3DateRange.from ? `${data.slot3DateRange.from} | ${data.slot3DateRange.to}` : "",
            applicationsLimit: Number.parseInt(data.applicationsLimit) || 0,
            waitingLimit: Number.parseInt(data.waitingLimit) || 0,
          }),
        )
        setEditMode(false)
        setEditId(null)
      }
    } else {
      // Add new exam
      const ID = crypto.randomUUID()
      const newExamData: ExamData = {
        id: ID,
        name: data.name,
        location: data.location,
        openingDate: data.applicationsDateRange.from,
        closingDate: data.applicationsDateRange.to,
        slot1: `${data.slot1DateRange.from} | ${data.slot1DateRange.to}`,
        slot2: data.slot2DateRange.from ? `${data.slot2DateRange.from} | ${data.slot2DateRange.to}` : "",
        slot3: data.slot3DateRange.from ? `${data.slot3DateRange.from} | ${data.slot3DateRange.to}` : "",
        applicationsLimit: Number.parseInt(data.applicationsLimit) || 0,
        waitingLimit: Number.parseInt(data.waitingLimit) || 0,
        formLink: `${window.location.origin}/application/${ID}`,
        isBlocked: false,
        receivingApplicationsCount: 0,
      }

      dispatch(addExam(newExamData))
    }

    // Reset form
    form.reset(defaultFormState)
  }

  const toggleBlock = (id: string) => {
    dispatch(toggleBlockExam(id))
  }

  const handleEdit = (exam: ExamData) => {
    // Parse slot dates
    const [slot1Start, slot1End] = exam.slot1.split(" | ")
    const slot2Parts = exam.slot2 ? exam.slot2.split(" | ") : ["", ""]
    const slot3Parts = exam.slot3 ? exam.slot3.split(" | ") : ["", ""]

    // Set form data with parsed dates
    form.reset({
      name: exam.name,
      location: exam.location,
      applicationsDateRange: {
        from: exam.openingDate,
        to: exam.closingDate,
      },
      applicationsLimit: exam.applicationsLimit.toString(),
      waitingLimit: exam.waitingLimit.toString(),
      slot1DateRange: {
        from: slot1Start.trim(),
        to: slot1End.trim(),
      },
      slot2DateRange: {
        from: slot2Parts[0].trim(),
        to: slot2Parts[1].trim(),
      },
      slot3DateRange: {
        from: slot3Parts[0].trim(),
        to: slot3Parts[1].trim(),
      },
    })

    setEditMode(true)
    setEditId(exam.id)

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    form.reset(defaultFormState)
    setEditMode(false)
    setEditId(null)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-100 dark:bg-slate-800 border-b dark:border-slate-700">
          <CardTitle className="text-xl font-bold dark:text-slate-200 flex items-center">
            {editMode ? (
              <>
                <Edit className="h-5 w-5 mr-2" />
                Edit Exam
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5 mr-2" />
                Add New Exam
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="examName" className="dark:text-slate-200 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Exam Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="examName"
                  {...form.register("name")}
                  placeholder="Exam Name"
                  className={cn(
                    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                    errors.name && "border-red-500 focus:ring-red-500",
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examLocation" className="dark:text-slate-200 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Exam Location <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="examLocation"
                  {...form.register("location")}
                  placeholder="Exam Location"
                  className={cn(
                    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                    errors.location && "border-red-500 focus:ring-red-500",
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applicationsDateRange" className="dark:text-slate-200 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Applications Receiving Dates <span className="text-red-500 ml-1">*</span>
                </Label>
                <DateRangePickerWithRange
                  value={form.watch("applicationsDateRange")}
                  onChange={(value) => handleDateRangeChange("applicationsDateRange", value)}
                  isError={!!errors.applicationsDateRange?.from || !!errors.applicationsDateRange?.to}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationsLimit" className="dark:text-slate-200 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Applications Limit <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="applicationsLimit"
                    type="number"
                    {...form.register("applicationsLimit")}
                    placeholder="Limit"
                    className={cn(
                      "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                      errors.applicationsLimit && "border-red-500 focus:ring-red-500",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waitingLimit" className="dark:text-slate-200 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Waiting Limit <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="waitingLimit"
                    type="number"
                    {...form.register("waitingLimit")}
                    placeholder="Waiting Limit"
                    className={cn(
                      "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                      errors.waitingLimit && "border-red-500 focus:ring-red-500",
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-200 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Exam Slot One <span className="text-red-500 ml-1">*</span>
                </Label>
                <DateRangePickerWithRange
                  value={form.watch("slot1DateRange")}
                  onChange={(value) => handleDateRangeChange("slot1DateRange", value)}
                  isError={!!errors.slot1DateRange?.from || !!errors.slot1DateRange?.to}
                />
              </div>

              <div className="space-y-2">
                <Label className="dark:text-slate-200 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Exam Slot Two (if applicable)
                </Label>
                <DateRangePickerWithRange
                  value={{
                    from: form.watch("slot2DateRange")?.from || "",
                    to: form.watch("slot2DateRange")?.to || "",
                  }}
                  onChange={(value) => handleDateRangeChange("slot2DateRange", value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="dark:text-slate-200 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Exam Slot Three (if applicable)
                </Label>
                <DateRangePickerWithRange
                  value={{
                    from: form.watch("slot3DateRange")?.from || "",
                    to: form.watch("slot3DateRange")?.to || "",
                  }}
                  onChange={(value) => handleDateRangeChange("slot3DateRange", value)}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-200 transform hover:scale-105"
              >
                {editMode ? "Update Exam" : "Submit"}
              </Button>
              {editMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 dark:bg-slate-900/80 dark:border-slate-800 overflow-hidden gradient-border">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-b dark:border-slate-700">
          <CardTitle className="text-xl font-bold dark:text-slate-200 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
            Exam Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80">
          <ScrollArea className="h-[500px]">
            <div className="p-4">
              <div className="grid grid-cols-1 w-auto md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[...exams].map((exam) => (
                  <div
                    key={exam.id}
                    className="exam-card relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-xl dark:shadow-slate-900/30 hover:translate-y-[-5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <div className="absolute top-0 right-0 p-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs dark:text-slate-400">{exam.isBlocked ? "Blocked" : "Active"}</span>
                        <Switch
                          checked={exam.isBlocked}
                          onCheckedChange={() => toggleBlock(exam.id)}
                          className="data-[state=checked]:bg-slate-700"
                        />
                      </div>
                    </div>

                    <div className="mb-4 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-lg dark:text-white">{exam.name}</h3>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        <span className="dark:text-slate-300">{exam.location}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        <span className="dark:text-slate-300">
                          {exam.openingDate} - {exam.closingDate}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                        <span className="dark:text-slate-300">
                          Limit: {exam.applicationsLimit} (Waiting: {exam.waitingLimit})
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold dark:text-slate-200">Exam Slots:</h4>
                      {exam.slot1 && (
                        <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300">
                          Slot 1: {exam.slot1}
                        </div>
                      )}
                      {exam.slot2 && (
                        <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300">
                          Slot 2: {exam.slot2}
                        </div>
                      )}
                      {exam.slot3 && (
                        <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300">
                          Slot 3: {exam.slot3}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
                      >
                        <a href={exam.formLink} target="_blank" rel="noopener noreferrer">
                          Form Link
                        </a>
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 transition-all duration-200 transform hover:scale-105 btn-glow"
                        onClick={() => handleEdit(exam)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
