import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Landing from './pages/Landing';
import StartCircle from './pages/StartCircle';
import JoinCircle from './pages/JoinCircle';
import BrowseFamilies from './pages/BrowseFamilies';
import MyCircle from './pages/MyCircle';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ChooseCircle from './pages/ChooseCircle';
import AfterLogin from './pages/AfterLogin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/start-circle" element={<StartCircle />} />
      <Route path="/join-circle" element={<JoinCircle />} />
      <Route path="/browse-families" element={<BrowseFamilies />} />
      <Route path="/my-circle" element={<MyCircle />} />
      <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
      <Route path="/choose-circle" element={<ChooseCircle />} />
      <Route path="/after-login" element={<AfterLogin />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App