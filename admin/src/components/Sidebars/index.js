import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";

// Icons
import { MdDashboard } from "react-icons/md";
import { FaAngleRight, FaBook, FaClipboardCheck, FaUsers, FaNewspaper, FaStar, FaComments, FaBell, FaChartBar, FaListUl } from "react-icons/fa6";
import { IoIosSettings, IoMdLogOut } from "react-icons/io";

const Sidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { showSuccess } = useNotification();

  const [activeTab, setActiveTab] = useState(null);
  const [isToggleSubMenu, setIsToggleSubMenu] = useState(false);

  // Redirect to login if token is missing and determine active tab based on route
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const path = location.pathname;
    if (path === "/" || path === "/dashboard") {
      setActiveTab(0);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/books")) {
      setActiveTab(1);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/category") || path.startsWith("/subCategory")) {
      setActiveTab(2);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/borrows")) {
      setActiveTab(3);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/users")) {
      setActiveTab(4);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/news")) {
      setActiveTab(5);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/featured")) {
      setActiveTab(6);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/reviews")) {
      setActiveTab(7);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/notifications")) {
      setActiveTab(8);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/reports")) {
      setActiveTab(9);
      setIsToggleSubMenu(true);
    } else if (path.startsWith("/settings") || path.startsWith("/dynamic-lists")) {
      setActiveTab(10);
      setIsToggleSubMenu(true);
    }
  }, [location.pathname, navigate]);

  const isOpenSubmenu = (index) => {
    if (activeTab === index) {
      setIsToggleSubMenu(!isToggleSubMenu);
    } else {
      setActiveTab(index);
      setIsToggleSubMenu(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    showSuccess(t("Header.logoutSuccess") || "Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <div className="siderbar">
        <ul className="menu-list">
          {/* لوحة التحكم */}
          <li>
            <Button
              className={`w-100 ${activeTab === 0 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(0)}
            >
              <span className="icon"><MdDashboard /></span>
              {t("Sidebar.dashboard")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 0 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/dashboard">{t("Sidebar.dashboard")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* الكتب */}
          <li>
            <Button
              className={`w-100 ${activeTab === 1 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(1)}
            >
              <span className="icon"><FaBook /></span>
              {t("Sidebar.books")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 1 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/books">{t("Sidebar.books_list")}</NavLink></li>
                <li><NavLink to="/books/add">{t("Sidebar.add_book")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* التصنيفات */}
          <li>
            <Button
              className={`w-100 ${activeTab === 2 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(2)}
            >
              <span className="icon"><FaListUl /></span>
              {t("Sidebar.categories")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 2 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/category">{t("Sidebar.categories_list")}</NavLink></li>
                <li><NavLink to="/category/add">{t("Sidebar.add_category")}</NavLink></li>
                <li><NavLink to="/subCategory">{t("Sidebar.subcategories_list")}</NavLink></li>
                <li><NavLink to="/subCategory/add">{t("Sidebar.add_subcategory")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* الاستعارات */}
          <li>
            <Button
              className={`w-100 ${activeTab === 3 && isToggleSubMenu === true ? "active" : ""}`}
              onClick={() => isOpenSubmenu(3)}
            >
              <span className="icon"><FaClipboardCheck /></span>
              {t("Sidebar.borrows")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 3 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/borrows">{t("Sidebar.borrows_list") || t("Sidebar.borrows")}</NavLink></li>
                <li><NavLink to="/borrows/add">{t("Sidebar.add_borrow")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* الأعضاء */}
          <li>
            <Button
              className={`w-100 ${activeTab === 4 && isToggleSubMenu === true ? "active" : ""}`}
              onClick={() => isOpenSubmenu(4)}
            >
              <span className="icon"><FaUsers /></span>
              {t("Sidebar.members")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 4 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/users">{t("Sidebar.members_list") || t("Sidebar.members")}</NavLink></li>
                <li><NavLink to="/users/add">{t("Sidebar.add_member")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* الأخبار */}
          <li>
            <Button
              className={`w-100 ${activeTab === 5 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(5)}
            >
              <span className="icon"><FaNewspaper /></span>
              {t("Sidebar.news")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 5 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/news">{t("Sidebar.view_news")}</NavLink></li>
                <li><NavLink to="/news/add">{t("Sidebar.add_news")}</NavLink></li>

              </ul>
            </div>
          </li>

          {/* الكتب المميزة */}
          <li>
            <Button
              className={`w-100 ${activeTab === 6 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(6)}
            >
              <span className="icon"><FaStar /></span>
              {t("Sidebar.featured_books")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 6 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/featured">{t("Sidebar.view_featured")}</NavLink></li>
                <li><NavLink to="/featured/add">{t("Sidebar.add_featured")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* المراجعات */}
          <li>
            <Button
              className={`w-100 ${activeTab === 7 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(7)}
            >
              <span className="icon"><FaComments /></span>
              {t("Sidebar.reviews")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 7 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/reviews">{t("Sidebar.view_reviews")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* الإشعارات */}
          <li>
            <Button
              className={`w-100 ${activeTab === 8 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(8)}
            >
              <span className="icon"><FaBell /></span>
              {t("Sidebar.notifications")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 8 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/notifications">{t("Sidebar.view_notifications")}</NavLink></li>
                <li><NavLink to="/notifications/add">{t("Sidebar.add_notification")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* التقارير */}
          <li>
            <Button
              className={`w-100 ${activeTab === 9 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(9)}
            >
              <span className="icon"><FaChartBar /></span>
              {t("Sidebar.reports")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 9 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/reports/books">{t("Sidebar.book_reports")}</NavLink></li>
                <li><NavLink to="/reports/borrows">{t("Sidebar.borrow_reports")}</NavLink></li>
                <li><NavLink to="/reports/users">{t("Sidebar.member_reports")}</NavLink></li>
              </ul>
            </div>
          </li>

          {/* الإعدادات */}
          <li>
            <Button
              className={`w-100 ${activeTab === 10 && isToggleSubMenu === true ? "active" : ""} `}
              onClick={() => isOpenSubmenu(10)}
            >
              <span className="icon"><IoIosSettings /></span>
              {t("Sidebar.settings")}
              <span className={`arrow ${t('dir') === 'rtl' ? 'rotate-180' : ''}`}><FaAngleRight /></span>
            </Button>
            <div className={`submenuWrapper ${activeTab === 10 && isToggleSubMenu === true ? "colapse" : "colapsed"} `}>
              <ul className="submenu">
                <li><NavLink to="/settings">{t("Sidebar.system_settings")}</NavLink></li>
                <li><NavLink to="/settings/profile">{t("Sidebar.profile_settings")}</NavLink></li>
                <li><NavLink to="/dynamic-lists">{t("Sidebar.dynamic_lists") || "القوائم الديناميكية"}</NavLink></li>
              </ul>
            </div>
          </li>
        </ul>

        {/* Logout Wrapper */}
        <div className="logoutWrapper">
          <div className="logoutBox">
            <Button className="w-100" onClick={handleLogout}>
              <span className="icon"><IoMdLogOut /></span>
              {t("Sidebar.logout") || "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
