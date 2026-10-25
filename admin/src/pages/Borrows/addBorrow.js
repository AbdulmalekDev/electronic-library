import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";
import api from '../../services/api';
// import borrowService from '../../services/borrowService';
import { FaArrowLeft, FaArrowRight, FaSave } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';

const AddBorrow = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();

    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    
    const [formData, setFormData] = useState({
        user: '',
        bookId: '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // context.setisHideSidebarAndHeader(false);
        fetchUsersAndBooks();
    }, []);

    const fetchUsersAndBooks = async () => {
        try {
            context.setProgress(40);
            const [usersRes, booksRes] = await Promise.all([
                api.get('/users', { params: { limit: 1000 } }),
                api.get('/books', { params: { limit: 1000 } })
            ]);
            
            setUsers(usersRes.data.data.users);
            setBooks(booksRes.data.data.books);
            
            context.setProgress(100);
        } catch (error) {
            console.error('Error fetching data:', error);
            showError(t("Borrows.fetch_error"));
            context.setProgress(100);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            context.setProgress(40);
            setLoading(true);
            
            await api.post('/borrows/admin', { 
                user: formData.user,
                bookId: formData.bookId, 
                dueDate: formData.dueDate 
            });

            showSuccess(t("Common.success"), true);
            setLoading(false);
            context.setProgress(100);
            navigate('/borrows');
        } catch (error) {
            console.error('Error adding borrow:', error);
            showError(error.response?.data?.message || t("Common.error"), true);
            setLoading(false);
            context.setProgress(100);
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0 fw-bold">{t("Borrows.add_title")}</h5>
                <button className="btn btn-secondary d-flex align-items-center gap-2 px-4 rounded-pill" onClick={() => navigate('/borrows')}>
                    {context.language === 'ar' ? <FaArrowLeft /> : <FaArrowRight />} {t("Common.cancel")}
                </button>
            </div>

            <div className="card shadow border-0 p-4" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 opacity-75">{t("Borrows.select_user")} <span className="text-danger">*</span></label>
                            <select className="form-select bg-body border-0 shadow-sm py-3" name="user" value={formData.user} onChange={handleChange} required>
                                <option value="" disabled>{t("Borrows.select_user_placeholder")}</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 opacity-75">{t("Borrows.select_book")} <span className="text-danger">*</span></label>
                            <select className="form-select bg-body border-0 shadow-sm py-3" name="bookId" value={formData.bookId} onChange={handleChange} required>
                                <option value="" disabled>{t("Borrows.select_book_placeholder")}</option>
                                {books.filter(b => b.availableCopies > 0).map(b => (
                                    <option key={b._id} value={b._id}>{b.title} - {t("Borrows.available_copies")}: {b.availableCopies}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 mb-4">
                            <label className="fw-bold mb-2 opacity-75">{t("Borrows.due_date")} <span className="text-danger">*</span></label>
                            <input type="date" className="form-control bg-body border-0 shadow-sm py-3" name="dueDate" value={formData.dueDate} onChange={handleChange} required />
                        </div>

                        <div className="col-md-12 d-flex justify-content-end gap-3 mt-4">
                            <button type="button" className="btn btn-outline-secondary px-5 rounded-pill" onClick={() => navigate('/borrows')} disabled={loading}>{t("Common.cancel")}</button>
                            <button type="submit" className="btn btn-primary px-5 d-flex align-items-center gap-2 rounded-pill shadow-sm" disabled={loading}>
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : <FaSave />}
                                <span>{loading ? t("Common.loading") : t("Borrows.confirm_borrow")}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBorrow;
