// components/MobileNavigation.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Library, Search, Heart, Disc, Users } from "lucide-react";

/**
 * MobileNavigation Component
 * --------------------------
 * A bottom navigation bar designed for small screens.
 * Provides quick access to main sections with proper routing.
 * Includes fluid animations and accessibility features.
 */
const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "home", label: "Home", icon: Home, path: "/home" },
    { id: "search", label: "Search", icon: Search, path: "/search" },
    { id: "library", label: "Library", icon: Library, path: "/library" },
    { id: "artists", label: "Artists", icon: Users, path: "/artists" },
    { id: "albums", label: "Albums", icon: Disc, path: "/albums" },
    { id: "liked", label: "Liked", icon: Heart, path: "/liked" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  // Check if current path matches the menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <motion.nav
      role="navigation"
      aria-label="Mobile Navigation"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 220,
        delay: 0.1
      }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        // Safe area for notches and home indicators
        paddingBottom: 'env(safe-area-inset-bottom, 0)'
      }}
    >
      {/* Outer container with mobile-safe spacing */}
      <div className="mx-3 mb-3 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden">
        <div className="flex justify-around items-center px-1 py-2 select-none">
          {menuItems.map(({ id, label, icon: Icon, path }) => {
            const active = isActive(path);

            return (
              <motion.button
                key={id}
                onClick={() => handleNavigation(path)}
                whileTap={{ scale: 0.85 }}
                className={`relative flex flex-col items-center justify-center flex-1 rounded-xl transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 mx-1 ${
                  active ? "text-white" : "text-gray-400 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
                aria-label={label}
              >
                {/* Active background animation */}
                {active && (
                  <motion.div
                    layoutId="mobileNavActive"
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-500/30 rounded-xl border border-purple-500/30"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon container */}
                <div className="relative z-10 flex items-center justify-center p-2">
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                    className={`transition-all duration-200 ${
                      active 
                        ? "drop-shadow-lg" 
                        : "drop-shadow-sm group-hover:scale-110"
                    }`}
                  />
                  
                  {/* Active indicator dot */}
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-purple-400 rounded-full"
                    />
                  )}
                </div>

                {/* Label */}
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative z-10 text-[0.65rem] font-medium transition-all duration-200 truncate max-w-[90%] ${
                    active 
                      ? "text-purple-300 font-semibold" 
                      : "text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for home indicator on iOS */}
      <div className="h-1 bg-transparent" />
    </motion.nav>
  );
};

export default MobileNavigation;