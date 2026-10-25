import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";
import api from '../../services/api';
import { FaSave, FaUndo, FaDownload, FaCog, FaUsers, FaBook, FaBell, FaShieldAlt, FaFileAlt, FaUser, FaCamera, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { getImageUrl } from '../../services/imageUtils';

const Settings = () => {
    const { t } = useTranslation();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();
    
    const { activeTab: urlTab } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(urlTab || 'profile');
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        username: '',
        profileImage: null,
        previewImage: null
    });
    const fileInputRef = useRef(null);

    const defaultSettings = {
        general: {
            libraryName: { key: 'libraryName', value: 'مكتبة عبد الملك الرقمية', description: t("Settings.system_name"), type: 'text' },
            libraryDescription: { key: 'libraryDescription', value: 'وصف المكتبة', description: t("Common.basic_info"), type: 'textarea' },
            defaultLanguage: { key: 'defaultLanguage', value: 'ar', description: t("Common.language") || 'Language', type: 'select', options: [{value:'ar',label:'العربية'},{value:'en',label:'English'}] },
            theme: { key: 'theme', value: 'light', description: t("Common.theme") || 'Theme', type: 'select', options: [{value:'light',label:t("Settings.enabled")},{value:'dark',label:t("Settings.disabled")}] }
        },
        users: {
            registrationEnabled: { key: 'registrationEnabled', value: 'true', description: t("Settings.tab_users"), type: 'boolean' },
            defaultUserRole: { key: 'defaultUserRole', value: 'user', description: t("Settings.profile_title"), type: 'select', options: [{value:'user',label:t("Members.role_user") || 'User'},{value:'librarian',label:t("Members.role_librarian") || 'Librarian'}] },
            maxBorrowBooks: { key: 'maxBorrowBooks', value: '3', description: t("Borrows.borrowed_books") || 'Borrowed Books', type: 'number' }
        },
        books: {
            autoGenerateBarcode: { key: 'autoGenerateBarcode', value: 'true', description: t("Settings.tab_books"), type: 'boolean' }
        },
        notifications: {
            emailNotifications: { key: 'emailNotifications', value: 'true', description: t("Settings.tab_notifications"), type: 'boolean' },
            overdueReminders: { key: 'overdueReminders', value: 'true', description: t("Borrows.status_overdue"), type: 'boolean' }
        },
        security: {
            sessionTimeout: { key: 'sessionTimeout', value: '480', description: t("Settings.tab_security"), type: 'number' }
        },
        libraryContent: {
            about: { key: 'about', title: 'حول المكتبة', value: '', description: t("Settings.tab_content"), type: 'libraryInfo' },
            vision: { key: 'vision', title: 'رؤيتنا', value: '', description: t("Settings.tab_content"), type: 'libraryInfo' },
            contact: { key: 'contact', title: 'اتصل بنا', value: '', description: t("Settings.contact_info"), type: 'libraryInfo' }
        }
    };

    const tabs = [
        // { id: 'profile', label: t("Settings.profile_title") || "الحساب", icon: <FaUser /> },
        { id: 'general', label: t("Settings.tab_general"), icon: <FaCog /> },
        { id: 'users', label: t("Settings.tab_users"), icon: <FaUsers /> },
        { id: 'books', label: t("Settings.tab_books"), icon: <FaBook /> },
        { id: 'notifications', label: t("Settings.tab_notifications"), icon: <FaBell /> },
        { id: 'libraryContent', label: t("Settings.tab_content"), icon: <FaFileAlt /> },
        { id: 'security', label: t("Settings.tab_security"), icon: <FaShieldAlt /> }
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (urlTab && urlTab !== activeTab) {
            setActiveTab(urlTab);
        }
    }, [urlTab]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/settings/${tabId}`);
    };

    const fetchSettings = async () => {
        try {
            context.setProgress(40);
            setLoading(true);

            // Fetch generic settings
            const response = await api.get('/admin/settings');
            const apiData = response.data.data || response.data.settings || [];
            const updatedSettings = JSON.parse(JSON.stringify(defaultSettings));

            if (Array.isArray(apiData)) {
                apiData.forEach(item => {
                    Object.keys(updatedSettings).forEach(category => {
                        if (updatedSettings[category][item.type]) {
                            updatedSettings[category][item.type].value = item.content;
                        }
                    });
                });
            }

            // Fetch profile data
            const userResponse = await api.get('/auth/profile');
            if (userResponse.data && userResponse.data.success) {
                const user = userResponse.data.data;
                setProfileData({
                    fullName: user.fullName || '',
                    email: user.email || '',
                    phoneNumber: user.phoneNumber || '',
                    username: user.username || '',
                    profileImage: user.profileImage,
                    previewImage: getImageUrl(user.profileImage)
                });
            }

            setSettings(updatedSettings);
            context.setProgress(100);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setSettings(defaultSettings);
            showError(t("Common.error"));
            context.setProgress(100);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            context.setProgress(40);
            setSaving(true);

            if (activeTab === 'profile') {
                const formData = new FormData();
                formData.append('fullName', profileData.fullName);
                formData.append('email', profileData.email);
                formData.append('phoneNumber', profileData.phoneNumber);
                if (profileData.file) {
                    formData.append('profileImage', profileData.file);
                }

                await api.put('/auth/update-profile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                const settingsData = {};
                Object.values(settings).forEach(category => {
                    Object.values(category).forEach(setting => {
                        if(setting.type === 'libraryInfo') {
                            settingsData[setting.key] = { title: setting.title, content: setting.value };
                        } else {
                            settingsData[setting.key] = setting.value;
                        }
                    });
                });
                await api.put('/admin/settings', settingsData);
            }

            showSuccess(t("Common.success"));
            fetchSettings();
            context.setProgress(100);
            setSaving(false);
        } catch (error) {
            showError(t("Common.error"));
            context.setProgress(100);
            setSaving(false);
        }
    };

    const handleReset = () => {
        fetchSettings();
        showSuccess(t("Common.success"));
    };

    const handleSettingChange = (category, key, value, field = 'value') => {
        setSettings(prev => ({
            ...prev,
            [category]: { ...prev[category], [key]: { ...prev[category][key], [field]: value } }
        }));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData(prev => ({
                ...prev,
                file: file,
                previewImage: URL.createObjectURL(file)
            }));
        }
    };

    const handleExportSettings = () => {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `library-settings.json`;
        link.click();
    };

    if (loading) {
        return (
            <div className="text-center py-5 mt-5">
                <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
                    <span className="visually-hidden">{t("Common.loading")}</span>
                </div>
                <h5 className="mt-4 fw-bold">{t("Settings.loading")}</h5>
            </div>
        );
    }

    const currentSettings = settings[activeTab] || {};

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <div>
                    <h5 className="mb-1 fw-bold"><FaCog className="me-2 text-primary" /> {t("Settings.title")}</h5>
                    <small className="text-muted opacity-75">{t("Sidebar.system_settings")}</small>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary shadow-sm" onClick={handleExportSettings} title={t("Settings.export")}><FaDownload /></button>
                    <button className="btn btn-outline-info shadow-sm" onClick={handleReset} title={t("Settings.reset")}><FaUndo /></button>
                    <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                        <FaSave /> {saving ? t("Settings.saving") : t("Common.save")}
                    </button>
                </div>
            </div>

            <div className="card shadow border-0 mb-4" style={{ background: "var(--bg-card)" }}>
                <div className="card-header bg-transparent border-bottom-0 pb-0 pt-3">
                    <ul className="nav nav-tabs border-bottom-0 gap-1 d-flex flex-nowrap overflow-auto hide-scrollbar " style={{ whiteSpace: 'nowrap' }}>
                        {tabs.map(tab => (
                            <li className="nav-item" key={tab.id}>
                                <button 
                                    className={`nav-link fw-bold transition-all border-0 rounded-top px-4 py-3 d-flex align-items-center gap-2 
                                        ${activeTab === tab.id ? 'active-tab shadow-sm' : ''}`}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <span className="opacity-75">{tab.icon}</span> {tab.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card-body p-4 pt-1">
                    <div className="row g-4 mt-2">
                        {activeTab === 'profile' ? (
                            <div className="col-12">
                                <div className="row g-4">
                                    {/* <div className="col-md-4 text-center">
                                        <div className="profile-image-section position-relative d-inline-block">
                                            <div className="rounded-circle overflow-hidden shadow mb-3 border border-4 border-primary bg-body" style={{ width: '180px', height: '180px' }}>
                                                {profileData.previewImage ? (
                                                    <img src={profileData.previewImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                                                ) : <div className="w-100 h-100 d-flex align-items-center justify-content-center text-primary fw-bold fs-1">{profileData.fullName?.charAt(0)}</div>}
                                            </div>
                                            <button className="btn btn-primary btn-sm rounded-circle position-absolute border-4 border-body shadow" style={{ bottom: '25px', right: '15px', width: '45px', height: '45px' }} onClick={() => fileInputRef.current.click()}>
                                                <FaCamera />
                                            </button>
                                            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleImageChange} />
                                            <h5 className="fw-bold mb-0">{profileData.fullName}</h5>
                                            <small className="text-muted opacity-75">@{profileData.username}</small>
                                        </div>
                                    </div> */}
                                    <div className="col-md-8">
                                        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--bg-body)', borderRadius: '15px' }}>
                                            <div className="row g-3">
                                                {/* <div className="col-md-6">
                                                    <label className="fw-bold mb-2 opacity-75 small">{t("Members.full_name")}</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-transparent border-2 border-end-0"><FaUser className="text-muted" /></span>
                                                        <input type="text" name="fullName" className="form-control form-control-lg bg-transparent border-2 border-start-0 shadow-none" value={profileData.fullName} onChange={handleProfileChange} />
                                                    </div>
                                                </div> */}
                                                {/* <div className="col-md-6">
                                                    <label className="fw-bold mb-2 opacity-75 small">{t("Auth.username")}</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-light border-2 border-end-0"><FaLock className="text-muted" /></span>
                                                        <input type="text" className="form-control form-control-lg bg-light border-2 border-start-0 shadow-none" value={profileData.username} disabled />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="fw-bold mb-2 opacity-75 small">{t("Auth.email")}</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-transparent border-2 border-end-0"><FaEnvelope className="text-muted" /></span>
                                                        <input type="email" name="email" className="form-control form-control-lg bg-transparent border-2 border-start-0 shadow-none" value={profileData.email} onChange={handleProfileChange} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="fw-bold mb-2 opacity-75 small">{t("Auth.phone")}</label>
                                                    <div className="input-group">
                                                        <span className="input-group-text bg-transparent border-2 border-end-0"><FaPhone className="text-muted" /></span>
                                                        <input type="text" name="phoneNumber" className="form-control form-control-lg bg-transparent border-2 border-start-0 shadow-none" value={profileData.phoneNumber} onChange={handleProfileChange} />
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            Object.entries(currentSettings).map(([key, setting]) => (
                                <div className="col-md-6" key={key}>
                                    <div className="card border-0 shadow-sm h-100 p-4 transition-all hover-shadow" style={{ background: "var(--bg-body)", borderRadius: '15px' }}>
                                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary opacity-75">
                                            {setting.description}
                                        </h6>
                                        
                                        <div className="setting-control mt-2">
                                            {setting.type === 'boolean' && (
                                                <div className="form-check form-switch custom-switch p-0 d-flex align-items-center gap-3">
                                                    <input className="form-check-input ms-0" style={{ width: '3em', height: '1.5em' }} type="checkbox" checked={setting.value === 'true'} onChange={e => handleSettingChange(activeTab, key, e.target.checked ? 'true' : 'false')} />
                                                    <label className="form-check-label fw-bold small">
                                                        {setting.value === 'true' ? t("Settings.enabled") : t("Settings.disabled")}
                                                    </label>
                                                </div>
                                            )}

                                            {setting.type === 'number' && (
                                                <input type="number" min="0" className="form-control form-control-lg bg-transparent border-2 shadow-none" value={setting.value} onChange={e => handleSettingChange(activeTab, key, e.target.value)} />
                                            )}

                                            {setting.type === 'text' && (
                                                <input type="text" className="form-control form-control-lg bg-transparent border-2 shadow-none" value={setting.value} onChange={e => handleSettingChange(activeTab, key, e.target.value)} />
                                            )}

                                            {setting.type === 'textarea' && (
                                                <textarea className="form-control bg-transparent border-2 shadow-none" rows="3" value={setting.value} onChange={e => handleSettingChange(activeTab, key, e.target.value)}></textarea>
                                            )}

                                            {setting.type === 'select' && (
                                                <select className="form-select form-select-lg bg-transparent border-2 shadow-none" value={setting.value} onChange={e => handleSettingChange(activeTab, key, e.target.value)}>
                                                    {setting.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </select>
                                            )}

                                            {setting.type === 'libraryInfo' && (
                                                <div className="mt-1">
                                                    <input type="text" className="form-control mb-3 bg-transparent border-2 shadow-none font-weight-bold" placeholder={t("Common.title") || "Title"} value={setting.title || ''} onChange={e => handleSettingChange(activeTab, key, e.target.value, 'title')} />
                                                    <textarea className="form-control bg-transparent border-2 shadow-none" rows="6" placeholder={t("News.content") || "Content"} value={setting.value || ''} onChange={e => handleSettingChange(activeTab, key, e.target.value, 'value')}></textarea>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
