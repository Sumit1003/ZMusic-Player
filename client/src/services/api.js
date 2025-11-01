// /services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://z-music-uq5m.onrender.com";

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.retryCount = 2; // 🔁 retry failed requests
    this.silent = import.meta.env.MODE === "production"; // disable logs in prod
  }

  /**
   * 🧩 Safe JSON parser
   */
  async _safeJsonParse(response) {
    try {
      return await response.json();
    } catch {
      !this.silent && console.warn("⚠️ Non-JSON response from:", response.url);
      return null;
    }
  }

  /**
   * 🧠 Fetch Wrapper with retries, structured errors, and JSON safety
   */
  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        const response = await fetch(url, {
          method: options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
          },
          mode: "cors",
          credentials: "include",
          ...options,
        });

        if (!response.ok) {
          const text = await response.text();
          if (!this.silent)
            console.error(`❌ [${response.status}] ${response.statusText}:`, text);

          // If unauthorized or server error, stop retrying
          if (response.status >= 400 && response.status < 500) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }

          // Retry on network/server errors (>=500)
          if (attempt < this.retryCount && response.status >= 500) {
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
            continue;
          }
        }

        const data = await this._safeJsonParse(response);
        if (!data) return null;

        // 🧱 Normalize response structure
        if (Array.isArray(data)) return data;
        if (data.data) return data.data;
        if (data.songs) return data.songs;
        if (data.result) return data.result;
        return data;
      } catch (error) {
        if (attempt < this.retryCount) {
          !this.silent &&
            console.warn(
              `🔁 Retry ${attempt + 1}/${this.retryCount} after error:`,
              error.message
            );
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }

        console.error(`🚨 Fetch Error (${url}):`, error);
        throw new Error(
          "Failed to connect to the server. Please ensure the backend is running."
        );
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🎵 SONG API METHODS                                                        */
  /* -------------------------------------------------------------------------- */

  async getSongs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/songs?${queryString}` : "/api/songs";
    return this._fetch(endpoint);
  }

  async getSongById(id) {
    if (!id) throw new Error("Song ID is required");
    return this._fetch(`/api/songs/${encodeURIComponent(id)}`);
  }

  async searchSongs(query) {
    if (!query?.trim()) return [];
    return this._fetch(`/api/songs/search/${encodeURIComponent(query)}`);
  }

  async getSongsByAlbum(albumName) {
    if (!albumName?.trim()) return [];
    return this._fetch(`/api/songs/album/${encodeURIComponent(albumName)}`);
  }

  /* -------------------------------------------------------------------------- */
  /* 🩺 SERVER HEALTH & TEST ENDPOINTS                                          */
  /* -------------------------------------------------------------------------- */

  async getServerHealth() {
    return this._fetch("/health");
  }

  async testCors() {
    return this._fetch("/api/test-cors");
  }

  /* -------------------------------------------------------------------------- */
  /* 🧩 FUTURE POST/PUT/DELETE METHODS                                          */
  /* -------------------------------------------------------------------------- */

  async post(endpoint, body) {
    return this._fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body) {
    return this._fetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint) {
    return this._fetch(endpoint, { method: "DELETE" });
  }
}

export default new ApiService();
