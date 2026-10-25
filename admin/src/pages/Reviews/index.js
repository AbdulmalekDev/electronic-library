import React, { useState, useEffect, useContext } from "react";
import { MyContext } from "../../App";
import api from "../../services/api";
import {
  FaSearch,
  FaStar,
  FaComment,
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaThumbsUp,
  FaThumbsDown,
  FaBook,
  FaEraser,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../contexts/NotificationContext";
import { getImageUrl } from "../../services/imageUtils";
import { Rating, Tooltip, IconButton, Pagination } from "@mui/material";

const Reviews = () => {
  const { t } = useTranslation();
  const context = useContext(MyContext);
  const { showSuccess, showError } = useNotification();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    publishedReviews: 0,
    pendingModeration: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchReviews();
  }, [debouncedSearch, selectedRating, selectedStatus, page]);

  const fetchReviews = async () => {
    try {
      context.setProgress(40);
      setLoading(true);

      const params = {
        page,
        limit: 10,
        search: debouncedSearch.trim() || undefined,
        rating: selectedRating !== "all" ? selectedRating : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      };

      const response = await api.get("/reviews/admin/all", { params });

      console.log(response.data[0]);

      if (response.data && response.data.success) {
        const {
          reviews: fetchedReviews,
          pagination,
          stats: fetchedStats,
        } = response.data.data;
        
        const safeReviews = fetchedReviews || [];
        setReviews(safeReviews);
        setTotalPages(pagination?.pages || 1);
        
        // Manual calculation fallback 
        const totalReviews = safeReviews.length;
        const publishedReviews = safeReviews.filter(r => r.isApproved || r.status === "approved").length;
        const pendingModeration = safeReviews.filter(r => (!r.isApproved && !r.isRejected && r.status !== "approved" && r.status !== "rejected") || r.status === "pending").length;
        const averageRating = totalReviews > 0 ? (safeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews) : 0;

        setStats({
          totalReviews: fetchedStats?.total || totalReviews,
          averageRating: fetchedStats?.average || averageRating,
          publishedReviews: fetchedStats?.published || publishedReviews,
          pendingModeration: fetchedStats?.pending || pendingModeration,
        });
      }
      context.setProgress(100);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showError(t("Common.error"));
      context.setProgress(100);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      context.setProgress(40);
      await api.put(`/reviews/admin/${reviewId}/approve`, {
        status: newStatus,
      });
      showSuccess(t("Common.success"));
      fetchReviews();
      context.setProgress(100);
    } catch (error) {
      showError(t("Common.error"));
      context.setProgress(100);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("Reviews.confirm_delete"))) {
      try {
        context.setProgress(40);
        await api.delete(`/reviews/${id}`);
        showSuccess(t("Reviews.delete_success"));
        fetchReviews();
        context.setProgress(100);
      } catch (error) {
        showError(t("Common.error"));
        context.setProgress(100);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRating("all");
    setSelectedStatus("all");
    setPage(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? "text-warning" : "text-muted opacity-25"}
        />,
      );
    }
    return stars;
  };

  return (
    <div className="right-content w-100">
      <div
        className="card shadow border-0 w-100 flex-column p-4 justify-content-between mb-4"
        style={{ borderRadius: "15px" }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h4 className="mb-2 fw-bold d-flex align-items-center gap-2">
              <FaComment className="text-primary" /> {t("Reviews.title")}
            </h4>
            <p className="text-muted mb-0 small">{t("Reviews.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div
            className="card shadow border-0 text-center p-4 h-100 shadow-sm"
            style={{ background: "var(--bg-card)", borderRadius: "15px" }}
          >
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mx-auto mb-3 shadow-sm">
              <FaComment size={24} className="text-primary" />
            </div>
            <h4 className="fw-bold mb-1">{stats.totalReviews}</h4>
            <span className="text-muted small fw-bold opacity-75">
              {t("Reviews.total_reviews")}
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow border-0 text-center p-4 h-100 shadow-sm"
            style={{ background: "var(--bg-card)", borderRadius: "15px" }}
          >
            <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-block mx-auto mb-3 shadow-sm">
              <FaStar size={24} className="text-warning" />
            </div>
            <h4 className="fw-bold mb-1">{stats.averageRating.toFixed(1)}</h4>
            <span className="text-muted small fw-bold opacity-75">
              {t("Reviews.average_rating")}
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow border-0 text-center p-4 h-100 shadow-sm"
            style={{ background: "var(--bg-card)", borderRadius: "15px" }}
          >
            <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mx-auto mb-3 shadow-sm">
              <FaCheckCircle size={24} className="text-success" />
            </div>
            <h4 className="fw-bold mb-1">{stats.publishedReviews}</h4>
            <span className="text-muted small fw-bold opacity-75">
              {t("Reviews.published")}
            </span>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="card shadow border-0 text-center p-4 h-100 shadow-sm"
            style={{ background: "var(--bg-card)", borderRadius: "15px" }}
          >
            <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mx-auto mb-3 shadow-sm">
              <FaTimesCircle size={24} className="text-danger" />
            </div>
            <h4 className="fw-bold mb-1">{stats.pendingModeration}</h4>
            <span className="text-muted small fw-bold opacity-75">
              {t("Reviews.pending")}
            </span>
          </div>
        </div>
      </div>

      <div
        className="card shadow border-0 p-4 mb-4"
        style={{ background: "var(--bg-card)", borderRadius: "15px" }}
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="fw-bold mb-2 opacity-75 small">
              {t("Common.search")}
            </label>
            <div className="input-group input-group-lg shadow-sm">
              {/* <span className="input-group-text bg-body border-0"><FaSearch className="text-muted opacity-50"/></span> */}
              <input
                type="text"
                className="form-control bg-body border-0 shadow-none ps-0"
                placeholder={t("Reviews.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="fw-bold mb-2 opacity-75 small">
              {t("Reviews.all_ratings")}
            </label>
            <select
              className="form-select form-select-lg bg-body border-0 shadow-sm shadow-none"
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">{t("Reviews.all_ratings")}</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} {t("Reviews.stars")}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="fw-bold mb-2 opacity-75 small">
              {t("Common.status")}
            </label>
            <select
              className="form-select form-select-lg bg-body border-0 shadow-sm shadow-none"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">{t("Reviews.all_statuses")}</option>
              <option value="approved">{t("Reviews.published")}</option>
              <option value="pending">{t("Reviews.pending")}</option>
              <option value="rejected">{t("Reviews.rejected")}</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              className="btn btn-secondary btn-lg w-100 shadow-sm d-flex align-items-center justify-content-center gap-2"
              onClick={clearFilters}
            >
              <FaEraser /> {t("Common.cancel")}
            </button>
          </div>
        </div>
      </div>

      <div
        className="card shadow border-0 overflow-hidden"
        style={{ background: "var(--bg-card)", borderRadius: "15px" }}
      >
        <div className="table-responsive">
          <table className="table v-align text-center custom-table m-0">
            <thead>
              <tr>
                <th className="text-start">{t("Borrows.book")}</th>
                <th className="text-start">{t("Members.name")}</th>
                <th>{t("Reviews.average_rating")}</th>
                <th style={{ width: "30%" }}>{t("Reviews.message")}</th>
                <th>{t("Common.status")}</th>
                <th>{t("Common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-5 text-center">
                    <div className="spinner-border text-primary"></div>
                  </td>
                </tr>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (

                  <tr key={review._id}>
                    <td className="text-start">
                      <div className="d-flex align-items-center">
                        <div
                          className="img card shadow-sm m-0 overflow-hidden"
                          style={{
                            width: "40px",
                            height: "55px",
                            borderRadius: "5px",
                            background: "var(--bg-body)",
                          }}
                        >
                          <img
                            src={getImageUrl(review.book?.coverImage)}
                            alt="Cover"
                            className="w-100 h-100 object-fit-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/no-image.png";
                            }}
                          />
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0 fw-bold small">
                            {review.book?.title || "---"}
                          </h6>
                          <small className="text-muted opacity-75">
                            {review.book?.author}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="text-start">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-circle overflow-hidden shadow-sm me-2"
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "var(--bg-body)",
                          }}
                        >
                          {review.user?.profileImage ? (
                            <img
                              src={getImageUrl(review.user?.profileImage)}
                              alt="User"
                              className="w-100 h-100 object-fit-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/user.png";
                              }}
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-primary fw-bold small">
                              {review.user?.fullName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="fw-bold small">
                            {review.user?.fullName}
                          </div>
                          <small
                            className="text-muted opacity-75"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {new Date(review.createdAt).toLocaleDateString(
                              "ar-EG",
                            )}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Rating value={review.rating} readOnly size="small" />
                    </td>
                    <td
                      className="text-start small text-muted"
                      style={{ whiteSpace: "normal", fontStyle: "italic" }}
                    >
                      "{review.review || review.comment}"
                    </td>
                    <td>
                      {review.isApproved || review.status === "approved" ? (
                        <span className="badge bg-success-soft text-success border border-success px-3 py-2 rounded-pill small">
                          {t("Reviews.published")}
                        </span>
                      ) : review.isRejected || review.status === "rejected" ? (
                        <span className="badge bg-danger-soft text-danger border border-danger px-3 py-2 rounded-pill small">
                          {t("Reviews.rejected")}
                        </span>
                      ) : (
                        <span className="badge bg-warning-soft  border border-warning px-3 py-2 rounded-pill small">
                          {t("Reviews.pending")}
                        </span>
                      )}
                    </td>
                    {/* text-dark */}
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        {!review.isApproved &&
                          !review.isRejected &&
                          review.status !== "approved" &&
                          review.status !== "rejected" && (
                            <>
                              <Tooltip title={t("Common.approve")}>
                                <IconButton
                                  onClick={() =>
                                    handleStatusUpdate(review._id, "approved")
                                  }
                                  size="small"
                                  className="bg-success-soft text-success shadow-sm mx-1"
                                >
                                  <FaCheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Common.reject")}>
                                <IconButton
                                  onClick={() =>
                                    handleStatusUpdate(review._id, "rejected")
                                  }
                                  size="small"
                                  className="bg-danger-soft text-danger shadow-sm mx-1"
                                >
                                  <FaTimesCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        <Tooltip title={t("Common.delete")}>
                          <IconButton
                            onClick={() => handleDelete(review._id)}
                            size="small"
                            className="bg-danger-soft text-danger shadow-sm mx-1"
                          >
                            <FaTrash fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-5 text-center text-muted opacity-50 fs-5"
                  >
                    {t("Reviews.no_matches")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 pb-3">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
