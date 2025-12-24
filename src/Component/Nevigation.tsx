import {
    BookOpen,
    ChevronsLeft,
    Folder,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    Moon,
    Store,
    Sun,
    Trophy,
    UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useTheme } from "../Context/ThemeContext";
import { useDataContext } from "../Context/UserDataContext";
import { logout } from "../service/auth";

export default function DashboardLayout() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const location = useLocation();
  const navigation = useNavigate();
  
  const navItems = [
    { name: "DashBoard", path: "/dashboard/db", icon: <Home size={20} /> },
    { name: "Creator Corner", path: "/dashboard/projects", icon: <Folder size={20} /> },
    { name: "Developer Connect", path: "/dashboard/courses", icon: <BookOpen size={20} /> },
    { name: "CodeArena", path: "/dashboard/codearena", icon: <Trophy size={20} /> },
    { name: "Project Bazaar", path: "/dashboard/marketplace", icon: <Store size={20} /> },
    { name: "Query", path: "/dashboard/query", icon: <MessageSquare size={20} /> },
    { name: "Profile Info", path: "/dashboard/profile", icon: <UserCircle size={20} /> },
  ];

  const { avatrUrl, fetchAllIdeas, fetchJoinRequests } = useDataContext();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Load pending requests count
  useEffect(() => {
    const loadPendingRequests = async () => {
      if (!user) return;
      
      try {
        const ideas = await fetchAllIdeas();
        const myProjects = ideas.filter((idea: any) => idea.userId === user.uid && idea.status === 'approved');
        
        let totalPending = 0;
        for (const project of myProjects) {
          const requests = await fetchJoinRequests(project.id);
          totalPending += requests.length;
        }
        
        setPendingRequestsCount(totalPending);
      } catch (error) {
        console.error('Error loading pending requests:', error);
      }
    };
    
    loadPendingRequests();
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingRequests, 30000);
    return () => clearInterval(interval);
  }, [user, fetchAllIdeas, fetchJoinRequests]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 z-[60] shadow-lg lg:shadow-none border-r border-gray-200 dark:border-gray-700 overflow-visible
          ${isMinimized ? "w-20" : "w-64"} 
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
          <div className="relative flex items-center justify-between p-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/" className="flex-shrink-0">
                <img
                  src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg"
                  alt="App Logo"
                  className="w-8 h-8"
                />
              </Link>

              {!isMinimized && (
                <Link
                  to="/"
                  className="text-xl font-bold text-gray-800 dark:text-white transition-all duration-300 truncate"
                >
                  NextStep
                </Link>
              )}
            </div>

            {/* Minimize Button - Desktop Only */}
            <button
              className="hidden lg:flex flex-shrink-0 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <ChevronsLeft
                size={20}
                className={`transition-transform duration-300 dark:text-white ${
                  isMinimized ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Close Button - Mobile Only */}
            <button
              className="lg:hidden flex-shrink-0 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsDrawerOpen(false)}
            >
              <ChevronsLeft size={20} className="dark:text-white" />
            </button>
          </div>
        </div>

        {/* Navigation Links - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.name} className="relative">
                  <Link
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${
                        isActive
                          ? "text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    style={{ backgroundColor: isActive ? "#00ADB5" : "" }}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isMinimized && (
                      <span className="truncate text-sm font-medium">{item.name}</span>
                    )}
                    
                    {/* Notification Badge for Projects */}
                    {item.path === '/dashboard/projects' && pendingRequestsCount > 0 && (
                      <span className="ml-auto flex-shrink-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                      </span>
                    )}
                    
                    {/* Tooltip - only when minimized on desktop */}
                    {isMinimized && (
                      <div className="hidden lg:block fixed ml-3 px-3 py-2 rounded-lg shadow-xl bg-gray-900 text-white text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-50"
                        style={{
                          left: '80px', // 80px sidebar + 12px gap
                          
                          transform: 'translateY(-50%)'
                        }}
                      >
                        {item.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900"></div>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Fixed Profile Section at Bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 overflow-visible">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center w-full mb-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              isMinimized ? "justify-center" : "gap-3"
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
            {!isMinimized && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSignOut(!showSignOut)}
              className={`flex items-center w-full hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors group ${
                isMinimized ? "justify-center" : "gap-3"
              }`}
            >
              {/* Avatar */}
              <img
                src={avatrUrl || "https://via.placeholder.com/40"}
                alt="User Avatar"
                className="flex-shrink-0 w-10 h-10 rounded-full "
                style={{ backgroundColor: "#00ADB5" }}
               
              />
              <div
                className="hidden flex-shrink-0 w-10 h-10 rounded-full items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: "#00ADB5" }}
              >
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* User Info */}
              {!isMinimized && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold truncate text-sm dark:text-white">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              )}
              
              {/* Tooltip for minimized state */}
              {isMinimized && (
                <div className="hidden lg:block fixed ml-3 px-3 py-2 rounded-lg shadow-xl bg-gray-900 text-white text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-[9999]"
                  style={{
                    left: '92px', // 80px sidebar + 12px gap
                    bottom: '24px'
                  }}
                >
                  <p className="font-semibold">{user?.displayName || "User"}</p>
                  <p className="text-xs text-gray-300">{user?.email || "user@example.com"}</p>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-gray-900"></div>
                </div>
              )}
            </button>
          </div>

          {/* Animated Sign Out */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              showSignOut ? "max-h-20 mt-3 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <button
              className={`flex items-center gap-2 py-2.5 px-3 w-full rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium ${
                isMinimized ? "justify-center" : ""
              }`}
              onClick={() => {
                logout();
                navigation("/");
              }}
            >
              <LogOut size={18} />
              {!isMinimized && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Dark overlay for mobile drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-[55] backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar (mobile only) */}
        <div className="lg:hidden flex items-center justify-between bg-white dark:bg-gray-900 shadow-md px-4 py-3 z-30">
          {/* Mobile Drawer Button */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={24} className="dark:text-white" />
          </button>

          {/* Logo in center */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg"
              alt="App Logo"
              className="w-8 h-8"
            />
          </Link>

          {/* Theme toggle and Avatar on right side */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <img
              src={avatrUrl || "https://via.placeholder.com/40"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover"
              style={{ backgroundColor: "#00ADB5" }}
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800">
          <Outlet />
        </div>
      </div>
    </div>
  );
}