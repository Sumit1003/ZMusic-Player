import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { MusicPlayerProvider } from "./context/MusicPlayerContext";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import MobileNavigation from "./components/MobileNavigation";

// 🧩 Pages
import Home from "./pages/Home";
import Library from "./pages/Library";
import Search from "./pages/Search";
import LikedSongs from "./pages/LikedSongs";
import Artists from "./pages/Artists";
import Albums from "./pages/Albums";

/* ------------------- ✨ Page Transition Wrapper ------------------- */
const PageWrapper = ({ children }) => {
  const pageVariants = {
    initial: { opacity: 0, x: 25, scale: 0.98 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      opacity: 0,
      x: -25,
      scale: 0.98,
      transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
    },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

/* ------------------- 🧱 Layout Component ------------------- */
const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect current route
  const currentPath = location.pathname.replace("/", "") || "home";

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Page navigation handler
  const handlePageChange = (page) => {
    navigate(`/${page}`);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-hidden">
      {/* 🧭 Main layout body */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* 🟣 Sidebar (Desktop) */}
        {!isMobile && (
          <motion.div
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="hidden md:flex md:flex-shrink-0"
          >
            <Sidebar currentPage={currentPath} onPageChange={handlePageChange} />
          </motion.div>
        )}

        {/* 🧩 Main Content (Animated Routes) */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageWrapper>
                    <Home />
                  </PageWrapper>
                }
              />
              <Route
                path="/home"
                element={
                  <PageWrapper>
                    <Home />
                  </PageWrapper>
                }
              />
              <Route
                path="/library"
                element={
                  <PageWrapper>
                    <Library />
                  </PageWrapper>
                }
              />
              <Route
                path="/artists"
                element={
                  <PageWrapper>
                    <Artists />
                  </PageWrapper>
                }
              />
              <Route
                path="/albums"
                element={
                  <PageWrapper>
                    <Albums />
                  </PageWrapper>
                }
              />
              <Route
                path="/search"
                element={
                  <PageWrapper>
                    <Search />
                  </PageWrapper>
                }
              />
              <Route
                path="/liked"
                element={
                  <PageWrapper>
                    <LikedSongs />
                  </PageWrapper>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      </div>

      {/* 📱 Mobile Bottom Navigation */}
      {isMobile && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <MobileNavigation
            currentPage={currentPath}
            onPageChange={handlePageChange}
          />
        </motion.div>
      )}

      {/* 🎵 Persistent Player */}
      <Player />
    </div>
  );
};

/* ------------------- 🌍 Root App Wrapper ------------------- */
function App() {
  return (
    <Router>
      <MusicPlayerProvider>
        <Layout />
      </MusicPlayerProvider>
    </Router>
  );
}

export default App;
