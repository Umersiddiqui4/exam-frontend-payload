import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ApplicationData {
  id: string; // Unique identifier for the application
  applicantName: string;
  examId: string; // Linking to exam
  status: string; // For example: 'pending', 'approved', 'rejected'
  submittedDate: string;
   examName: string; 
   candidateId: string
   date: string
   name: string
   email: string
   whatsapp: string
   emergencyContact: string
   passportUrl: string
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

interface ApplicationState {
  applications: ApplicationData[];
}

const initialState: ApplicationState = {
  applications: [],
};

const applicationDataSlice = createSlice({
  name: 'applicationData',
  initialState,
  reducers: {
    addApplication(state, action: PayloadAction<ApplicationData>) {
      state.applications.push(action.payload);
    },
    deleteApplication(state, action: PayloadAction<string>) {
      state.applications = state.applications.filter(application => application.id !== action.payload);
    },
    updateApplicationStatus(state, action: PayloadAction<{ id: string; status: string }>) {
      const { id, status } = action.payload;
      const application = state.applications.find(application => application.id === id);
      if (application) {
        application.status = status;
      }
    },
    setApplicationStatus(state, action: PayloadAction<{ id: string; status: "approved" | "rejected" }>) {
      const { id, status } = action.payload;
      const application = state.applications.find(app => app.id === id);
      if (application) {
        application.status = status;
      }
    },
    
  },
});

export const { addApplication, deleteApplication, updateApplicationStatus, setApplicationStatus } = applicationDataSlice.actions;
export default applicationDataSlice.reducer;

export const selectApplications = (state: { applicationData: ApplicationState }) => state.applicationData.applications;
