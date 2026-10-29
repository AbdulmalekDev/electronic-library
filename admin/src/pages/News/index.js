import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Fab,
  Tooltip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Toolbar,
} from "@mui/material";
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Article,
  Publish,
  VisibilityOff,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews, removeNews } from "../../store/slices/newsSlice";
import { updateNews } from "../../services/api";
import { getImageUrl } from "../../services/imageUtils";
import { useNotification } from "../../contexts/NotificationContext";

const AdminNews = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: news, loading } = useSelector((state) => state.news);
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filteredNews, setFilteredNews] = useState([]);

  const categories = useMemo(
    () => [
      { value: "", label: t("adminNews.filters.allCategories") },
      { value: "announcement", label: t("adminNews.filters.announcement") },
      { value: "event", label: t("adminNews.filters.event") },
      { value: "new_books", label: t("adminNews.filters.new_books") },
      { value: "maintenance", label: t("adminNews.filters.maintenance") },
      { value: "policy", label: t("adminNews.filters.policy") },
      { value: "general", label: t("adminNews.filters.general") },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: t("adminNews.filters.allStatuses") },
      { value: "published", label: t("adminNews.status.published") },
      { value: "draft", label: t("adminNews.status.draft") },
      { value: "expired", label: t("adminNews.status.expired") },
    ],
    [t],
  );

  const loadNews = useCallback(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const filterNews = useCallback(() => {
    let filtered = news;
    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (selectedCategory)
      filtered = filtered.filter(
        (article) => article.category === selectedCategory,
      );
    if (selectedStatus) {
      if (selectedStatus === "published") {
        filtered = filtered.filter(
          (article) =>
            article.isPublished &&
            (!article.expireDate || new Date(article.expireDate) > new Date()),
        );
      } else if (selectedStatus === "draft") {
        filtered = filtered.filter((article) => !article.isPublished);
      } else if (selectedStatus === "expired") {
        filtered = filtered.filter(
          (article) =>
            article.expireDate && new Date(article.expireDate) < new Date(),
        );
      }
    }
    setFilteredNews(filtered);
  }, [news, searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    filterNews();
  }, [filterNews]);

  const handleDeleteClick = (article) => {
    setSelectedNewsItem(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await dispatch(removeNews(selectedNewsItem._id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedNewsItem(null);
      showSuccess(t("adminNews.messages.deleteSuccess"));
    } catch (err) {
      showError(err || t("adminNews.messages.deleteError"));
    }
  }, [dispatch, selectedNewsItem, showSuccess, showError, t]);

  const handlePublishToggle = useCallback(
    async (article) => {
      try {
        const isPublished = !article.isPublished;
        const response = await updateNews(article._id, { isPublished });
        if (response.data && response.data.success) {
          dispatch(fetchNews()); // Refresh from server to sync state
          showSuccess(
            isPublished ? "تم نشر الخبر بنجاح" : "تم إلغاء نشر الخبر بنجاح",
          );
        }
      } catch (error) {
        console.error("Error toggling publish status:", error);
        showError(t("adminNews.messages.statusUpdateError"));
      }
    },
    [dispatch, showSuccess, showError, t],
  );

  const isExpired = (article) => {
    return article.expireDate && new Date(article.expireDate) < new Date();
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return t("adminNews.priorities.high");
      case "normal":
        return t("adminNews.priorities.normal");
      case "low":
        return t("adminNews.priorities.low");
      case "urgent":
        return t("adminNews.priorities.urgent");
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Toolbar />
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          {t("adminNews.title")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate("/news/add")}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {t("adminNews.addButton")}
        </Button>
      </Box>

      {/* Search and Filters */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          alignItems: "center",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "none",
        }}
      >
        <TextField
          size="small"
          placeholder={t("adminNews.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: 250,
            "& .MuiInputBase-root": { backgroundColor: "var(--bg-input)" },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("adminNews.filters.category")}</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label={t("adminNews.filters.category")}
            sx={{ backgroundColor: "var(--bg-input)" }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("adminNews.filters.status")}</InputLabel>
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            label={t("adminNews.filters.status")}
            sx={{ backgroundColor: "var(--bg-input)" }}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* News Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: "none",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          overflowX: "auto",
          "&::-webkit-scrollbar": { height: "8px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.1)",
            borderRadius: "4px",
          },
        }}
      >
        <Table sx={{ tableLayout: "fixed" }}>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white", width: "80px" }}>
                {t("adminNews.table.image")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "200px" }}>
                {t("adminNews.table.title")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "120px" }}>
                {t("adminNews.table.category")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "80px" }}>
                {t("adminNews.table.priority")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "120px" }}>
                {t("adminNews.table.author")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "100px" }}>
                {t("adminNews.table.publishDate")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "100px" }}>
                {t("adminNews.table.expireDate")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "80px" }}>
                {t("adminNews.table.views")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "100px" }}>
                {t("adminNews.table.status")}
              </TableCell>
              <TableCell sx={{ color: "white", width: "120px" }}>
                {t("adminNews.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredNews.map((article) => (
                <TableRow
                  component={motion.tr}
                  key={article._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  sx={{
                    bgcolor: isExpired(article) ? "error.light" : "inherit",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      src={getImageUrl(article.image)}
                      sx={{ width: 50, height: 50 }}
                    >
                      <Article />
                    </Avatar>
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "500",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {article.title}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        categories.find((c) => c.value === article.category)
                          ?.label || article.category
                      }
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(article.priority)}
                      size="small"
                      color={
                        article.priority === "high" ||
                        article.priority === "urgent"
                          ? "error"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>{article.createdBy?.fullName || "---"}</TableCell>
                  <TableCell>
                    {article.publishedDate
                      ? new Date(article.publishedDate).toLocaleDateString(
                          t("adminNews.lang") === "ar" ? "ar-EG" : "en-US",
                        )
                      : "---"}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={
                        isExpired(article) ? "error.main" : "textSecondary"
                      }
                      fontWeight={isExpired(article) ? "bold" : "normal"}
                    >
                      {article.expireDate
                        ? new Date(article.expireDate).toLocaleDateString(
                            t("adminNews.lang") === "ar" ? "ar-EG" : "en-US",
                          )
                        : t("adminNews.table.noDate")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={article.viewCount || 0}
                      size="small"
                      icon={<Visibility sx={{ fontSize: "14px !important" }} />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        isExpired(article)
                          ? t("adminNews.status.expiredShort")
                          : article.isPublished
                            ? t("adminNews.status.published")
                            : t("adminNews.status.draft")
                      }
                      color={
                        isExpired(article)
                          ? "error"
                          : article.isPublished
                            ? "success"
                            : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex" }}>
                      <Tooltip
                        title={
                          article.isPublished
                            ? t("adminNews.tooltips.unpublish")
                            : t("adminNews.tooltips.publish")
                        }
                      >
                        <IconButton
                          size="small"
                          onClick={() => handlePublishToggle(article)}
                        >
                          {article.isPublished ? (
                            <VisibilityOff color="warning" />
                          ) : (
                            <Publish color="success" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("adminNews.tooltips.edit")}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/news/edit/${article._id}`)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("adminNews.tooltips.delete")}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(article)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      {filteredNews.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t("adminNews.messages.noNews")}
        </Alert>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 32, right: 32 }}
        onClick={() => navigate("/news/add")}
      >
        <Add />
      </Fab>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t("adminNews.dialogs.deleteTitle")}</DialogTitle>
        <DialogContent>
          {t("adminNews.messages.deleteConfirm", {
            title: selectedNewsItem?.title,
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("adminNews.dialogs.cancel")}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            {t("adminNews.dialogs.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default React.memo(AdminNews);
