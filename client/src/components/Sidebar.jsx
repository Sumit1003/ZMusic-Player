import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Library,
  Search,
  Heart,
  Menu,
  X,
  Music,
  ChevronLeft,
  ChevronRight,
  Users,
  Disc,
} from "lucide-react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentSong, isPlaying } = useMusicPlayer();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 640);

  /* 🧩 Auto-detect screen size */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsCollapsed(window.innerWidth < 640);
      if (!mobile) setIsMobileOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* 🚫 Prevent background scroll on mobile sidebar open */
  useEffect(() => {
    document.body.style.overflow = isMobile && isMobileOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isMobile, isMobileOpen]);

  /* 🌍 Resolve image URLs */
  const getBackendUrl = (path) => {
    if (!path) return "";
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (path.startsWith("http")) return path;
    return `${base}/${path.replace(/^\/+/, "")}`;
  };

  /* 📜 Navigation menu items */
  const menuItems = [
    { id: "home", label: "Home", icon: Home, path: "/home" },
    { id: "library", label: "Library", icon: Library, path: "/library" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "artists", label: "Artists", icon: Users, path: "/artists" },
    { id: "albums", label: "Albums", icon: Disc, path: "/albums" },
    { id: "liked", label: "Liked Songs", icon: Heart, path: "/liked" },
  ];

  /* 🧭 Navigation handler */
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setIsMobileOpen(false);
  };

  /* ✨ Sidebar animations */
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { 
      x: -300, 
      opacity: 0, 
      transition: { duration: 0.25, ease: "easeIn" } 
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  /* 🎵 Now Playing card */
  const NowPlayingCard = ({ collapsed }) => (
    <motion.div
      layout
      className={`glass-card p-3 rounded-xl border border-white/10 shadow-md transition-all ${
        collapsed ? "items-center flex flex-col" : "flex flex-col"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          {currentSong?.image ? (
            <img
              src={getBackendUrl(currentSong.image)}
              alt="Now Playing"
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = `https://picsum.photos/seed/${currentSong?.id}/100`;
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music size={16} className="text-white" />
            </div>
          )}

          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
            />
          )}
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {currentSong?.title || "Your Favorite Mix"}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {currentSong?.artist || "Various Artists"}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  /* 🧱 Desktop Sidebar */
  const DesktopSidebar = (
    <motion.aside
      key="desktop-sidebar"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`glass-effect flex flex-col border-r border-white/10 transition-all duration-300 z-50 ${
        isCollapsed ? "md:w-20" : "md:w-64"
      } h-screen ${isMobile ? "fixed left-0 top-0 w-64" : ""}`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center w-full" : "gap-2"
          }`}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            className="text-xl"
          >
            🎧
          </motion.span>
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-white truncate">Z Music</h1>
          )}
        </div>

        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}

        {isMobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent px-3 md:px-4 py-4 space-y-6">
        <NowPlayingCard collapsed={isCollapsed} />

        <nav className="space-y-2">
          {menuItems.map(({ id, label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <motion.button
                key={id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                <Icon size={20} />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.aside>
  );

  /* 📱 Compact Sidebar for Mobile (Always visible when main sidebar is closed) */
  const CompactSidebar = (
    <motion.div
      key="compact-sidebar"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-0 top-0 h-full z-30 glass-effect border-r border-white/10 w-16"
    >
      {/* Header with Hamburger */}
      <div className="flex items-center justify-center p-4 border-b border-white/10">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {/* Now Playing - Compact */}
        <div className="flex justify-center">
          <div className="glass-card p-2 rounded-xl border border-white/10">
            <div className="relative">
              {currentSong?.image ? (
                <img
                  src={getBackendUrl(currentSong.image)}
                  alt="Now Playing"
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/${currentSong?.id}/100`;
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Music size={12} className="text-white" />
                </div>
              )}
              {isPlaying && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="space-y-3">
          {menuItems.map(({ id, label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <motion.button
                key={id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavigation(path)}
                title={label}
                className={`w-full flex items-center justify-center p-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* 🖥️ Desktop Sidebar */}
      {!isMobile && DesktopSidebar}

      {/* 📱 Mobile Layout */}
      {isMobile && (
        <>
          {/* Compact Sidebar (Always visible when main sidebar is closed) */}
          {!isMobileOpen && CompactSidebar}

          {/* 🌫 Overlay on Mobile */}
          <AnimatePresence>
            {isMobileOpen && (
              <motion.div
                key="overlay"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setIsMobileOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* 📱 Full Sidebar (Mobile Expanded) */}
          <AnimatePresence>
            {isMobileOpen && (
              <>
                {DesktopSidebar}
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* 📱 Mobile Menu Button (Alternative position) */}
      {isMobile && !isMobileOpen && (
        <motion.button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-18 z-40 p-2 glass-effect rounded-xl text-white shadow-lg border border-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Menu size={16} />
        </motion.button>
      )}
    </>
  );
};

export default Sidebar;