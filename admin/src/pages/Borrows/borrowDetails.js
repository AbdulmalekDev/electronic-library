import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";
import api from '../../services/api';
import borrowService from '../../services/borrowService';
import { FaArrowLeft, FaArrowRight, FaBookOpen, FaUserCircle, FaCalendarCheck, FaCalendarTimes, FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';

const BorrowDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();

    const [borrow, setBorrow] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // context.setisHideSidebarAndHeader(false);
        fetchBorrowDetails();
    }, [id]);

    const fetchBorrowDetails = async () => {
        try {
            context.setProgress(40);
            setLoading(true);
            
            const response = await api.get(`/borrows/${id}`);
            setBorrow(response.data.data);
            
            setLoading(false);
            context.setProgress(100);
        } catch (error) {
            console.error('Error fetching borrow details:', error);
            showError(t("Borrows.load_details_error"));
            setLoading(false);
            context.setProgress(100);
        }
    };

    const handleReturn = async () => {
        try {
            context.setProgress(40);
            const response = await borrowService.returnBook(borrow._id);
            if (response && response.data.success) {
                setBorrow(response.data.data);
                showSuccess(t("Borrows.return_success"));
            }
            context.setProgress(100);
        } catch(error) {
            showError(t("Borrows.return_error"));
            context.setProgress(100);
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString(context.language === 'ar' ? 'ar-EG' : 'en-US');
    };

    if (loading) return null;
    if (!borrow) return <div className="text-center mt-5"><h5>{t("Common.no_data")}</h5></div>;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: t("Borrows.status_pending"), class: 'badge bg-warning text-dark' };
            case 'borrowed': return { label: t("Borrows.status_borrowed"), class: 'badge bg-primary' };
            case 'returned': return { label: t("Borrows.status_returned"), class: 'badge bg-success' };
            case 'overdue': return { label: t("Borrows.status_overdue"), class: 'badge bg-danger' };
            case 'rejected': return { label: t("Borrows.status_rejected"), class: 'badge bg-danger' };
            default: return { label: status, class: 'badge bg-secondary' };
        }
    };

    const statusObj = getStatusInfo(borrow.status);

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0 fw-bold">{t("Borrows.details_title")}</h5>
                <div className="d-flex gap-2">
                    {borrow.status === 'borrowed' && (
                        <button className="btn btn-outline-primary rounded-pill px-4" onClick={handleReturn}>{t("Common.return")}</button>
                    )}
                    <button className="btn btn-secondary d-flex align-items-center gap-2 px-4 rounded-pill" onClick={() => navigate('/borrows')}>
                        {context.language === 'ar' ? <FaArrowLeft /> : <FaArrowRight />} {t("Common.cancel")}
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card shadow border-0 p-4 h-100" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
                        <h5 className="border-bottom pb-3 fw-bold d-flex align-items-center gap-2 text-primary opacity-75">
                            <FaUserCircle /> {t("Borrows.user_data")}
                        </h5>
                        <div className="mt-3">
                            <h6 className="fw-bold fs-5">{borrow.user?.fullName || t("Borrows.unknown_user")}</h6>
                            <p className="text-muted mb-2">{borrow.user?.email}</p>
                            <div className="p-2 bg-body rounded shadow-sm d-inline-block small">
                                <span className="text-muted">{t("Members.phone")}: </span>
                                <span className="fw-bold">{borrow.user?.phone || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card shadow border-0 p-4 h-100" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
                        <h5 className="border-bottom pb-3 fw-bold d-flex align-items-center gap-2 text-primary opacity-75">
                            <FaBookOpen /> {t("Borrows.book_data")}
                        </h5>
                        <div className="mt-3">
                            <h6 className="fw-bold fs-5 text-primary">{borrow.book?.title || t("Borrows.unknown_book")}</h6>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                <span className="badge bg-light text-dark border p-2 fw-normal">
                                    <span className="text-muted">{t("Borrows.reference_number")}: </span>
                                    {borrow.book?.referenceNumber || '-'}
                                </span>
                                <span className="badge bg-soft-primary text-primary border border-primary border-opacity-25 p-2 fw-normal">
                                    <span className="text-muted">{t("Borrows.category")}: </span>
                                    {borrow.book?.category}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-12 mb-4">
                    <div className="card shadow border-0 p-4" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
                        <h5 className="border-bottom pb-3 fw-bold d-flex align-items-center gap-2 text-primary opacity-75">
                            <FaInfoCircle /> {t("Borrows.order_details_status")}
                        </h5>
                        <div className="row mt-3">
                            <div className="col-md-3 mb-4">
                                <label className="d-block text-muted small mb-1">{t("Common.status")}</label>
                                <span className={statusObj.class + " fs-6 px-3 py-2 rounded-pill"}>{statusObj.label}</span>
                            </div>

                            <div className="col-md-3 mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-light rounded-circle text-muted">
                                        <FaCalendarCheck size={20} />
                                    </div>
                                    <div>
                                        <label className="d-block text-muted small mb-0">{borrow.borrowDate ? t("Borrows.borrow_date") : t("Borrows.request_date")}</label>
                                        <span className="fw-bold">{formatDate(borrow.borrowDate || borrow.requestDate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3 mb-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-light rounded-circle text-muted">
                                        <FaCalendarTimes size={20} />
                                    </div>
                                    <div>
                                        <label className="d-block text-muted small mb-0">{t("Borrows.due_date")}</label>
                                        <span className="fw-bold text-danger">{formatDate(borrow.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-3 mb-4">
                                <label className="d-block text-muted small mb-1">{t("Borrows.return_date")}</label>
                                <span className="fw-bold">{formatDate(borrow.returnDate)}</span>
                            </div>
                        </div>

                        {borrow.notes && (
                            <div className="mt-3 bg-body p-4 rounded-3 border-start border-primary border-4 shadow-sm">
                                <h6 className="fw-bold text-primary opacity-75 mb-2">{t("Borrows.admin_notes")}:</h6>
                                <p className="mb-0 fs-6">{borrow.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BorrowDetails;
