import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MyContext } from "../../App";
import bookService from "../../services/bookService";
import borrowService from "../../services/borrowService";
import { FaHome, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../contexts/NotificationContext";
import { getImageUrl } from "../../services/imageUtils";

const BookCopies = () => {
  const { t } = useTranslation();
  const context = useContext(MyContext);
  const mode = context.themeMode ? 'dark' : 'light';
  const { showError } = useNotification();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper styles based on theme
  const bgCard = mode === 'dark' ? 'bg-dark border-secondary bg-opacity-10' : 'bg-light';
  const textTitle = mode === 'dark' ? 'text-white' : 'text-dark';
  const borderClass = mode === 'dark' ? 'border-secondary' : 'border';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      context.setProgress(30);

      const [bookRes, borrowRes] = await Promise.all([
        bookService.getBook(id),
        borrowService.getAllBorrowRequests({ book: id, limit: 100 })
      ]);

      setBook(bookRes.data?.data?.book || bookRes.data?.book);
      
      const fetchedBorrows = borrowRes.data?.data?.requests || borrowRes.data?.requests || borrowRes.data?.data || [];
      const historyArr = Array.isArray(fetchedBorrows) ? fetchedBorrows : [];
      setBorrowHistory(historyArr);

      context.setProgress(100);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      context.setProgress(100);
      setLoading(false);
      showError(t("BookCopies.fetch_error") || "Failed to fetch book information");
    }
  };

  const statusBadge = (status) => {
    const validStatuses = ["returned", "active", "late", "pending", "overdue", "rejected", "borrowed"];
    let badgeClass = "bg-secondary";
    
    if (status === "returned") badgeClass = "bg-success";
    else if (status === "active" || status === "borrowed") badgeClass = "bg-primary";
    else if (status === "late" || status === "overdue" || status === "rejected") badgeClass = "bg-danger";
    else if (status === "pending") badgeClass = "bg-warning text-dark";

    const translationKey = validStatuses.includes(status) ? `BookCopies.status_${status}` : "BookCopies.status_unknown";
    
    return <span className={`badge ${badgeClass} shadow-sm px-3 py-2 rounded-pill`}>{t(translationKey, t("BookCopies.status_unknown"))}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t("Common.unknown") || "-";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div
        className="right-content w-100 d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">{t("Common.loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="right-content w-100">
        <div className={`card shadow border-0 w-100 p-4 mb-4 d-flex flex-md-row justify-content-between align-items-center ${mode === 'dark' ? 'bg-dark text-white' : ''}`}>
          <h5 className="mb-3 mb-md-0 fw-bold">{t("BookCopies.title")}</h5>
          <div className="d-flex align-items-center flex-wrap gap-3">
            <nav aria-label="breadcrumb" className="d-none d-md-block m-0">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-decoration-none d-flex align-items-center gap-1">
                    <FaHome className="mb-1" /> {t("Sidebar.dashboard")}
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/books" className="text-decoration-none">{t("Sidebar.books")}</Link>
                </li>
              </ol>
            </nav>
            <Link to={`/books/${id}`}>
            {/* btn-outline-primary */}
              <button className="btn btn-primary shadow-sm d-flex align-items-center gap-2">
                <span>{t("BookCopies.back")}</span> <FaArrowRight className="mt-1" />
              </button>
            </Link>
          </div>
        </div>

        {book && (
          <div className="row mt-4">
            <div className="col-md-4 mb-4">
              <div className={`card shadow border-0 p-4 h-100 ${mode === 'dark' ? 'bg-dark text-white' : ''}`}>
                <h6 className={`fw-bold fs-5 mb-4 border-bottom pb-3 ${borderClass} ${textTitle}`}>
                  {t("BookCopies.summary")}
                </h6>

                <div className={`d-flex align-items-center mb-4 p-3 rounded ${bgCard} ${borderClass}`}>
                  <div className={`img-thumbnail me-3 p-1 ${mode === 'dark' ? 'bg-secondary' : 'bg-white'}`}>
                    <img
                      src={getImageUrl(book.coverImage)}
                      alt={book.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/60x80?text=" + t("Common.no_data");
                      }}
                      style={{
                        width: "70px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <div>
                    <h6 className={`fw-bold mb-1 ${textTitle}`}>{book.title}</h6>
                    <small className={mode === 'dark' ? 'text-light opacity-75' : 'text-muted'}>
                      {book.author || t("Common.unknown")}
                    </small>
                  </div>
                </div>

                <ul className="list-group list-group-flush mt-3 rounded shadow-sm">
                  <li className={`list-group-item d-flex justify-content-start align-items-center p-3 gap-4 ${mode === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                    <span className="badge bg-secondary rounded-pill fs-6 px-3 py-2 shadow-sm">
                      {book.totalCopies}
                    </span>
                    <span className="fs-5 text-muted fw-bold mx-4">:</span>
                    <span className={`fs-5 ${mode === 'dark' ? 'text-light fw-bold' : 'text-muted fw-bold'}`}>
                      {t("BookCopies.total_copies")}
                    </span>
                  </li>
                  <li className={`list-group-item d-flex justify-content-start align-items-center p-3 gap-4 ${mode === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                    <span className="badge bg-success rounded-pill fs-6 px-3 py-2 shadow-sm">
                      {book.availableCopies}
                    </span>
                    <span className="fs-5 text-muted fw-bold mx-4">:</span>
                    <span className="fs-5 text-success fw-bold">
                      {t("BookCopies.available_copies")}
                    </span>
                  </li>
                  <li className={`list-group-item d-flex justify-content-start align-items-center p-3 gap-4 ${mode === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                    <span className="badge bg-danger rounded-pill fs-6 px-3 py-2 shadow-sm">
                      {Math.max(0, book.totalCopies - book.availableCopies)}
                    </span>
                    <span className="fs-5 text-muted fw-bold mx-4">:</span>
                    <span className="fs-5 text-danger fw-bold">
                      {t("BookCopies.borrowed")}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-md-8 mb-4">
              <div className={`card shadow border-0 p-0 h-100 overflow-hidden ${mode === 'dark' ? 'bg-dark text-white' : ''}`}>
                <div className={`p-4 border-bottom ${borderClass} ${bgCard}`}>
                  <h6 className={`fw-bold fs-5 mb-0 ${textTitle}`}>
                    {t("BookCopies.title")}
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className={`table mb-0 align-middle ${mode === 'dark' ? 'table-dark table-hover' : 'table-hover'}`}>
                    <thead className={mode === 'dark' ? 'table-active' : 'table-light'}>
                      <tr>
                        <th className="px-4 py-3 border-0">{t("BookCopies.borrower")}</th>
                        <th className="py-3 border-0">{t("BookCopies.borrow_date")}</th>
                        <th className="py-3 border-0">{t("BookCopies.return_date")}</th>
                        <th className="px-4 py-3 border-0">{t("BookCopies.status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowHistory.map((b) => (
                        <tr key={b._id} style={{ transition: 'all 0.2s ease-in-out' }}>
                          <td className="px-4 py-3 fw-bold text-primary">
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center shadow-sm" style={{ width: '35px', height: '35px', fontSize: '14px' }}>
                                {(b.user?.name || "").substring(0, 1).toUpperCase() || "?"}
                              </div>
                              <span className={mode === 'dark' ? 'text-info' : 'text-primary'}>
                                {b.user?.name || t("Common.unknown")}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-muted">{formatDate(b.borrowDate)}</td>
                          <td className="py-3 text-muted">{formatDate(b.returnDate || b.dueDate)}</td>
                          <td className="px-4 py-3">{statusBadge(b.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {borrowHistory.length === 0 && (
                    <div className={`text-center py-5 d-flex flex-column align-items-center ${mode === 'dark' ? 'text-light' : 'text-muted'}`}>
                      <div className="mb-3 opacity-50 p-4 rounded-circle bg-secondary bg-opacity-10">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      </div>
                      <h5 className="fw-bold">{t("BookCopies.no_history")}</h5>
                      <p className="opacity-75">{t("Common.no_data")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookCopies;
