import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MyContext } from "../../App";
import { createNews, updateNews, getNewsById } from '../../services/api';
import { FaArrowRight, FaSave, FaImage, FaHeading, FaAlignLeft, FaTags, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { getImageUrl } from '../../services/imageUtils';

const NewsForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        summary: '',
        category: 'general',
        priority: 'normal',
        isPublished: false,
        expireDate: '',
        tags: '',
        image: null
    });

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const categories = [
        { value: 'announcement', label: t("News.cat_announcement") || 'Announcement' },
        { value: 'event', label: t("News.cat_event") || 'Event' },
        { value: 'new_books', label: t("News.cat_new_books") || 'New Books' },
        { value: 'maintenance', label: t("News.cat_maintenance") || 'Maintenance' },
        { value: 'policy', label: t("News.cat_policy") || 'Policy' },
        { value: 'general', label: t("News.cat_general") || 'General' }
    ];

    const priorities = [
        { value: 'low', label: t("News.priority_low") || 'Low' },
        { value: 'normal', label: t("News.priority_normal") || 'Normal' },
        { value: 'high', label: t("News.priority_high") || 'High' },
        { value: 'urgent', label: t("News.priority_urgent") || 'Urgent' }
    ];

    useEffect(() => {
        // context.setisHideSidebarAndHeader(false);
        if (isEditMode) {
            fetchNewsData();
        }
    }, [isEditMode, id]);

    const fetchNewsData = async () => {
        try {
            context.setProgress(40);
            setLoading(true);
            const response = await getNewsById(id);
            const news = response.data.data;
            setFormData({
                title: news.title || '',
                content: news.content || '',
                summary: news.summary || '',
                category: news.category || 'general',
                priority: news.priority || 'normal',
                isPublished: news.isPublished || false,
                expireDate: news.expireDate ? new Date(news.expireDate).toISOString().split('T')[0] : '',
                tags: news.tags ? news.tags.join(', ') : '',
                image: news.image || null
            });
            if (news.image) {
                setImagePreview(getImageUrl(news.image));
            }
            context.setProgress(100);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news data:', error);
            showError(t("Common.error"));
            setLoading(false);
            context.setProgress(100);
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            context.setProgress(40);
            setLoading(true);
            const data = new FormData();

            Object.keys(formData).forEach(key => {
                if (key === 'image' && formData[key] instanceof File) {
                    data.append('image', formData[key]);
                } else if (key !== 'image') {
                    data.append(key, formData[key]);
                }
            });

            if (isEditMode) {
                await updateNews(id, data);
                showSuccess(t("Common.updated_successfully") || 'تم تعديل الخبر بنجاح');
            } else {
                await createNews(data);
                showSuccess(t("Common.added_successfully") || 'تم إضافة الخبر بنجاح');
            }

            context.setProgress(100);
            setLoading(false);
            navigate('/news');
        } catch (error) {
            console.error('Error saving news:', error);
            showError(error.response?.data?.message || t("Common.error"));
            setLoading(false);
            context.setProgress(100);
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0 fw-bold">{isEditMode ? t("News.edit_news") : t("News.add_news")}</h5>
                <button className="btn btn-secondary pe-3 ps-3 shadow-sm" onClick={() => navigate('/news')}>
                    <FaArrowRight className={context.language === 'ar' ? 'ms-2' : 'me-2 rotate-180'} /> {t("Common.cancel")}
                </button>
            </div>

            <div className="card shadow border-0 p-5" style={{ background: "var(--bg-card)" }}>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-12 text-center mb-5">
                            <div className="d-inline-block position-relative border-dashed rounded-3 p-3 text-center transition-all bg-body-tertiary"
                                style={{ width: '100%', maxWidth: '500px', minHeight: '250px', cursor: 'pointer' }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: '220px' }} />
                                ) : (
                                    <div className="py-5 text-muted opacity-50">
                                        <FaImage size={64} className="mb-3" />
                                        <p className="mb-0 fw-bold">{t("Common.media")}</p>
                                    </div>
                                )}
                                <label className="btn btn-primary d-flex align-items-center gap-2 position-absolute bottom-0 start-50 translate-middle-x mb-3 shadow">
                                    <FaImage /> {t("Common.media")}
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        <div className="col-md-12 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaHeading className="text-primary small" /> {t("News.news_title")} *
                            </label>
                            <input type="text" className="form-control form-control-lg" name="title" value={formData.title} onChange={handleChange} required placeholder={t("News.news_title")} />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2">{t("Common.category")}</label>
                            <select className="form-select" name="category" value={formData.category} onChange={handleChange}>
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2">{t("News.priority")}</label>
                            <select className="form-select" name="priority" value={formData.priority} onChange={handleChange}>
                                {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                        </div>

                        <div className="col-md-12 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaAlignLeft className="text-primary small" /> {t("News.summary")}
                            </label>
                            <textarea className="form-control" name="summary" rows="3" value={formData.summary} onChange={handleChange} placeholder={t("News.summary")}></textarea>
                        </div>

                        <div className="col-md-12 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaAlignLeft className="text-primary small" /> {t("News.content")} *
                            </label>
                            <textarea className="form-control" name="content" rows="10" value={formData.content} onChange={handleChange} required placeholder={t("News.content")}></textarea>
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaTags className="text-primary small" /> {t("Common.tags")}
                            </label>
                            <input type="text" className="form-control" name="tags" placeholder="tag1, tag2..." value={formData.tags} onChange={handleChange} />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 d-flex align-items-center gap-2">
                                <FaCalendarAlt className="text-primary small" /> {t("News.status_expired")}
                            </label>
                            <input type="date" className="form-control" name="expireDate" value={formData.expireDate} onChange={handleChange} />
                        </div>

                        <div className="col-md-12 mb-5">
                            <div className="form-check form-switch custom-switch p-0 d-flex align-items-center gap-4 border rounded p-3">
                                <label className="form-check-label fw-bold mb-0 cursor-pointer" htmlFor="publishCheck">
                                    {t("News.status_published")}
                                </label>
                                <input className="form-check-input ms-0" style={{ width: '3em', height: '1.5em' }} type="checkbox" name="isPublished" id="publishCheck" checked={formData.isPublished} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="col-md-12 d-flex justify-content-end gap-3 pt-4 border-top">
                            <button type="button" className="btn btn-secondary px-5 py-2 shadow-sm" onClick={() => navigate('/news')} disabled={loading}>
                                {t("Common.cancel")}
                            </button>
                            <button type="submit" className="btn btn-primary px-5 py-2 shadow-sm d-flex align-items-center gap-2" disabled={loading}>
                                <FaSave /> {loading ? t("Common.loading") : t("Common.save")}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewsForm;
