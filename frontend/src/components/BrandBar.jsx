import { useState, useEffect, useRef } from "react";
import NotificationBell from "./NotificationBell";
import { brandbarService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useMenu } from "../contexts/MenuContext";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const greetingConfig = {
  morning: { icon: '🌤', gradient: 'from-amber-400 to-orange-500', label: "Good Morning" },
  noon: { icon: '☀️', gradient: 'from-yellow-400 to-amber-500', label: "Good Noon" },
  afternoon: { icon: '⛅', gradient: 'from-orange-400 to-amber-500', label: "Good Afternoon" },
  evening: { icon: '🌅', gradient: 'from-orange-500 to-red-500', label: "Good Evening" },
  night: { icon: '🌙', gradient: 'from-indigo-500 to-purple-600', label: "Good Night" },
};

const BrandBar = () => {
  const { user, logout } = useAuth();
  const { setLogoutPreloader } = useMenu();
  const { setSidebarOpen, sidebarCollapsed } = useMenu();
  const { theme, setTheme, themes } = useTheme();
  const [settings, setSettings] = useState({
    logo_url: "",
    company_name: "Republic Insurance",
    subtitle: "Support & IT Service Desk",
  });
  const [weather, setWeather] = useState(null);
  const [now, setNow] = useState(new Date());
  const locationRef = useRef(null);

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          locationRef.current = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          fetchWeather();
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 },
      );
    }

    const weatherInterval = setInterval(fetchWeather, 300000);
    return () => clearInterval(weatherInterval);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await brandbarService.getSettings();
      setSettings({
        logo_url: res.data?.logo_url || "",
        company_name: res.data?.company_name || "Republic Insurance",
        subtitle: res.data?.subtitle || "Support & IT Service Desk",
      });
    } catch (error) {
      // use defaults
    }
  };

  const fetchWeather = async () => {
    if (!locationRef.current) return;
    try {
      const res = await brandbarService.getWeather({
        params: {
          lat: locationRef.current.lat,
          lon: locationRef.current.lon,
        },
      });
      if (res.data?.enabled && !res.data?.error) {
        setWeather(res.data);
      } else {
        setWeather(null);
      }
    } catch (error) {
      setWeather(null);
    }
  };

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  };

  const greeting = greetingConfig[getGreeting()];

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 ${
        sidebarCollapsed ? "md:ml-20" : "md:ml-64"
      }`}
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div
        className="px-4 md:px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm border-b hidden md:flex"
        style={{
          background: "linear-gradient(90deg, var(--bg-secondary), var(--bg-primary))",
          color: "var(--text-primary)",
          borderColor: "var(--border-default)",
        }}
      >
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <span className="flex items-center gap-2 font-medium truncate">
            <span className="text-lg leading-none">{greeting.icon}</span>
            <span className="truncate">
              <span className="font-semibold">{greeting.label}</span>
              <span style={{ color: "var(--text-muted)" }}>
                , {user?.name || "User"}
              </span>
            </span>
          </span>
          {weather && (
            <span
              className="hidden lg:flex items-center gap-2 rounded-full px-3 py-1 flex-shrink-0"
              style={{
                backgroundColor: "var(--bg-muted)",
                color: "var(--text-primary)",
                border: `1px solid var(--border-default)`,
              }}
            >
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.description}
                className="w-6 h-6"
              />
              <span className="font-semibold">{weather.temp}°C</span>
              <span className="w-px h-3" style={{ backgroundColor: "var(--border-default)" }} />
              <span className="capitalize" style={{ color: "var(--text-secondary)" }}>
                {weather.description}
              </span>
              <span className="w-px h-3" style={{ backgroundColor: "var(--border-default)" }} />
              <span style={{ color: "var(--text-secondary)" }}>{weather.city}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(now)}
          </span>
          <span
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium"
            style={{
              background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
              color: "white",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono tracking-wide">{formatTime(now)}</span>
          </span>
        </div>
      </div>

      <div
        className="px-2 md:px-6 py-2 md:py-3 flex items-center gap-2 md:gap-3 justify-between"
        style={{ color: "var(--text-primary)" }}
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <motion.button
            className="md:hidden p-1.5 rounded-xl transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            style={{
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-muted)",
            }}
            onClick={() => setSidebarOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt="Company logo"
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover flex-shrink-0 shadow-md"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div
              className="w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center font-bold md:font-extrabold flex-shrink-0 shadow-lg"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))", color: "var(--text-inverse)" }}
            >
              {settings.company_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm md:text-lg font-semibold truncate hidden xs:block" style={{ color: "var(--text-primary)" }}>
              {settings.company_name}
            </p>
            <p className="text-xs hidden md:block" style={{ color: "var(--text-muted)" }}>
              {settings.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-2 py-1.5 md:px-3 md:py-2 rounded-xl text-xs md:text-sm font-medium border min-h-[36px]"
            style={{
              backgroundColor: "var(--bg-muted)",
              color: "var(--text-primary)",
              borderColor: "var(--border-default)",
            }}
            aria-label="Select theme"
          >
            {Object.entries(themes).map(([key, t]) => (
              <option key={key} value={key}>{t.label}</option>
            ))}
          </select>
          <NotificationBell />
          <motion.button
            onClick={() => {
              setLogoutPreloader(true);
              logout(false);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-2 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border min-h-[36px] flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              border: "none",
            }}
          >
            <span className="hidden xs:inline">Logout</span>
            <svg className="w-4 h-4 xs:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BrandBar;
