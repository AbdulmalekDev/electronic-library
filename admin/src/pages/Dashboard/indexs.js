// src/pages/Dashboard/indexs.js
import React, { useEffect, useState, useContext, useCallback } from "react";
import DashboardBox from "./components/dashboardBox";
import { BiCategory } from "react-icons/bi";
import { GiStarsStack } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MyContext } from "../../App";
import api from "../../services/api";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../contexts/NotificationContext";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const context = useContext(MyContext);
  const { setProgress, t: contextT } = context;
  const { showSuccess, showError } = useNotification();
  
  const [dashboardData, setDashboardData] = useState({
    stats: { totalBooks: 0, totalUsers: 0, activeBorrows: 0, overdueReturns: 0 },
    pendingRequests: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      if (setProgress) setProgress(30);
      
      const response = await api.get('/admin/overview');
      if (response.data && response.data.success) {
        setDashboardData({
          stats: response.data.data.stats || {
            totalBooks: response.data.data.totalBooks || 0,
            totalUsers: response.data.data.totalUsers || 0,
            activeBorrows: response.data.data.totalBorrows || 0,
            overdueReturns: response.data.data.overdueBooks || 0,
          },
          pendingRequests: response.data.data.pendingRequests || []
        });
      }
      
      if (setProgress) setProgress(100);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError(t("Common.error"));
      setLoading(false);
      if (setProgress) setProgress(100);
    }
  }, [setProgress, showError, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAction = useCallback(async (requestId, action) => {
    try {
      if (setProgress) setProgress(40);
      const endpoint = action === 'approve' 
        ? `/borrows/${requestId}/approve` 
        : `/borrows/${requestId}/reject`;
      
      const res = await api.put(endpoint, action === 'approve' ? {
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        canRead: true,
        canDownload: false
      } : { reason: 'Rejected by Admin' });

      if (res.data.success) {
        showSuccess(t("Common.success"));
        fetchDashboardData();
      }
      if (setProgress) setProgress(100);
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      showError(t("Common.error"));
      if (setProgress) setProgress(100);
    }
  }, [fetchDashboardData, setProgress, showError, t]);

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{height: '70vh'}}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{t("Common.loading")}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="right-content w-100">
        {dashboardData.stats.overdueReturns > 0 && (
          <div className="alert alert-warning shadow-sm border-0 d-flex align-items-center gap-2 mb-4" role="alert" style={{ borderRadius: '12px' }}>
            <GiStarsStack className="fs-4" />
            <span>{t("Borrows.overdue_returns_alert", { count: dashboardData.stats.overdueReturns })}</span>
          </div>
        )}

        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-xl-3">
            <DashboardBox
              color={["#1da256", "#48d483"]}
              icon={<BiCategory />}
              title={t("Sidebar.total_books") || "إجمالي الكتب"}
              count={dashboardData.stats.totalBooks}
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <DashboardBox
              color={["#c012e2", "#eb64fe"]}
              icon={<FaUserCircle />}
              title={t("Members.title") || "المستخدمين النشطين"}
              count={dashboardData.stats.totalUsers}
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <DashboardBox
              color={["#2c78e5", "#60aff5"]}
              icon={<IoMdCart />}
              title={t("Borrows.currently_borrowed") || "الاستعارات الحالية"}
              count={dashboardData.stats.activeBorrows}
            />
          </div>
          <div className="col-sm-6 col-xl-3">
            <DashboardBox
              color={["#e1950e", "#f3cd29"]}
              icon={<GiStarsStack />}
              title={t("Borrows.status_overdue") || "متأخرة الإرجاع"}
              count={dashboardData.stats.overdueReturns}
            />
          </div>
        </div>

        <div className="card shadow border-0 p-4 mt-4" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
          <h5 className="mb-4 fw-bold">{t("Borrows.pending_requests") || "طلبات الاستعارة المعلقة"}</h5>
          <div className="table-responsive">
            <table className="table v-align text-center custom-table">
              <thead>
                <tr>
                  <th className="text-start">{t("Borrows.book")}</th>
                  <th className="text-start">{t("Borrows.borrower")}</th>
                  <th>{t("Common.date")}</th>
                  <th>{t("Common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.pendingRequests.map((req, index) => (
                  <tr key={index}>
                    <td className="text-start fw-bold text-primary">{req.book?.title || req.book}</td>
                    <td className="text-start">
                       <div className="fw-bold">{req.user?.fullName || req.user}</div>
                       <small className="text-muted opacity-75">{req.user?.email}</small>
                    </td>
                    <td>{new Date(req.createdAt || req.date).toLocaleDateString('ar-EG')}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-success btn-sm px-3 shadow-sm" onClick={() => handleAction(req._id, 'approve')}>{t("Common.approve")}</button>
                        <button className="btn btn-danger btn-sm px-3 shadow-sm" onClick={() => handleAction(req._id, 'reject')}>{t("Common.reject")}</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {dashboardData.pendingRequests.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-5 text-muted opacity-50">{t("Common.no_data")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(AdminDashboard);
