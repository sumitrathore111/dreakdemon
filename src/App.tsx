import { type JSX, Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navigation from "./Component/Nevigation";


import { AuthProvider, useAuth } from "./Context/AuthContext";
import { DataProvider } from "./Context/UserDataContext";

import PublicNavBar from "./Public/PublicNevBar";
import ScrollToTop from "./Component/ScrollToTop";
import { AnimatePresence } from "framer-motion";
import ProjectDetail from "./Pages/Projects/ProjectDetails";
import ResumePreview from "./Pages/Resume/ResumePreview";
import DashboardComingSoon from "./Pages/Dashboard/Dashboard";


// Lazy-loaded pages
const HomePage = lazy(() => import("./Public/HomePage").then(mod => ({ default: mod.HomePage })));
const AboutPage = lazy(() => import("./Public/CompanyAbout").then(mod => ({ default: mod.AboutPage })));
const TeamPage = lazy(() => import("./Public/TeamPage").then(mod => ({ default: mod.TeamPage })));
const Login = lazy(() => import("./Auth/LoginScreen"));
const Signup = lazy(() => import("./Auth/SignupScreen"));

// const ProjectContribution = lazy(() => import("./Pages/ProjectContribution"));
const BrowseProjects = lazy(() => import("./Pages/Projects/BrowseProjects"));
const IdeaSubmission = lazy(() => import("./Pages/Projects/IdeaSubmission"));
const ProjectWorkspace = lazy(() => import("./Pages/Projects/ProjectWorkspace"));
const AdminPanel = lazy(() => import("./Pages/Admin/AdminPanel"));
const QueryScreen = lazy(() => import("./Pages/QueryScreen"));
const Intership = lazy(() => import("./Pages/Intership"));
const Company_Req = lazy(() => import("./Pages/Company_Req/Company_Req"));
const ProfileInfo = lazy(() => import("./Pages/Profile/ProfileInfo"));
const Marathon = lazy(() => import("./Pages/Marathon/Marathon"));
const Courses = lazy(() => import("./Pages/Courses"));
const CourseView = lazy(() => import("./Pages/CourseView"));

function PublicLayout() {

  const location = useLocation();
  const hideFooter = ["/login", "/signup"].includes(location.pathname);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavBar />

      <div className="flex-grow">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/signup" element={<SignupRedirect />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>

      {!hideFooter && (
        <footer className="bg-card border-t border-border mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <img src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg" />
                  </div>
                  <span className="text-lg font-semibold">NextStep</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Empowering the next generation of tech professionals through
                  practical education and industry mentorship.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Open Project Contribution</li>
                  <li>Resume Builder</li>
                  <li>Marathon</li>
                  <li>Company Requirements</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>About Us</li>
                  <li>Our Team</li>
                  <li>Contact</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Connect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>LinkedIn</li>
                  <li>Twitter</li>
                  <li>GitHub</li>
                  <li>Discord</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 NextStep. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function LoginRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Login />;
}

function SignupRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <Signup />;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <ScrollToTop />
        <Suspense fallback={<div>Loading app...</div>}>
          <AnimatePresence mode="wait" >

            <Routes>
              {/* Public Routes */}
              <Route path="/*" element={<PublicLayout />} />

              {/* Private Routes */}
              <Route path="dashboard/*" element={
                <ProtectedRoute>
                  <Navigation />
                </ProtectedRoute>

              }>

                <Route path="db" element={<DashboardComingSoon />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:courseId" element={<CourseView />} />
                <Route path="openproject/:id" element={<ProjectDetail />} />
                <Route path="projects" element={<BrowseProjects />} />
                <Route path="projects/submit-idea" element={<IdeaSubmission />} />
                <Route path="projects/:projectId" element={<ProjectWorkspace />} />
                <Route path="query" element={<QueryScreen />} />
                <Route path="profile" element={<ProfileInfo />} />
                <Route path="marathon" element={<Marathon />} />
                <Route path="company_req" element={<Company_Req />} />
                <Route path="intership" element={<Intership />} />
                <Route path="resume" element={<ResumePreview />} />
              </Route>
              {/* <Route
                path="dashboard/*"
                element={
                  <ProtectedRoute>
                    
                      <PrivateLayout />
                   
                  </ProtectedRoute>
                }
              >
                
              </Route> */}
            </Routes>
          </AnimatePresence>
        </Suspense>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
