// components/Navbar.jsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useMusicPlayer } from "../context/MusicPlayerContext";

/**
 * Navbar Component
 * ----------------
 * Displays title, subtitle, search results, statistics, and "Now Playing" info.
 * Includes responsive animations, accessibility, and dynamic data rendering.
 */
const Navbar = ({ title, subtitle, showStats = false, additionalInfo }) => {
  const { filteredSongs, searchQuery, songs, currentSong, isPlaying } = useMusicPlayer();

  /** 🎧 Calculate Statistics */
  const stats = useMemo(() => {
    if (!showStats) return null;

    const totalSongs = songs.length;
    const totalArtists = new Set(songs.map((s) => s.artist)).size;
    const totalAlbums = new Set(songs.map((s) => s.album)).size;
    const filteredCount = filteredSongs.length;

    return {
      totalSongs,
      totalArtists,
      totalAlbums,
      filteredCount,
      isFiltered: filteredCount !== totalSongs,
    };
  }, [songs, filteredSongs, showStats]);

  /** 🎵 Now Playing Info */
  const nowPlayingInfo = useMemo(() => {
    if (!currentSong || !isPlaying) return null;
    return {
      title: currentSong.title,
      artist: currentSong.artist,
    };
  }, [currentSong, isPlaying]);

  /** 🎨 Motion Variants */
  const variants = {
    container: {
      hidden: { opacity: 0, y: -20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
      },
    },
    text: {
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: "easeOut" },
      },
    },
    icon: {
      hidden: { opacity: 0, scale: 0.8, rotate: -180 },
      visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { duration: 0.6, type: "spring", stiffness: 200 },
      },
      pulse: {
        scale: [1, 1.1, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      },
    },
    spin: {
      animate: {
        rotate: 360,
        transition: { duration: 8, repeat: Infinity, ease: "linear" },
      },
    },
  };

  return (
    <motion.header
      variants={variants.container}
      initial="hidden"
      animate="visible"
      role="banner"
      className="mb-6 md:mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
        {/* 🔹 Title & Info Section */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <motion.h1
                variants={variants.text}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight line-clamp-2"
              >
                {title}
              </motion.h1>

              {(subtitle || additionalInfo) && (
                <div className="space-y-1.5">
                  {subtitle && (
                    <motion.p
                      variants={variants.text}
                      transition={{ delay: 0.1 }}
                      className="text-gray-300 text-sm sm:text-base leading-relaxed"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                  {additionalInfo && (
                    <motion.div
                      variants={variants.text}
                      transition={{ delay: 0.15 }}
                      className="text-purple-300 text-sm font-medium"
                    >
                      {additionalInfo}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* 🎧 Mobile Music Icon */}
            <motion.div
              className="flex sm:hidden"
              variants={variants.icon}
              transition={{ delay: 0.3 }}
            >
              <motion.div variants={variants.spin} animate="animate" className="text-3xl">
                🎵
              </motion.div>
            </motion.div>
          </div>

          {/* 🔍 Search Info */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.2 }}
              className="flex items-center flex-wrap gap-3"
            >
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-2">
                <span className="text-purple-300 text-sm font-medium">
                  Found {filteredSongs.length} song{filteredSongs.length !== 1 ? "s" : ""} for "
                  {searchQuery}"
                </span>
              </div>

              {filteredSongs.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear search
                </motion.button>
              )}
            </motion.div>
          )}

          {/* 📊 Statistics Row */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              {[
                { color: "bg-green-400", label: `${stats.totalSongs} songs` },
                { color: "bg-blue-400", label: `${stats.totalArtists} artists` },
                { color: "bg-purple-400", label: `${stats.totalAlbums} albums` },
                stats.isFiltered && {
                  color: "bg-yellow-400",
                  label: `${stats.filteredCount} filtered`,
                  textColor: "text-yellow-400",
                },
              ]
                .filter(Boolean)
                .map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${item.textColor || "text-gray-400"}`}
                  >
                    <span className={`w-2 h-2 ${item.color} rounded-full`} />
                    <span>{item.label}</span>
                  </div>
                ))}
            </motion.div>
          )}

          {/* 🎶 Now Playing */}
          {nowPlayingInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 mt-3 p-3 bg-white/5 rounded-lg border border-white/10 max-w-md"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-3 h-3 bg-green-400 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  Now Playing: {nowPlayingInfo.title}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  by {nowPlayingInfo.artist}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* 🖥️ Desktop Animated Icon & Stats */}
        <div className="hidden sm:flex flex-col items-end gap-4 flex-shrink-0">
          <motion.div variants={variants.icon} transition={{ delay: 0.3 }} className="relative">
            <motion.div variants={variants.spin} animate="animate" className="text-4xl md:text-5xl">
              🎵
            </motion.div>

            {/* Pulse Effect When Playing */}
            {isPlaying && (
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-purple-500/30 -z-10"
              />
            )}
          </motion.div>

          {stats && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-right"
            >
              <div className="rounded-lg px-3 py-2 border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="text-white text-sm font-semibold">{stats.filteredCount} songs</div>
                <div className="text-gray-400 text-xs">in view</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ✨ Animated Bottom Border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mt-4"
      />
    </motion.header>
  );
};

export default Navbar;
