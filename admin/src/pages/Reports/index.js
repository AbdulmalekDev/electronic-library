import React, { useEffect, useContext, useState } from 'react';
import api from '../../services/api';
import { MyContext } from "../../App";
import { FaChartLine, FaDownload, FaUsers, FaBook, FaCalendarCheck, FaTags, FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Set up pdfMake with fonts
try {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
} catch (e) {
    console.warn("pdfFonts not found", e);
}

const Reports = () => {
    const { t } = useTranslation();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();
    const location = useLocation();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubReport, setIsSubReport] = useState(false);
    const [reportType, setReportType] = useState('');

    useEffect(() => {
        const path = location.pathname;
        if (path === '/reports' || path === '/reports/') {
            setIsSubReport(false);
            setReportType('overview');
            fetchStats();
        } else {
            setIsSubReport(true);
            const type = path.split('/').pop();
            setReportType(type);
            fetchReportData(type);
        }
    }, [location.pathname]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            context.setProgress(40);
            const response = await api.get('/admin/dashboard');
            // stats endpoint in adminController is getDashboardStats mapped to /dashboard
            setStats(response.data.data.overview);
            context.setProgress(100);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            showError(t("Common.error"));
            setLoading(false);
            context.setProgress(100);
        }
    };

    const fetchReportData = async (type) => {
        try {
            setLoading(true);
            context.setProgress(40);
            const response = await api.get(`/reports/${type}`);
            setReportData(response.data.data);
            context.setProgress(100);
            setLoading(false);
        } catch (error) {
            console.error(`Error fetching ${type} report:`, error);
            showError(t("Common.error"));
            setLoading(false);
            context.setProgress(100);
        }
    };

    const handleExport = async () => {
        try {
            showSuccess(t("Common.success"));
            console.log("Generating report for:", reportType, reportData);

            // Simple BiDi for Arabic (manual reversal if needed)
            // Note: Proper Arabic support usually requires a Cairo VFS font. 
            // Here we provide a professional layout structure. 
            const docDefinition = {
                content: [
                    { text: t(`Sidebar.${reportType === 'users' ? 'member' : reportType === 'books' ? 'book' : 'borrow'}_reports`), style: 'header' },
                    { text: new Date().toLocaleDateString('ar'), alignment: 'right', margin: [0, 0, 0, 20] },
                    {
                        table: {
                            headerRows: 1,
                            widths: reportType === 'borrows' ? ['*', '*', '*', '*'] : ['*', '*', '*'],
                            body: [
                                // Header row
                                reportType === 'users' ?
                                    [t("Members.name"), t("Members.email"), t("Common.status")] :
                                    reportType === 'books' ?
                                        [t("Borrows.book"), t("Borrows.category"), t("Common.status")] :
                                        [t("Borrows.borrower"), t("Borrows.book"), t("Borrows.borrow_date"), t("Common.status")],

                                // Data rows
                                ...reportData.map(item => {
                                    if (reportType === 'users') {
                                        return [item.fullName, item.email, item.status];
                                    } else if (reportType === 'books') {
                                        return [item.title, item.category, item.status || "نشط"];
                                    } else {
                                        return [item.user?.fullName || "", item.book?.title || "", new Date(item.borrowDate).toLocaleDateString(), item.status];
                                    }
                                })
                            ]
                        },
                        layout: 'lightHorizontalLines'
                    }
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10],
                        alignment: 'right'
                    }
                },
                defaultStyle: {
                    alignment: 'right'
                }
            };

            pdfMake.createPdf(docDefinition).download(`${reportType}-report.pdf`);
        } catch (error) {
            console.error("PDF Export error:", error);
            showError(t("Common.error"));
        }
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ height: '70vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t("Common.loading")}</span>
                </div>
            </div>
        );
    }

    const renderOverview = () => (
        <>
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 text-center h-100 bg-primary text-white transition-all hover-shadow"
                        style={{ borderRadius: '15px', cursor: 'pointer' }}
                        onClick={() => navigate('/reports/books')}>
                        <FaBook size={40} className="mx-auto mb-3 opacity-75" />
                        <h3 className="fw-bold mb-1">{stats?.totalBooks?.toLocaleString() || 0}</h3>
                        <p className="mb-0 opacity-75">{t("Sidebar.book_reports")}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 text-center h-100 bg-success text-white transition-all hover-shadow"
                        style={{ borderRadius: '15px', cursor: 'pointer' }}
                        onClick={() => navigate('/reports/users')}>
                        <FaUsers size={40} className="mx-auto mb-3 opacity-75" />
                        <h3 className="fw-bold mb-1">{stats?.totalUsers?.toLocaleString() || 0}</h3>
                        <p className="mb-0 opacity-75">{t("Sidebar.member_reports")}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 text-center h-100 bg-warning text-dark transition-all hover-shadow"
                        style={{ borderRadius: '15px', cursor: 'pointer' }}
                        onClick={() => navigate('/reports/borrows')}>
                        <FaCalendarCheck size={40} className="mx-auto mb-3 opacity-75" />
                        <h3 className="fw-bold mb-1">{stats?.totalBorrows?.toLocaleString() || 0}</h3>
                        <p className="mb-0 opacity-75">{t("Sidebar.borrow_reports")}</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm p-4 text-center h-100 bg-danger text-white transition-all hover-shadow" style={{ borderRadius: '15px' }}>
                        <FaTags size={40} className="mx-auto mb-3 opacity-75" />
                        <h3 className="fw-bold mb-1">{stats?.overdueBooks?.toLocaleString() || 0}</h3>
                        <p className="mb-0 opacity-75">{t("Reports.overdue_books")}</p>
                    </div>
                </div>
            </div>

            <div className="card shadow border-0 p-4" style={{ borderRadius: '15px', background: "var(--bg-card)" }}>
                <h6 className="fw-bold mb-4 opacity-75">{t("Reports.subtitle")}</h6>
                <div className="text-center py-5">
                    <p className="text-muted">{t("Reports.subtitle")}</p>
                    <div className="d-flex gap-2 justify-content-center mt-3">
                        <button className="btn btn-outline-primary" onClick={() => navigate('/reports/books')}>{t("Sidebar.book_reports")}</button>
                        <button className="btn btn-outline-success" onClick={() => navigate('/reports/users')}>{t("Sidebar.member_reports")}</button>
                        <button className="btn btn-outline-warning" onClick={() => navigate('/reports/borrows')}>{t("Sidebar.borrow_reports")}</button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderTable = () => {
        if (!reportData || reportData.length === 0) {
            return <div className="py-5 text-center text-muted">{t("Common.no_data")}</div>;
        }

        return (
            <div className="card shadow border-0 p-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="table v-align mb-0">
                        <thead className="thead-dark">
                            {reportType === 'users' && (
                                <tr>
                                    <th>{t("Members.name")}</th>
                                    <th>{t("Members.email")}</th>
                                    <th>{t("Members.role")}</th>
                                    <th>{t("Common.status")}</th>
                                </tr>
                            )}
                            {reportType === 'books' && (
                                <tr>
                                    <th>{t("Borrows.book")}</th>
                                    <th>{t("Borrows.category")}</th>
                                    <th>{t("Common.status")}</th>
                                </tr>
                            )}
                            {reportType === 'borrows' && (
                                <tr>
                                    <th>{t("Borrows.borrower")}</th>
                                    <th>{t("Borrows.book")}</th>
                                    <th>{t("Borrows.borrow_date")}</th>
                                    <th>{t("Common.status")}</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {reportData.map((item, idx) => (
                                <tr key={idx}>
                                    {reportType === 'users' && (
                                        <>
                                            <td>{item.fullName}</td>
                                            <td>{item.email}</td>
                                            <td>{item.role}</td>
                                            <td>
                                                {/* {item.status} */}
                                                {item?.isActive ?
                                                    <span className="badge bg-success-soft text-success border border-success px-3 py-2 rounded-pill">{t("Common.active") || 'Active'}</span> :
                                                    <span className="badge bg-danger-soft text-danger border border-danger px-3 py-2 rounded-pill">{t("Common.inactive") || 'Inactive'}</span>
                                                }

                                            </td>
                                        </>
                                    )}
                                    {reportType === 'books' && (
                                        <>
                                            <td>{item.title}</td>
                                            <td>{item.category}</td>
                                            <td>{item.status || t("Common.active")}</td>
                                        </>
                                    )}
                                    {reportType === 'borrows' && (
                                        <>
                                            <td>{item.user?.fullName}</td>
                                            <td>{item.book?.title}</td>
                                            <td>{new Date(item.borrowDate).toLocaleDateString()}</td>
                                            <td>{item.status}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                    {isSubReport && (
                        <button className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={() => navigate('/reports')}>
                            <FaArrowLeft />
                        </button>
                    )}
                    <div>
                        <h5 className="mb-1 fw-bold">
                            <FaChartLine className="me-2 text-primary" />
                            {isSubReport ? t(`Sidebar.${reportType === 'users' ? 'member' : reportType === 'books' ? 'book' : 'borrow'}_reports`) : t("Reports.title")}
                        </h5>
                        <small className="text-muted opacity-75">{isSubReport ? `${t("Common.view")} ${t("Reports.title")}` : t("Reports.subtitle")}</small>
                    </div>
                </div>
                {isSubReport && (
                    <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={handleExport} disabled={reportData.length === 0}>
                        <FaDownload /> {t("Reports.export_pdf")}
                    </button>
                )}
            </div>

            {isSubReport ? renderTable() : renderOverview()}
        </div>
    );
};

export default Reports;
