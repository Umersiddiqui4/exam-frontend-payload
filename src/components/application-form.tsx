"use client";

import { Checkbox } from "@/components/ui/checkbox";
import Swal from "sweetalert2";

import { cn } from "@/lib/utils";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";

import { CardContent } from "@/components/ui/card";

import { CardDescription } from "@/components/ui/card";

import { CardTitle } from "@/components/ui/card";

import { CardHeader } from "@/components/ui/card";

import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Upload,
  Calendar,
  User,
  FileText,
  Shield,
  Loader2,
  Eye,
} from "lucide-react";
import { PhoneInput } from "./ui/phone-input";
import "react-phone-number-input/style.css";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  // incrementApplicationsCount,
  // selectExams,
  toggleBlockExam,
} from "@/redux/examDataSlice";
// import { supabase } from "@/lib/supabaseClient";
// import { addApplication } from "@/redux/applicationsSlice";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { useMemo } from "react";
import NotFound from "./ui/notFound";
import ExamClosedApp from "./ui/examClosedApplication";
import ExamClosed from "./ui/examClosed";
import "../App.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import useSubmitApplication from "@/hooks/useSubmitApplication";

const formSchema = z.object({
  candidateId: z
    .string()
    .length(7, "Candidate ID must be exactly 7 numbers")
    .regex(/^\d+$/, "Candidate ID must contain only numbers"),
  passportImage: z.any(),
  fullName: z.string().min(2, "Full name is required"),

  // Address
  poBox: z.string().min(1, "P.O. Box is required"),
  district: z.string().min(1, "District is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  country: z.string().min(1, "Country is required"),

  // Contact
  whatsapp: z.string().min(5, "WhatsApp number is required"),
  emergencyContact: z.string().min(5, "Emergency contact is required"),
  email: z.string().email("Invalid email address"),

  // Experience
  dateOfPassingPart1: z
    .string()
    .min(1, "Date of passing Part 1 exam is required"),
  previousOsceAttempts: z
    .string()
    .min(1, "Number of previous OSCE attempts is required"),

  // Experience and License
  countryOfExperience: z.string().min(1, "Country of experience is required"),
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  registrationAuthority: z
    .string()
    .min(1, "Registration authority is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  dateOfRegistration: z.date({
    required_error: "Date of registration is required",
  }),

  // OSCE Session
  preferenceDate1: z.string().optional(),
  preferenceDate2: z.string().optional(),
  preferenceDate3: z.string().optional(),

  // Uploads
  part1PassingEmail: z.any().optional(),
  medicalLicense: z.any(),
  passportBioPage: z.any(),
  signature: z.any(),

  // Agreement
  agreementName: z.string().optional(),
  agreementDate: z.date({
    required_error: "Date is required",
  }),
  termsAgreed: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Part 1 exam dates
const part1ExamDates = [
  "AKT - November 2024",
  "AKT - May 2024",
  "AKT - November 2023",
  "AKT - May 2023",
  "AKT - November 2022",
  "AKT - June 2022",
  "AKT - January 2022",
  "AKT - June 2021",
  "AKT - September 2020",
  "AKT - November 2019",
  "AKT - May 2019",
];

const parseSlotDates = (slotString: string): Date[] => {
  // If the slot string contains a range (e.g., "2025-04-02 | 2025-04-08")
  const dates = slotString.split(" | ");

  if (dates.length === 2) {
    const startDate = new Date(dates[0]);
    const endDate = new Date(dates[1]);

    // Generate all dates between start and end (inclusive)
    const allDates: Date[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      allDates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allDates;
  }

  // If it's not a range, just return the parsed dates
  return dates.map((dateStr) => new Date(dateStr));
};

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [medicalLicensePreview, setMedicalLicensePreview] = useState<
    string | null
  >(null);
  const [part1EmailPreview, setPart1EmailPreview] = useState<string | null>(
    null
  );
  const [passportBioPreview, setPassportBioPreview] = useState<string | null>(
    null
  );
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [passportData, setPassportData] = useState<string | null>(null);
  const [medicalLicenseData, setMedicalLicenseData] = useState<
    string | null
  >(null);
  const [part1EmailData, setPart1EmailData] = useState<string | null>(
    null
  );
  const [passportBioData, setPassportBioData] = useState<string | null>(
    null
  );
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [pdfGenerating] = useState(false);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isExamClosed, setIsExamClosed] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [warning ] = useState(false);
  const [exams, setExams] = useState<any>([]);
  const [selectedDates, setSelectedDates] = useState<{
    preferenceDate1: string | null;
    preferenceDate2: string | null;
    preferenceDate3: string | null;
  }>({
    preferenceDate1: null,
    preferenceDate2: null,
    preferenceDate3: null,
  });

  
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
      setExams(data.docs); // 👈 exams state update ho rahi hai
    } catch (error) {
      console.error("❌ Network error while fetching exams:", error);
    }
  };
  
  useEffect(() => {
    fetchExams();
  }, []);
  
  const params = useParams();
  const dispatch = useDispatch();
  
  if (!params.examId) return null;
  
const formLinkToMatch = `https://exam-frontend-payload-pb3w.vercel.app/application/${params.examId}`;

const selectedExam = exams.find((exam: any) => exam.formLink === formLinkToMatch);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      candidateId: "",
      fullName: "",
      poBox: "",
      district: "",
      city: "",
      province: "",
      country: "",
      whatsapp: "",
      emergencyContact: "",
      email: "",
      previousOsceAttempts: "",
      countryOfExperience: "",
      countryOfOrigin: "",
      registrationAuthority: "",
      registrationNumber: "",
      termsAgreed: false,
    },
  });
  // PDF Document Component with multi-page support

  const Watermark = () => (
    <View style={styles.watermarkContainer} fixed>
      <Text style={styles.watermarkText}>Preview</Text>
    </View>
  );

  const ApplicationPDFCompletePreview = ({ data, images }: any) => {
    return (
      <Document>
        {/* Main application form page */}
        <Page size="A4" style={styles.page}>
          {/* Watermark */}

          <View style={styles.watermarkContainer} fixed>
            <Text style={styles.watermarkText}>Preview</Text>
          </View>

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
                    {data.preferenceDate1 && data.preferenceDate1 !== " "
                      ? format(new Date(data.preferenceDate1), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                  <Text style={styles.fieldValue}>
                    {data.preferenceDate2 && data.preferenceDate2 !== " "
                      ? format(new Date(data.preferenceDate2), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                  <Text style={styles.fieldValue}>
                    {data.preferenceDate3 && data.preferenceDate3 !== " "
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
                    ON THE "FIRST COME FIRST SERVED" BASIS. Your application may
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
                    "MRCGP [INT.] South Asia", I also understand and agree that
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
            {/* Watermark */}
            <Watermark />

            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Medical License</Text>
              <Image
                src={images.medicalLicense || "/placeholder.svg"}
                style={styles.documentPageImagePrev}
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
            {/* Watermark */}
            <Watermark />

            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Part 1 Passing Email</Text>
              <Image
                src={images.part1Email || "/placeholder.svg"}
                style={styles.documentPageImagePrev}
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
            {/* Watermark */}
            <Watermark />

            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Passport Bio Page</Text>
              <Image
                src={images.passportBio || "/placeholder.svg"}
                style={styles.documentPageImagePrev}
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
            {/* Watermark */}
            <Watermark />

            <View style={styles.documentPage}>
              <Text style={styles.documentPageTitle}>Signature</Text>
              <Image
                src={images.signature || "/placeholder.svg"}
                style={styles.documentPageImagePrev}
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
  const ApplicationPDFComplete = ({ data, images }: any) => {
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
                    {data.preferenceDate1 && data.preferenceDate1 !== " "
                      ? format(new Date(data.preferenceDate1), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 2:</Text>
                  <Text style={styles.fieldValue}>
                    {data.preferenceDate2 && data.preferenceDate2 !== " "
                      ? format(new Date(data.preferenceDate2), "PPP")
                      : "Not provided"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Preference Date 3:</Text>
                  <Text style={styles.fieldValue}>
                    {data.preferenceDate3 && data.preferenceDate3 !== " "
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
            {/* Footer */}
            {/* <View style={styles.footer}>
              <Text style={styles.footerText}>
                This document serves as a preview of your application for the South Asia MRCGP [INT.] Part 2 (OSCE)
                Examination.
              </Text>
            </View> */}
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

  // PDF Styles
  const styles = StyleSheet.create({
    watermarkContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,

      pointerEvents: "none",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      opacity: 0.9,
    },
    watermarkText: {
      position: "absolute",
      zIndex: 9999,
      color: "#000000cc",
      fontSize: 150,
      // fontWeight: "bold",
      transform: "rotate(-55deg)",
    },
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
    passportImagePrev: {
      width: 80,
      height: 80,
      objectFit: "cover",
      borderRadius: 4,
      border: "1px solid #e5e7eb",
      opacity: 0.8,
    },
    passportImage1Prev: {
      width: 80,
      height: 80,
      objectFit: "cover",
      opacity: 0.8,
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
      backgroundColor: "#ffffffdb",
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
      zIndex: 1,
    },
    documentPageImagePrev: {
      width: "90%",
      height: "70%",
      objectFit: "contain",
      marginBottom: 20,
      border: "1px solid #e5e7eb",
      zIndex: 1,
      opacity: 0.8,
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
  
  // Prepare images for PDF
  const pdfImages = useMemo(() => {
    return {
      passport: passportPreview,
      medicalLicense: medicalLicensePreview,
      part1Email: part1EmailPreview,
      passportBio: passportBioPreview,
      signature: signaturePreview,
    };
  }, [
    passportPreview,
    medicalLicensePreview,
    part1EmailPreview,
    passportBioPreview,
    signaturePreview,
  ]);
  
  useEffect(() => {
    if (selectedExam && new Date(selectedExam.closingDate) < new Date()) {
      setIsExamClosed(true);
    } else {
      setIsExamClosed(false);
    }
    if (selectedExam && selectedExam.isBlocked === true) {
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
  }, [selectedExam]);
 const { mutateAsync } = useSubmitApplication();

  
  async function onSubmit(data: FormValues) {
    // Validate all fields
    Object.keys(form.getValues()).forEach((key) => {
      form.trigger(key as keyof FormValues);
    });
    
    // Validate phone numbers
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    
    if (!data.whatsapp || data.whatsapp.length < 8) {
      form.setError("whatsapp", {
        type: "manual",
        message: "Please enter a valid phone number",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!phoneRegex.test(data.emergencyContact)) {
      form.setError("emergencyContact", {
        type: "manual",
        message: "Please enter a valid phone number",
      });
      setIsSubmitting(false);
      return;
    }

    if (!params.examId || !selectedExam) {
      alert("Exam ID is missing or invalid. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // if (
    //   signaturePreview === null ||
    //   medicalLicensePreview === null ||
    //   passportBioPreview === null
    // ) {
    //   setWarning(true);
    //   return;
    // } else {
    //   setWarning(false);
    // }

    // Show confirmation dialog with custom styling
    const result = await Swal.fire({
      html: `
      <div style="text-align: center; margin-bottom: 20px;">
      <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
      </div>
      <h1><b>Are you sure you want to submit?</b></h1>
        <p style="color: #666; font-size: 16px;">
          Please review all details carefully before submission, as you won't be able to resubmit with the same candidate ID.
        </p>
      `,
      // title: "Are you sure you want to submit?",
      showCancelButton: true,
      confirmButtonText: "Yes, please submit!",
      cancelButtonText: "No, cancel submission!",
      confirmButtonColor: "#4ade80",
      cancelButtonColor: "#f87171",
      reverseButtons: false,
      focusConfirm: false,
      customClass: {
        container: "custom-swal-container",
        popup: "custom-swal-popup",
        title: "custom-swal-title",
        confirmButton: "custom-swal-confirm",
        cancelButton: "custom-swal-cancel",
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsSubmitting(true);

    const isPendingAvailable =
      selectedExam.receivingApplicationsCount < selectedExam.applicationsLimit;

    const isWaitingAvailable =
      selectedExam.receivingApplicationsCount <
      selectedExam.applicationsLimit + selectedExam.waitingLimit;

    const application: any = {
      ...data,
      // examId: params.examId,
      examId: selectedExam,
      examName: selectedExam.name,
      id: crypto.randomUUID(),
      applicantName: data.fullName,
      submittedDate: new Date().toISOString(),
      passportUrl: passportData || "",
      medicalLicenseUrl: medicalLicenseData || "",
      part1EmailUrl: part1EmailData || "",
      passportBioUrl: passportBioData || "",
      signatureUrl: signatureData || "",
      status: "",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      date: new Date().toISOString(),
      name: data.fullName,
      dateOfRegistration: data.dateOfRegistration
        ? data.dateOfRegistration.toISOString()
        : "",
      preferenceDate1: data.preferenceDate1 || "",
      preferenceDate2: data.preferenceDate2 || "",
      preferenceDate3: data.preferenceDate3 || "",
    };

    if (isPendingAvailable) {
      application.status = "pending";
const cleanedApp = { ...application };

const nullableKeys: (keyof typeof cleanedApp)[] = [
  "passportUrl",
  "medicalLicenseUrl",
  "part1EmailUrl",
  "passportBioUrl",
  "signatureUrl",
];

nullableKeys.forEach((key) => {
  if (!cleanedApp[key]) delete cleanedApp[key];
});
try {
  await mutateAsync(cleanedApp);
} catch (err) {
  console.error("❌ Submission failed:", err);
      // Show success dialog with custom styling
      Swal.fire({
        html: `
        <div style="text-align: center; margin-bottom: 20px;">
        <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
        </div>
        <h1><b>Form Successfully Submitted!</b></h1>
        <p style="color: #666; font-size: 16px;">
        You should receive an email of acknowledgement within 24 hours of form submission otherwise please 
        <a href="mailto:contact@mrcgpintsouthasia.org" style="color: #818cf8; text-decoration: underline;">contact</a> the office
        </p>
        <p style="color: #666; font-size: 16px; margin-top: 15px;">
        For preview final PDF 
        <a href="#" id="pdf-preview-link" style="color: #818cf8; text-decoration: underline;">Click Me</a>
        </p>
        `,
        // title: "Form Successfully Submitted!",
        confirmButtonText: "OK",
        confirmButtonColor: "#3b82f6",
        customClass: {
          container: "custom-swal-container",
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          confirmButton: "custom-swal-confirm",
        },
        didOpen: () => {
          // Add event listener to the PDF preview link
          document
            .getElementById("pdf-preview-link")
            ?.addEventListener("click", (e) => {
              e.preventDefault();
              document.getElementById("pdf-download-link")?.click();
            });
        },
      }).then((result) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
      }
    } else if (isWaitingAvailable) {
      application.status = "waiting";
await mutateAsync(application); 

      // Show success dialog with custom styling
      Swal.fire({
        title: "Form Successfully Submitted!",
        html: `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="/icon.png" alt="MRCGP Logo" style="width: 100px; height: 100px; margin: 0 auto 15px auto;">
          </div>
          <p style="color: #666; font-size: 16px;">
            You should receive an email of acknowledgement within 24 hours of form submission otherwise please 
            <a href="mailto:contact@mrcgpintsouthasia.org" style="color: #818cf8; text-decoration: underline;">contact</a> the office
          </p>
          <p style="color: #666; font-size: 16px; margin-top: 15px;">
            <strong>Note:</strong> Your application has been added to the waiting list.
          </p>
          <p style="color: #666; font-size: 16px; margin-top: 15px;">
            For preview final PDF 
            <a href="#" id="pdf-preview-link" style="color: #818cf8; text-decoration: underline;">Click Me</a>
          </p>
        `,
        confirmButtonText: "OK",
        confirmButtonColor: "#3b82f6",
        customClass: {
          container: "custom-swal-container",
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          confirmButton: "custom-swal-confirm",
        },
        didOpen: () => {
          // Add event listener to the PDF preview link
          document
            .getElementById("pdf-preview-link")
            ?.addEventListener("click", (e) => {
              e.preventDefault();
              document.getElementById("pdf-download-link")?.click();
            });
        },
      }).then((result) => {
        if (result.isConfirmed) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
    } else {
      dispatch(toggleBlockExam(params.examId));
      Swal.fire({
        title: "Error",
        text: "No more slots available for this exam.",
        icon: "error",
        confirmButtonColor: "#6366f1",
      });
    }

    setIsSubmitting(false);
  }

 const validateFile = async (file: File, inputId: string) => {
  const validateThese = ["passport-image"];
  setFileError(null);

  if (validateThese.includes(inputId)) {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setFileError("Invalid file format. Only PNG and JPG formats are supported.");
      const fileInput = document.getElementById(inputId) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      return false;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size exceeds 2MB limit. Please choose a smaller file.");
      const fileInput = document.getElementById(inputId) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      return false;
    }
  }

  // ✅ Upload to Payload CMS
  const formData = new FormData();
  formData.append("file", file); // important: must be 'file'

  try {
    const res = await fetch("https://exam-cms-payload.vercel.app/api/media", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setFileError("Upload failed. Please try again.");
      return false;
    }

    const data = await res.json();

    // ✅ Get uploaded file URL
    const publicUrl = data?.doc; // or data.filename if you store just file name


    if (!publicUrl) {
      setFileError("Could not retrieve image URL.");
      return false;
    }

    // ✅ Set preview based on input ID
    switch (inputId) {
      case "passport-image":
        setPassportPreview(publicUrl.url);
        setPassportData(publicUrl.id);
        break;
      case "medical-license":
        setMedicalLicensePreview(publicUrl.url);
        setMedicalLicenseData(publicUrl.id);
        break;
      case "part1-email":
        setPart1EmailPreview(publicUrl.url);
        setPart1EmailData(publicUrl.id);
        break;
      case "passport-bio":
        setPassportBioPreview(publicUrl.url);
        setPassportBioData(publicUrl.id);
        break;
      case "signature":
        setSignaturePreview(publicUrl.url);
        setSignatureData(publicUrl.id);
        break;
    }

    return true;
  } catch (error) {
    console.error(error);
    setFileError("Something went wrong.");
    return false;
  }
};
console.log(`File uploaded successfully: ${passportPreview}`);

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (passportPreview) URL.revokeObjectURL(passportPreview);
      if (medicalLicensePreview) URL.revokeObjectURL(medicalLicensePreview);
      if (part1EmailPreview) URL.revokeObjectURL(part1EmailPreview);
      if (passportBioPreview) URL.revokeObjectURL(passportBioPreview);
      if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    };
  }, [
    passportPreview,
    medicalLicensePreview,
    part1EmailPreview,
    passportBioPreview,
    signaturePreview,
  ]);

  // Parse slot dates when selectedExam changes
  useEffect(() => {
    if (selectedExam && selectedExam.slot1) {
      const slot1Dates = parseSlotDates(selectedExam.slot1);
      const slot2Dates = parseSlotDates(selectedExam.slot2);
      const slot3Dates = parseSlotDates(selectedExam.slot3);

      // Combine all dates and remove duplicates
      const allDates = [...slot1Dates, ...slot2Dates, ...slot3Dates];
      const uniqueDatesStr = [
        ...new Set(
          allDates
            .filter((date) => date instanceof Date && !isNaN(date.getTime()))
            .map((date) => date.toISOString())
        ),
      ];
      const uniqueDates = uniqueDatesStr.map((dateStr) => new Date(dateStr));

      // Sort dates in ascending order
      uniqueDates.sort((a, b) => a.getTime() - b.getTime());

      setAvailableDates(uniqueDates);
    }
  }, [selectedExam]);

  // Update selected dates when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      setSelectedDates({
        preferenceDate1:
          value.preferenceDate1 && value.preferenceDate1 !== " "
            ? new Date(value.preferenceDate1)?.toISOString()
            : null,
        preferenceDate2:
          value.preferenceDate2 && value.preferenceDate2 !== " "
            ? new Date(value.preferenceDate2)?.toISOString()
            : null,
        preferenceDate3:
          value.preferenceDate3 && value.preferenceDate3 !== " "
            ? new Date(value.preferenceDate3)?.toISOString()
            : null,
      });
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Get available dates for a specific field (excluding dates selected in other fields)
  const getAvailableDatesForField = (
    fieldName: "preferenceDate1" | "preferenceDate2" | "preferenceDate3"
  ) => {
    return availableDates.filter((date) => {
      const dateStr = date.toISOString();

      // Check if this date is selected in another field
      for (const [field, selectedDate] of Object.entries(selectedDates)) {
        if (field !== fieldName && selectedDate === dateStr) {
          return false;
        }
      }

      return true;
    });
  };

  const candidateId = form.watch("candidateId");

  useEffect(() => {
    if (candidateId && candidateId.length > 7) {
      form.setValue("candidateId", "");
    }
  }, [candidateId]);

  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handleBlur = () => {
    if (!phone) {
      setError("Phone number is required");
    } else if (!isValidPhoneNumber(phone)) {
      setError("Invalid phone number");
    } else {
      setError(null);
    }
  };

  function test() {
    setTimeout(() => {
      const pdfBlob = document.getElementById("pdf-download-preview-link");
      if (pdfBlob) {
        // @ts-ignore
        const pdfUrl = pdfBlob.href;
        window.open(pdfUrl, "_blank");
      }
    }, 200);
  }

  if (isExamClosed) {
    return <ExamClosed />;
  }
  if (isClosed) {
    return <ExamClosedApp />;
  }
  if (selectedExam === undefined) return <NotFound />;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="space-y-1 bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex justify-start items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <img src="/icon.png" alt="404" />
                </div>
                <span>APPLICATION FORM</span>
              </div>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                For the South Asia MRCGP [INT.] Part 2 (OSCE) Examination
              </CardDescription>
            </CardTitle>
            <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-md text-indigo-700 dark:text-indigo-300 font-medium text-sm">
              {selectedExam
                ? selectedExam.name + " - " + selectedExam.location
                : ""}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal and Contact Information */}
              <Accordion
                type="single"
                collapsible
                defaultValue="personal"
                className="w-full"
              >
                <AccordionItem
                  value="personal"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <User className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      PERSONAL AND CONTACT INFORMATION
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      {/* Candidate ID */}
                      <FormField
                        control={form.control}
                        name="candidateId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Candidate ID{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormDescription>
                              Please quote it in all correspondence.
                            </FormDescription>
                            <FormControl>
                              <Input
                                placeholder="e.g. 1234567"
                                {...field}
                                maxLength={7}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.length <= 7) {
                                    field.onChange(value);
                                  }
                                }}
                                className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                  form.formState.errors.fullName
                                    ? "border-red-500 dark:border-red-700"
                                    : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Passport Image */}
                      <div className="space-y-2">
                        <FormLabel className="text-base font-medium">
                          Passport Size image:
                        </FormLabel>
                        <div className="flex items-center justify-center w-full">
                          {passportPreview ? (
                            <div className="relative w-full">
                              <div className="flex flex-col items-center">
                                <img
                                  src={passportPreview || "/placeholder.svg"}
                                  alt="Passport preview"
                                  className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setPassportPreview(null);
                                    const fileInput = document.getElementById(
                                      "passport-image"
                                    ) as HTMLInputElement;
                                    if (fileInput) fileInput.value = "";
                                  }}
                                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                >
                                  Change Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <label
                              htmlFor="passport-image"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-slate-500 dark:text-slate-400" />
                                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  PNG, JPG (MAX. 2MB)
                                </p>
                              </div>
                              <input
                                id="passport-image"
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    validateFile(
                                      e.target.files[0],
                                      "passport-image"
                                    );
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                        {fileError && (
                          <p className="text-sm text-red-500 mt-1">
                            {fileError}
                          </p>
                        )}
                      </div>

                      {/* Full Name */}
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Full name as you would like it to appear on record{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Full Name"
                                {...field}
                                className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                  form.formState.errors.fullName
                                    ? "border-red-500 dark:border-red-700"
                                    : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Residential Address */}
                      <div className="space-y-4">
                        <h3 className="text-base font-medium">
                          Residential Address
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="poBox"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  House no. and street or P.O.Box:{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter P.O.Box"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      form.formState.errors.fullName
                                        ? "border-red-500 dark:border-red-700"
                                        : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  District:{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter District"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      form.formState.errors.fullName
                                        ? "border-red-500 dark:border-red-700"
                                        : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  City / Town / Village:{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter City / Town / Village"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      form.formState.errors.fullName
                                        ? "border-red-500 dark:border-red-700"
                                        : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Province / Region:{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Province / Region"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      form.formState.errors.fullName
                                        ? "border-red-500 dark:border-red-700"
                                        : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Country:{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Country"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      form.formState.errors.fullName
                                        ? "border-red-500 dark:border-red-700"
                                        : ""
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Contact Details */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                WhatsApp number:{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              {/* <FormDescription>In full international format</FormDescription> */}
                              <FormControl>
                                <div
                                  className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                                    form.formState.errors.whatsapp
                                      ? "border-red-500 dark:border-red-700"
                                      : ""
                                  }`}
                                >
                                  <PhoneInput
                                    international
                                    countryCallingCodeEditable={true}
                                    value={field.value}
                                    onBlur={handleBlur}
                                    onChange={(value) => {
                                      field.onChange(value);
                                      setPhone(value);
                                    }}
                                    className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage>
                                {error && (
                                  <span className="text-sm text-red-500">
                                    {error}
                                  </span>
                                )}
                              </FormMessage>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="emergencyContact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Emergency contact number{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              {/* <FormDescription>In full international format</FormDescription> */}
                              <FormControl>
                                <div
                                  className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 ${
                                    form.formState.errors.whatsapp
                                      ? "border-red-500 dark:border-red-700"
                                      : ""
                                  }`}
                                >
                                  <PhoneInput
                                    international
                                    countryCallingCodeEditable={true}
                                    value={field.value}
                                    onBlur={handleBlur}
                                    onChange={(value) => {
                                      field.onChange(value);
                                      setPhone(value);
                                    }}
                                    className="flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage>
                                {error && (
                                  <span className="text-sm text-red-500">
                                    {error}
                                  </span>
                                )}
                              </FormMessage>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                              <FormLabel>
                                E-mail <span className="text-red-500">*</span>
                              </FormLabel>
                              {/* <FormDescription>
                                  Please provide valid personal email address that you regularly check, as most
                                  correspondence and important announcements are communicated to candidates by email.
                                </FormDescription> */}
                              <FormControl>
                                <Input
                                  placeholder="Enter Email"
                                  type="email"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    form.formState.errors.fullName
                                      ? "border-red-500 dark:border-red-700"
                                      : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date of passing Part 1 exam */}
                        <FormField
                          control={form.control}
                          name="dateOfPassingPart1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Date of passing Part 1 exam{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      form.formState.errors.fullName
                                        ? "border-red-500 dark:border-red-700"
                                        : ""
                                    }`}
                                  >
                                    <SelectValue placeholder="Select date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  {part1ExamDates.map((date) => (
                                    <SelectItem
                                      key={date}
                                      value={date}
                                      className="dark:text-slate-200 dark:focus:bg-slate-700"
                                    >
                                      {date}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* No. of previous OSCE attempts */}
                        <FormField
                          control={form.control}
                          name="previousOsceAttempts"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                No. of previous OSCE attempts{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                      form.formState.errors.fullName
                                        ? "border-red-500 dark:border-red-700"
                                        : ""
                                    }`}
                                  >
                                    <SelectValue placeholder="Select number" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  <SelectItem
                                    value="0"
                                    className="dark:text-slate-200 dark:focus:bg-slate-700"
                                  >
                                    0
                                  </SelectItem>
                                  <SelectItem
                                    value="1"
                                    className="dark:text-slate-200 dark:focus:bg-slate-700"
                                  >
                                    1
                                  </SelectItem>
                                  <SelectItem
                                    value="2"
                                    className="dark:text-slate-200 dark:focus:bg-slate-700"
                                  >
                                    2
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Experience and License Details */}
              <Accordion
                type="single"
                collapsible
                defaultValue="experience"
                className="w-full"
              >
                <AccordionItem
                  value="experience"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <FileText className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      EXPERIENCE AND LICENSE DETAILS
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="countryOfExperience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Country of postgraduate clinical experience:{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter country of postgraduate clinical experience"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    form.formState.errors.fullName
                                      ? "border-red-500 dark:border-red-700"
                                      : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="countryOfOrigin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Country of ethnic origin{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Country of ethnic origin"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    form.formState.errors.fullName
                                      ? "border-red-500 dark:border-red-700"
                                      : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="registrationAuthority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Registration authority{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Registration authority"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    form.formState.errors.fullName
                                      ? "border-red-500 dark:border-red-700"
                                      : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="registrationNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Registration number{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter Registration number"
                                  {...field}
                                  className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 ${
                                    form.formState.errors.fullName
                                      ? "border-red-500 dark:border-red-700"
                                      : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dateOfRegistration"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>
                                Date of full registration{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>dd/mm/yyyy</span>
                                      )}
                                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0 dark:bg-slate-800 dark:border-slate-700"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() ||
                                      date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    className="dark:bg-slate-800"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* OSCE Session */}
              <Accordion
                type="single"
                collapsible
                defaultValue="osce"
                className="w-full"
              >
                <AccordionItem
                  value="osce"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      OSCE SESSION
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-100 dark:border-indigo-800">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                          The OSCE exam will take place over 12 days (
                          {selectedExam ? selectedExam?.name : ""}{" "}
                          {Object.values(availableDates).map((dateStr: any) => {
                            const day = new Date(dateStr).getDate();
                            return <span key={dateStr}>{day}, </span>;
                          })}
                          ) If you have a preference (e.g. for travel purposes)
                          for a particular day, please indicate below your
                          preferred choice:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="preferenceDate1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preference Date 1</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                                  >
                                    <SelectValue placeholder="Select a date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  <SelectItem key="" value={" "}>
                                    None
                                  </SelectItem>
                                  {getAvailableDatesForField(
                                    "preferenceDate1"
                                  ).map((date) => (
                                    <SelectItem
                                      key={date.toISOString()}
                                      value={date.toISOString()}
                                    >
                                      {format(date, "MMMM d, yyyy")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="preferenceDate2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preference Date 2</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 `}
                                  >
                                    <SelectValue placeholder="Select a date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  <SelectItem key="" value={" "}>
                                    None
                                  </SelectItem>
                                  {getAvailableDatesForField(
                                    "preferenceDate2"
                                  ).map((date) => (
                                    <SelectItem
                                      key={date.toISOString()}
                                      value={date.toISOString()}
                                    >
                                      {format(date, "MMMM d, yyyy")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="preferenceDate3"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preference Date 3</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                                  >
                                    <SelectValue placeholder="Select a date" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                                  <SelectItem key="" value={" "}>
                                    None
                                  </SelectItem>
                                  {getAvailableDatesForField(
                                    "preferenceDate3"
                                  ).map((date) => (
                                    <SelectItem
                                      key={date.toISOString()}
                                      value={date.toISOString()}
                                    >
                                      {format(date, "MMMM d, yyyy")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-800">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                          PLEASE NOTE
                        </h4>
                        <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                          <li>
                            The number of seats are limited and slots will be
                            allocated on the "First Come First Served" basis.
                          </li>
                          <li>
                            Whilst we will try to accommodate your preference,
                            it may not be possible due to a large number of
                            applicants.
                          </li>
                          <li>
                            Please email us well in advance if you require a
                            letter of invitation for visa purposes and make sure
                            you complete all travel formalities in good time
                            (visa applications, travel permits, leaves, etc.) No
                            Refunds will be granted in case any candidate fails
                            to get the visa prior to the exam date.
                          </li>
                          <li>
                            Candidates with a disability are requested to read
                            the rules and regulation document [Page 10]
                            available on the website.
                          </li>
                          <li>
                            The MRCGP [INT.] South Asia Secretariat will notify
                            you by email of your allocated date and time at
                            least four weeks before the exam starting date. [It
                            is advised to make your travel arrangements once you
                            receive this email]
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Candidate's Statement */}
              <Accordion
                type="single"
                collapsible
                defaultValue="statement"
                className="w-full"
              >
                <AccordionItem
                  value="statement"
                  className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center text-lg font-semibold text-slate-800 dark:text-slate-200">
                      <Shield className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" />
                      CANDIDATE'S STATEMENT
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pt-4 pb-6 bg-white dark:bg-slate-900">
                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          I hereby apply to sit the South Asia MRCGP [INT.] Part
                          2 (OSCE) Examination, success in which will allow me
                          to apply for International Membership of the UK's
                          Royal College of General Practitioners. Detailed
                          information on the membership application process can
                          be found on the RCGP website:{" "}
                          <a
                            href="#"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Member Ship
                          </a>
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          I have read and agree to abide by the conditions set
                          out in the South Asia MRCGP [INT.] Examination Rules
                          and Regulations as published on the MRCGP [INT.] South
                          Asia website:{" "}
                          <a
                            href="http://www.mrcgpintsouthasia.org"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            www.mrcgpintsouthasia.org
                          </a>{" "}
                          If accepted for International Membership, I undertake
                          to continue approved postgraduate study while I remain
                          in active general practice/family practice, and to
                          uphold and promote the aims of the RCGP to the best of
                          my ability.
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                          I understand that, on being accepted for International
                          Membership, an annual subscription fee is to be
                          payable to the RCGP. I understand that only registered
                          International Members who maintain their RCGP
                          subscription are entitled to use the post-nominal
                          designation "MRCGP [INT]". Success in the exam does
                          not give me the right to refer to myself as MRCGP
                          [INT.].
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          I also understand and agree that my personal data will
                          be handled by the MRCGP [INT.] South Asia Board and I
                          also give permission for my personal data to be
                          handled by the regional MRCGP [INT.] South Asia
                          co-ordinators.
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="termsAgreed"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                I agree to the terms and conditions{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormDescription className="text-xs">
                                By checking this box, I confirm that I have read
                                and agree to the statements above.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* File Uploads */}
                        <div className="space-y-4">
                          <h3 className="text-base font-medium">
                            Required Documents
                          </h3>

                          <div className="space-y-2">
                            <FormLabel>
                              Valid Medical license: (Use .png or .jpg only){" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {medicalLicensePreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={
                                        medicalLicensePreview ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt="Medical license preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setMedicalLicensePreview(null);
                                        const fileInput =
                                          document.getElementById(
                                            "medical-license"
                                          ) as HTMLInputElement;
                                        if (fileInput) fileInput.value = "";
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="medical-license"
                                  className={
                                    warning ||
                                    form.formState.errors.medicalLicense
                                      ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }
                                >
                                  <div
                                    className={`flex flex-col items-center justify-center pt-5 pb-6 `}
                                  >
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className={`font-semibold`}>
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="medical-license"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(
                                          e.target.files[0],
                                          "medical-license"
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>
                              Part I passing email: (Use .png or .jpg only)
                            </FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {part1EmailPreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={
                                        part1EmailPreview ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt="Part I passing email preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setPart1EmailPreview(null);
                                        const fileInput =
                                          document.getElementById(
                                            "part1-email"
                                          ) as HTMLInputElement;
                                        if (fileInput) fileInput.value = "";
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="part1-email"
                                  className={
                                    "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 "
                                  }
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="part1-email"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(
                                          e.target.files[0],
                                          "part1-email"
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-base font-medium">&nbsp;</h3>

                          <div className="space-y-2">
                            <FormLabel>
                              Passport bio Page (Valid): (Use .png or .jpg only){" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {passportBioPreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={
                                        passportBioPreview ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg" ||
                                        "/placeholder.svg"
                                      }
                                      alt="Passport bio page preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setPassportBioPreview(null);
                                        const fileInput =
                                          document.getElementById(
                                            "passport-bio"
                                          ) as HTMLInputElement;
                                        if (fileInput) fileInput.value = "";
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="passport-bio"
                                  className={
                                    warning ||
                                    form.formState.errors.medicalLicense
                                      ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="passport-bio"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(
                                          e.target.files[0],
                                          "passport-bio"
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>
                              Signature: (Use .png or .jpg only){" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <div className="flex items-center justify-center w-full">
                              {signaturePreview ? (
                                <div className="relative w-full">
                                  <div className="flex flex-col items-center">
                                    <img
                                      src={
                                        signaturePreview || "/placeholder.svg"
                                      }
                                      alt="Signature preview"
                                      className="h-40 object-contain rounded-md mb-2 border border-slate-200 dark:border-slate-700"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSignaturePreview(null);
                                        const fileInput =
                                          document.getElementById(
                                            "signature"
                                          ) as HTMLInputElement;
                                        if (fileInput) fileInput.value = "";
                                      }}
                                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    >
                                      Change Image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor="signature"
                                  className={
                                    warning ||
                                    form.formState.errors.medicalLicense
                                      ? "border-red-500 flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                                      : "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  }
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-1 text-slate-500 dark:text-slate-400" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </p>
                                  </div>
                                  <input
                                    id="signature"
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        validateFile(
                                          e.target.files[0],
                                          "signature"
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="agreementName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full name: </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter Full name"
                                    {...field}
                                    className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="agreementDate"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>
                                  Date: <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? format(field.value, "PPP")
                                          : format(new Date(), "PPP")}
                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0 dark:bg-slate-800 dark:border-slate-700"
                                    align="start"
                                  >
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                      className="dark:bg-slate-800"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <PDFDownloadLink
                  id="pdf-download-link"
                  document={
                    <ApplicationPDFComplete
                      data={form.getValues()}
                      images={pdfImages}
                    />
                  }
                  fileName="MRCGP_Application_Form.pdf"
                  className="hidden"
                >
                  {({ loading }) => (
                    <>
                      {loading || pdfGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </>
                      )}
                    </>
                  )}
                </PDFDownloadLink>
                <PDFDownloadLink
                  id="pdf-download-preview-link"
                  document={
                    <ApplicationPDFCompletePreview
                      data={form.getValues()}
                      images={pdfImages}
                    />
                  }
                  fileName="MRCGP_Application_Form.pdf"
                  className="hidden"
                >
                  {({ loading }) => (
                    <>
                      {loading || pdfGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </>
                      )}
                    </>
                  )}
                </PDFDownloadLink>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.handleSubmit(test)();
                  }}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  id="preview-button"
                  onClick={() => {
                    // Create a new window to open the PDF
                    setTimeout(() => {
                      const pdfBlob =
                        document.getElementById("pdf-download-link");
                      if (pdfBlob) {
                        // @ts-ignore
                        const pdfUrl = pdfBlob.href;
                        window.open(pdfUrl, "_blank");
                        form.reset();
                        setPassportPreview(null);
                        setMedicalLicensePreview(null);
                        setPart1EmailPreview(null);
                        setPassportBioPreview(null);
                        setSignaturePreview(null);
                      }
                    }, 500); // Increased timeout to ensure PDF generation completes
                  }}
                  className=" hidden items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                ></Button>
                <Button
                  type="submit"
                  // disabled={isSubmitting}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">
            © 2025 . Crafted with ❤ by MRCGP International South Asia
          </div>
        </div>
      </Card>
    </div>
  );
}
export default ApplicationForm;
