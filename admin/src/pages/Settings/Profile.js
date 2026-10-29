import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { MyContext } from "../../App";
import {
  FaUser,
  FaLock,
  FaSave,
  FaImage,
  FaUserCircle,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "../../services/imageUtils";

const Profile = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const { showSuccess, showError } = useNotification();
  const { t, i18n } = useTranslation();

  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    job: "",
    profileImage: null,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data.data.user || res.data.data;

      setFormData({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        job: user.job || "",
      });

      if (user.profileImage) {
        setImagePreview(getImageUrl(user.profileImage));
      }

      setLoading(false);
    } catch {
      showError("فشل تحميل البيانات");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateInfo = () => {
    let err = {};
    if (!formData.fullName) err.fullName = "مطلوب";
    if (!formData.email.includes("@")) err.email = "بريد غير صحيح";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSaveInfo = async () => {
    if (!validateInfo()) return;

    try {
      setSaving(true);

      let payload;
      let headers = {};

      if (formData.profileImage instanceof File) {
        payload = new FormData();
        payload.append("fullName", formData.fullName);
        payload.append("email", formData.email);
        payload.append("job", formData.job);
        payload.append("phone", formData.phone);
        payload.append("profileImage", formData.profileImage);
        headers = { "Content-Type": "multipart/form-data" };
      } else {
        payload = {
          fullName: formData.fullName,
          email: formData.email,
          job: formData.job,
          phone: formData.phone,
        };
      }

      const response = await api.put("/auth/profile", payload, { headers });

      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setFormData({
          ...formData,
          profileImage: updatedUser.profileImage,
        });
        if (context && context.setUser) {
          context.setUser(updatedUser);
        }
        showSuccess("تم تحديث البيانات الشخصية بنجاح");
      }
    } catch (err) {
      console.error(err);
      showError(t("Profile.save_error") || "خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showError("كلمة المرور غير متطابقة");
    }

    try {
      setSaving(true);

      await api.post("/auth/change-password", passwordData);

      showSuccess("تم تغيير كلمة المرور");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showError(err.response?.data?.message || t("Common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center mt-5">{t("Common.loading")}</div>;

  const isRtl = i18n.language === "ar";

  return (
    <div className={`right-content w-100 ${isRtl ? "rtl" : "ltr"}`}>
      {/* Header */}
      <div className="card p-3 d-flex flex-row justify-content-between mb-4 shadow-sm border-0 align-items-center">
        <h5 className="mb-0 fw-bold">
          <FaUser className={`${isRtl ? "ms-2" : "me-2"} text-primary`} />
          {t("Profile.title")}
        </h5>
        <button
          className="btn btn-secondary shadow-sm d-flex align-items-center"
          onClick={() => navigate("/settings")}
        >
          <FaArrowRight className={isRtl ? "ms-2" : "me-2 rotate-180"} />{" "}
          {t("Common.back")}
        </button>
      </div>

      {/* Tabs */}
      <div
        className="card p-4 shadow-sm border-0"
        style={{ background: "var(--bg-card)", borderRadius: "15px" }}
      >
        <div className="d-flex gap-3 mb-4">
          <button
            className={`btn rounded-pill px-4 d-flex align-items-center ${tab === "info" ? "btn-primary shadow" : "btn-light"}`}
            onClick={() => setTab("info")}
          >
            <FaUser className={isRtl ? "ms-2" : "me-2"} /> {t("Profile.info")}
          </button>

          <button
            className={`btn rounded-pill px-4 d-flex align-items-center ${tab === "security" ? "btn-primary shadow" : "btn-light"}`}
            onClick={() => setTab("security")}
          >
            <FaLock className={isRtl ? "ms-2" : "me-2"} />{" "}
            {t("Profile.security")}
          </button>
        </div>

        {/* INFO TAB */}
        {tab === "info" && (
          <div className="row">
            <div className="col-md-12 text-center mb-4">
              <div
                className="position-relative d-inline-block p-1 border rounded-circle shadow-sm"
                style={{ backgroundColor: "var(--bg-body)" }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="rounded-circle object-fit-cover"
                    width="130"
                    height="130"
                    alt="profile"
                  />
                ) : (
                  <FaUserCircle
                    size={130}
                    className="text-primary opacity-25"
                  />
                )}

                <label
                  className="btn btn-primary btn-sm position-absolute rounded-circle p-2 border border-white border-2"
                  style={{
                    bottom: "5px",
                    [isRtl ? "left" : "right"]: "5px",
                    cursor: "pointer",
                  }}
                >
                  <FaImage />
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImage}
                  />
                </label>
              </div>
            </div>

            <div className="col-md-6 mb-3">
              <label className="fw-bold mb-2">{t("Members.name")} *</label>
              <input
                name="fullName"
                className="form-control"
                value={formData.fullName}
                onChange={handleChange}
                placeholder={t("Members.name")}
              />
              {errors.fullName && (
                <small className="text-danger">{errors.fullName}</small>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="fw-bold mb-2">
                {t("SignUpPage.enterYourUsername")}
              </label>
              <input
                name="username"
                className="form-control"
                value={formData.username}
                disabled
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="fw-bold mb-2">{t("Members.email")} *</label>
              <input
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />
              {errors.email && (
                <small className="text-danger">{errors.email}</small>
              )}
            </div>

            <div className="col-md-6 mb-3">
              <label className="fw-bold mb-2">{t("Members.phone")}</label>
              <input
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+201..."
              />
            </div>

            <div className="col-md-12 mb-3">
              <label className="fw-bold mb-2">
                {t("SignUpPage.enterYourJob") || "Job"}
              </label>
              <input
                name="job"
                className="form-control"
                value={formData.job}
                onChange={handleChange}
                placeholder="..."
              />
            </div>

            <div className="col-md-12 text-end mt-4">
              <button
                className={`btn btn-primary px-5 shadow-sm d-flex align-items-center gap-2 ${isRtl ? "me-auto" : "ms-auto"}`}
                onClick={handleSaveInfo}
                disabled={saving}
              >
                <FaSave /> {saving ? t("Common.loading") : t("Common.save")}
              </button>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {tab === "security" && (
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="mb-3">
                <label className="fw-bold mb-2">
                  {t("Profile.current_password")}
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="mb-3">
                <label className="fw-bold mb-2">
                  {t("Profile.new_password")}
                </label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="mb-3">
                <label className="fw-bold mb-2">
                  {t("Profile.confirm_password")}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="text-end mt-4">
                <button
                  className={`btn btn-warning px-5 shadow-sm d-flex align-items-center gap-2 ${isRtl ? "me-auto" : "ms-auto"}`}
                  onClick={handleChangePassword}
                  disabled={saving}
                >
                  <FaLock />{" "}
                  {saving ? t("Common.loading") : t("Profile.change_password")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
