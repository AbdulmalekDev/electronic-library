import { React, useContext,  useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/download.png";
import SearchBox from "../SearchBox";
import { MdMenuOpen, MdOutlineMenu, MdOutlineLightMode,MdOutlineDarkMode, MdCheckCircle } from "react-icons/md";
import { IoCartOutline, IoShieldHalfSharp } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaRegBell, FaUserPlus } from "react-icons/fa6";
import { MyContext } from "../../App";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { Badge } from "@mui/material";

const Header = () => {
    const { i18n, t } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [isMyAccOpen, setIsMyAccOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const context = useContext(MyContext);
    const { user, isLogin, logout } = useAuth();
    const { showSuccess, showError, unreadCount, notificationsList, markAsRead } = useNotification();
    const navigate = useNavigate();

    const toggleMyAcc = () => setIsMyAccOpen(!isMyAccOpen);
    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen);
    };

    const handleLogout = async () => {
        setIsMyAccOpen(false);
        await logout();
        showSuccess(t("Header.logoutSuccess"));
        navigate("/login");
    };

    return (
        <header className="d-flex align-items-center">
            <div className="container-fluid w-100">
                <div className="row d-flex align-items-center w-100">
                    {/* Logo Wrapper */}
                    <div className="col-sm-2 part1">
                        <Link to={"/"} className="d-flex align-items-center logo">
                            <img src={logo} alt="logo" />
                            <span className="ms-2">E-Library</span>
                        </Link>
                    </div>

                    <div className="col-sm-3 d-flex align-items-center part2 res-hide">
                        <button className="rounded-circle me-3 btn-sidebar-toggle btn" onClick={() => context.setisToggleSidebar(!context.isToggleSidebar)}>
                            {context.isToggleSidebar ? <MdOutlineMenu /> : <MdMenuOpen />}
                        </button>
                        <SearchBox />
                    </div>

                    <div className="col-sm-7 d-flex align-items-center justify-content-end part3">
                        <button className="rounded-circle me-3 btn-theme-toggle btn d-flex align-items-center justify-content-center" onClick={() => context.setThemeMode(!context.themeMode)}>
                            {context.themeMode ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
                        </button>

                        <div className="cartWrapper me-3">
                            <button className="rounded-circle btn-cart btn d-flex align-items-center justify-content-center">
                                <IoCartOutline />
                            </button>
                            {/* <span className="d-flex align-items-center justify-content-center">"0"</span> */}
                        </div>

                        <div className="res-hide me-3">
                            <LanguageSwitcher />
                        </div>

                        <div className="dropdown me-3">
                            <button className="rounded-circle btn-notifications btn d-flex align-items-center justify-content-center" onClick={toggleNotifications}>
                                <Badge 
                                    badgeContent={unreadCount} 
                                    color="error" 
                                    overlap="circular"
                                    showZero
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            top: "-32%",
                                            left: "7%",
                                        }
                                    }}
                                >
                                    <FaRegBell />
                                </Badge>
                            </button>
                            {isNotificationsOpen && (
                                <div className="dropdown-menu dropdown-menu-end show shadow border-0 p-3 notifications dropdown_list">
                                    <div className="head ps-3 pb-0">
                                        <h4>{t("Header.notificationsTitle")} ({notificationsList.length})</h4>
                                    </div>
                                    <div className="dropdown-divider mb-1"></div>
                                    <div className="scroll" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {notificationsList.length > 0 ? notificationsList.map((item) => (
                                            <button key={item.id} className={`dropdown-item py-2 ${!item.read ? 'bg-light fw-bold' : ''}`} onClick={() => {
                                                markAsRead(item.id);
                                                setIsNotificationsOpen(false);
                                                navigate('/notifications');
                                            }}>
                                                <div className="d-flex align-items-center">
                                                    <div className="userImg mr-2 ms-2">
                                                        <span className={`rounded-circle text-white d-flex align-items-center justify-content-center ${item.type === 'overdue' ? 'bg-danger' : item.type === 'returned' ? 'bg-success' : 'bg-primary'}`} style={{ width: '35px', height: '35px', borderRadius: '50%', fontSize: '14px' }}>
                                                            {item.type === 'borrowed' ? <FaRegBell /> : item.type === 'returned' ? <MdCheckCircle /> : item.type === 'overdue' ? '!' : 'N'}
                                                        </span>
                                                    </div>
                                                    <div className="dropdownInfo text-start">
                                                        <p className="mb-0 small" style={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
                                                            {item.type === 'borrowed' && t("Notifications.borrowed_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                                            {item.type === 'overdue' && t("Notifications.late_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                                            {item.type === 'returned' && t("Notifications.returned_msg", { userName: item.userName, bookTitle: item.bookTitle })}
                                                        </p>
                                                        <p className="text-primary small mb-0 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        )) : (
                                            <p className="p-3 text-center small text-muted">{t("Notifications.no_new_notifications") || "No new notifications"}</p>
                                        )}
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <div className="ps-3 pe-3 w-100 pt-1">
                                        <Link to="/notifications" onClick={() => setIsNotificationsOpen(false)}>
                                            <button className="btn btn-blue w-100 btn-sm">
                                                {t("Header.viewAllNotifications")}
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {isLogin !== true ? (
                            <Link to={"/login"}>
                                <button className="btn btn-blue btn-round ms-3">
                                    {t("Header.signIn")}
                                </button>
                            </Link>
                        ) : (
                            <div className="myAccWrapper dropdown position-relative">
                                <button
                                    className="myAcc btn d-flex align-items-center border-0"
                                    onClick={toggleMyAcc}
                                >
                                    <div className="userImg">
                                        <span className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white" style={{ width: '40px', height: '40px' }}>
                                            {user?.fullName?.charAt(0) || user?.name?.charAt(0) || "U"}
                                        </span>
                                    </div>
                                    <div className="userInfo res-hide ms-2 text-start">
                                        <h4 className="mb-0 small fw-bold">{user?.fullName || user?.name}</h4>
                                        <p className="mb-0 text-muted extra-small" style={{ fontSize: '10px' }}>{user?.email}</p>
                                    </div>
                                </button>

                                {isMyAccOpen && (
                                    <div className="dropdown-menu dropdown-menu-end show shadow border-0 p-2 mt-2" style={{ minWidth: '200px', position: 'absolute', right: 0, top: '50px', zIndex: 1000 }}>
                                        <Link to="/settings/profile" className="w-100" onClick={() => { setIsMyAccOpen(false); }}>
                                            <button className="dropdown-item d-flex align-items-center py-2 rounded">
                                                <FaUserPlus className="me-2" /> {t("Header.myAccount")}
                                            </button>
                                        </Link>
                                        <button className="dropdown-item d-flex align-items-center py-2 rounded" onClick={() => { setIsMyAccOpen(false); }}>
                                            <IoShieldHalfSharp className="me-2" /> {t("Header.resetPassword")}
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item d-flex align-items-center py-2 rounded text-danger" onClick={handleLogout}>
                                            <IoMdLogOut className="me-2" /> {t("Header.logout")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;