"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FileText, Edit, Calendar, MapPin, Users, Clock, File } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import {
  toggleBlockExam,
} from "@/redux/examDataSlice";
import { useDispatch } from "react-redux";

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
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
});

type FormValues = z.infer<typeof formSchema>;

function DateRangePickerWithRange({
  className,
  value,
  onChange,
  isError = false,
}: {
  className?: string;
  value: { from: string; to: string };
  onChange: (value: { from: string; to: string }) => void;
  isError?: boolean;
}) {
  const [date, setDate] = useState<DateRange>({
    from: value.from ? new Date(value.from) : undefined,
    to: value.to ? new Date(value.to) : undefined,
  });

  // Use a ref to track if we're handling a prop change
  const isUpdatingFromProps = useRef(false);

  // Only update local state when props change and values are different
  useEffect(() => {
    const newFrom = value.from ? new Date(value.from) : undefined;
    const newTo = value.to ? new Date(value.to) : undefined;

    const currentFromStr = date.from
      ? date.from.toLocaleDateString("en-CA")
      : "";
    const currentToStr = date.to ? date.to.toLocaleDateString("en-CA") : "";

    if (value.from !== currentFromStr || value.to !== currentToStr) {
      isUpdatingFromProps.current = true;
      setDate({
        from: newFrom,
        to: newTo,
      });
    }
  }, [value.from, value.to]);

  // Handle user interactions with the date picker
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate || { from: undefined, to: undefined });

    if (newDate?.from || newDate?.to) {
      onChange({
        from: newDate.from ? format(newDate.from, "yyyy-MM-dd") : "",
        to: newDate.to ? format(newDate.to, "yyyy-MM-dd") : "",
      });
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className={isError ? "border border-red-500 rounded-md" : ""}>
        <DatePickerWithRange date={date} setDate={handleDateChange} />
      </div>
    </div>
  );
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
};

export function Exam() {
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const dispatch = useDispatch();
  // const exams = useSelector(selectExams)

  const [exams, setExams] = useState([]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://exam-cms-payload.vercel.app/api/exams", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Error fetching exams:", errorData);
        return;
      }

      const data = await res.json();
      console.log("✅ Exams fetched:", data.docs);
      setExams(data.docs); // 👈 exams state update ho rahi hai
    } catch (error) {
      console.error("❌ Network error while fetching exams:", error);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [editMode]);

  // Initialize form with React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormState,
    mode: "onSubmit",
  });

  const { formState } = form;
  const { errors } = formState;

  // Handle date range changes
  const handleDateRangeChange = (
    field:
      | "applicationsDateRange"
      | "slot1DateRange"
      | "slot2DateRange"
      | "slot3DateRange",
    value: { from: string; to: string }
  ) => {
    form.setValue(field, value, { shouldValidate: false });
  };
  console.log(editId, "editId");

  const onSubmit = async (data: any) => {
    const newExamData = {
      name: data.name,
      location: data.location,
      applicationsDateRange: {
        from: new Date(data.applicationsDateRange.from).toISOString(),
        to: new Date(data.applicationsDateRange.to).toISOString(),
      },
      slot1DateRange: {
        from: new Date(data.slot1DateRange.from).toISOString(),
        to: new Date(data.slot1DateRange.to).toISOString(),
      },
      slot2DateRange:
        data.slot2DateRange.from && data.slot2DateRange.to
          ? {
              from: new Date(data.slot2DateRange.from).toISOString(),
              to: new Date(data.slot2DateRange.to).toISOString(),
            }
          : undefined,
      slot3DateRange:
        data.slot3DateRange.from && data.slot3DateRange.to
          ? {
              from: new Date(data.slot3DateRange.from).toISOString(),
              to: new Date(data.slot3DateRange.to).toISOString(),
            }
          : undefined,
      applicationsLimit: data.applicationsLimit,
      waitingLimit: data.waitingLimit,
      formLink:
        data.formLink ||
        `${window.location.origin}/application/${crypto.randomUUID()}`,
      isBlocked: data.isBlocked ?? false,
      receivingApplicationsCount: data.receivingApplicationsCount ?? 0,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        editMode
          ? `https://exam-cms-payload.vercel.app/api/exams/${editId}` // 🛠️ PATCH for edit
          : `https://exam-cms-payload.vercel.app/api/exams`, // 🆕 POST for new
        {
          method: editMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(newExamData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Payload CMS error:", errorData);
        throw new Error("Failed to submit exam");
      }

      const responseData = await res.json();
      console.log(
        editMode ? "📝 Exam updated" : "✅ Exam created",
        responseData
      );

      form.reset(defaultFormState);
      setEditMode(false);
      setEditId(null);
      fetchExams();
    } catch (error) {
      console.error("❌ Error submitting exam:", error);
    }
  };

  const toggleBlock = async (id: string, currentValue: boolean) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`https://exam-cms-payload.vercel.app/api/exams/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        isBlocked: !currentValue, // Toggle value
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("❌ Error updating isBlocked:", error);
      return;
    }

    const updated = await res.json();
    console.log("✅ isBlocked updated:", updated);
    // Optionally update state here
    fetchExams();
    dispatch(toggleBlockExam(id)); // redux update if needed

  } catch (error) {
    console.error("❌ Network error while updating isBlocked:", error);
  }
};


  const handleEdit = (exam: any) => {
    // Parse slot dates
    console.log("editing exam data", exam);

    // Set form data with parsed dates
    form.reset({
      name: exam.name,
      location: exam.location,
      applicationsDateRange: {
        from: exam.applicationsDateRange.from,
        to: exam.applicationsDateRange.to,
      },
      applicationsLimit: exam.applicationsLimit.toString(),
      waitingLimit: exam.waitingLimit.toString(),
      slot1DateRange: {
        from: exam.slot1DateRange.from,
        to: exam.slot1DateRange.to,
      },
      slot2DateRange: {
        from: exam.slot2DateRange.from,
        to: exam.slot2DateRange.to,
      },
      slot3DateRange: {
        from: exam.slot3DateRange.from,
        to: exam.slot3DateRange.to,
      },
    });

    setEditMode(true);
    setEditId(exam.id);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    form.reset(defaultFormState);
    setEditMode(false);
    setEditId(null);
  };

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
                <Label
                  htmlFor="examName"
                  className="dark:text-slate-200 flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Exam Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="examName"
                  {...form.register("name")}
                  placeholder="Exam Name"
                  className={cn(
                    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                    errors.name && "border-red-500 focus:ring-red-500"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="examLocation"
                  className="dark:text-slate-200 flex items-center"
                >
                  <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Exam Location <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="examLocation"
                  {...form.register("location")}
                  placeholder="Exam Location"
                  className={cn(
                    "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                    errors.location && "border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="applicationsDateRange"
                  className="dark:text-slate-200 flex items-center"
                >
                  <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Applications Receiving Dates{" "}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <DateRangePickerWithRange
                  value={form.watch("applicationsDateRange")}
                  onChange={(value) =>
                    handleDateRangeChange("applicationsDateRange", value)
                  }
                  isError={
                    !!errors.applicationsDateRange?.from ||
                    !!errors.applicationsDateRange?.to
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="applicationsLimit"
                    className="dark:text-slate-200 flex items-center"
                  >
                    <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                    Applications Limit{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="applicationsLimit"
                    type="number"
                    {...form.register("applicationsLimit")}
                    placeholder="Limit"
                    className={cn(
                      "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500",
                      errors.applicationsLimit &&
                        "border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="waitingLimit"
                    className="dark:text-slate-200 flex items-center"
                  >
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
                      errors.waitingLimit && "border-red-500 focus:ring-red-500"
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
                  onChange={(value) =>
                    handleDateRangeChange("slot1DateRange", value)
                  }
                  isError={
                    !!errors.slot1DateRange?.from || !!errors.slot1DateRange?.to
                  }
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
                  onChange={(value) =>
                    handleDateRangeChange("slot2DateRange", value)
                  }
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
                  onChange={(value) =>
                    handleDateRangeChange("slot3DateRange", value)
                  }
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
            Exam List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80">
          <div className="p-4">
            <div className="grid grid-cols-1 w-auto md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[...exams].map((exam: any) => (
                <div key={exam.id} className="exam-card relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-xl dark:shadow-slate-900/30 hover:translate-y-[-5px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col min-h-[280px]">
                  <div className="absolute top-0 right-0 p-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs dark:text-slate-400">
                        {exam.isBlocked ? "Blocked" : "Active"}
                      </span>
                      <Switch
                        checked={exam.isBlocked}
                        onCheckedChange={() => toggleBlock(exam.id, exam.isBlocked)}
                        className="data-[state=checked]:bg-slate-700"
                      />
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-3">
                      <File className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-lg dark:text-white">
                      {exam.name}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">
                        {exam.location}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">
                        {exam.applicationsDateRange.from
                          ? new Date(
                              exam.applicationsDateRange.from
                            ).toLocaleDateString()
                          : ""}{" "}
                        -{" "}
                        {exam.applicationsDateRange.to
                          ? new Date(
                              exam.applicationsDateRange.to
                            ).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                      <span className="dark:text-slate-300">
                        Limit: {exam.applicationsLimit} (Waiting:{" "}
                        {exam.waitingLimit})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 flex-grow">
                    <h4 className="text-sm font-semibold dark:text-slate-200">
                      Exam Slots:
                    </h4>
                    {exam.slot1DateRange &&
                      (exam.slot1DateRange.from || exam.slot1DateRange.to) && (
                        <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300">
                          Slot 1:
                          {"  "}
                          {exam.slot1DateRange.from
                            ? new Date(
                                exam.slot1DateRange.from
                              ).toLocaleDateString()
                            : ""}{" "}
                          -{" "}
                          {exam.slot1DateRange.to
                            ? new Date(
                                exam.slot1DateRange.to
                              ).toLocaleDateString()
                            : ""}
                        </div>
                      )}
                    {exam.slot2DateRange &&
                      (exam.slot2DateRange.from || exam.slot2DateRange.to) && (
                        <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300">
                          Slot 2: {"  "}
                          {exam.slot2DateRange.from
                            ? new Date(
                                exam.slot2DateRange.from
                              ).toLocaleDateString()
                            : ""}{" "}
                          -{" "}
                          {exam.slot2DateRange.to
                            ? new Date(
                                exam.slot2DateRange.to
                              ).toLocaleDateString()
                            : ""}
                        </div>
                      )}
                    {exam.slot3DateRange &&
                      (exam.slot3DateRange.from || exam.slot3DateRange.to) && (
                        <div className="text-xs bg-slate-100 dark:bg-slate-700 p-1.5 rounded dark:text-slate-300">
                          Slot 3: {"  "}
                          {exam.slot3DateRange.from
                            ? new Date(
                                exam.slot3DateRange.from
                              ).toLocaleDateString()
                            : ""}{" "}
                          -{" "}
                          {exam.slot3DateRange.to
                            ? new Date(
                                exam.slot3DateRange.to
                              ).toLocaleDateString()
                            : ""}
                        </div>
                      )}
                  </div>

                  <div className="mt-4 pt-3 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 border-blue-200 dark:border-blue-800 cursor-pointer transition-colors"
                    >
                      <a
                        href={exam.formLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
        </CardContent>
      </Card>
    </div>
  );
}
