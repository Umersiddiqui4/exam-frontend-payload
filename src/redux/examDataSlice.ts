import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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

interface ExamDataState {
  exams: ExamData[]
}

const initialState: ExamDataState = {
  exams: [],
}

const examDataSlice = createSlice({
  name: 'examData',
  initialState,
  reducers: {
    addExam(state, action: PayloadAction<ExamData>) {
      const newExam = {
        ...action.payload,
        receivingApplicationsCount: 0, // ✅ initialize
      }
      state.exams.push(newExam)
    },
    deleteExam(state, action: PayloadAction<string>) {
      state.exams = state.exams.filter(exam => exam.id !== action.payload)
    },
    updateExam(state, action: PayloadAction<ExamData>) {
      const updatedExam = action.payload;
    
      console.log("Updated Exam ID:", updatedExam.id);
      console.log("Current Exams:");
      state.exams.forEach((exam, i) => {
        console.log(`Index ${i}: Exam ID = ${exam.id}`);
      });
    
      state.exams = state.exams.map(exam =>
        exam.id === updatedExam.id ? updatedExam : exam
      );
    },
    toggleBlockExam(state, action: PayloadAction<string>) {
      const exam = state.exams.find(exam => exam.id === action.payload);
      if (exam) {
        exam.isBlocked = !exam.isBlocked;
      }
    },
    incrementApplicationsCount(state, action: PayloadAction<string>) {
      const exam = state.exams.find(exam => exam.id === action.payload)
      if (exam) {
        exam.receivingApplicationsCount += 1
      }
    }
    
    
  },
})

export const { addExam, deleteExam, updateExam, toggleBlockExam, incrementApplicationsCount } = examDataSlice.actions
export default examDataSlice.reducer
export const selectExams = (state: { examData: ExamDataState }) => state.examData.exams
