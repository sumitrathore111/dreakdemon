import { type JSX, Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navigation from "./Component/Nevigation";
import ToastProvider from "./Component/ToastProvider";


import { AuthProvider, useAuth } from "./Context/AuthContext";
import { BattleGuardProvider } from "./Context/BattleGuardContext";
import { ThemeProvider } from "./Context/ThemeContext";
import { DataProvider } from "./Context/UserDataContext";

import { AnimatePresence } from "framer-motion";
import RematchNotification from "./Component/Global/RematchNotification";
import ScrollToTop from "./Component/ScrollToTop";
import DashboardComingSoon from "./Pages/Dashboard/Dashboard";
import ProjectDetail from "./Pages/Projects/ProjectDetails";
import Documentation from "./Public/Documentation";
import PublicNavBar from "./Public/PublicNevBar";

// Lazy-loaded pages
const HomePage = lazy(() => import("./Public/HomePage"));
const AboutPage = lazy(() => import("./Public/CompanyAbout").then(mod => ({ default: mod.AboutPage })));
const ContactUs = lazy(() => import("./Public/ContactUs").then(mod => ({ default: mod.ContactUs })));
const Login = lazy(() => import("./Auth/LoginScreen"));
const Signup = lazy(() => import("./Auth/SignupScreen"));

// const ProjectContribution = lazy(() => import("./Pages/ProjectContribution"));
const BrowseProjects = lazy(() => import("./Pages/Projects/BrowseProjects"));
const IdeaSubmission = lazy(() => import("./Pages/Projects/IdeaSubmission"));
const ProjectWorkspace = lazy(() => import("./Pages/Projects/ProjectWorkspace"));
const ProjectAccessDiagnostic = lazy(() => import("./Pages/Projects/ProjectAccessDiagnostic"));
const AdminPanel = lazy(() => import("./Pages/Admin/AdminPanel"));
const QueryScreen = lazy(() => import("./Pages/QueryScreen"));
const Company_Req = lazy(() => import("./Pages/Company_Req/Company_Req"));
const ProfileInfo = lazy(() => import("./Pages/Profile/ProfileInfo"));
const DeveloperConnect = lazy(() => import("./Pages/DeveloperConnect/DeveloperConnect"));
const CodeArena = lazy(() => import("./Pages/CodeArena/CodeArena"));

// Marketplace pages
const MarketplaceBazaar = lazy(() => import("./Pages/Marketplace/MarketplaceBazaar"));
const ProjectDetailMarketplace = lazy(() => import("./Pages/Marketplace/ProjectDetail"));
const CreateListing = lazy(() => import("./Pages/Marketplace/CreateListing"));
const MyListings = lazy(() => import("./Pages/Marketplace/MyListings"));
const MyPurchases = lazy(() => import("./Pages/Marketplace/MyPurchases"));

function PublicLayout() {

  const location = useLocation();
  const hideFooter = ["/login", "/signup"].includes(location.pathname);
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col">
      <PublicNavBar />

      <div className="flex-grow">
        <Suspense fallback={<div className="dark:bg-gray-900 dark:text-white">Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/signup" element={<SignupRedirect />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </div>

      {!hideFooter && (
        <footer className="bg-card dark:bg-gray-800 border-t border-border dark:border-gray-700 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-0">
                  <div className="w-16 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <img src="https://res.cloudinary.com/dvwmbidka/image/upload/e_make_transparent/Gemini_Generated_Image_97tpgf97tpgf97tp_qgylcb" />
                  </div>
                  <span className="text-lg font-semibold dark:text-white">SkillUpX</span>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Empowering the next generation of tech professionals through
                  practical education and industry mentorship.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 dark:text-white">Features</h4>
                <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                  <li>Open Project Contribution</li>
                  <li>Creator corner</li>
                  <li>CodeArena</li>
                  <li>Developer Connect</li>
                   <li>Project Bazaar</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 dark:text-white">Company</h4>
                <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                  <li>About Us</li>
                  <li>Our Team</li>
                  <li>Contact</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 dark:text-white">Connect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground dark:text-gray-400">
                  <li>LinkedIn</li>
                  <li>Twitter</li>
                  <li>GitHub</li>
                  <li>Discord</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border dark:border-gray-700 mt-8 pt-8 text-center text-sm text-muted-foreground dark:text-gray-400">
              <p>&copy; 2024 SkillUpX. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function LoginRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard/db" replace /> : <Login />;
}

function SignupRedirect() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard/db" replace /> : <Signup />;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? (
    <>
      <RematchNotification />
      {children}
    </>
  ) : <Navigate to="/login" replace />;
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BattleGuardProvider>
            <ToastProvider />
            <ScrollToTop />
            <Suspense fallback={<div className="dark:bg-gray-900 dark:text-white min-h-screen flex items-center justify-center">Loading app...</div>}>
              <AnimatePresence mode="wait" >

                <Routes>
                  {/* Public Routes */}
                  <Route path="/*" element={<PublicLayout />} />

                {/* Private Routes */}
                <Route
                  path="dashboard/*"
                  element={
                    <ProtectedRoute>
                      <Navigation />
                    </ProtectedRoute>
                  }
                >
                  <Route path="db" element={<DashboardComingSoon />} />
                  <Route path="admin" element={<AdminPanel />} />
                  <Route path="openproject/:id" element={<ProjectDetail />} />
                  <Route path="projects" element={<BrowseProjects />} />
                  <Route path="projects/admin" element={<AdminPanel />} />
                  <Route path="projects/AdminPanel" element={<AdminPanel />} />
                  <Route path="projects/submit-idea" element={<IdeaSubmission />} />
                  <Route path="projects/access-diagnostic" element={<ProjectAccessDiagnostic />} />
                  <Route path="projects/workspace/:projectId" element={<ProjectWorkspace />} />
                  <Route path="courses" element={<DeveloperConnect />} />
                  <Route path="query" element={<QueryScreen />} />
                  <Route path="profile" element={<ProfileInfo />} />
                  <Route path="codearena/*" element={<CodeArena />} />
                  <Route path="company_req" element={<Company_Req />} />

                  {/* Marketplace Routes */}
                  <Route path="marketplace" element={<MarketplaceBazaar />} />
                  <Route path="marketplace/project/:projectId" element={<ProjectDetailMarketplace />} />
                  <Route path="marketplace/create" element={<CreateListing />} />
                  <Route path="marketplace/edit/:projectId" element={<CreateListing />} />
                  <Route path="marketplace/my-listings" element={<MyListings />} />
                  <Route path="marketplace/my-purchases" element={<MyPurchases />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </Suspense>
          </BattleGuardProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
