import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './Slice'  // authSlice ko import karo
import examDataReducer from './examDataSlice'  // examDataSlice ko import karo
import applicationDataReducer from './applicationsSlice'  // applicationDataSlice ko import karo
// Root reducer mein dono reducers ko combine karo
const rootReducer = combineReducers({
  auth: authReducer, // auth slice
  examData: examDataReducer, // examData slice
  applicationData: applicationDataReducer
})

export default rootReducer
