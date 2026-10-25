import { useTranslation } from "react-i18next";
import { MdLanguage } from "react-icons/md";
import { FaFlagUsa, FaFlag } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setOpen(!open);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang); // ✅ مهم جداً
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDarkMode = document.body.classList.contains("dark");

  const styles = {
    wrapper: { position: "relative", display: "inline-block" },
    button: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      cursor: "pointer",
      background: isDarkMode ? "#112755" : "#f1f1f1",
      border: isDarkMode ? "1px solid #112755" : "1px solid #ccc",
      color: isDarkMode ? "#fff" : "#112755",
    },
    icon: { fontSize: "20px" },
    dropdown: {
      position: "absolute",
      top: "120%",
      right: 0,
      background: isDarkMode ? "#112755" : "#fff",
      border: isDarkMode ? "1px solid #112755" : "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: isDarkMode
        ? "0 2px 6px rgba(0,0,0,0.5)"
        : "0 2px 6px rgba(0,0,0,0.15)",
      padding: "5px 0",
      zIndex: 999,
      minWidth: "120px",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    dropdownItem: {
      padding: "8px 12px",
      cursor: "pointer",
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      color: isDarkMode ? "#fff" : "#112755",
    },
    itemIcon: { fontSize: "18px" },
  };

  const handleHover = (e, enter) => {
    if (isDarkMode) {
      e.currentTarget.style.background = enter ? "#444" : "transparent";
    } else {
      e.currentTarget.style.background = enter ? "#f1f1f1" : "transparent";
    }
  };

  return (
    <div style={styles.wrapper} ref={dropdownRef}>
      <div style={styles.button} onClick={toggleDropdown}>
        <MdLanguage style={styles.icon} />
      </div>

      {open && (
        <div style={styles.dropdown}>
          <div
            style={styles.dropdownItem}
            onClick={() => changeLanguage("en")}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            <FaFlagUsa style={styles.itemIcon} /> English
          </div>
          <div
            style={styles.dropdownItem}
            onClick={() => changeLanguage("ar")}
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
          >
            <FaFlag style={styles.itemIcon} /> العربية
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
