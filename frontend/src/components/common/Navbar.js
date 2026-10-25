import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search,
  Notifications,
  AccountCircle,
  Home,
  LibraryBooks,
  Person,
  ExitToApp,
  Brightness4,
  Brightness7,
  BookmarkAdded
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useThemeContext } from '../../contexts/ThemeContext';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const { isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotification();
  const { mode, toggleColorMode } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { text: 'الرئيسية', path: '/', icon: <Home /> },
    { text: 'الكتب', path: '/books', icon: <LibraryBooks /> },
    { text: 'من نحن', path: '/about', icon: null },
    { text: 'اتصل بنا', path: '/contact', icon: null }
  ];

  const mobileNavItems = [
    ...navItems,
    ...(isAuthenticated ? [
      { text: 'استعاراتي', path: '/my-borrows', icon: <BookmarkAdded /> },
      { text: 'ملفي الشخصي', path: '/profile', icon: <Person /> }
    ] : [])
  ];

  const renderMobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 280,
          p: 2,
          bgcolor: 'background.paper'
        }
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            مكتبة عبد الملك
          </Typography>
          <IconButton onClick={toggleColorMode} color="inherit" aria-label="تبديل المظهر">
            {mode === 'dark' ? <Brightness7 sx={{ color: '#F59E0B' }} /> : <Brightness4 />}
          </IconButton>
        </Box>

        <List>
          {mobileNavItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={handleMobileMenuToggle}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'primary.dark' }
                }
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'inherit' : 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontFamily: 'Cairo, sans-serif',
                  fontWeight: isActive(item.path) ? 700 : 500
                }}
              />
            </ListItem>
          ))}

          {!isAuthenticated && (
            <>
              <ListItem
                button
                component={Link}
                to="/login"
                onClick={handleMobileMenuToggle}
                sx={{ borderRadius: 2, mt: 2, border: '1px solid', borderColor: 'primary.main', color: 'primary.main' }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText
                  primary="تسجيل الدخول"
                  primaryTypographyProps={{ fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}
                />
              </ListItem>

              <ListItem
                button
                component={Link}
                to="/register"
                onClick={handleMobileMenuToggle}
                sx={{ borderRadius: 2, mt: 1, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
                  <Person />
                </ListItemIcon>
                <ListItemText
                  primary="إنشاء حساب جديد"
                  primaryTypographyProps={{ fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}
                />
              </ListItem>
            </>
          )}

          {isAuthenticated && (
            <ListItem
              button
              onClick={() => {
                handleMobileMenuToggle();
                handleLogout();
              }}
              sx={{ borderRadius: 2, mt: 3, color: 'error.main' }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="تسجيل الخروج"
                primaryTypographyProps={{ fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );

  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 180,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          p: 0.5
        }
      }}
    >
      <MenuItem onClick={handleProfileMenuClose} component={Link} to="/profile" sx={{ borderRadius: 1.5, py: 1 }}>
        <Person sx={{ ml: 1.5, color: 'primary.main', fontSize: 20 }} />
        الملف الشخصي
      </MenuItem>
      <MenuItem onClick={handleProfileMenuClose} component={Link} to="/my-borrows" sx={{ borderRadius: 1.5, py: 1 }}>
        <BookmarkAdded sx={{ ml: 1.5, color: 'primary.main', fontSize: 20 }} />
        استعاراتي
      </MenuItem>
      <MenuItem onClick={handleLogout} sx={{ borderRadius: 1.5, py: 1, color: 'error.main' }}>
        <ExitToApp sx={{ ml: 1.5, color: 'error.main', fontSize: 20 }} />
        تسجيل الخروج
      </MenuItem>
    </Menu>
  );

  const renderNotificationMenu = (
    <Menu
      anchorEl={notificationAnchor}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      open={Boolean(notificationAnchor)}
      onClose={handleNotificationMenuClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 220,
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          p: 0.5
        }
      }}
    >
      <MenuItem onClick={handleNotificationMenuClose} component={Link} to="/profile" sx={{ borderRadius: 1.5, py: 1 }}>
        <Notifications sx={{ ml: 1.5, color: 'primary.main', fontSize: 20 }} />
        الإشعارات ({unreadCount || 0})
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar
        position={isMobile ? 'fixed' : 'sticky'}
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          backdropFilter: { xs: 'none', md: 'blur(8px)' },
          WebkitBackdropFilter: { xs: 'none', md: 'blur(8px)' }
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
          {/* Logo & Brand */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 800,
              fontSize: { xs: '1.15rem', md: '1.35rem' },
              fontFamily: 'Cairo, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <LibraryBooks sx={{ fontSize: 28 }} />
            {/* مكتبة عبد الملك الإلكترونية */}
          </Typography>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    px: 2,
                    py: 0.8,
                    borderRadius: 2,
                    bgcolor: isActive(item.path) ? (mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 58, 138, 0.08)') : 'transparent',
                    '&:hover': {
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {/* Right side buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            {/* Theme Toggle Button */}
            <Tooltip title={mode === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}>
              <IconButton
                color="inherit"
                onClick={toggleColorMode}
                aria-label="تبديل المظهر"
                sx={{ color: 'text.primary' }}
              >
                {mode === 'dark' ? <Brightness7 sx={{ color: '#F59E0B' }} /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {/* Search button */}
            <Tooltip title="البحث في الكتب">
              <IconButton
                color="inherit"
                component={Link}
                to="/books"
                aria-label="البحث في الكتب"
                sx={{ color: 'text.primary' }}
              >
                <Search />
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Tooltip title="الإشعارات">
                  <IconButton
                    color="inherit"
                    onClick={handleNotificationMenuOpen}
                    aria-label="عرض الإشعارات"
                    sx={{ color: 'text.primary' }}
                  >
                    <Badge
                      badgeContent={unreadCount > 0 ? unreadCount : null}
                      color="error"
                    >
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Profile menu */}
                <Tooltip title="حسابي">
                  <IconButton
                    color="inherit"
                    onClick={handleProfileMenuOpen}
                    aria-label="حساب المستخدم"
                    sx={{ color: 'text.primary' }}
                  >
                    <AccountCircle />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              !isMobile && (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    variant="text"
                    sx={{
                      color: 'text.primary',
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 600,
                      px: 2
                    }}
                  >
                    تسجيل الدخول
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 700,
                      px: 2.5,
                      borderRadius: 2
                    }}
                  >
                    إنشاء حساب
                  </Button>
                </>
              )
            )}

            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleMobileMenuToggle}
                aria-label="القائمة الرئيسية"
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile && <Toolbar sx={{ py: 0.5 }} />}

      {renderMobileMenu}
      {renderProfileMenu}
      {renderNotificationMenu}
    </>
  );
};

export default Navbar;