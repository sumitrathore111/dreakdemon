import  { useState } from "react";
import { Outlet, Link, useLocation,  useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Folder,
  Settings,
  MessageSquare,
  UserCircle,
  Menu,
  LogOut,
  ChevronsLeft,
  Trophy,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useDataContext } from "../Context/UserDataContext";
import { logout } from "../service/auth";

export default function DashboardLayout() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const location = useLocation();
  const navigation = useNavigate()
  const navItems = [
    { name: "DashBoard", path: "/dashboard/db", icon: <Home size={20} /> },
    { name: "Resume", path: "/dashboard/resume", icon: <FileText size={20} /> },
    { name: "Open Projects", path: "/dashboard/openproject", icon: <Folder size={20} /> },
    { name: "Marathon", path: "/dashboard/marathon", icon: <Trophy size={20} /> },
    // { name: "Intership", path: "/dashboard/intership", icon: <User size={20} /> },
    { name: "Company Requirements", path: "/dashboard/company_req", icon: <Settings size={20} /> },
    { name: "Query", path: "/dashboard/query", icon: <MessageSquare size={20} /> },
    { name: "Profile Info", path: "/dashboard/profile", icon: <UserCircle size={20} /> },
  ];

  const {avatrUrl} = useDataContext()
  const { user } = useAuth()

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full bg-white flex flex-col transition-all duration-300 z-50
          ${isMinimized ? "w-20" : "w-56"} 
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0">
          <div className="relative flex items-center p-3">
            <div className="flex items-center gap-2">
              <Link to="/">
                <img
                  src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg"
                  alt="App Logo"
                  className="w-8 h-8"
                />
              </Link>

              {!isMinimized && (
                <Link
                  to={"/"}
                  className="ml-2 text-lg font-semibold text-gray-800 transition-all duration-300"
                >
                  NextStep
                </Link>
              )}
            </div>

            {/* Minimize Button */}
            <button
              className="hidden lg:flex absolute right-2 p-2 rounded-md transition-transform"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <ChevronsLeft
                size={20}
                className={`transition-transform duration-300 ${isMinimized ? "rotate-180" : ""
                  }`}
              />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col py-4 space-y-2 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.path}
                    onClick={()=>setIsDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                      ${isActive
                        ? "text-white"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}

                      style={{backgroundColor:isActive? "#00ADB5" : ""}}
                  >
                    {item.icon}
                    {!isMinimized && <span>{item.name}</span>}
                  </Link>

                  {/* Tooltip - only when minimized */}
                  {isMinimized && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-md shadow-lg bg-gray-800 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Fixed Profile Section at Bottom */}
        <div className="mt-auto border-t p-4">
          <button
            onClick={() => setShowSignOut(!showSignOut)}
            className="flex items-center gap-3 w-full"
          >
            {/* Avatar */}
            <img 
            src={avatrUrl}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{backgroundColor:"#00ADB5"}}
            >
              
            </img>

            {/* User Info */}
            {!isMinimized && (
              <div className="flex-1 min-w-0 text-left">
                <p className="font-semibold truncate">{user?.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </button>

          {/* Animated Sign Out */}
          <div
            className={`overflow-hidden transition-all duration-300 ${showSignOut ? "max-h-16 mt-3 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <button className="flex items-center gap-2 py-2 px-3 w-full rounded-md bg-red-500 text-white hover:bg-red-600 transition"
            onClick={()=>{logout(); navigation('/')}}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

      </div>

      {/* Dark overlay for mobile drawer */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-40"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar (mobile only) */}
        <div className="lg:hidden flex items-center justify-between bg-white shadow px-4 py-2">
          {/* Mobile Drawer Button */}
          <button
            className="p-2 rounded-md hover:bg-gray-200"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={22} />
          </button>

          {/* Avatar on right side */}
          <div className="ml-auto">
            <img
            src={avatrUrl}
            className="w-10 h-10 rounded-full  flex items-center justify-center text-white font-bold" style={{backgroundColor:'#00ADB5'}} >
              
            </img>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
