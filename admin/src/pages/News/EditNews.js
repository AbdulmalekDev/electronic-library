import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    Select,
    MenuItem,
    CircularProgress,
    Breadcrumbs,
    Link,
    IconButton,
    Grid,
    Card,
    CardContent,
    Stack,
    Switch,
    Tooltip
} from '@mui/material';
import {
    Save,
    ArrowBack,
    CloudUpload,
    Delete,
    Newspaper,
    Title,
    Description,
    Category,
    PriorityHigh,
    Event,
    Publish,
    Info
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import { MyContext } from '../../App';
import { getNewsById, updateNews } from '../../services/api';
import { getImageUrl } from '../../services/imageUtils';

const EditNews = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotification();
    const { setProgress, language } = useContext(MyContext);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        summary: '',
        category: 'general',
        priority: 'normal',
        isPublished: false,
        expireDate: '',
        tags: ''
    });

    const categories = useMemo(() => [
        { value: 'announcement', label: t('adminNews.filters.announcement') },
        { value: 'event', label: t('adminNews.filters.event') },
        { value: 'new_books', label: t('adminNews.filters.new_books') },
        { value: 'maintenance', label: t('adminNews.filters.maintenance') },
        { value: 'policy', label: t('adminNews.filters.policy') },
        { value: 'general', label: t('adminNews.filters.general') }
    ], [t]);

    const priorities = useMemo(() => [
        { value: 'low', label: t('adminNews.priorities.low') },
        { value: 'normal', label: t('adminNews.priorities.normal') },
        { value: 'high', label: t('adminNews.priorities.high') },
        { value: 'urgent', label: t('adminNews.priorities.urgent') }
    ], [t]);

    const fetchNewsData = useCallback(async () => {
        try {
            setLoading(true);
            if (setProgress) setProgress(30);
            const response = await getNewsById(id);
            if (response.data && response.data.success) {
                const news = response.data.data;
                setFormData({
                    title: news.title || '',
                    content: news.content || '',
                    summary: news.summary || '',
                    category: news.category || 'general',
                    priority: news.priority || 'normal',
                    isPublished: news.isPublished || false,
                    expireDate: news.expireDate ? new Date(news.expireDate).toISOString().split('T')[0] : '',
                    tags: news.tags ? news.tags.join(', ') : ''
                });

                if (news.image) {
                    setImagePreview(getImageUrl(news.image));
                }
            }
            if (setProgress) setProgress(100);
        } catch (error) {
            console.error('Error fetching news:', error);
            showError(t('adminNews.messages.fetchError'));
            navigate('/news');
        } finally {
            setLoading(false);
        }
    }, [id, setProgress, showError, t, navigate]);

    useEffect(() => {
        fetchNewsData();
        window.scrollTo(0, 0);
    }, [fetchNewsData]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    }, []);

    const removeImage = useCallback(() => {
        setImageFile(null);
        setImagePreview(null);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            showError("يرجى ملء الحقول المطلوبة (العنوان والمحتوى)");
            return;
        }

        try {
            setSubmitting(true);
            if (setProgress) setProgress(30);

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            if (imageFile) {
                data.append('image', imageFile);
            }

            const response = await updateNews(id, data);
            if (response.data && response.data.success) {
                showSuccess(t('adminNews.messages.publishSuccess') || "تم تحديث الخبر بنجاح");
                if (setProgress) setProgress(100);
                setTimeout(() => navigate('/news'), 1000);
            }
        } catch (error) {
            console.error('Error updating news:', error);
            showError(error.response?.data?.message || t('Common.error'));
        } finally {
            setSubmitting(false);
            if (setProgress) setProgress(100);
        }
    }, [id, formData, imageFile, setProgress, showError, showSuccess, t, navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress thickness={4} size={50} />
            </Box>
        );
    }

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0 fw-bold">{t("News.edit_news")}</h5>
                <button className="btn btn-secondary pe-3 ps-3 shadow-sm" onClick={() => navigate('/news')}>
                    <ArrowBack className={language === 'ar' ? 'ms-2' : 'me-2'} />
                    {t("Common.cancel")}
                </button>
            </div>

            <div className="card shadow border-0 p-5" style={{ background: "var(--bg-card)" }}>
                <form onSubmit={handleSubmit}>
                    <div className="row">

                        {/* Image Upload */}
                        <div className="col-md-12 text-center mb-5">
                            <div
                                className="d-inline-block position-relative border-dashed rounded-3 p-3 text-center bg-body-tertiary"
                                style={{ width: '100%', maxWidth: '500px', minHeight: '250px' }}
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="img-fluid rounded shadow-sm"
                                        style={{ maxHeight: '220px' }}
                                    />
                                ) : (
                                    <div className="py-5 text-muted opacity-50">
                                        <CloudUpload style={{ fontSize: 64 }} />
                                        <p className="mb-0 fw-bold">{t("Common.media")}</p>
                                    </div>
                                )}

                                <label className="btn btn-primary d-flex align-items-center gap-2 position-absolute bottom-0 start-50 translate-middle-x mb-3 shadow">
                                    <CloudUpload /> {t("Common.upload_image")}
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="col-md-12 mb-4">
                            <label className="fw-bold mb-2">{t("News.news_title")} *</label>
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Category */}
                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2">{t("Common.category")}</label>
                            <select
                                className="form-select"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {categories.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2">{t("News.priority")}</label>
                            <select
                                className="form-select"
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                            >
                                {priorities.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Summary */}
                        <div className="col-md-12 mb-4">
                            <label className="fw-bold mb-2">{t("News.summary")}</label>
                            <textarea
                                className="form-control"
                                name="summary"
                                rows="3"
                                value={formData.summary}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        {/* Content */}
                        <div className="col-md-12 mb-4">
                            <label className="fw-bold mb-2">{t("News.content")} *</label>
                            <textarea
                                className="form-control"
                                name="content"
                                rows="10"
                                value={formData.content}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        {/* Tags */}
                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2">{t("Common.tags")}</label>
                            <input
                                type="text"
                                className="form-control"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Expire Date */}
                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2">{t("News.status_expired")}</label>
                            <input
                                type="date"
                                className="form-control"
                                name="expireDate"
                                value={formData.expireDate}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Publish */}
                        <div className="col-md-12 mb-5">
                            <div className="form-check form-switch d-flex align-items-center gap-3 border rounded p-3">
                                <label className="fw-bold mb-0">
                                    {t("News.status_published")}
                                </label>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            isPublished: e.target.checked
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="col-md-12 d-flex justify-content-end gap-3 pt-4 border-top">
                            <button
                                type="button"
                                className="btn btn-secondary px-5"
                                onClick={() => navigate('/news')}
                            >
                                {t("Common.cancel")}
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary px-5 d-flex align-items-center gap-2"
                                disabled={submitting}
                            >
                                <Save />
                                {submitting ? t("Common.loading") : t("Common.save")}
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default React.memo(EditNews);
