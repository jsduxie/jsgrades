import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import { AddQualificationForm } from './pages/AddQualification';
import { theme } from './theme/theme';
import { CssBaseline } from '@mui/material';

function App() {
  const routesArray = [
    { path: '*', element: <Login /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/home', element: <Home /> },
    { path: '/forgot-password', element: <ForgotPassword /> },
    { path: '/onboarding', element: <Onboarding /> },
    { path: '/add-qualification', element: <AddQualificationForm /> },
  ];
  const routesElement = useRoutes(routesArray);

  useEffect(() => {
    document.title = 'JSGrades';
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <div className="w-full h-screen flex flex-col">{routesElement}</div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
