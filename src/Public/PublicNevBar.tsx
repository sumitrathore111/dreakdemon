import { useState, useEffect } from "react";
import { Home, Phone, BarChart3, Info, Menu, X, LogIn } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext"; 
import { motion, AnimatePresence } from "framer-motion";

const PublicNavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const navItems = [
        { id: "home", label: "Home", icon: <Home className="w-5 h-5" />, path: '/' },
        { id: "about", label: "About", icon: <Info className="w-5 h-5" />, path: '/about' },
        { id: "contact", label: "Contact Us", icon: <Phone className="w-5 h-5" />, path: '/contact' },
    ];

    const authItems = user
        ? [{ id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-5 h-5" />, path: '/dashboard/db' }]
        : [{ id: "login", label: "Login", icon: <LogIn className="w-5 h-5" />, path: '/login' }];

    const allItems = [...navItems, ...authItems];

    const linkAnimation = { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } };
    const MotionLink = motion(Link)
    return (
        <nav className={`fixed top-0 left-0 w-full z-50 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <img src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg" alt="logo" />
                        </div>
                        <span className="font-semibold text-lg">NextStep</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-6">
                        {allItems.map((item, idx) => (
                            <MotionLink
                                key={item.id}
                                to={item.path}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition ${
                                    location.pathname === item.path
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                }`}
                                initial="hidden"
                                animate="visible"
                                variants={linkAnimation}
                                transition={{ delay: idx * 0.05 }}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </MotionLink>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setIsOpen(true)} className="md:hidden p-2 rounded-md hover:bg-accent">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            className="absolute left-0 top-0 w-64 h-full bg-white p-6 shadow-lg"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                        <img src="https://res.cloudinary.com/doytvgisa/image/upload/v1758623200/logo_evymhe.svg" alt="logo" />
                                    </div>
                                    <span className="font-semibold text-lg">NextStep</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-md hover:bg-accent">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col space-y-3">
                                {allItems.map((item, idx) => (
                                    <MotionLink
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition ${
                                            location.pathname === item.path
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                        }`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </MotionLink>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default PublicNavBar;
