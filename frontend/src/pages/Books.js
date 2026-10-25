import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Pagination,
  Skeleton,
  IconButton,
  InputAdornment,
  Alert
} from "@mui/material";
import {
  Search,
  Sort,
  Book as BookIcon,
  Clear,
  Refresh
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import bookService from "../services/bookService";
import BookCard from "../components/home/BookCard";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const itemsPerPage = 12;

const PREDEFINED_CATEGORIES = [
  "أدب",
  "تاريخ",
  "علوم",
  "تكنولوجيا",
  "دين",
  "فلسفة",
  "سياسة",
  "اقتصاد",
  "طب",
  "هندسة",
  "فنون",
  "شعر",
  "قصص",
  "الروايات",
  "أخرى"
];

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <Grid container spacing={{ xs: 2, sm: 3 }}>
    {Array.from({ length: 8 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Card sx={{ height: "100%", borderRadius: 3 }}>
          <Skeleton variant="rectangular" height={260} />
          <CardContent>
            <Skeleton variant="text" height={28} width="85%" />
            <Skeleton variant="text" height={20} width="60%" />
            <Skeleton variant="rectangular" height={24} width={70} sx={{ my: 1, borderRadius: 1 }} />
            <Skeleton variant="text" height={20} width="40%" />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Skeleton variant="rectangular" width="50%" height={36} sx={{ borderRadius: 1.5 }} />
              <Skeleton variant="rectangular" width="50%" height={36} sx={{ borderRadius: 1.5 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const Books = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  // URL query params synchronization
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialPage = parseInt(searchParams.get("page"), 10) || 1;
  const initialFeatured = searchParams.get("featured") === "true";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Debounce search input (~400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync state if URL query params change externally
  useEffect(() => {
    const paramSearch = searchParams.get("search") || "";
    const paramCategory = searchParams.get("category") || "";
    const paramSort = searchParams.get("sort") || "newest";
    const paramPage = parseInt(searchParams.get("page"), 10) || 1;

    setSearchInput(paramSearch);
    setDebouncedSearch(paramSearch);
    setSelectedCategory(paramCategory);
    setSortBy(paramSort);
    setCurrentPage(paramPage);
  }, [searchParams]);

  // Update URL parameters helper
  const updateUrlParams = useCallback((newSearch, newCategory, newSort, newPage) => {
    const params = new URLSearchParams();
    if (newSearch && newSearch.trim()) params.set("search", newSearch.trim());
    if (newCategory && newCategory !== "all") params.set("category", newCategory);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    if (newPage && newPage > 1) params.set("page", newPage.toString());
    if (initialFeatured) params.set("featured", "true");
    setSearchParams(params, { replace: true });
  }, [initialFeatured, setSearchParams]);

  // Server-side fetch books
  const fetchBooks = useCallback(async (searchQuery, categoryQuery, sortQuery, pageQuery) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageQuery,
        limit: itemsPerPage,
        sort: sortQuery || "newest"
      };

      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (categoryQuery && categoryQuery !== "all") {
        params.category = categoryQuery;
      }
      if (initialFeatured) {
        params.featured = "true";
      }

      const response = await bookService.getAllBooks(params);
      const booksList = response?.data?.data?.books || response?.data?.books || [];
      const pagination = response?.data?.data?.pagination;

      setBooks(booksList);
      setTotalPages(pagination?.pages || 1);
      setTotalCount(pagination?.count || booksList.length);

      const favSet = new Set(
        booksList.filter((b) => b.isFavorite).map((b) => b._id)
      );
      setFavorites(favSet);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("تعذر تحميل قائمة الكتب، يرجى التحقق من الاتصال والمحاولة مرة أخرى.");
      setBooks([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [initialFeatured]);

  // Fetch when debouncedSearch, category, sort, or page changes
  useEffect(() => {
    fetchBooks(debouncedSearch, selectedCategory, sortBy, currentPage);
  }, [fetchBooks, debouncedSearch, selectedCategory, sortBy, currentPage]);

  // Combine predefined categories with any dynamic ones from loaded books
  const categories = useMemo(() => {
    const dynamicCats = books
      .map((b) => b.category)
      .filter((cat) => typeof cat === "string" && cat.trim() !== "");
    const combined = [...new Set([...PREDEFINED_CATEGORIES, ...dynamicCats])];
    return combined;
  }, [books]);

  // Event handlers
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    setCurrentPage(1);
    updateUrlParams(val, selectedCategory, sortBy, 1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCurrentPage(1);
    updateUrlParams("", selectedCategory, sortBy, 1);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    setCurrentPage(1);
    updateUrlParams(debouncedSearch, val, sortBy, 1);
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    setCurrentPage(1);
    updateUrlParams(debouncedSearch, selectedCategory, val, 1);
  };

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
    updateUrlParams(debouncedSearch, selectedCategory, sortBy, page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetAllFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedCategory("");
    setSortBy("newest");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleToggleFavorite = async (bookId) => {
    if (!user) {
      showError("يرجى تسجيل الدخول أولاً لإضافة الكتاب إلى المفضلة");
      navigate("/login");
      return;
    }

    try {
      const response = await bookService.toggleFavorite(bookId);
      const isFav = response?.data?.favorited;
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(bookId);
        } else {
          next.delete(bookId);
        }
        return next;
      });
      showSuccess(isFav ? "تمت الإضافة إلى قائمة المفضلة" : "تمت الإزالة من المفضلة");
    } catch (err) {
      console.error("Error toggling favorite:", err);
      showError("حدث خطأ أثناء تحديث المفضلة");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <BookIcon sx={{ fontSize: 36, color: "primary.main" }} />
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="text.primary"
          >
            فهرس الكتب والمصادر
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          استكشف آلاف العناوين والمصادر المعرفية المتوفرة للاستعارة والقراءة الفورية
        </Typography>
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 4,
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="ابحث بالعنوان، اسم المؤلف، أو نبذة..."
              value={searchInput}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="مسح البحث"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>

          {/* Category Selector */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-select-label">التصنيف</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="التصنيف"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">جميع التصنيفات</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Selector */}
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-select-label">ترتيب حسب</InputLabel>
              <Select
                labelId="sort-select-label"
                value={sortBy}
                onChange={handleSortChange}
                label="ترتيب حسب"
                startAdornment={<Sort sx={{ mr: 1, color: "action.active", fontSize: 20 }} />}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="newest">الأحدث إضافة</MenuItem>
                <MenuItem value="title">العنوان الأبجدي</MenuItem>
                <MenuItem value="rating">الأعلى تقييماً</MenuItem>
                <MenuItem value="views">الأكثر مشاهدة</MenuItem>
                <MenuItem value="oldest">الأقدم</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Results Count & Reset Button */}
          <Grid item xs={12} md={1.5}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                alignItems: { xs: "center", md: "flex-end" },
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2" fontWeight="bold" color="primary.main">
                {totalCount} نتيجة
              </Typography>
              {(searchInput || selectedCategory || sortBy !== "newest" || currentPage > 1) && (
                <Button
                  size="small"
                  onClick={handleResetAllFilters}
                  sx={{ p: 0, minWidth: "auto", fontSize: "0.75rem" }}
                >
                  إعادة ضبط
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Error State */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchBooks(debouncedSearch, selectedCategory, sortBy, currentPage)}
              startIcon={<Refresh />}
            >
              إعادة المحاولة
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Books Grid / Skeleton / Empty State */}
      {loading ? (
        <LoadingSkeleton />
      ) : books.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
            borderRadius: 4,
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <BookIcon sx={{ fontSize: 72, color: "text.secondary", mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
            لم يتم العثور على كتب مطابقة
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: "auto", mb: 3 }}>
            لم نتمكن من إيجاد كتب تطابق معايير البحث الحالية. حاول تغيير كلمات البحث أو إعادة ضبط الفلاتر.
          </Typography>
          <Button
            variant="contained"
            onClick={handleResetAllFilters}
            startIcon={<Refresh />}
            sx={{ borderRadius: 2, px: 3 }}
          >
            إعادة تعيين جميع الفلاتر
          </Button>
        </Paper>
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {books.map((book, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book._id || index}>
                <BookCard
                  book={book}
                  index={index}
                  catalogMode={true}
                  isFavoriteProp={favorites.has(book._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mt: 6,
                mb: 2,
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Books;
