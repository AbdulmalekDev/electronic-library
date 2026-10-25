import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MyContext } from "../../App";
import bookService from "../../services/bookService";
import { FaHome } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../contexts/NotificationContext";
import { FormControlLabel, Switch } from "@mui/material";
import { getImageUrl } from "../../services/imageUtils";

const EditBook = () => {
  const { t } = useTranslation();
  const context = useContext(MyContext);
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    referenceNumber: "",
    publisher: "",
    publishedYear: "",
    totalCopies: 1,
    description: "",
    featured: false
  });
  
  const [file, setFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [currentPdf, setCurrentPdf] = useState(null);

  const categories = [
    "أدب", "تاريخ", "علوم", "تكنولوجيا", "دين", "فلسفة",
    "سياسة", "اقتصاد", "طب", "هندسة", "فنون", "شعر",
    "قصص", "الروايات", "أخرى"
  ];

  useEffect(() => {
    // context.setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
    fetchBookData();
  }, [id]);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      context.setProgress(30);
      const response = await bookService.getBook(id);
      const bookData = response.data?.data?.book;
      
      if (bookData) {
        setFormData({
          title: bookData.title || "",
          author: bookData.author || "",
          category: bookData.category || "",
          referenceNumber: bookData.referenceNumber || "",
          publisher: bookData.publisher || "",
          publishedYear: bookData.publishedYear || bookData.publicationYear || "",
          totalCopies: bookData.totalCopies || 1,
          description: bookData.description || "",
          featured: bookData.featured || false
        });
        
        if (bookData.coverImage) {
          setCurrentImage(bookData.coverImage);
        }
        if (bookData.pdfPath) {
          setCurrentPdf(bookData.pdfPath);
        }
      }
      
      context.setProgress(100);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching book for edit:", error);
      context.setProgress(100);
      setLoading(false);
      showError(t("Common.error") || "تعذر جلب بيانات الكتاب للتعديل");
      navigate("/books");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handlePdfChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        showError('يرجى اختيار ملف بصيغة PDF صالحة');
        e.target.value = '';
        return;
      }
      setPdfFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      context.setProgress(30);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });
      
      if (file) {
        submitData.append("coverImage", file);
      }

      if (pdfFile) {
        submitData.append("pdfFile", pdfFile);
      }

      context.setProgress(60);
      const res = await bookService.updateBook(id, submitData);
      
      context.setProgress(100);
      setLoading(false);
      showSuccess(res?.data?.message || t("Common.success") || "تم تعديل الكتاب بنجاح!");
      
      setTimeout(() => {
        navigate("/books");
      }, 1000);
      
    } catch (error) {
      console.error("Error updating book:", error);
      context.setProgress(100);
      setLoading(false);
      showError(error.response?.data?.message || t("Common.error") || "حدث خطأ أثناء تعديل الكتاب");
    }
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">تعديل كتاب</h5>
          <div className="ms-auto d-flex align-items-center">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/"><FaHome /> {t("Sidebar.dashboard")}</Link></li>
                <li className="breadcrumb-item"><Link to="/books">{t("Sidebar.books")}</Link></li>
                <li className="breadcrumb-item active" aria-current="page">تعديل كتاب</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card shadow border-0 p-4 mt-4">
          <form onSubmit={handleSubmit}>
             <div className="row">
              <div className="col-md-8">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold mb-2">عنوان الكتاب <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                  </div>
                  
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold mb-2">المؤلف <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} required />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-bold mb-2">التصنيف <span className="text-danger">*</span></label>
                    <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                      <option value="">-- اختر التصنيف --</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-bold mb-2">الرقم المرجعي <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="fw-bold mb-2">الناشر</label>
                    <input type="text" className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="fw-bold mb-2">سنة النشر</label>
                    <input type="number" className="form-control" name="publishedYear" value={formData.publishedYear} onChange={handleChange} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="fw-bold mb-2">عدد النسخ الكلي <span className="text-danger">*</span></label>
                    <input type="number" className="form-control" name="totalCopies" min="1" value={formData.totalCopies} onChange={handleChange} required />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="fw-bold mb-2">الوصف</label>
                    <textarea className="form-control" name="description" rows="5" value={formData.description} onChange={handleChange}></textarea>
                  </div>

                  <div className="col-md-12 mb-3">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.featured}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              featured: e.target.checked
                            })
                          }
                          color="error"
                        />
                      }
                      label="إضافة إلى الكتب المميرة"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontWeight: "bold",
                          fontSize: "0.95rem"
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card shadow-sm p-3 mb-3">
                  <h6 className="fw-bold mb-3">تحديث صورة الغلاف</h6>
                  <div className="text-center mb-3">
                    {imagePreview ? (
                      <div className="preview-container position-relative">
                        <img src={imagePreview} alt="New Preview" className="img-thumbnail" style={{ maxHeight: "250px", objectFit: "cover" }} />
                        <span className="badge bg-primary position-absolute top-0 start-50 translate-middle-x mt-2">معاينة جديدة</span>
                      </div>
                    ) : currentImage ? (
                      <div className="current-container">
                        <img src={getImageUrl(currentImage)} alt="Current Cover" className="img-thumbnail" style={{ maxHeight: "250px", objectFit: "cover" }} />
                        <small className="text-muted d-block mt-1">الغلاف الحالي</small>
                      </div>
                    ) : (
                       <div className="bg-light p-5 border text-muted rounded">
                         <i className="fa fa-image d-block fs-1 opacity-25 mb-2"></i>
                         لم يتم رفع صورة سابقاً
                       </div>
                    )}
                  </div>
                  <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                  <small className="text-muted mt-2 d-block">يفضل استخدام صور بصيغة JPG أو PNG بأبعاد متناسقة.</small>
                </div>

                <div className="card shadow-sm p-3 mb-3">
                  <h6 className="fw-bold mb-2">ملف الكتاب الرقمي (PDF)</h6>
                  {pdfFile ? (
                    <div className="alert alert-success d-flex align-items-center justify-content-between p-2 mb-2">
                      <div className="text-truncate me-2">
                        <i className="fa fa-file-pdf text-danger me-2"></i>
                        <span className="small fw-bold">{pdfFile.name}</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB (جديد)
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setPdfFile(null)}
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : currentPdf ? (
                    <div className="alert alert-info d-flex align-items-center justify-content-between p-2 mb-2">
                      <div className="text-truncate me-2">
                        <i className="fa fa-file-pdf text-danger me-2"></i>
                        <span className="small fw-bold">يوجد ملف PDF مرفوع مسبقاً</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-light p-3 border text-muted rounded mb-2 text-center small">
                      لا يوجد ملف PDF مرفوع لهذا الكتاب
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                  />
                  <small className="text-muted mt-2 d-block">لاختيار ملف جديد واستبدال الحالي (إن وجد).</small>
                </div>
              </div>
            </div>

            <hr />

            <div className="d-flex justify-content-end gap-2">
              <Link to="/books">
                <button type="button" className="btn btn-outline-primary">إلغاء</button>
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                   <>
                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                     جاري التحديث...
                   </>
                ) : "تحديث بيانات الكتاب"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditBook;
