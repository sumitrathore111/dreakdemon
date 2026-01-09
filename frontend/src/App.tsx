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
        <footer className="bg-card dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-t border-border dark:border-gray-700 mt-20 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
            <div className="grid md:grid-cols-4 gap-10">
              <div className="space-y-5">
                <div className="flex items-center space-x-2">
                  <img src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg" className="w-8 h-8" />
                  <span className="text-xl font-bold text-foreground dark:text-white">SkillUpX</span>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed">
                  Empowering the next generation of tech professionals through
                  practical education and industry mentorship.
                </p>
                <div className="flex space-x-3 pt-2">
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-muted dark:bg-gray-800 hover:bg-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/25">
                    <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-muted dark:bg-gray-800 hover:bg-blue-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25">
                    <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-muted dark:bg-gray-800 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-500/25">
                    <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-muted dark:bg-gray-800 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/25">
                    <svg className="w-4 h-4 text-muted-foreground dark:text-gray-400 hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-foreground dark:text-white text-lg relative inline-block">
                  Features
                  <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#00ADB5] to-purple-500 rounded-full"></span>
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground dark:text-gray-400">
                  <li className="hover:text-primary transition-colors duration-200 cursor-pointer flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full"></span>
                    Open Project Contribution
                  </li>
                  <li className="hover:text-primary transition-colors duration-200 cursor-pointer flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full"></span>
                    Creator Corner
                  </li>
                  <li className="hover:text-primary transition-colors duration-200 cursor-pointer flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full"></span>
                    CodeArena
                  </li>
                  <li className="hover:text-primary transition-colors duration-200 cursor-pointer flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full"></span>
                    Developer Connect
                  </li>
                  <li className="hover:text-primary transition-colors duration-200 cursor-pointer flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full"></span>
                    Project Bazaar
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-foreground dark:text-white text-lg relative inline-block">
                  Company
                  <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#00ADB5] to-purple-500 rounded-full"></span>
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground dark:text-gray-400">
                  <li>
                    <a href="/about" className="hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:bg-primary transition-colors"></span>
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="/about#team" className="hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:bg-primary transition-colors"></span>
                      Our Team
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:bg-primary transition-colors"></span>
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-foreground dark:text-white text-lg relative inline-block">
                  Connect
                  <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-[#00ADB5] to-purple-500 rounded-full"></span>
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground dark:text-gray-400">
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:bg-primary transition-colors"></span>
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:bg-primary transition-colors"></span>
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:bg-primary transition-colors"></span>
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://www.instagram.com/skillupx1.0?igsh=Y25rN29tMzJnenFh" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:bg-primary transition-colors"></span>
                     Instagram
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-border dark:border-gray-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground dark:text-gray-500">
                &copy; 2024 SkillUpX. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground dark:text-gray-500">
                <a href="#" className="hover:text-primary transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors duration-200">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors duration-200">Cookie Policy</a>
              </div>
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
                  <Route path="developer-connect" element={<DeveloperConnect />} />
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
