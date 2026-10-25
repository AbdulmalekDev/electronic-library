import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MyContext } from "../../App";
import api from '../../services/api';
import { FaArrowRight, FaSave, FaUserCircle, FaImage, FaLock, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { getImageUrl } from '../../services/imageUtils';

const UserForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();
    const { setProgress, language } = context;
    const isEditMode = useMemo(() => !!id, [id]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        phone: '',
        role: 'user',
        password: '',
        confirmPassword: '',
        profileImage: null
    });

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const fetchUserData = useCallback(async () => {
        try {
            if (setProgress) setProgress(40);
            setLoading(true);
            const isProfile = id === 'profile';
            const endpoint = isProfile ? '/auth/me' : `/users/${id}`;
            const response = await api.get(endpoint);
            
            const user = isProfile ? (response.data.data.user || response.data.data) : response.data.data;
            
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                username: user.username || '',
                phone: user.phone || '',
                role: user.role || 'user',
                password: '',
                confirmPassword: '',
            });
            if (user.profileImage) {
                setImagePreview(getImageUrl(user.profileImage));
            }
            setLoading(false);
            if (setProgress) setProgress(100);
        } catch (error) {
            console.error('Error fetching user data:', error);
            showError(t("Common.error"));
            setLoading(false);
            if (setProgress) setProgress(100);
        }
    }, [id, setProgress, showError, t]);

    useEffect(() => {
        if (isEditMode) {
            fetchUserData();
        }
    }, [isEditMode, fetchUserData]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profileImage: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        if (!isEditMode && formData.password !== formData.confirmPassword) {
            showError(t("SignUpPage.passwordNotMatch"));
            return;
        }

        try {
            if (setProgress) setProgress(40);
            setLoading(true);
            const data = new FormData();

            data.append('fullName', formData.fullName);
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('role', formData.role);
            data.append('phone', formData.phone);

            if (formData.password) data.append('password', formData.password);
            if (formData.profileImage instanceof File) data.append('profileImage', formData.profileImage);

            if (isEditMode) {
                const endpoint = id === 'profile' ? '/auth/update-profile' : `/users/${id}`;
                await api.put(endpoint, data);
                showSuccess("تم تعديل بيانات المستخدم بنجاح");
            } else {
                await api.post('/users', data);
                showSuccess("تم إضافة المستخدم بنجاح");
            }

            setLoading(false);
            if (setProgress) setProgress(100);
            navigate('/users');
        } catch (error) {
            console.error('Error saving user:', error);
            showError(error.response?.data?.message || t("Common.error"));
            setLoading(false);
            if (setProgress) setProgress(100);
        }
    }, [isEditMode, formData, id, setProgress, showError, showSuccess, navigate, t]);

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0 fw-bold">{isEditMode ? t("Members.edit_member") : t("Members.add_member")}</h5>
                <button className="btn btn-secondary pe-3 ps-3 shadow-sm" onClick={() => navigate('/users')}>
                    <FaArrowRight className={context.language === 'ar' ? 'ms-2' : 'me-2 rotate-180'} /> {t("Common.cancel")}
                </button>
            </div>

            <div className="card shadow border-0 p-4" style={{ background: "var(--bg-card)" }}>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-12 text-center mb-5">
                            <div className="d-inline-block position-relative rounded-circle p-2 border shadow-sm" style={{ width: '140px', height: '140px', backgroundColor: 'var(--bg-body)' }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-100 h-100 rounded-circle object-fit-cover" />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted rounded-circle bg-light">
                                        <FaUserCircle size={90} className="text-primary opacity-25" />
                                    </div>
                                )}
                                <label className="btn btn-primary btn-sm rounded-circle position-absolute border-white border-2" style={{ cursor: 'pointer', padding: '8px', bottom: '5px', right: '5px' }}>
                                    <FaImage />
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <p className="text-muted small mt-2">{t("Common.media")}</p>
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaUser className="text-primary small" /> {t("Members.name")} *
                            </label>
                            <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder={t("Members.name")} />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaUserCircle size={14} className="text-primary" /> {t("SignUpPage.enterYourName")} *
                            </label>
                            <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required disabled={isEditMode} placeholder="@username" />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaEnvelope size={14} className="text-primary" /> {t("Members.email")} *
                            </label>
                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required placeholder="example@mail.com" />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaPhone size={14} className="text-primary" /> {t("Members.phone")}
                            </label>
                            <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="+201..." />
                        </div>

                        <div className="col-md-12 mb-4">
                            <label className="fw-bold mb-2">{t("Members.role")}</label>
                            <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                                <option value="user">{t("Members.role_user") || 'User'}</option>
                                <option value="librarian">{t("Members.role_librarian") || 'Librarian'}</option>
                                <option value="admin">{t("Members.role_admin") || 'Admin'}</option>
                            </select>
                        </div>

                        {!isEditMode && (
                            <>
                                <div className="col-md-6 mb-4">
                                    <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                        <FaLock size={14} className="text-primary" /> {t("SignUpPage.enterYourPassword")} *
                                    </label>
                                    <input type="password" title={t("SignUpPage.enterYourPassword")} className="form-control" name="password" value={formData.password} onChange={handleChange} required />
                                </div>

                                <div className="col-md-6 mb-4">
                                    <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                        <FaLock size={14} className="text-primary" /> {t("SignUpPage.confirmYourPassword")} *
                                    </label>
                                    <input type="password" title={t("SignUpPage.confirmYourPassword")} className="form-control" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                                </div>
                            </>
                        )}

                        <div className="col-md-12 d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-secondary px-4 shadow-sm" onClick={() => navigate('/users')} disabled={loading}>
                                {t("Common.cancel")}
                            </button>
                            <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={loading}>
                                <FaSave className={context.language === 'ar' ? 'ms-2' : 'me-2'} /> 
                                {loading ? t("Common.loading") : t("Common.save")}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default React.memo(UserForm);
