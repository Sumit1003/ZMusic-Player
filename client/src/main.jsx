import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import "./index.css";
import App from "./App.jsx";

/* ---------------------------------------------------
 🧱 Error Boundary — Handles Runtime Failures Gracefully
--------------------------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("🚨 Application Error:", error, info);
    this.setState({ info });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center p-4">
          <div className="glass-effect rounded-3xl p-8 max-w-md text-center border border-white/10 shadow-2xl backdrop-blur-2xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{
                rotate: { duration: 2, repeat: Infinity },
                scale: { duration: 1.8, repeat: Infinity },
              }}
              className="text-6xl mb-4 select-none"
            >
              😵
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Don’t worry — it’s not you! Please try refreshing the page to
              reload the application.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={this.handleReload}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
            >
              Reload Application
            </motion.button>

            <details className="mt-5 text-left bg-black/30 p-3 rounded-lg border border-white/10 text-sm">
              <summary className="text-gray-400 cursor-pointer">
                ⚙ Technical Details
              </summary>
              <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                {this.state.error?.toString()}
                {"\n"}
                {this.state.info?.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ---------------------------------------------------
 🎧 Beautiful Animated Loading Screen (Fallback)
--------------------------------------------------- */
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
    <div className="text-center select-none">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="text-6xl mb-5"
      >
        🎵
      </motion.div>

      <motion.h1
        className="text-2xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Z Music
      </motion.h1>

      <motion.p
        className="text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Loading your music experience...
      </motion.p>

      <motion.div
        className="mt-6 flex justify-center space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 bg-purple-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        ))}
      </motion.div>
    </div>
  </div>
);

/* ---------------------------------------------------
 🚀 Render Application
--------------------------------------------------- */
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

try {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          {/* ✅ BrowserRouter is already inside App.jsx */}
          <App />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  console.error("❌ Fatal render error:", error);

  root.render(
    <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center text-center p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">Application Failed to Load</h1>
      <p className="text-gray-200 mb-6">
        Please check your browser console for details or reload the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl text-white border border-white/10 transition-all"
      >
        Reload Page
      </button>
    </div>
  );
}
