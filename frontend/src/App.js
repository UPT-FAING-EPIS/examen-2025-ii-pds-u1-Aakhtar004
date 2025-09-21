import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Pages - Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Pages - Projects
import ProjectList from './pages/projects/ProjectList';
import ProjectForm from './pages/projects/ProjectForm';
import ProjectMembers from './pages/projects/ProjectMembers';

// Pages - Tasks
import TaskList from './pages/tasks/TaskList';
import TaskForm from './pages/tasks/TaskForm';
import TaskDetail from './pages/tasks/TaskDetail';

// Components
import Layout from './components/layout/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    }
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Rutas de proyectos */}
            <Route path="/projects" element={
              <ProtectedRoute>
                <ProjectList />
              </ProtectedRoute>
            } />
            <Route path="/projects/new" element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/edit" element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/members" element={
              <ProtectedRoute>
                <ProjectMembers />
              </ProtectedRoute>
            } />
            
            {/* Rutas de tareas */}
            <Route path="/projects/:projectId/tasks" element={
              <ProtectedRoute>
                <TaskList />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/tasks/new" element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/tasks/:taskId" element={
              <ProtectedRoute>
                <TaskDetail />
              </ProtectedRoute>
            } />
            <Route path="/projects/:projectId/tasks/:taskId/edit" element={
              <ProtectedRoute>
                <TaskForm />
              </ProtectedRoute>
            } />
            
            {/* Ruta por defecto - redirige al dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;