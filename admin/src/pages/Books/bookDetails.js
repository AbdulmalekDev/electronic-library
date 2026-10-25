import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MyContext } from "../../App";
import bookService from "../../services/bookService";
import { FaHome, FaEdit, FaBookOpen } from "react-icons/fa";
import { MdOutlineDateRange, MdLocalLibrary } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../contexts/NotificationContext";
import { getImageUrl } from "../../services/imageUtils";

const BookDetails = () => {
  const { t } = useTranslation();
  const context = useContext(MyContext);
  const mode = context.themeMode ? 'dark' : 'light';
  const { showError } = useNotification();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper styles based on theme
  const bgCard = mode === 'dark' ? 'bg-dark border-secondary bg-opacity-10' : 'bg-light';
  const textTitle = mode === 'dark' ? 'text-white' : 'text-dark';
  const borderClass = mode === 'dark' ? 'border-secondary' : 'border';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      context.setProgress(30);
      const response = await bookService.getBook(id);
      setBook(response.data?.data?.book);
      context.setProgress(100);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching book details:", error);
      context.setProgress(100);
      setLoading(false);
      showError(t("BookDetails.fetch_error") || "تعذر جلب تفاصيل الكتاب");
    }
  };

  if (loading) {
    return (
      <div
        className="right-content w-100 d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">{t("Common.loading")}</span>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="right-content w-100">
        <div className="alert alert-danger m-4">
          {t("BookDetails.not_found")}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="right-content w-100">
        <div className={`card shadow border-0 w-100 p-4 mb-4 d-flex flex-md-row justify-content-between align-items-center ${mode === 'dark' ? 'bg-dark text-white' : ''}`}>
          <h5 className="mb-3 mb-md-0 fw-bold">{t("BookDetails.title")}</h5>
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

            <Link to={`/books/edit/${book._id}`}>
              <button className="btn btn-primary px-4 shadow-sm d-flex align-items-center gap-2">
                <FaEdit /> <span>{t("BookDetails.edit")}</span>
              </button>
            </Link>
          </div>
        </div>

        <div className={`card shadow border-0 p-4 ${mode === 'dark' ? 'bg-dark text-white' : ''}`}>
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className={`text-center rounded border p-2 ${bgCard} ${borderClass}`}>
                <img
                  src={getImageUrl(book.coverImage)}
                  alt={book.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x400?text=" + t("BookDetails.not_available");
                  }}
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
                />
              </div>
            </div>
            <div className="col-md-9">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <h2 className={`fw-bold m-0 ${textTitle}`}>{book.title}</h2>
                <span className={`text-muted d-flex align-items-center gap-2 border px-3 py-2 rounded shadow-sm ${bgCard} ${borderClass}`}>
                  <FaBookOpen className="text-primary mb-1" /> {t("BookDetails.reference_number")}:{" "}
                  <strong className={textTitle}>{book.referenceNumber || book.isbn || t("BookDetails.unknown")}</strong>
                </span>
              </div>
              <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
                <span className="badge bg-primary fs-6 py-2 px-3 shadow-sm">
                  {book.category}
                </span>
                <span
                  className={`badge fs-6 py-2 px-3 shadow-sm ${book.availableCopies > 0 ? "bg-success" : "bg-danger"}`}
                >
                  {book.availableCopies > 0
                    ? t("BookDetails.available")
                    : t("BookDetails.not_available")}
                </span>
              </div>

              <div className="row mb-4 mt-2">
                <div className="col-sm-6 col-md-4 mb-3">
                  <div className={`p-3 border rounded h-100 d-flex flex-column justify-content-center ${bgCard} ${borderClass}`}>
                    <span className="text-muted d-block mb-1">
                      {t("BookDetails.author")}
                    </span>
                    <strong className={`fs-5 ${textTitle}`}>{book.author || t("BookDetails.unknown")}</strong>
                  </div>
                </div>
                <div className="col-sm-6 col-md-4 mb-3">
                  <div className={`p-3 border rounded h-100 d-flex flex-column justify-content-center ${bgCard} ${borderClass}`}>
                    <span className="text-muted d-block mb-1">
                      {t("BookDetails.publisher")}
                    </span>
                    <strong className={`fs-5 ${textTitle}`}>
                      {book.publisher || t("BookDetails.unknown")}
                    </strong>
                  </div>
                </div>
                <div className="col-sm-6 col-md-4 mb-3">
                  <div className={`p-3 border rounded h-100 d-flex flex-column justify-content-center ${bgCard} ${borderClass}`}>
                    <span className="text-muted d-block mb-1 text-nowrap">
                      {t("BookDetails.published_year")} <MdOutlineDateRange className="me-1 mb-1" />
                    </span>
                    <strong className={`fs-5 ${textTitle}`}>
                      {book.publishedYear || t("BookDetails.unknown")}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <div className="card bg-success text-white border-0 shadow-sm h-100">
                    <div className="card-body px-4 py-4 d-flex justify-content-between align-items-center">
                      <h4 className="card-title text-white m-0 opacity-100 fw-bold">
                        {t("BookDetails.available_copies")} :
                      </h4>
                      <h1 className="fw-bold m-0 text-white" style={{ fontSize: "2.5rem" }}>
                        {book.availableCopies}
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card bg-secondary text-white border-0 shadow-sm h-100">
                    <div className="card-body px-4 py-4 d-flex justify-content-between align-items-center">
                      <h4 className="card-title text-white m-0 opacity-100 fw-bold">
                        {t("BookDetails.total_copies")} :
                      </h4>
                      <h1 className="fw-bold m-0 text-white" style={{ fontSize: "2.5rem" }}>
                        {book.totalCopies}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mb-4 p-4 rounded border ${bgCard} ${borderClass}`}>
                <h5 className={`fw-bold mb-3 border-bottom pb-2 ${borderClass} ${textTitle}`}>
                  {t("BookDetails.description")}
                </h5>
                <p
                  className={`fs-6 lh-lg text-justify m-0 ${mode === 'dark' ? 'text-light opacity-75' : 'text-muted'}`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {book.description || t("BookDetails.no_description")}
                </p>
              </div>

              <div className={`mt-4 pt-4 border-top ${borderClass}`}>
                <Link to={`/books/copies/${book._id}`}>
                  <button className="btn btn-outline-info d-flex align-items-center gap-2 px-4 py-2 shadow-sm">
                    <MdLocalLibrary size={22} className="mb-1" />{" "}
                    <strong>{t("BookDetails.borrow_history_btn")}</strong>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetails;
