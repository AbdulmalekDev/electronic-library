import "./i18n";
import React, { createContext, useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";
// import "./arabic-only-strict.css";

import LoadingBar from "react-top-loading-bar";
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useTranslation } from "react-i18next";
import { fetchDataFromApi } from "./services/api";

// Eagerly Load Critical Components for LCP
import Header from './components/Header';
import Sidebar from './components/Sidebars';

// Lazy Load Pages to reduce initial bundle size
const Dashboard = lazy(() => import('./pages/Dashboard/indexs'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Borrows = lazy(() => import('./pages/Borrows/index'));
const AddBorrow = lazy(() => import('./pages/Borrows/addBorrow'));
const BorrowDetails = lazy(() => import('./pages/Borrows/borrowDetails'));

const Users = lazy(() => import('./pages/Users/index'));
const UserForm = lazy(() => import('./pages/Users/userForm'));
const UserDetails = lazy(() => import('./pages/Users/userDetails'));

const Books = lazy(() => import('./pages/Books/index'));
const AddBook = lazy(() => import('./pages/Books/addBook'));
const EditBook = lazy(() => import('./pages/Books/editBook'));
const BookDetails = lazy(() => import('./pages/Books/bookDetails'));
const BookCopies = lazy(() => import('./pages/Books/bookCopies'));

const News = lazy(() => import('./pages/News/index'));
const NewsForm = lazy(() => import('./pages/News/newsForm'));
const EditNews = lazy(() => import('./pages/News/EditNews'));
const Featured = lazy(() => import('./pages/Featured/index'));

const Reviews = lazy(() => import('./pages/Reviews/index'));
const Notifications = lazy(() => import('./pages/Notifications/index'));
const Reports = lazy(() => import('./pages/Reports/index'));
const Settings = lazy(() => import('./pages/Settings/index'));
const Profile = lazy(() => import('./pages/Settings/Profile'));
const ThemeDemo = lazy(() => import('./pages/ThemeDemo'));
const DynamicLists = lazy(() => import('./pages/DynamicLists'));

const MyContext = createContext();

// Emotion caches for LTR and RTL
const ltrCache = createCache({ key: 'mui-ltr' });
const rtlCache = createCache({ key: 'mui-rtl', stylisPlugins: [prefixer, rtlPlugin] });

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  const [isToggleSidebar, setisToggleSidebar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [progress, setProgress] = useState(0);

  const isRtl = i18n.language === 'ar';

  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem("themeMode");
    return savedTheme === "dark" ? true : false;
  });

  const theme = useMemo(() => createTheme({
    direction: isRtl ? 'rtl' : 'ltr',
    palette: {
      mode: themeMode ? 'dark' : 'light',
      primary: { main: '#0858f7' },
      background: {
        default: themeMode ? '#121212' : '#ebe9e9',
        paper: themeMode ? '#1E1E1E' : '#fff',
      },
      text: {
        primary: themeMode ? '#E0E0E0' : '#1a1a1a',
        secondary: themeMode ? '#A0A0A0' : '#5e5d72',
      },
      heart: {
        active: '#e53935',
        inactive: themeMode ? '#757575' : '#bdbdbd',
      },
      icon: {
        default: themeMode ? '#E0E0E0' : '#5e5d72',
        hover: '#0858f7',
      },
    },
    typography: {
      fontFamily: isRtl
        ? "'Cairo', 'Open Sans', sans-serif"
        : "'Open Sans', 'Cairo', sans-serif",
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: themeMode ? '#1E1E1E' : '#fff',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: themeMode ? '#E0E0E0' : '#1a1a1a',
            backgroundColor: themeMode ? '#242424' : '#fafafa',
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            color: themeMode ? '#E0E0E0' : '#1a1a1a',
          },
        },
      },
    },
  }), [themeMode, isRtl]);

  // Hide header and sidebar if not authenticated OR on specifically marked pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signUp";
  const isHideSidebarAndHeader = !isAuthenticated || isAuthPage;

  useEffect(() => {
    if (themeMode) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
      localStorage.setItem("themeMode", "dark");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
      localStorage.setItem("themeMode", "light");
    }
  }, [themeMode]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = savedLanguage;
    }
  }, [i18n]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const changeLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [i18n]);

  const contextValues = useMemo(() => ({
    isToggleSidebar,
    setisToggleSidebar,
    isHideSidebarAndHeader,
    themeMode,
    setThemeMode,
    windowWidth,
    isOpenNav,
    setIsOpenNav,
    setProgress,
    changeLanguage,
    t,
    language: i18n.language,
    isRtl,
    fetchDataFromApi
  }), [isToggleSidebar, isHideSidebarAndHeader, themeMode, windowWidth, isOpenNav, changeLanguage, t, i18n.language, isRtl]);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <CacheProvider value={isRtl ? rtlCache : ltrCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MyContext.Provider value={contextValues}>
          <LoadingBar
            color="#f11946"
            progress={progress}
            onLoaderFinished={() => setProgress(0)}
            className='topLoadingBar'
          />

          {isHideSidebarAndHeader !== true && <Header />}

          <div className='main d-flex'>
            {isHideSidebarAndHeader !== true && (
              <>
                <div className={`sidebarOverlay d-none ${isOpenNav === true && 'show'}`} onClick={() => setIsOpenNav(false)}></div>
                <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''} ${isOpenNav === true ? 'open' : ''}`}>
                  <Sidebar />
                </div>
              </>
            )}

            <div className={`content ${isHideSidebarAndHeader === true && 'full'} ${isToggleSidebar === true ? 'toggle' : ''}`}>
              <Suspense fallback={
                <div className="d-flex align-items-center justify-content-center" style={{ height: '70vh', width: '100%' }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" exact={true} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard" exact={true} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                  <Route path="/login" exact={true} element={
                    isAuthenticated ? <Navigate to="/" replace /> : <Login />
                  } />
                  <Route path="/signUp" exact={true} element={
                    isAuthenticated ? <Navigate to="/" replace /> : <SignUp />
                  } />

                  {/* Protected Administrative Routes */}
                  <Route path="/books" exact={true} element={<ProtectedRoute><Books /></ProtectedRoute>} />
                  <Route path="/books/add" exact={true} element={<ProtectedRoute><AddBook /></ProtectedRoute>} />
                  <Route path="/books/edit/:id" exact={true} element={<ProtectedRoute><EditBook /></ProtectedRoute>} />
                  <Route path="/books/copies/:id" exact={true} element={<ProtectedRoute><BookCopies /></ProtectedRoute>} />
                  <Route path="/books/:id" exact={true} element={<ProtectedRoute><BookDetails /></ProtectedRoute>} />

                  <Route path="/borrows" exact={true} element={<ProtectedRoute><Borrows /></ProtectedRoute>} />
                  <Route path="/borrows/add" exact={true} element={<ProtectedRoute><AddBorrow /></ProtectedRoute>} />
                  <Route path="/borrows/:id" exact={true} element={<ProtectedRoute><BorrowDetails /></ProtectedRoute>} />

                  <Route path="/users" exact={true} element={<ProtectedRoute><Users /></ProtectedRoute>} />
                  <Route path="/users/add" exact={true} element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
                  <Route path="/users/edit/:id" exact={true} element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
                  <Route path="/users/:id" exact={true} element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />

                  <Route path="/news" exact={true} element={<ProtectedRoute><News /></ProtectedRoute>} />
                  <Route path="/news/add" exact={true} element={<ProtectedRoute><NewsForm /></ProtectedRoute>} />
                  <Route path="/news/edit/:id" exact={true} element={<ProtectedRoute><EditNews /></ProtectedRoute>} />
                  <Route path="/news/:id/edit" exact={true} element={<ProtectedRoute><NewsForm /></ProtectedRoute>} />
                  <Route path="/featured" exact={true} element={<ProtectedRoute><Featured /></ProtectedRoute>} />
                  <Route path="/reviews" exact={true} element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                  <Route path="/notifications" exact={true} element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/reports/*" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/settings/:activeTab" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/settings/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/dynamic-lists" element={<ProtectedRoute><DynamicLists /></ProtectedRoute>} />

                  <Route path="/theme-demo" exact={true} element={<ThemeDemo />} />
                </Routes>
              </Suspense>
            </div>
          </div>
        </MyContext.Provider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
export { MyContext };
