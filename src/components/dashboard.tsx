"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../components/theme-provider";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Filter,
  Download,
  Search,
  Check,
  XIcon,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { DataTable } from "../components/data-table";
import { StatusCard } from "../components/status-card";
import { type ApplicationData, columns } from "../components/columns";
import { useMobile } from "../hooks/use-mobile";
import { Tabs, TabsContent } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/Slice";
import { selectExams } from "@/redux/examDataSlice";
import {
  selectApplications,
  setApplicationStatus,
} from "@/redux/applicationsSlice";
// Removed unused import
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver"; // Ensure you install types with: npm i --save-dev @types/file-saver

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [filteredData, setFilteredData] = useState<ApplicationData[]>();
  const [isExporting, setIsExporting] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { user } = useSelector((state: any) => state.auth);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const initialExams = useSelector(selectExams);
  const applications = useSelector(selectApplications);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  console.log(selectedExam, "examId");

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);
  console.log(user, "user");

  // const pdfData = useMemo(() => {
  //   return {
  //     .getValues(),
  //   }
  // }, [form, previewMode])

  useEffect(() => {
    // First filter by status
    let statusFiltered: any = applications;
    if (activeFilter !== "all") {
      statusFiltered = applications.filter(
        (app) => app.status === activeFilter
      );
    }
    console.log(activeFilter, "activeFilter");

    // Then filter by exam
    if (selectedExam !== "all") {
      statusFiltered = statusFiltered.filter(
        (app: any) => app.examId === selectedExam
      );
    }

    // Then filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      statusFiltered = statusFiltered.filter(
        (app: any) =>
          app.id.toLowerCase().includes(query) || // SNO
          app.candidateId?.toLowerCase().includes(query) || // Candidate ID
          app.name?.toLowerCase().includes(query) || // Name
          app.email?.toLowerCase().includes(query) // Email
      );
    }

    setFilteredData(statusFiltered);
  }, [activeFilter, selectedExam, applications, searchQuery]);

  const ApplicationPDF = ({ data, images }: any) => {
    return (
      <Document>
        {/* Main application form page */}
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent1}>
              <Image src="/icon.png" style={styles.passportImage1} />
              <div className="text-center">
                <Text style={styles.title}>MRCGP [INT.] South Asia</Text>
                <Text style={styles.subtitle}>
                  Part 2 (OSCE) Examination Application
                </Text>
              </div>
            </View>
            {images.passport && (
              <Image
                src={images.passport || "/placeholder.svg"}
                style={styles.passportImage}
              />
            )}
          </View>

          {/* Main content - Resume style format */}
          <View style={styles.section}>
            {/* Candidate information section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>
                  CANDIDATE INFORMATION
                </Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Candidate ID:</Text>
                      <Text style={styles.fieldValue}>
                        {data.candidateId || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Full Name:</Text>
                      <Text style={styles.fieldValue}>
                        {data.fullName || "Not provided"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Contact information section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>
                  CONTACT INFORMATION
                </Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>WhatsApp:</Text>
                      <Text style={styles.fieldValue}>
                        {data.whatsapp || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Emergency Contact:</Text>
                      <Text style={styles.fieldValue}>
                        {data.emergencyContact || "Not provided"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Email:</Text>
                      <Text style={styles.fieldValue}>
                        {data.email || "Not provided"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Address section */}

            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>
                  CONTACT INFORMATION
                </Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Post Box:</Text>
                      <Text style={styles.fieldValue}>
                        {data.poBox || "No address"}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>District</Text>
                      <Text style={styles.fieldValue}>
                        {data.district || ""}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>City:</Text>
                      <Text style={styles.fieldValue}>{data.city || ""}</Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>province:</Text>
                      <Text style={styles.fieldValue}>
                        {data.province || ""}
                      </Text>
                    </View>
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Country:</Text>
                      <Text style={styles.fieldValue}>
                        {data.country || ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Experience section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>EXPERIENCE</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Date of passing Part 1:</Text>
                  <Text style={styles.fieldValue}>
                    {data.dateOfPassingPart1 || "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Previous OSCE attempts:</Text>
                  <Text style={styles.fieldValue}>
                    {data.previousOsceAttempts || "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Country of experience:</Text>
                  <Text style={styles.fieldValue}>
                    {data.countryOfExperience || "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Country of origin:</Text>
                  <Text style={styles.fieldValue}>
                    {data.countryOfOrigin || "Not provided"}
                  </Text>
                </View>
              </View>
            </View>

            {/* License details section */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>LICENSE DETAILS</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Registration authority:</Text>
                  <Text style={styles.fieldValue}>
                    {data.registrationAuthority || "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Registration number:</Text>
                  <Text style={styles.fieldValue}>
                    {data.registrationNumber || "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Date of registration:</Text>
                  <Text style={styles.fieldValue}>
                    {data.dateOfRegistration
                      ? format(data.dateOfRegistration, "PPP")
                      : "Not provided"}
                  </Text>
                </View>
              </View>
            </View>

            {/* OSCE Session Preferences */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>
                  OSCE SESSION PREFERENCES
                </Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 1:</Text>
                  <Text style={styles.fieldValue}>
                    {data.preferenceDate1
                      ? format(new Date(data.preferenceDate1), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                  <Text style={styles.fieldValue}>
                    {data.preferenceDate2
                      ? format(new Date(data.preferenceDate2), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                  <Text style={styles.fieldValue}>
                    {data.preferenceDate3
                      ? format(new Date(data.preferenceDate3), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Agreement */}
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>AGREEMENT</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Name:</Text>
                  <Text style={styles.fieldValue}>
                    {data.agreementName || "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Date:</Text>
                  <Text style={styles.fieldValue}>
                    {data.agreementDate
                      ? format(data.agreementDate, "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Terms Agreed:</Text>
                  <Text style={styles.fieldValue}>
                    {data.termsAgreed ? "Yes" : "No"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>Please Note</Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.note}>
                    THE NUMBER OF PLACES IS LIMITED, AND SLOTS WILL BE ALLOCATED
                    ON THE "FIRST COME FIRST SERVED” BASIS. Your application may
                    be rejected because of a large number of applicants and you
                    may be invited to apply again or offered a slot at a
                    subsequent examination. Priority will be given to applicants
                    from South Asia and those applications that reach us first,
                    so we encourage you to apply as soon as possible. WHILST WE
                    WILL TRY TO ACCOMMODATE YOUR PREFERENCE, IT MAY NOT BE
                    POSSIBLE DUE TO A LARGE NUMBER OF APPLICANTS. Please email
                    us well in advance if you require a letter of invitation for
                    visa purposes and make sure you complete all travel
                    formalities in good time (visa applications, travel permits,
                    leaves, etc.) No Refunds will be granted in case any
                    candidate fails to get the visa prior to the exam date.
                    Candidates with a disability are requested to read the rules
                    and regulation document [Page 10] available on the website
                    The MRCGP [INT.] South Asia Secretariat will notify you by
                    email of your allocated date and time at least two weeks
                    before the exam starting date.
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.resumeSection}>
              <View style={styles.resumeHeader}>
                <Text style={styles.resumeSectionTitle}>
                  CANDIDATE'S STATEMENT
                </Text>
              </View>
              <View style={styles.resumeBody}>
                <View style={styles.fieldRow}>
                  <Text style={styles.note}>
                    I hereby apply to sit the South Asia MRCGP [INT.] Part 2
                    (OSCE) Examination, success in which will allow me to apply
                    for International Membership of the UK's Royal College of
                    General Practitioners. Detailed information on the
                    membership application process can be found on the RCGP
                    website: Member Ship I have read and agree to abide by the
                    conditions set out in the South Asia MRCGP [INT.]
                    Examination Rules and Regulations as published on the MRCGP
                    [INT.] South Asia website: www.mrcgpintsouthasia.org If
                    accepted for International Membership, I undertake to
                    continue approved postgraduate study while I remain in
                    active general practice/family practice, and to uphold and
                    promote the aims of the RCGP to the best of my ability. I
                    understand that, on being accepted for International
                    Membership, an annual subscription fee is to be payable to
                    the RCGP. I understand that only registered International
                    Members who maintain their RCGP subscription are entitled to
                    use the post-nominal designation "MRCGP [INT]". Success in
                    the exam does not give me the right to refer to myself as
                    MRCGP [INT.]. I attach a banker's draft made payable to
                    “MRCGP [INT.] South Asia”, I also understand and agree that
                    my personal data will be handled by the MRCGP [INT.] South
                    Asia Board and I also give permission for my personal data
                    to be handled by the regional MRCGP [INT.] South Asia
                    co-ordinators..
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Page>

        {/* Each document on its own page */}
        {images.medicalLicense && (
          <Page size="A4" style={styles.page}>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Medical License</Text>
              <Image
                src={images.medicalLicense || "/placeholder.svg"}
                style={styles.documentPageImage}
              />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
              </View>
            </View>
          </Page>
        )}

        {images.part1Email && (
          <Page size="A4" style={styles.page}>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Part 1 Passing Email</Text>
              <Image
                src={images.part1Email || "/placeholder.svg"}
                style={styles.documentPageImage}
              />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
              </View>
            </View>
          </Page>
        )}

        {images.passportBio && (
          <Page size="A4" style={styles.page}>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Passport Bio Page</Text>
              <Image
                src={images.passportBio || "/placeholder.svg"}
                style={styles.documentPageImage}
              />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
              </View>
            </View>
          </Page>
        )}

        {images.signature && (
          <Page size="A4" style={styles.page}>
            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Signature</Text>
              <Image
                src={images.signature || "/placeholder.svg"}
                style={styles.documentPageImage}
              />
              <View style={styles.documentPageFooter}>
                <Text style={styles.documentPageFooterText}>
                  {data.fullName} - Candidate ID: {data.candidateId}
                </Text>
              </View>
            </View>
          </Page>
        )}
      </Document>
    );
  };
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: "#ffffff",
      fontFamily: "Helvetica",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: "#6366f1",
      borderBottomStyle: "solid",
    },
    headerContent: {
      flex: 1,
    },
    headerContent1: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#4f46e5",
      marginBottom: 5,
    },
    titleimage: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#4f46e5",
      marginBottom: 5,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
    },
    subtitle: {
      fontSize: 12,
      color: "#6b7280",
    },
    passportImage: {
      width: 80,
      height: 80,
      objectFit: "cover",
      borderRadius: 4,
      border: "1px solid #e5e7eb",
    },
    passportImage1: {
      width: 80,
      height: 80,
      objectFit: "cover",
    },
    section: {
      marginBottom: 10,
    },
    row: {
      flexDirection: "row",
      marginBottom: 5,
    },
    column: {
      flex: 1,
      paddingRight: 10,
    },
    resumeSection: {
      marginBottom: 15,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      overflow: "hidden",
    },
    resumeHeader: {
      backgroundColor: "#6366f1",
      padding: 5,
    },
    resumeSectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: "white",
    },
    resumeBody: {
      padding: 8,
      backgroundColor: "#f9fafb",
    },
    fieldRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    fieldLabel: {
      fontSize: 9,
      fontWeight: "bold",
      marginRight: 5,
      flex: 1,
    },
    fieldValue: {
      fontSize: 9,
      flex: 2,
    },
    note: {
      fontSize: 10,
      flex: 2,
    },
    footer: {
      marginTop: 20,
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: "#e5e7eb",
      borderTopStyle: "solid",
      textAlign: "center",
    },
    footerText: {
      fontSize: 8,
      color: "#6b7280",
    },
    // Document page styles
    documentPage: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    documentPageTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 20,
      color: "#4f46e5",
      textAlign: "center",
    },
    documentPageImage: {
      width: "90%",
      height: "70%",
      objectFit: "contain",
      marginBottom: 20,
      border: "1px solid #e5e7eb",
    },
    documentPageFooter: {
      position: "absolute",
      bottom: 20,
      width: "100%",
      textAlign: "center",
    },
    documentPageFooterText: {
      fontSize: 10,
      color: "#6b7280",
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Force theme update by setting a data attribute on document.documentElement
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  const handleStatusChange = (
    id: string,
    newStatus: "approved" | "rejected"
  ) => {
    dispatch(setApplicationStatus({ id, status: newStatus }));
  };

  const handleExamChange = (value: string) => {
    setSelectedExam(value);
  };

  // optional, for file download

  const handlePdfGenerate = async (row: any) => {
    setPdfGenerating(true);
    try {
      const blob = await pdf(
        <ApplicationPDF
          data={row.original}
          images={{
            passport: row.original.passportUrl,
            medicalLicense: row.original.medicalLicenseUrl,
            part1Email: row.original.part1EmailUrl,
            passportBio: row.original.passportBioUrl,
            signature: row.original.signatureUrl,
          }}
        />
      ).toBlob();

      saveAs(blob, "MRCGP_Application_Form.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setPdfGenerating(false);
    }
  };

  console.log(applications, "application");

  const handleExport = () => {
    setIsExporting(true);

    // Default: all applications
    let dataToExport = applications;

    // If a specific exam is selected, filter by that exam
    if (selectedExam !== "all") {
      dataToExport = dataToExport.filter(
        (app) => String(app.examId) === selectedExam
      );
    }

    const exportData = dataToExport.map((app, index) => ({
      "S/No": index + 1,
      "Condidate ID#": app.candidateId,
      Profile: app.passportUrl,
      "Application Date": app.submittedDate,
      Name: app.fullName,
      Email: app.email,
      WhatsApp: app.whatsapp,
      "Emergency Contact": app.emergencyContact,
      "Residential P.O.Box": app.poBox,
      "Residential District": app.district,
      "Residential City/Town/Village": app.city,
      "Residential Province/Region": app.province,
      "Residential Country": app.country,
      "Date of passing Part 1 exam": app.dateOfPassingPart1,
      "Date of passing Part 2 exam": "0000-00-00",
      "Country of PG clinical": "Country",
      "Country of ethnic origin": app.countryOfOrigin,
      "Registration Authority": app.registrationAuthority,
      "Registration Number": app.registrationNumber,
      "Registration Date": app.dateOfRegistration,
      "Preference Date 1": app.preferenceDate1,
      "Preference Date 2": app.preferenceDate2,
      "Preference Date 3": app.preferenceDate3,
      Status: app.status,
      Action: "PDF",
    }));

    setTimeout(() => {
      try {
        const headers = Object.keys(exportData[0]);
        const csvContent = [
          headers.join("\t"),
          ...exportData.map((row) =>
            headers
              .map((header) => {
                const cell = row[header as keyof typeof row];
                const cellStr = String(cell);
                return cellStr.includes("\t") || cellStr.includes('"')
                  ? `"${cellStr.replace(/"/g, '""')}"`
                  : cellStr;
              })
              .join("\t")
          ),
        ].join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], {
          type: "text/csv;charset=utf-16",
        });

        const examName =
          selectedExam !== "all"
            ? initialExams.find((exam) => exam.id.toString() === selectedExam)
                ?.name || "Selected-Exam"
            : "All-Exams";

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Applications_${examName}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsExporting(false);
      } catch (error) {
        console.error("Export error:", error);
        setIsExporting(false);
      }
    }, 500);
  };

  function nav(props: string) {
    navigate(props);
  }

  const actionColumn = {
    id: "actions",
    header: "Action",
    cell: ({ row }: { row: any }) => {
      const id = row.original.id;
      const status = row.original.status;
      console.log(row.original, "row");

      return (
        <div className="flex space-x-2">
          {(status === "pending" || status === "waiting") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-800"
                onClick={() => handleStatusChange(id, "approved")}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-800"
                onClick={() => handleStatusChange(id, "rejected")}
              >
                <XIcon className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}

          <Button
            onClick={() => handlePdfGenerate(row)}
            disabled={pdfGenerating}
            className="bg-red-400 hover:bg-red-200 text-white dark:bg-red-900 dark:hover:bg-blue-900/50 dark:text-white border-blue-200 dark:border-blue-800"
          >
            PDF
          </Button>
        </div>
      );
    },
  };

  const columnsWithActions = [
    ...columns.filter((col) => col.id !== "actions"),
    actionColumn,
  ];

  return (
    <div className="flex h-screen bg-background transition-all duration-300 ease-in-out">
      {/* Sidebar - transforms to top navbar on mobile */}
      {sidebarOpen && (
        <div
          className={`${
            isMobile ? "fixed top-0 left-0 z-50 w-64 h-full" : "w-64"
          } bg-slate-800 text-slate-100 shadow-lg transition-all duration-300 dark:bg-slate-900`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <img src="/icon.png" alt="404" />
              </div>
              <span className="font-bold text-lg">MRCGP INT. </span>
            </div>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <nav className="mt-6 px-4">
            <ul className="space-y-2">
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 bg-slate-500/50 dark:bg-slate-600/50"
                  onClick={() => nav("/")}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                  onClick={() => nav("/exam")}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Exams
                </Button>
              </li>
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-slate-800 text-slate-100 h-16 flex items-center px-4 shadow-md dark:bg-slate-900">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-xl font-bold">Dashboard</h1>

            <div className="flex items-center space-x-4">
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent rounded-full p-2 border-slate-600 text-slate-100 hover:bg-slate-700/50 dark:hover:bg-slate-800/50"
                  onClick={toggleTheme}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              )}

              <div className="relative">
                {/* Profile Picture */}
                <div
                  className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer"
                  onClick={() => setOpen(!open)} // toggle on click
                  onMouseEnter={() => setOpen(true)} // open on hover
                  onMouseLeave={() => setOpen(false)} // close on leave
                >
                  <img
                    src="/profile.png"
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Dropdown menu */}
                {open && (
                  <div
                    className="absolute right-0 w-32 bg-white border rounded shadow-md z-50"
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                  >
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 dark:bg-slate-800 dark:text-white hover:bg-gray-100 text-left"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950">
          <Tabs defaultValue="applications" className="w-full">
            <TabsContent value="applications">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatusCard
                  title="Total Applications"
                  value={applications.length}
                  color="bg-slate-600 dark:bg-slate-700"
                  onClick={() => setActiveFilter("all")}
                  active={activeFilter === "all"}
                />
                <StatusCard
                  title="Pending Applications"
                  value={
                    applications.filter((app) => app.status === "pending")
                      .length
                  }
                  color="bg-amber-600 dark:bg-amber-700"
                  onClick={() => setActiveFilter("pending")}
                  active={activeFilter === "pending"}
                />
                <StatusCard
                  title="Approved Applications"
                  value={
                    applications.filter((app) => app.status === "approved")
                      .length
                  }
                  color="bg-green-600 dark:bg-green-700"
                  onClick={() => setActiveFilter("approved")}
                  active={activeFilter === "approved"}
                />
                <StatusCard
                  title="Rejected Applications"
                  value={
                    applications.filter((app) => app.status === "rejected")
                      .length
                  }
                  color="bg-red-600 dark:bg-red-700"
                  onClick={() => setActiveFilter("rejected")}
                  active={activeFilter === "rejected"}
                />
              </div>

              <Card className="shadow-lg border-0 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                <CardHeader className="bg-slate-100 dark:bg-slate-800 flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    Applications
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="dark:bg-slate-900 dark:border-slate-700"
                      >
                        <DropdownMenuItem
                          onClick={() => setActiveFilter("all")}
                          className="dark:text-slate-200 dark:focus:bg-slate-800"
                        >
                          All
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setActiveFilter("pending")}
                          className="dark:text-slate-200 dark:focus:bg-slate-800"
                        >
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setActiveFilter("approved")}
                          className="dark:text-slate-200 dark:focus:bg-slate-800"
                        >
                          Approved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setActiveFilter("rejected")}
                          className="dark:text-slate-200 dark:focus:bg-slate-800"
                        >
                          Rejected
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setActiveFilter("waiting")}
                          className="dark:text-slate-200 dark:focus:bg-slate-800"
                        >
                          Waiting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={isExporting}
                      className="dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 dark:bg-slate-900">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <Badge
                          variant={
                            activeFilter === "all" ? "default" : "outline"
                          }
                          className="cursor-pointer dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:border-slate-600"
                          onClick={() => setActiveFilter("all")}
                        >
                          All
                        </Badge>
                        <Badge
                          variant={
                            activeFilter === "pending" ? "default" : "outline"
                          }
                          className="cursor-pointer dark:bg-amber-700 dark:text-amber-100 dark:hover:bg-amber-600 dark:border-amber-600"
                          onClick={() => setActiveFilter("pending")}
                        >
                          Pending
                        </Badge>
                        <Badge
                          variant={
                            activeFilter === "approved" ? "default" : "outline"
                          }
                          className="cursor-pointer dark:bg-green-700 dark:text-green-100 dark:hover:bg-green-600 dark:border-green-600"
                          onClick={() => setActiveFilter("approved")}
                        >
                          Approved
                        </Badge>
                        <Badge
                          variant={
                            activeFilter === "rejected" ? "default" : "outline"
                          }
                          className="cursor-pointer dark:bg-red-700 dark:text-red-100 dark:hover:bg-red-600 dark:border-red-600"
                          onClick={() => setActiveFilter("rejected")}
                        >
                          Rejected
                        </Badge>
                        <Badge
                          variant={
                            activeFilter === "waiting" ? "default" : "outline"
                          }
                          className="cursor-pointer dark:bg-blue-700 dark:text-blue-100 dark:hover:bg-blue-600 dark:border-blue-600"
                          onClick={() => setActiveFilter("waiting")}
                        >
                          Waiting
                        </Badge>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Exam Dropdown */}
                        <div className="w-full md:w-64">
                          <Select
                            value={selectedExam}
                            onValueChange={handleExamChange}
                          >
                            <SelectTrigger className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                <SelectValue placeholder="Select Exam" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                              <SelectItem
                                value="all"
                                className="dark:text-slate-200 dark:focus:bg-slate-800"
                              >
                                All Exams
                              </SelectItem>
                              {initialExams.map((exam) => (
                                <SelectItem
                                  key={exam.id}
                                  value={exam.id.toString()}
                                  className="dark:text-slate-200 dark:focus:bg-slate-800"
                                >
                                  {exam.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                          <Input
                            placeholder="Search by SNO, name, email, candidate ID..."
                            className="pl-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Selected Exam Info */}
                    {selectedExam !== "all" && (
                      <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                          <span className="font-medium dark:text-slate-200">
                            Showing applications for:{" "}
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {applications.find(
                                (exam) => exam.examId === selectedExam
                              )?.examName || "N/A"}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <DataTable
                    columns={columnsWithActions}
                    data={filteredData || []}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
