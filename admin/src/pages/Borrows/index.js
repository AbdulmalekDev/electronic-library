// src/pages/Borrows/index.js
import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from "../../App";
import { FaCheckCircle, FaTimesCircle, FaSyncAlt, FaSearch, FaEraser, FaUser, FaBook, FaCalendarAlt, FaClock } from 'react-icons/fa';
import borrowService from '../../services/borrowService';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { getImageUrl } from '../../services/imageUtils';
import { Tooltip, IconButton, Pagination } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBorrows, fetchBorrowStats, updateBorrowAction } from '../../store/slices/borrowsSlice';
import { useCallback, useMemo } from 'react';

const Borrows = () => {
    const dispatch = useDispatch();
    const { items: borrows, stats, pagination, loading, error } = useSelector((state) => state.borrows);
    const { t } = useTranslation();
    const context = useContext(MyContext);
    const { showSuccess, showError, showInfo } = useNotification();
    const { setProgress } = context;

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const totalPages = pagination?.pages || 1;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

    const loadData = useCallback(() => {
        if (setProgress) setProgress(40);
        const params = {
            page,
            limit: 10,
            search: debouncedSearch.trim() || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined
        };

        dispatch(fetchBorrows(params)).finally(() => {
            if (setProgress) setProgress(100);
        });
        dispatch(fetchBorrowStats());
    }, [dispatch, page, debouncedSearch, statusFilter, setProgress]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAction = useCallback(async (borrow, type) => {
        try {
            if (setProgress) setProgress(40);
            let options = {};

            if (type === 'approve') {
                options = {
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    canRead: true,
                    canDownload: false,
                    notes: t("Borrows.status_borrowed")
                };
            } else if (type === 'reject') {
                options = { notes: t("Borrows.status_rejected") };
            }

            const result = await dispatch(updateBorrowAction({ id: borrow._id, type, options })).unwrap();
            showSuccess(t("Common.success"), true);
            if (setProgress) setProgress(100);
        } catch (err) {
            showError(err || t("Common.error"), true);
            if (setProgress) setProgress(100);
        }
    }, [dispatch, setProgress, showSuccess, showError, t]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: t("Borrows.status_pending"), class: 'bg-warning-soft text-dark border-warning' };
      case 'borrowed': return { label: t("Borrows.status_borrowed"), class: 'bg-primary-soft text-primary border-primary' };
      case 'returned': return { label: t("Borrows.status_returned"), class: 'bg-success-soft text-success border-success' };
      case 'overdue': return { label: t("Borrows.status_overdue"), class: 'bg-danger-soft text-danger border-danger' };
      case 'rejected': return { label: t("Borrows.status_rejected"), class: 'bg-secondary-soft text-muted border-secondary' };
      default: return { label: status, class: 'bg-light text-muted' };
    }
  };

  const formatDate = (date) => {
    if (!date) return '---';
    return new Date(date).toLocaleDateString(context.language === 'ar' ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

    const clearFilters = useCallback(() => {
        setSearch('');
        setStatusFilter('all');
        setPage(1);
    }, []);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 p-4 mb-4" style={{ borderRadius: '15px' }}>
        <h5 className="mb-0 fw-bold">{t("Borrows.title")}</h5>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card p-4 text-center shadow-sm" style={{ borderRadius: "15px", background: "var(--bg-card)" }}>
            <h2 className="fw-bold text-success mb-2">{stats.returned || 0}</h2>
            <span className="text-muted fw-bold">{t("Borrows.returned_books")}</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4 text-center shadow-sm" style={{ borderRadius: "15px", background: "var(--bg-card)" }}>
            <h2 className="fw-bold text-danger mb-2">{stats.overdue || 0}</h2>
            <span className="text-muted fw-bold">{t("Borrows.overdue_returns")}</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4 text-center shadow-sm" style={{ borderRadius: "15px", background: "var(--bg-card)" }}>
            <h2 className="fw-bold text-primary mb-2">{stats.borrowed || 0}</h2>
            <span className="text-muted fw-bold">{t("Borrows.currently_borrowed")}</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-4 text-center shadow-sm" style={{ borderRadius: "15px", background: "var(--bg-card)" }}>
            <h2 className="fw-bold text-warning mb-2">{stats.pending || 0}</h2>
            <span className="text-muted fw-bold">{t("Borrows.pending_requests")}</span>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 p-4 mb-4" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="fw-bold mb-2 opacity-75 small">{t("Common.search")}</label>
            <div className="input-group input-group-lg shadow-sm">
              {/* <span className="input-group-text bg-body border-0"><FaSearch className="text-muted opacity-50"/></span> */}
              <input
                type="text"
                className="form-control bg-body border-0 shadow-none ps-0"
                placeholder={t("Borrows.search_placeholder") || t("Common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <label className="fw-bold mb-2 opacity-75 small">{t("Common.status")}</label>
            <select className="form-select form-select-lg bg-body border-0 shadow-sm shadow-none" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="all">{t("Common.all")}</option>
              <option value="pending">{t("Borrows.status_pending")}</option>
              <option value="borrowed">{t("Borrows.status_borrowed")}</option>
              <option value="overdue">{t("Borrows.status_overdue")}</option>
              <option value="returned">{t("Borrows.status_returned")}</option>
              <option value="rejected">{t("Borrows.status_rejected")}</option>
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-secondary btn-lg w-100 shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={clearFilters}>
              <FaEraser /> {t("Common.cancel")}
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 p-3" style={{ borderRadius: '15px' }}>
        <div className="table-responsive">
          <table className="table v-align text-center custom-table m-0">
            <thead>
              <tr>
                <th className="text-start">{t("Borrows.borrower")}</th>
                <th className="text-start">{t("Borrows.book")}</th>
                <th>{t("Borrows.borrow_date")}</th>
                <th>{t("Borrows.due_date")}</th>
                <th>{t("Common.status")}</th>
                <th>{t("Common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-5 text-center"><div className="spinner-border text-primary"></div></td></tr>
              ) : borrows.length > 0 ? borrows.map((borrow) => {
                const status = getStatusInfo(borrow.status);
                return (
                  <tr key={borrow._id}>
                    <td className="text-start">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle overflow-hidden shadow-sm bg-light d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '40px', height: '40px', border: '1px solid var(--border-color)' }}>
                          {borrow.user?.profileImage ? (
                            <img src={getImageUrl(borrow.user.profileImage)} className="w-100 h-100 object-fit-cover" alt="User" />
                          ) : <FaUser className="text-muted" />}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold small">{borrow.user?.fullName || '---'}</h6>
                          <small className="text-muted opacity-75" style={{ fontSize: '0.75rem' }}>{borrow.user?.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-start">
                      <div className="d-flex align-items-center">
                        <div className="img card shadow-sm m-0 overflow-hidden flex-shrink-0" style={{ width: "35px", height: "50px", borderRadius: '4px' }}>
                          <img src={getImageUrl(borrow.book?.coverImage)} alt="Book" className="w-100 h-100 object-fit-cover" />
                        </div>
                        <h6 className="mb-0 fw-bold small text-primary">{borrow.book?.title || '---'}</h6>
                      </div>
                    </td>
                    <td>
                      <div className="small fw-bold">{borrow.borrowDate ? formatDate(borrow.borrowDate) : formatDate(borrow.requestDate)}</div>
                      <small className="text-muted opacity-50" style={{ fontSize: '0.7rem' }}>
                        {borrow.borrowDate ? t("Borrows.borrow_date") : t("Borrows.request_date")}
                      </small>
                    </td>
                    <td>
                      <div className={`small fw-bold ${borrow.status === 'overdue' ? 'text-danger' : ''}`}>
                        {borrow.dueDate ? formatDate(borrow.dueDate) : '---'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${status.class} px-3 py-2 rounded-pill border small fw-bold shadow-sm`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        {borrow.status === 'pending' && (
                          <>
                            <Tooltip title={t("Common.approve")}>
                              <IconButton onClick={() => handleAction(borrow, 'approve')} size="small" className="bg-success-soft text-success shadow-sm">
                                <FaCheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("Common.reject")}>
                              <IconButton onClick={() => handleAction(borrow, 'reject')} size="small" className="bg-danger-soft text-danger shadow-sm">
                                <FaTimesCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {borrow.status === 'borrowed' && (
                          <Tooltip title={t("Common.return")}>
                            <IconButton onClick={() => handleAction(borrow, 'return')} size="small" className="bg-primary-soft text-primary shadow-sm px-3 rounded-pill gap-2 d-flex align-items-center" style={{ width: 'auto' }}>
                              <FaSyncAlt fontSize="small" />
                              <span className="small fw-bold">{t("Common.return")}</span>
                            </IconButton>
                          </Tooltip>
                        )}
                        {(borrow.status === 'returned' || borrow.status === 'rejected' || borrow.status === 'overdue') && (
                          <span className="text-muted small opacity-50"><FaCheckCircle className="me-1" /> {t("Common.completed")}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6" className="py-5 text-center text-muted opacity-50 fs-5">{t("Common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 pb-3">
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Borrows);
