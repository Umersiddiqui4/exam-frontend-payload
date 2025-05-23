
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Input } from "./input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
    Check,
    XIcon
  } from "lucide-react";
  import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
  } from "@react-pdf/renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Calendar, Download, Filter, Loader2, Search } from "lucide-react";
import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { ApplicationData, columns } from "../columns";
import { format } from "date-fns";
import { pdf } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import { updateApplicationStatus } from "@/hooks/applicationUpdate";


export default function ApplicationTable() {

      const [activeFilter, setActiveFilter] = useState<string>("all");
      const [selectedExam, setSelectedExam] = useState<string>("all");
      const [filteredData, setFilteredData] = useState<ApplicationData[]>();
      const [isExporting, setIsExporting] = useState(false);
      const [pdfGenerating] = useState(false);
      const [searchQuery, setSearchQuery] = useState<string>("");
        const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
console.log(applications,"applications");


const [initialExams, setInitialExams] = useState<any>([]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/exams", {
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
      setInitialExams(data.docs); // 👈 exams state update ho rahi hai
    } catch (error) {
      console.error("❌ Network error while fetching exams:", error);
    }
  };
  const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/applications', {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('❌ Error fetching applications:', errorData);
          return;
        }

        const data = await res.json();
        console.log('✅ Applications fetched:', data.docs);
        setApplications(data.docs);
      } catch (error) {
        console.error('❌ Network error:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, []);


    const actionColumn = {
        id: "actions",
        header: "Action",
        cell: ({ row }: { row: any }) => {
          const id = row.original.id;
          const status = row.original.status;
    
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

 

const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
  if (status === "approved") {
    const result = await Swal.fire({
      title: "Are you sure you want to approve?",
      imageUrl: "/icon.png",
      imageWidth: 150,
      imageHeight: 150,
      showCancelButton: true,
      confirmButtonText: "Yes, please approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4ade80",
      cancelButtonColor: "#ef4444",
      customClass: {
        popup: "rounded-lg",
        confirmButton: "rounded-lg px-4 py-2",
        cancelButton: "rounded-lg px-4 py-2",
      },
    });

    if (result.isConfirmed) {
      await updateApplicationStatus({ id, status });

      await Swal.fire({
        title: "Updated Successfully!",
        imageUrl: "/icon.png",
        imageWidth: 150,
        imageHeight: 150,
        confirmButtonText: "OK",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "rounded-lg",
          confirmButton: "rounded-lg px-4 py-2",
        },
      });
    }
  } else if (status === "rejected") {
    const result = await Swal.fire({
      title: "Are you sure you want to reject?",
      imageUrl: "/icon.png",
      imageWidth: 150,
      imageHeight: 150,
      input: "text",
      inputPlaceholder: "Enter reason...",
      showCancelButton: true,
      confirmButtonText: "Yes, please reject!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4ade80",
      cancelButtonColor: "#ef4444",
      customClass: {
        popup: "rounded-lg",
        input: "border rounded-lg p-2 w-auto",
        confirmButton: "rounded-lg px-4 py-2",
        cancelButton: "rounded-lg px-4 py-2",
      },
    });

    if (result.isConfirmed) {
      const reason = result.value;
      await updateApplicationStatus({ id, status, reason });
    }
  }
  fetchApplications();
};


      const handleExamChange = (value: string) => {
        setSelectedExam(value);
      };
    
      const handlePdfGenerate = async (row: any) => {
        const blob = await generatePdfBlob(row.original, {
          passport: row.original.passportUrl.url,
          medicalLicense: row.original.medicalLicenseUrl.url,
          part1Email: row.original.part1EmailUrl.url,
          passportBio: row.original.passportBioUrl.url,
          signature: row.original.signatureUrl.url,
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      };
    
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
                ? initialExams.find((exam: any) => exam.id.toString() === selectedExam)
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
    console.log(selectedExam,"selected exam");

      const generatePdfBlob = async (data: any, images: any) => {
        const doc = <ApplicationPDF data={data} images={images} />;
        const asPdf = pdf();
        asPdf.updateContainer(doc);
        const blob = await asPdf.toBlob();
        return blob;
      };

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
      const columnsWithActions = [
        ...columns.filter((col: any) => col.id !== "actions"),
        actionColumn,
      ];

  useEffect(() => {
    // First filter by status
    let statusFiltered: any = applications;
    if (activeFilter !== "all") {
      statusFiltered = applications.filter(
        (app) => app.status === activeFilter
      );
    }

    // Then filter by exam
    if (selectedExam !== "all") {
      statusFiltered = statusFiltered.filter(
        (app: any) => app.examId.id === selectedExam
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

  if (loading) return <p>Loading applications...</p>;


  return (
    <div>
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
                <CardContent className="p-0 ">
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
                              {initialExams.map((exam: any) => (
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
                      <div className="mb-4 p-3  bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                          <span className="font-medium dark:text-slate-200">
                            Showing applications for:{" "}
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {applications.find(
                                (exam: any) => exam.examId.id === selectedExam
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
    </div>
  )
}
