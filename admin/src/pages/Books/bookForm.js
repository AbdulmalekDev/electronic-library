import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MyContext } from "../../App";
import api from '../../services/api';
import { FaArrowRight, FaSave, FaImage } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from "react-i18next";
import { getImageUrl } from '../../services/imageUtils';

const BookForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const context = useContext(MyContext);
    const { t } = useTranslation();
    const { showSuccess, showError } = useNotification();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        publisher: '',
        referenceNumber: '',
        totalCopies: 1,
        category: 'أدب',
        description: '',
        publicationYear: new Date().getFullYear(),
        isbn: '',
        pages: 0,
        language: 'العربية',
        tags: '',
        coverImage: null,
        featured: false
    });

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const categories = [
        'أدب', 'تاريخ', 'علوم', 'تكنولوجيا', 'دين', 'فلسفة', 'سياسة', 'اقتصاد', 'طب', 'هندسة', 'فنون', 'شعر', 'قصص', 'الروايات', 'أخرى'
    ];

    const languages = ['العربية', 'الإنجليزية', 'فرنسية', 'ألمانية', 'إسبانية', 'أخرى'];

    useEffect(() => {
        // context.setisHideSidebarAndHeader(false);
        if (isEditMode) {
            fetchBookDetails();
        }
    }, [isEditMode, id]);

    const fetchBookDetails = async () => {
        try {
            context.setProgress(40);
            setLoading(true);
            const response = await api.get(`/books/${id}`);
            const book = response.data.data.book;
            setFormData({
                title: book.title || '',
                author: book.author || '',
                publisher: book.publisher || '',
                referenceNumber: book.referenceNumber || '',
                totalCopies: book.totalCopies || 1,
                category: book.category || 'أدب',
                description: book.description || '',
                publicationYear: book.publicationYear || book.publishedYear || new Date().getFullYear(),
                isbn: book.isbn || '',
                pages: book.pages || 0,
                language: book.language || 'العربية',
                tags: book.tags ? book.tags.join(', ') : '',
                coverImage: book.coverImage || null,
                featured: book.featured || false
            });
            if (book.coverImage) {
                setImagePreview(getImageUrl(book.coverImage));
            }
            setLoading(false);
            context.setProgress(100);
        } catch (error) {
            console.error('Error fetching book details:', error);
            showError(t("Common.error") || "خطأ في جلب بيانات الكتاب");
            setLoading(false);
            context.setProgress(100);
        }
    };

    const [pdfFile, setPdfFile] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, coverImage: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                showError('يرجى اختيار ملف بصيغة PDF صالحة');
                e.target.value = '';
                return;
            }
            setPdfFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            context.setProgress(40);
            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'coverImage' && formData[key] instanceof File) {
                    data.append('coverImage', formData[key]);
                } else if (key !== 'coverImage' && formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            if (pdfFile) {
                data.append('pdfFile', pdfFile);
            }

            if (isEditMode) {
                const res = await api.put(`/books/${id}`, data);
                showSuccess(res?.data?.message || t("Common.success") || 'تم تحديث بيانات الكتاب بنجاح');
            } else {
                const res = await api.post('/books', data);
                showSuccess(res?.data?.message || t("Common.success") || 'تم إضافة الكتاب بنجاح');
            }

            setLoading(false);
            context.setProgress(100);
            navigate('/books');
        } catch (error) {
            console.error('Error saving book:', error);
            const errMsg = error.response?.data?.message || error.message || t("Common.error") || 'خطأ أثناء الحفظ';
            showError(errMsg);
            setLoading(false);
            context.setProgress(100);
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0">{isEditMode ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}</h5>
                <button className="btn btn-secondary pe-3 ps-3" onClick={() => navigate('/books')}>
                    <FaArrowRight className="ms-2" /> رجوع
                </button>
            </div>

            <div className="card shadow border-0 p-4">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-12 text-center mb-4">
                            <div className="d-inline-block position-relative border rounded p-2" style={{ width: '150px', height: '200px', backgroundColor: '#f8f9fa' }}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-100 h-100 object-fit-cover rounded" />
                                ) : (
                                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                        <FaImage size={40} />
                                    </div>
                                )}
                                <label className="btn btn-primary btn-sm position-absolute bottom-0 start-50 translate-middle-x mb-2" style={{ cursor: 'pointer' }}>
                                    اختر صورة
                                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        <div className="col-md-12 mb-3">
                            <label className="fw-bold mb-2">عنوان الكتاب *</label>
                            <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">المؤلف *</label>
                            <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} required />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">الناشر</label>
                            <input type="text" className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">الرقم المرجعي *</label>
                            <input type="text" className="form-control" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} required />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">ISBN</label>
                            <input type="text" className="form-control" name="isbn" value={formData.isbn} onChange={handleChange} />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">التصنيف *</label>
                            <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">عدد النسخ الإجمالي *</label>
                            <input type="number" className="form-control" name="totalCopies" value={formData.totalCopies} min="1" onChange={handleChange} required />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">سنة النشر</label>
                            <input type="number" className="form-control" name="publicationYear" value={formData.publicationYear} max={new Date().getFullYear()} onChange={handleChange} />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">عدد الصفحات</label>
                            <input type="number" className="form-control" name="pages" value={formData.pages} min="0" onChange={handleChange} />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">اللغة</label>
                            <select className="form-select" name="language" value={formData.language} onChange={handleChange}>
                                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="fw-bold mb-2">الكلمات المفتاحية (مفصولة بفاصلة)</label>
                            <input type="text" className="form-control" name="tags" value={formData.tags} placeholder="مثال: علمي، خيال" onChange={handleChange} />
                        </div>

                        <div className="col-md-12 mb-3">
                            <label className="fw-bold mb-2">ملف الكتاب الرقمي (PDF)</label>
                            <input
                                type="file"
                                className="form-control"
                                accept=".pdf,application/pdf"
                                onChange={handlePdfChange}
                            />
                            {pdfFile && (
                                <small className="text-success mt-1 d-block">
                                    تم اختيار: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </small>
                            )}
                            <small className="text-muted mt-1 d-block">اختياري - مخصص للقراءة والاستعارة الإلكترونية المحمية.</small>
                        </div>

                        <div className="col-md-12 mb-3">
                            <label className="fw-bold mb-2">وصف الكتاب</label>
                            <textarea className="form-control" name="description" rows="4" value={formData.description} onChange={handleChange}></textarea>
                        </div>

                        <div className="col-md-12 mb-4">
                            <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" name="featured" id="featuredCheck" checked={formData.featured} onChange={handleChange} />
                                <label className="form-check-label ms-2" htmlFor="featuredCheck">
                                    أضف الكتاب إلى القائمة المميزة (المفضلات)
                                </label>
                            </div>
                        </div>

                        <div className="col-md-12 d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/books')} disabled={loading}>إلغاء</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <FaSave className="ms-2" /> {loading ? 'جاري الحفظ...' : 'حفظ الكتاب'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookForm;
