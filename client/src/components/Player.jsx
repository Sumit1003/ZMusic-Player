// components/Player.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Heart,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const Player = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isRepeat,
    isShuffle,
    likedSongs,
    togglePlay,
    nextSong,
    previousSong,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    setVolume,
    setCurrentTime,
    setDuration,
  } = useMusicPlayer();

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const expandedProgressBarRef = useRef(null);

  const [audioError, setAudioError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localTime, setLocalTime] = useState(0);

  // ✅ Detect screen width and update isMobile state
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      
      // If screen becomes desktop and player was hidden, show it again
      if (!mobile && !isVisible && currentSong) {
        setIsVisible(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isVisible, currentSong]);

  // ✅ Show player when song loaded
  useEffect(() => {
    if (currentSong) setIsVisible(true);
    else setIsVisible(false);
  }, [currentSong]);

  // ✅ Mirror currentTime locally for smooth progress
  useEffect(() => {
    setLocalTime(currentTime);
  }, [currentTime]);

  const getBackendUrl = useCallback((path) => {
    if (!path) return "";
    const base = import.meta.env.VITE_API_URL || "https://z-music-uq5m.onrender.com";
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${base}/${clean}`;
  }, []);

  // ✅ Handle play/pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const handlePlayPause = async () => {
      try {
        if (isPlaying) await audio.play();
        else audio.pause();
      } catch {
        setAudioError("Failed to play audio");
      }
    };
    handlePlayPause();
  }, [isPlaying, currentSong]);

  // ✅ Sync progress with audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        setLocalTime(audio.currentTime);
      }
    };
    
    const loaded = () => {
      const audioDuration = audio.duration || 0;
      setDuration(audioDuration);
    };
    
    const ended = () =>
      isRepeat ? ((audio.currentTime = 0), audio.play()) : nextSong();

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("canplaythrough", loaded);
    audio.addEventListener("ended", ended);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeEventListener("canplaythrough", loaded);
      audio.removeEventListener("ended", ended);
    };
  }, [isDragging, isRepeat, nextSong, setCurrentTime, setDuration]);

  // ✅ Handlers
  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => setAudioError("Cannot play track."));
    }
    togglePlay();
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.volume = newVol;
    setVolume(newVol);
  };

  // ✅ Fixed seek handler for both desktop and mobile
  const handleSeek = (e, ref) => {
    if (!ref.current || !audioRef.current || !duration) return;

    const rect = ref.current.getBoundingClientRect();
    let clientX;
    
    // Handle both mouse and touch events
    if (e.type.includes('touch')) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const seekX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const newTime = (seekX / rect.width) * duration;

    // Update audio time and state
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setLocalTime(newTime);
  };

  // ✅ Desktop mouse handlers
  const handleMouseDown = (e, ref) => {
    setIsDragging(true);
    handleSeek(e, ref);

    const handleMove = (ev) => {
      if (isDragging) {
        handleSeek(ev, ref);
      }
    };
    
    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  };

  // ✅ Mobile touch handlers
  const handleTouchStart = (e, ref) => {
    setIsDragging(true);
    handleSeek(e, ref);
  };

  const handleTouchMove = (e, ref) => {
    if (isDragging) {
      handleSeek(e, ref);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ✅ Click/tap handler for quick seeking
  const handleProgressClick = (e, ref) => {
    handleSeek(e, ref);
  };

  // ✅ New handler for hiding player on mobile
  const handleHidePlayer = () => {
    if (isMobile) {
      setIsVisible(false);
    }
  };

  // ✅ Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTime = (t) =>
    isNaN(t)
      ? "0:00"
      : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

  const progress = duration ? (localTime / duration) * 100 : 0;
  const isLiked = currentSong && likedSongs.includes(currentSong.id);

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={getBackendUrl(currentSong.audio)}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
      />

      {/* 🎵 Expanded Player View */}
      <AnimatePresence>
        {isExpanded && !isMobile && (
          <motion.div
            key="expanded-player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
          >
            {/* Close Button */}
            <motion.button
              onClick={toggleExpanded}
              whileHover={{ scale: 1.1 }}
              className="absolute top-6 right-6 text-white p-2 rounded-full hover:bg-white/10"
            >
              <Minimize2 size={24} />
            </motion.button>

            {/* Album Art */}
            <motion.img
              src={getBackendUrl(currentSong.image)}
              alt={currentSong.title}
              className="w-80 h-80 rounded-2xl object-cover shadow-2xl mb-8"
              onError={(e) => {
                e.target.src = `https://picsum.photos/seed/${currentSong.id}/400`;
              }}
            />

            {/* Song Info */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentSong.title}
              </h2>
              <p className="text-gray-400 text-lg">{currentSong.artist}</p>
            </div>

            {/* Expanded Progress Bar */}
            <div className="w-full max-w-2xl mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">{formatTime(localTime)}</span>
                <span className="text-white">{formatTime(duration)}</span>
              </div>
              <div
                ref={expandedProgressBarRef}
                className="w-full h-2 bg-gray-700/70 rounded-full cursor-pointer relative"
                onClick={(e) => handleProgressClick(e, expandedProgressBarRef)}
                onMouseDown={(e) => handleMouseDown(e, expandedProgressBarRef)}
                onTouchStart={(e) => handleTouchStart(e, expandedProgressBarRef)}
                onTouchMove={(e) => handleTouchMove(e, expandedProgressBarRef)}
                onTouchEnd={handleTouchEnd}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>
            </div>

            {/* Expanded Controls */}
            <div className="flex items-center justify-center space-x-6 mb-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={toggleShuffle}
                className={`${
                  isShuffle ? "text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Shuffle size={24} />
              </motion.button>

              <motion.button whileHover={{ scale: 1.1 }} onClick={previousSong}>
                <SkipBack className="text-gray-400 hover:text-white" size={28} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handleTogglePlay}
                className="p-4 bg-white text-purple-700 rounded-full hover:scale-105 transition"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </motion.button>

              <motion.button whileHover={{ scale: 1.1 }} onClick={nextSong}>
                <SkipForward className="text-gray-400 hover:text-white" size={28} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={toggleRepeat}
                className={`${
                  isRepeat ? "text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Repeat size={24} />
              </motion.button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-4 w-64">
              <Volume2 size={20} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 accent-purple-500 rounded-full cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎵 Main Player */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="player"
            drag={isMobile}
            dragConstraints={{ top: -400, bottom: 400, left: -150, right: 150 }}
            dragElastic={0.3}
            whileDrag={{ scale: 1.05 }}
            dragMomentum={false}
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              opacity: { duration: 0.3 },
            }}
            className={`fixed z-[80] backdrop-blur-2xl border border-white/10 shadow-2xl ${
              isMobile
                ? "bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[90%] rounded-2xl bg-black/90 p-3"
                : "bottom-0 left-0 right-0 bg-black/95 border-t rounded-none p-3 sm:p-4"
            }`}
          >
            {/* ✅ X Button for Mobile - Left Side */}
            {isMobile && (
              <motion.button
                onClick={handleHidePlayer}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -top-2 -left-2 z-10 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                title="Hide player"
              >
                <X size={12} className="text-white" />
              </motion.button>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
              {/* 🎧 Song Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={getBackendUrl(currentSong.image)}
                  alt={currentSong.title}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover shadow-md"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/seed/${currentSong.id}/200`;
                  }}
                />
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {currentSong.title}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {currentSong.artist}
                  </p>
                </div>

                <motion.button
                  onClick={() => toggleLike(currentSong.id)}
                  whileHover={{ scale: 1.1 }}
                  className={`ml-2 p-1.5 sm:p-2 rounded-full ${
                    isLiked
                      ? "text-pink-500 bg-pink-500/20"
                      : "text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <Heart size={16} className={isLiked ? "fill-current" : ""} />
                </motion.button>
              </div>

              {/* 🎚️ Controls + Progress */}
              <div className="flex flex-col items-center w-full sm:w-[45%]">
                <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={toggleShuffle}
                    className={`${
                      isShuffle
                        ? "text-purple-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Shuffle size={18} />
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.1 }} onClick={previousSong}>
                    <SkipBack className="text-gray-400 hover:text-white" size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={handleTogglePlay}
                    className="p-3 sm:p-3.5 bg-white text-purple-700 rounded-full hover:scale-105 transition"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.1 }} onClick={nextSong}>
                    <SkipForward className="text-gray-400 hover:text-white" size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={toggleRepeat}
                    className={`${
                      isRepeat
                        ? "text-purple-400"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Repeat size={18} />
                  </motion.button>
                </div>

                {/* ✅ Fixed Progress Bar with smooth seeking for mobile */}
                <div className="flex items-center gap-2 w-full mt-2">
                  <span className="text-[10px] sm:text-xs text-gray-400 w-6 sm:w-8 text-right">
                    {formatTime(localTime)}
                  </span>
                  <div
                    ref={progressBarRef}
                    className="flex-1 h-1.5 sm:h-2 bg-gray-700/70 rounded-full cursor-pointer relative overflow-hidden group"
                    onClick={(e) => handleProgressClick(e, progressBarRef)}
                    onMouseDown={(e) => handleMouseDown(e, progressBarRef)}
                    onTouchStart={(e) => handleTouchStart(e, progressBarRef)}
                    onTouchMove={(e) => handleTouchMove(e, progressBarRef)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: "easeOut", duration: 0.2 }}
                    />
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${progress}% - 6px)` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400 w-6 sm:w-8">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* 🔊 Volume & Expand */}
              {!isMobile && (
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="hidden sm:flex items-center gap-2 w-24">
                    <button className="text-gray-400 hover:text-white">
                      {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 accent-purple-500 rounded-full cursor-pointer"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-full text-gray-400 hover:text-purple-400"
                    onClick={toggleExpanded}
                  >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Player;