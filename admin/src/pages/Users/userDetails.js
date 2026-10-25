import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";
import api from '../../services/api';
import { FaArrowRight, FaUserAlt, FaEnvelope, FaPhone, FaCalendarAlt, FaBook, FaEdit } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { getImageUrl } from '../../services/imageUtils';
import { useNotification } from '../../contexts/NotificationContext';

const UserDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useContext(MyContext);
    const { showError } = useNotification();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // context.setisHideSidebarAndHeader(false);
        fetchUserDetails();
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            context.setProgress(40);
            setLoading(true);
            const response = await api.get(`/users/${id}`);
            setUser(response.data.data);
            setLoading(false);
            context.setProgress(100);
        } catch (error) {
            console.error('Error fetching user details:', error);
            showError(t("Common.error"));
            setLoading(false);
            context.setProgress(100);
        }
    };

    if (loading) return null;
    if (!user) return <div className="text-center mt-5 text-muted"><h5>{t("Common.no_data")}</h5></div>;

    const getRoleInfo = (role) => {
        if (role === 'admin') return { label: t("Members.role_admin") || 'Admin', class: 'bg-danger' };
        if (role === 'librarian') return { label: t("Members.role_librarian") || 'Librarian', class: 'bg-primary' };
        return { label: t("Members.role_user") || 'User', class: 'bg-secondary' };
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString(context.language === 'ar' ? 'ar-EG' : 'en-US');
    };

    const roleInfo = getRoleInfo(user.role);

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0">{t("Members.member_details")}</h5>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => navigate(`/admin/users/${id}/edit`)}>
                        <FaEdit /> {t("Common.edit")}
                    </button>
                    <button className="btn btn-secondary d-flex align-items-center gap-2 shadow-sm" onClick={() => navigate('/users')}>
                        <FaArrowRight className={context.language === 'ar' ? 'ms-2' : 'me-2 rotate-180'} /> {t("Common.cancel")}
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card shadow border-0 p-4 text-center h-100" style={{ background: "var(--bg-card)" }}>
                        <div className="avatar mx-auto mb-4 border shadow-sm" style={{ width: '130px', height: '130px', backgroundColor: 'var(--bg-body)', borderRadius: '50%', overflow: 'hidden' }}>
                            {user.profileImage ? (
                                <img src={getImageUrl(user.profileImage)} alt="Profile" className="w-100 h-100 object-fit-cover" />
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-primary opacity-50">
                                    <FaUserAlt size={60} />
                                </div>
                            )}
                        </div>
                        <h4 className="fw-bold mb-1">{user.fullName}</h4>
                        <p className="text-muted mb-3 small">@{user.username}</p>
                        <span className={`badge ${roleInfo.class} px-4 py-2 rounded-pill shadow-sm`}>
                            {roleInfo.label}
                        </span>
                    </div>
                </div>

                <div className="col-md-8 mb-4">
                    <div className="card shadow border-0 p-4 h-100" style={{ background: "var(--bg-card)" }}>
                        <h5 className="border-bottom pb-3 fw-bold mb-4 d-flex align-items-center gap-2">
                            <span className="bg-primary p-1 rounded-3"></span> {t("Common.basic_info")}
                        </h5>
                        <ul className="list-group list-group-flush mb-4 transparent-list">
                            <li className="list-group-item d-flex align-items-center px-0 py-3 bg-transparent border-bottom">
                                <FaEnvelope className="text-primary opacity-50 me-3 ms-3" size={22} />
                                <div>
                                    <small className="text-muted d-block">{t("Members.email")}</small>
                                    <span className="fw-bold">{user.email}</span>
                                </div>
                            </li>
                            <li className="list-group-item d-flex align-items-center px-0 py-3 bg-transparent border-bottom">
                                <FaPhone className="text-primary opacity-50 me-3 ms-3" size={22} />
                                <div>
                                    <small className="text-muted d-block">{t("Members.phone")}</small>
                                    <span className="fw-bold">{user.phone || '-'}</span>
                                </div>
                            </li>
                            <li className="list-group-item d-flex align-items-center px-0 py-3 bg-transparent border-bottom">
                                <FaCalendarAlt className="text-primary opacity-50 me-3 ms-3" size={22} />
                                <div>
                                    <small className="text-muted d-block">{t("Common.date")}</small>
                                    <span className="fw-bold">{formatDate(user.createdAt)}</span>
                                </div>
                            </li>
                        </ul>

                        <h5 className="border-bottom pb-3 fw-bold mt-2 mb-4 d-flex align-items-center gap-2">
                             <span className="bg-success p-1 rounded-3"></span> {t("Borrows.currently_borrowed")}
                        </h5>
                        <div className="borrow-activity">
                            {user.borrows && user.borrows.length > 0 ? (
                                <ul className="list-group list-group-flush transparent-list">
                                    {user.borrows.map((borrow) => (
                                        <li key={borrow._id || borrow.id} className="list-group-item d-flex align-items-center px-0 py-3 bg-transparent border-bottom">
                                            <FaBook className="text-primary opacity-50 me-3 ms-3" size={22} />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1 fw-bold">{borrow.book?.title || borrow.bookTitle}</h6>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">{formatDate(borrow.borrowDate || borrow.date)}</small>
                                                    <span className={`badge ${borrow.status === 'returned' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'} border px-3`}>
                                                        {borrow.status === 'returned' ? t("Borrows.status_returned") : t("Borrows.status_borrowed")}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4 text-muted border rounded bg-body-tertiary">
                                    {t("Common.no_data")}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
