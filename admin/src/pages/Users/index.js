// src/pages/Users/index.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from "../../App";
import { FaTrash, FaEdit, FaUserCircle, FaSearch, FaEraser, FaPlus, FaEye } from 'react-icons/fa';
import { MdAdminPanelSettings, MdPersonOutline } from 'react-icons/md';
import { getImageUrl } from '../../services/imageUtils';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, removeUser } from '../../store/slices/usersSlice';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../contexts/NotificationContext';
import { Tooltip, IconButton } from '@mui/material';

const Users = () => {
    const dispatch = useDispatch();
    const { items: users, loading, error } = useSelector((state) => state.users);
    const { t } = useTranslation();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();
    const { setProgress } = context;

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [role, setRole] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

    const loadUsers = useCallback((searchQuery = debouncedSearch) => {
        const params = { page: 1, limit: 100 };
        if (searchQuery.trim()) params.search = searchQuery.trim();
        if (role !== 'all') params.role = role;
        if (statusFilter !== 'all') params.status = statusFilter;

        if (setProgress) setProgress(40);
        dispatch(fetchUsers(params)).finally(() => {
            if (setProgress) setProgress(100);
        });
    }, [dispatch, debouncedSearch, role, statusFilter, setProgress]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDeleteUser = useCallback(async (id, name) => {
        if (window.confirm(`${t("Common.delete")} "${name}"?`)) {
            try {
                if (setProgress) setProgress(40);
                const result = await dispatch(removeUser(id)).unwrap();
                showSuccess(t("Common.success"));
                if (setProgress) setProgress(100);
            } catch (err) {
                showError(err || t("Common.error"));
                if (setProgress) setProgress(100);
            }
        }
    }, [dispatch, setProgress, showSuccess, showError, t]);

    const clearFilters = useCallback(() => {
        setSearch('');
        setRole('all');
        setStatusFilter('all');
    }, []);

  const getRoleInfo = (roleName) => {
    switch (roleName) {
      case 'admin': return { label: t("Members.role_admin") || 'Admin', class: 'badge bg-danger-soft text-danger border border-danger', icon: <MdAdminPanelSettings /> };
      case 'librarian': return { label: t("Members.role_librarian") || 'Librarian', class: 'badge bg-primary-soft text-primary border border-primary', icon: <MdPersonOutline /> };
      default: return { label: t("Members.role_user") || 'User', class: 'badge bg-secondary-soft text-secondary border border-secondary', icon: <FaUserCircle /> };
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4" style={{ borderRadius: '15px' }}>
        <h5 className="mb-0 fw-bold">{t("Members.title")}</h5>
        <Link to="/users/add">
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm px-4">
            <FaPlus /> {t("Members.add_member")}
          </button>
        </Link>
      </div>

      <div className="card shadow border-0 p-4 mb-4" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="fw-bold mb-2 opacity-75 small">{t("Common.search")}</label>
            <div className="input-group input-group-lg shadow-sm">
              {/* <span className="input-group-text bg-body border-0"><FaSearch className="text-muted opacity-50"/></span> */}
              <input
                type="text"
                className="form-control bg-body border-0 shadow-none ps-0"
                placeholder={t("Common.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="fw-bold mb-2 opacity-75 small">{t("Members.role")}</label>
            <select className="form-select form-select-lg bg-body border-0 shadow-sm shadow-none" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">{t("Common.all")}</option>
              <option value="admin">{t("Members.role_admin")}</option>
              <option value="librarian">{t("Members.role_librarian")}</option>
              <option value="user">{t("Members.role_user")}</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="fw-bold mb-2 opacity-75 small">{t("Common.status")}</label>
            <select className="form-select form-select-lg bg-body border-0 shadow-sm shadow-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">{t("Common.all")}</option>
              <option value="active">{t("Common.active")}</option>
              <option value="inactive">{t("Common.inactive")}</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-secondary btn-lg w-100 d-flex align-items-center justify-content-center gap-1 shadow-sm" onClick={clearFilters}>
              <FaEraser /> {t("Common.cancel")}
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 p-3" style={{ borderRadius: '15px' }}>
        <div className="table-responsive">
          <table className="table v-align text-center custom-table">
            <thead>
              <tr>
                <th className="text-start">{t("Members.name")}</th>
                <th className="text-start">{t("Members.email")}</th>
                <th>{t("Members.role")}</th>
                <th>{t("Books.books")}</th>
                <th>{t("Common.status")}</th>
                <th>{t("Common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">{t("Common.loading")}</span>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? users.map((user) => {
                const roleInfo = getRoleInfo(user?.role);
                return (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center text-start">
                        <div className="user-img-circle me-3 shadow-sm overflow-hidden" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-body)' }}>
                          {user.profileImage ? (
                            <img src={getImageUrl(user.profileImage)} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-primary-soft text-primary fw-bold">
                                {user.fullName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{user?.fullName || '---'}</h6>
                          <small className="opacity-75">@{user?.username || 'user'}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-start">
                      <div className="mb-0 fw-bold small">{user?.email || '-'}</div>
                      <div><small className="text-muted">{user?.phone || '-'}</small></div>
                    </td>
                    <td>
                      <span className={`${roleInfo.class} d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm small fw-bold`}>
                        {roleInfo.icon} {roleInfo.label}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold fs-5 text-primary">{user?.borrowedBooksCount || user?.borrowedBooks || 0}</span>
                    </td>
                    <td>
                      {user?.isActive ?
                        <span className="badge bg-success-soft text-success border border-success px-3 py-2 rounded-pill">{t("Common.active") || 'Active'}</span> :
                        <span className="badge bg-danger-soft text-danger border border-danger px-3 py-2 rounded-pill">{t("Common.inactive") || 'Inactive'}</span>
                      }
                    </td>
                    <td>
                      <div className="actions d-flex justify-content-center gap-1">
                        <Tooltip title={t("Common.view") || "View"}>
                          <Link to={`/users/${user._id}`}>
                            <IconButton size="small" className="shadow-sm bg-info-soft text-info mx-1" disabled={loading}>
                              <FaEye fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip title={t("Common.edit")}>
                          <Link to={`/users/edit/${user._id}`}>
                            <IconButton size="small" className="shadow-sm bg-primary-soft text-primary mx-1" disabled={loading}>
                              <FaEdit fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip title={t("Common.delete")}>
                                <IconButton onClick={() => handleDeleteUser(user._id, user.fullName)} size="small" className="bg-danger-soft text-danger shadow-sm" disabled={loading}>
                                  <FaTrash fontSize="small" />
                                </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted opacity-50 fs-5">{t("Common.no_data")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Users);
