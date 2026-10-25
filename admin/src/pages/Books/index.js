// src/pages/Books/index.js
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaPencilAlt, FaHome, FaHeart, FaRegHeart, FaSearch, FaEraser, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Tooltip, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { MyContext } from "../../App";
import bookService from "../../services/bookService";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../contexts/NotificationContext";
import { getImageUrl } from '../../services/imageUtils';

const Books = () => {
  const { t } = useTranslation();
  const context = useContext(MyContext);
  const { showSuccess, showError } = useNotification();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for filter and pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const categories = [
    "أدب", "تاريخ", "علوم", "تكنولوجيا", "دين", "فلسفة",
    "سياسة", "اقتصاد", "طب", "هندسة", "فنون", "شعر",
    "قصص", "الروايات", "أخرى"
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBooks(debouncedSearch);
  }, [page, category, debouncedSearch, showFeaturedOnly]);

  const fetchBooks = async (searchQuery = debouncedSearch) => {
    try {
      context.setProgress(40);
      setLoading(true);

      const params = { page, limit: 10 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (category !== "all") params.category = category;
      if (showFeaturedOnly) params.featured = true;

      const response = await bookService.getAllBooks(params);

      setBooks(response.data.data.books || []);
      console.log('The Books Are Data Is : ', response.data.data.books)
      setTotalPages(response.data.data.pagination?.pages || 1);

      setLoading(false);
      context.setProgress(100);
    } catch (error) {
      console.error("Error fetching books", error);
      context.setProgress(100);
      setLoading(false);
      showError(t("Common.error"));
    }
  };

  const toggleFeatured = async (book) => {
    const updatedValue = !book.featured;
    setBooks(prev => prev.map(b => b._id === book._id ? { ...b, featured: updatedValue } : b));

    try {
      const response = await bookService.updateBook(book._id, { featured: updatedValue });
      if (response.data && response.data.success) {
        showSuccess(updatedValue ? t("Featured.add_success") : t("Featured.remove_success"));
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      setBooks(prev => prev.map(b => b._id === book._id ? book : b));
      showError(t("Common.error"));
    }
  };

  const deleteBook = async (id) => {
    if (window.confirm(t("Common.delete") + "?")) {
      try {
        context.setProgress(40);
        await bookService.deleteBook(id);
        showSuccess("تم حذف الكتاب بنجاح");
        context.setProgress(100);
        fetchBooks();
      } catch (error) {
        showError(t("Common.error"));
        context.setProgress(100);
      }
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setShowFeaturedOnly(false);
    setPage(1);
  };

  const getAvailabilityStatus = (book) => {
    if (book.availableCopies === 0) return { label: t("Common.inactive"), class: "badge bg-danger-soft text-danger border border-danger" };
    if (book.availableCopies <= 2) return { label: t("Borrows.status_pending"), class: "badge bg-warning-soft  border border-warning" };
    return { label: t("Common.active"), class: "badge bg-success-soft text-success border border-success" };
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    let items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
          <button className="page-link shadow-sm mx-1 rounded" onClick={() => setPage(i)}>{i}</button>
        </li>
      );
    }
    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link shadow-sm mx-1 rounded" onClick={() => setPage(page - 1)}>{t("Common.prev") || "السابق"}</button>
          </li>
          {items}
          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button className="page-link shadow-sm mx-1 rounded" onClick={() => setPage(page + 1)}>{t("Common.next") || "التالي"}</button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center mb-4" style={{ borderRadius: '15px' }}>
          <h5 className="mb-0 fw-bold">{t("Sidebar.books")}</h5>
          <div className="d-flex align-items-center gap-3" style={{ marginInlineStart: 'auto' }}>
            <Link to="/books/add">
              <button className="btn btn-primary px-4 shadow-sm d-flex align-items-center gap-2">
                <FaPlus /> {t("Sidebar.add_book")}
              </button>
            </Link>
          </div>
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
              <label className="fw-bold mb-2 opacity-75 small">{t("Sidebar.categories")}</label>
              <select className="form-select form-select-lg bg-body border-0 shadow-sm shadow-none" value={category} onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}>
                <option value="all">{t("Common.all")}</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="fw-bold mb-2 opacity-75 small">{t("Featured.title")}</label>
              <div className="form-check form-switch pt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => {
                    setShowFeaturedOnly(e.target.checked);
                    setPage(1);
                  }}
                />
                <label className="form-check-label small fw-bold">{t("Featured.title")}</label>
              </div>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-secondary btn-lg w-100 shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={clearFilters}>
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
                  <th className="text-start">{t("Borrows.book")}</th>
                  <th>{t("Borrows.borrowDate")}</th>
                  <th>{t("Borrows.category")}</th>
                  <th>{t("Common.status")}</th>
                  <th>{t("Borrows.available_copies")}</th>
                  <th>{t("Common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {!loading && books.length > 0 ? books.map((item, index) => {
                  const status = getAvailabilityStatus(item);
                  return (
                    <tr key={index}>
                      <td className="text-start">
                        <div className="d-flex align-items-center gap-3">
                          <div className="img card shadow-sm m-0 overflow-hidden" style={{ width: "50px", height: "70px", borderRadius: '8px', background: 'var(--bg-body)', flexShrink: 0 }}>
                            <img src={getImageUrl(item.coverImage)} alt="Cover" className="w-100 h-100 object-fit-cover" />
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold">{item.title}</h6>
                            <small className="text-muted opacity-75">SN: {item.referenceNumber || item.isbn}</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle fw-bold small">{item.author}</td>
                      <td className="align-middle">
                        <span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill border border-primary small">{item.category}</span>
                      </td>
                      <td className="align-middle">
                        <span className={`${status.class} px-3 py-2 rounded-pill small`}>{status.label}</span>
                      </td>
                      <td className="align-middle fw-bold">
                        <span className="text-primary">{item.availableCopies}</span> / {item.totalCopies}
                      </td>
                      <td className="align-middle">
                        <div className="actions d-flex align-items-center justify-content-center gap-1">
                          <Tooltip title={item.featured ? t("Featured.remove_success") : t("Featured.add_success")}>
                            <IconButton
                              size="small"
                              onClick={() => toggleFeatured(item)}
                              disabled={loading}
                              className={`shadow-sm mx-1 ${item.featured ? 'text-danger' : 'text-muted'}`}
                            >
                              {item.featured ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("Common.view")}>
                            <Link to={`/books/${item._id}`}>
                              <IconButton size="small" className="shadow-sm bg-info-soft text-info mx-1" disabled={loading}>
                                <FaEye fontSize="small" />
                              </IconButton>
                            </Link>
                          </Tooltip>
                          <Tooltip title={t("Common.edit")}>
                            <Link to={`/books/edit/${item._id}`}>
                              <IconButton size="small" className="shadow-sm bg-primary-soft text-primary mx-1" disabled={loading}>
                                <FaPencilAlt fontSize="small" />
                              </IconButton>
                            </Link>
                          </Tooltip>
                          <Tooltip title={t("Common.delete")}>
                            <IconButton size="small" className="shadow-sm bg-danger-soft text-danger mx-1" onClick={() => deleteBook(item._id)} disabled={loading}>
                              <MdDelete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted opacity-50 fs-5">
                      {loading ? (
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">{t("Common.loading")}</span>
                        </div>
                      ) : t("Common.no_data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4 pb-3">
              {renderPagination()}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Books;
