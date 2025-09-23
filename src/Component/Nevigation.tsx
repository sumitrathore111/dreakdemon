import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../Context/AuthContext";
import {
  Home,
  FileText,
  Folder,
  Activity,
  User,
  Settings,
  MessageSquare,
  UserCircle,
  Menu,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const logout = () => {

  }
  // Tooltip state (visible only when sidebar is collapsed)
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    text: string;
    left: number;
    top: number;
  }>({ visible: false, text: "", left: 0, top: 0 });

  // Hide tooltip on scroll/resize to avoid stale position
  useEffect(() => {
    const hide = () => setTooltip(t => ({ ...t, visible: false }));
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, []);

  const showTooltip = (el: HTMLElement | null, text: string) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltip({
      visible: true,
      text,
      // position tooltip just to the right of the element, vertically centered
      left: rect.right + 10,
      top: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => setTooltip(t => ({ ...t, visible: false }));

  const menu = [
    { name: "DashBoard", path: "/dashboard", icon: <Home size={20} /> },
    { name: "Resume", path: "/dashboard/courses", icon: <FileText size={20} /> },
    { name: "Open Projects", path: "/dashboard/openproject", icon: <Folder size={20} /> },
    { name: "Marathon", path: "/dashboard/marathon", icon: <Activity size={20} /> },
    { name: "Intership", path: "/dashboard/intership", icon: <User size={20} /> },
    { name: "Company Requirements", path: "/dashboard/company_req", icon: <Settings size={20} /> },
    { name: "Query", path: "/dashboard/query", icon: <MessageSquare size={20} /> },
    { name: "Profile Info", path: "/dashboard/profile", icon: <UserCircle size={20} /> },
  ];

  return (
    <motion.div
      className="h-screen flex bg-gray-200 overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.8 }}
    >
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-black text-white">
        <button onClick={() => setIsOpen(true)} className="p-2">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold"
            style={{ backgroundColor: "#00ADB5" }}
          >
            {user?.displayName ? user.displayName[0] : ""}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex bg-black text-white h-screen flex-col transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link to="/">
            <img src="src/assets/logo.svg" alt="App Logo" className="w-8 h-8" />
          </Link>
          {sidebarOpen && <h1 className="text-lg font-bold">Skill India</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1 rounded hover:bg-gray-800"
          >
            {sidebarOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold"
            style={{ backgroundColor: "#00ADB5" }}
          >
            {user?.displayName ? user.displayName[0] : ""}
          </div>
          {sidebarOpen && (
            <div>
              <h2 className="text-base font-bold leading-tight">{user?.displayName}</h2>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-2">
            {menu.map((tab, index) => {
              // local ref for each link
              const linkRef = React.createRef<HTMLAnchorElement>();
              return (
                <li key={index} className="relative">
                  <Link
                    ref={linkRef}
                    to={tab.path}
                    onMouseEnter={() => {
                      if (!sidebarOpen) showTooltip(linkRef.current, tab.name);
                    }}
                    onMouseLeave={hideTooltip}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${location.pathname === tab.path
                        ? "bg-gray-800 shadow-lg"
                        : "hover:bg-gray-900"
                      }`}
                    style={{
                      color: location.pathname === tab.path ? "#00ADB5" : "#ffffff",
                    }}
                  >
                    {tab.icon}
                    {sidebarOpen && <span>{tab.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-700 relative">
          <button
            onMouseEnter={(e) => {
              if (!sidebarOpen) showTooltip(e.currentTarget as HTMLElement, "Sign Out");
            }}
            onMouseLeave={hideTooltip}
            onClick={logout}
            className="flex items-center gap-4 p-3 w-full rounded-lg hover:bg-red-600 transition-all duration-200 text-white"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-64 h-full bg-black text-white z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <Link to="/" onClick={() => setIsOpen(false)}>
                <img src="src/assets/logo.svg" alt="App Logo" className="w-8 h-8" />
              </Link>
              <button onClick={() => setIsOpen(false)} className="p-1">
                ✕
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-700 flex items-center gap-4">
              <div
                className="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold"
                style={{ backgroundColor: "#00ADB5" }}
              >
                {user?.displayName ? user.displayName[0] : ""}
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">{user?.displayName}</h2>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-2 overflow-y-auto">
              <ul className="space-y-2">
                {menu.map((tab, index) => (
                  <li key={index}>
                    <Link
                      to={tab.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${location.pathname === tab.path ? "bg-gray-800 shadow-lg" : "hover:bg-gray-900"
                        }`}
                      style={{
                        color: location.pathname === tab.path ? "#00ADB5" : "#ffffff",
                      }}
                    >
                      {tab.icon}
                      <span>{tab.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      

      {/* Tooltip portal - only visible when sidebar is collapsed */}
      {tooltip.visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: tooltip.left,
              top: tooltip.top,
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
            className="bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50 opacity-95"
          >
            {tooltip.text}
          </div>,
          document.body
        )}
    </motion.div>
  );
};

export default DashboardLayout;
