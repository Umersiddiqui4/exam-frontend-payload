// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor  } from './redux/store';  // Import the Redux store
import { ThemeProvider } from './components/theme-provider';
import {Dashboard} from './components/dashboard';
import {ApplicationForm} from './components/application-form';
import ExamComponent from './components/examComponent';
import { LoginForm } from './components/LoginForm';
import { ProtectedRoute } from './auth/ProtectedRoute';

function App() {
  return (
    <Provider store={store}> {/* Wrap the app with Redux provider */}
    <PersistGate loading={null} persistor={persistor}>
      <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/application/:examId"
            element={
                <ApplicationForm />
            }
          />
          <Route
            path="/exam"
            element={
              <ProtectedRoute>
                <ExamComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
