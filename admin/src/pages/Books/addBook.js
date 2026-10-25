import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import bookService from "../../services/bookService";
import { FaHome } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNotification } from "../../contexts/NotificationContext";
import { FormControlLabel, Switch } from "@mui/material";

const AddBook = () => {
  const { t } = useTranslation();
  const context = useContext(MyContext);
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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

  const categoryKeys = [
    "cat_literature", "cat_history", "cat_science", "cat_technology",
    "cat_religion", "cat_philosophy", "cat_politics", "cat_economy",
    "cat_medicine", "cat_engineering", "cat_arts", "cat_poetry",
    "cat_stories", "cat_novels", "cat_other"
  ];

  // Map translated labels to their actual backend values
  const categoryValues = [
    "أدب", "تاريخ", "علوم", "تكنولوجيا", "دين", "فلسفة",
    "سياسة", "اقتصاد", "طب", "هندسة", "فنون", "شعر",
    "قصص", "الروايات", "أخرى"
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      const res = await bookService.createBook(submitData);

      context.setProgress(100);
      setLoading(false);
      showSuccess(res?.data?.message || t("Books.add_success") || "تمت إضافة الكتاب بنجاح");

      setTimeout(() => {
        navigate("/books");
      }, 1000);

    } catch (error) {
      console.error("Error creating book:", error);
      context.setProgress(100);
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || t("Books.add_error") || "حدث خطأ أثناء إضافة الكتاب";
      showError(errorMessage);
    }
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">{t("Sidebar.add_book")}</h5>
          <div className="ms-auto d-flex align-items-center">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/"><FaHome /> {t("Sidebar.dashboard")}</Link></li>
                <li className="breadcrumb-item"><Link to="/books">{t("Sidebar.books")}</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{t("Sidebar.add_book")}</li>
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
                    <label className="fw-bold mb-2">{t("Books.title_label")} <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-bold mb-2">{t("Books.author_label")} <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} required />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-bold mb-2">{t("Books.category_label")} <span className="text-danger">*</span></label>
                    <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                      <option value="">{t("Books.select_category")}</option>
                      {categoryKeys.map((key, idx) => (
                        <option key={idx} value={categoryValues[idx]}>{t(`Books.${key}`)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-bold mb-2">{t("Books.reference_label")} <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} required />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="fw-bold mb-2">{t("Books.publisher_label")}</label>
                    <input type="text" className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="fw-bold mb-2">{t("Books.year_label")}</label>
                    <input type="number" className="form-control" name="publishedYear" value={formData.publishedYear} onChange={handleChange} />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="fw-bold mb-2">{t("Books.copies_label")} <span className="text-danger">*</span></label>
                    <input type="number" className="form-control" name="totalCopies" min="1" value={formData.totalCopies} onChange={handleChange} required />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="fw-bold mb-2">{t("Books.description_label")}</label>
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
                      label={t("Books.featured_toggle")}
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
                  <h6 className="fw-bold mb-3">{t("Books.cover_image")}</h6>
                  <div className="text-center mb-3">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="img-thumbnail" style={{ maxHeight: "250px" }} />
                    ) : (
                      <div className="bg-light p-5 border text-muted">{t("Books.no_image_selected")}</div>
                    )}
                  </div>
                  <input type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
                  <small className="text-muted mt-2 d-block">{t("Books.image_hint")}</small>
                </div>

                <div className="card shadow-sm p-3 mb-3">
                  <h6 className="fw-bold mb-2">ملف الكتاب الرقمي (PDF)</h6>
                  <small className="text-muted mb-3 d-block">اختياري - للقراءة والاستعارة الإلكترونية</small>
                  {pdfFile ? (
                    <div className="alert alert-success d-flex align-items-center justify-content-between p-2 mb-2">
                      <div className="text-truncate me-2">
                        <i className="fa fa-file-pdf text-danger me-2"></i>
                        <span className="small fw-bold">{pdfFile.name}</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
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
                  ) : null}
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                  />
                  <small className="text-muted mt-2 d-block">الصيغ المدعومة: PDF فقط، حتى 50 ميغابايت.</small>
                </div>
              </div>
            </div>

            <hr />

            <div className="d-flex justify-content-end gap-2">
              <Link to="/books">
                <button type="button" className="btn btn-outline-primary">{t("Common.cancel")}</button>
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t("Books.saving")}
                  </>
                ) : t("Books.save_book")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddBook;
