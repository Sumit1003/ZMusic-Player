// components/Layout.jsx (Updated mobile navigation section)
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "./Player";
import MobileNavigation from "./MobileNavigation";
import { motion } from "framer-motion";

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getMainContentMargin = () => {
    return isMobile 
      ? (isSidebarCollapsed ? "ml-16" : "ml-72")
      : (isSidebarCollapsed ? "ml-20" : "ml-80");
  };

  const getSidebarWidth = () => {
    return isMobile ? (isSidebarCollapsed ? 64 : 280) : (isSidebarCollapsed ? 80 : 320);
  };

  const sidebarWidth = getSidebarWidth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden">
      {/* 🟣 SIDEBAR */}
      <div className="fixed left-0 top-0 h-screen z-40">
        <Sidebar 
          onToggleCollapse={setIsSidebarCollapsed}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* 🧩 MAIN CONTENT */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 
        ${getMainContentMargin()}
        pb-32 md:pb-28 px-4 sm:px-6 md:px-8 py-6 md:py-8 
        scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}
        aria-live="polite"
      >
        <Outlet />
      </motion.main>

      {/* 🎧 MUSIC PLAYER */}
      <motion.footer
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 z-40 bg-black/80 backdrop-blur-lg 
        border-t border-purple-800/30 transition-all duration-300"
        aria-label="Music player"
        style={{
          width: `calc(100% - ${sidebarWidth}px)`,
          marginLeft: `${sidebarWidth}px`,
          height: isMobile ? '80px' : '90px'
        }}
      >
        <Player />
      </motion.footer>

      {/* 📱 MOBILE NAVIGATION */}
      {isMobile && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          className="fixed bottom-0 z-50 transition-all duration-300"
          style={{
            width: `calc(100% - ${sidebarWidth}px)`,
            marginLeft: `${sidebarWidth}px`,
          }}
        >
          <MobileNavigation />
        </motion.div>
      )}
    </div>
  );
};

export default Layout;