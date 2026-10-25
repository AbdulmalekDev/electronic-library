import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MyContext } from "../../App";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEyeOff, IoMdEye, IoMdHome } from "react-icons/io";
import { FaUserCircle, FaPhoneAlt, FaBriefcase } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import Logo from "../../assets/images/download.png";
import patter from "../../assets/images/Backgroudlogin_files/pattern.df9a7a28fc13484d1013.webp";
import GoogleLogoImge from "../../assets/images/GoogleLogoImge.png";

// Common Components
import InputField from "../../components/common/InputField";
import SubmitButton from "../../components/common/SubmitButton";

const SignUp = () => {
    const { t } = useTranslation();
    const [inputIndex, setInputIndex] = useState(null);
    const [isShowPassword, setisShowPassword] = useState(false);
    const [isShowConfirmPassword, setisShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formFields, setFormFields] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        job: ""
    });

    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: "",
        color: ""
    });

    const navigate = useNavigate();
    const { register } = useAuth();
    const { showSuccess, showError } = useNotification();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const onchangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields(prev => ({
            ...prev,
            [name]: value,
        }));

        if (name === "password") {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        let score = 0;
        if (!password) {
            setPasswordStrength({ score: 0, label: "", color: "" });
            return;
        }
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        let label = "";
        let color = "";

        switch (score) {
            case 0:
            case 1:
                label = t("SignUpPage.weak") || "Weak";
                color = "danger";
                break;
            case 2:
            case 3:
                label = t("SignUpPage.medium") || "Medium";
                color = "warning";
                break;
            case 4:
            case 5:
                label = t("SignUpPage.strong") || "Strong";
                color = "success";
                break;
            default:
                break;
        }

        setPasswordStrength({ score, label, color });
    };

    const validateForm = () => {
        if (!formFields.fullName) return t("SignUpPage.nameCannotBeBlank");
        if (!formFields.username) return t("SignUpPage.usernameCannotBeBlank");
        if (!formFields.email) return t("SignUpPage.emailCannotBeBlank");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formFields.email)) return t("SignUpPage.invalidEmail") || "البريد الإلكتروني غير صحيح";

        if (!formFields.password) return t("SignUpPage.passwordCannotBeBlank");
        if (passwordStrength.score < 4) return t("SignUpPage.passwordTooWeak") || "كلمة المرور ضعيفة جداً";

        if (formFields.password !== formFields.confirmPassword) return t("SignUpPage.passwordNotMatch");

        return null;
    };

    const signUp = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            showError(validationError);
            return;
        }

        setIsLoading(true);
        try {
            // Note: Backend register controller currently uses: { fullName, username, email, password, job }
            // We pass phone as well in case the model/controller is updated later.
            const res = await register({
                fullName: formFields.fullName,
                username: formFields.username,
                email: formFields.email,
                password: formFields.password,
                phone: formFields.phone,
                job: formFields.job
            });

            if (res.success) {
                showSuccess(t("SignUpPage.registerSuccess"));
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                showError(res.message || t("SignUpPage.registerFailed"));
            }
        } catch (error) {
            showError(error.response?.data?.message || t("SignUpPage.registerFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <img src={patter} className="loginPatter" alt="no-image" />
            <section className="loginSection signUpSection">
                <div className="row w-100 m-0">
                    <div className="col-md-8 d-flex align-items-center flex-column part1 justify-content-center">
                        <h1>
                            {t("SignUpPage.bestUxUi")}{" "}
                            <span className="text-sky">{t("SignUpPage.ecommerceDashboard")}</span> & {t("SignUpPage.adminPanel")}
                        </h1>
                        <p>{t("SignUpPage.signupDescription")}</p>
                        <div className="w-100 mt-4">
                            <Link to={"/"}>
                                <button className="btn btn-primary btn-lg btn-big">
                                    <IoMdHome className="me-2" />
                                    {t('SignUpPage.goToHome')}
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="col-md-4 pe-0">
                        <div className="loginBox">
                            <div className="logo text-center">
                                <img src={Logo} width={"60px"} alt="no-image" />
                                <h5 className="font-weight-bold">{t("SignUpPage.registerNewAccount")}</h5>
                            </div>
                            <div className="wrapper mt-3 card border p-4">
                                <form onSubmit={signUp}>
                                    <InputField
                                        placeholder={t("SignUpPage.enterYourName")}
                                        icon={<FaUserCircle />}
                                        name="fullName"
                                        value={formFields.fullName}
                                        onChange={onchangeInput}
                                        isFocus={inputIndex === 0}
                                        onFocus={() => setInputIndex(0)}
                                        onBlur={() => setInputIndex(null)}
                                        autoFocus
                                    />

                                    <InputField
                                        placeholder={t("SignUpPage.enterYourUsername")}
                                        icon={<FaUserCircle />}
                                        name="username"
                                        value={formFields.username}
                                        onChange={onchangeInput}
                                        isFocus={inputIndex === 1}
                                        onFocus={() => setInputIndex(1)}
                                        onBlur={() => setInputIndex(null)}
                                    />

                                    <InputField
                                        placeholder={t("SignUpPage.enterYourJob")}
                                        icon={<FaBriefcase />}
                                        name="job"
                                        value={formFields.job}
                                        onChange={onchangeInput}
                                        isFocus={inputIndex === 2}
                                        onFocus={() => setInputIndex(2)}
                                        onBlur={() => setInputIndex(null)}
                                    />

                                    <InputField
                                        placeholder={t("SignUpPage.enterYourPhone")}
                                        icon={<FaPhoneAlt />}
                                        name="phone"
                                        value={formFields.phone}
                                        onChange={onchangeInput}
                                        isFocus={inputIndex === 3}
                                        onFocus={() => setInputIndex(3)}
                                        onBlur={() => setInputIndex(null)}
                                    />

                                    <InputField
                                        type="email"
                                        placeholder={t("SignUpPage.enterYourEmail")}
                                        icon={<MdEmail />}
                                        name="email"
                                        value={formFields.email}
                                        onChange={onchangeInput}
                                        isFocus={inputIndex === 4}
                                        onFocus={() => setInputIndex(4)}
                                        onBlur={() => setInputIndex(null)}
                                    />

                                    <div className="mb-1">
                                        <InputField
                                            type={isShowPassword ? "text" : "password"}
                                            placeholder={t("SignUpPage.enterYourPassword")}
                                            icon={<RiLockPasswordFill />}
                                            name="password"
                                            value={formFields.password}
                                            onChange={onchangeInput}
                                            isFocus={inputIndex === 5}
                                            onFocus={() => setInputIndex(5)}
                                            onBlur={() => setInputIndex(null)}
                                            showPasswordToggle
                                            isShowPassword={isShowPassword}
                                            onTogglePassword={() => setisShowPassword(!isShowPassword)}
                                        />
                                        {formFields.password && (
                                            <div className="px-2 mb-2">
                                                <div className="progress" style={{ height: '5px' }}>
                                                    <div
                                                        className={`progress-bar bg-${passwordStrength.color}`}
                                                        role="progressbar"
                                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <small className={`text-${passwordStrength.color} d-block mt-1 text-start`}>
                                                    {passwordStrength.label}
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    <InputField
                                        type={isShowConfirmPassword ? "text" : "password"}
                                        placeholder={t("SignUpPage.confirmYourPassword")}
                                        icon={<IoShieldCheckmarkSharp />}
                                        name="confirmPassword"
                                        value={formFields.confirmPassword}
                                        onChange={onchangeInput}
                                        isFocus={inputIndex === 6}
                                        onFocus={() => setInputIndex(6)}
                                        onBlur={() => setInputIndex(null)}
                                        showPasswordToggle
                                        isShowPassword={isShowConfirmPassword}
                                        onTogglePassword={() => setisShowConfirmPassword(!isShowConfirmPassword)}
                                    />

                                    <div className="form-check mb-3 text-start">
                                        <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                                        <label className="form-check-label ms-2" htmlFor="agreeTerms">
                                            {t("SignUpPage.agreeTerms")}
                                        </label>
                                    </div>

                                    <SubmitButton
                                        isLoading={isLoading}
                                        text={t("SignUpPage.signUp")}
                                        loadingText={t("SignUpPage.loading") || "جاري الإنشاء..."}
                                    />

                                    <div className="form-group text-center mb-0">
                                        <div className="d-flex align-items-center justify-content-center or mt-3 mb-3">
                                            <span className="line"></span>
                                            <span className="txt">{t("SignUpPage.or")}</span>
                                            <span className="line"></span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary w-100 btn-lg btn-big loginWithGoogle d-flex align-items-center justify-content-center"
                                            onClick={() => showError("Google Sign-Up is temporarily unavailable.")}
                                        >
                                            <img src={GoogleLogoImge} width={"25px"} alt="no-image" className="me-2" /> {t("SignUpPage.signInWithGoogle")}
                                        </button>
                                    </div>
                                </form>
                                <span className="text-center d-block mt-3">
                                    {t("SignUpPage.alreadyHaveAccount")}
                                    <Link to={"/login"} className="link color ms-2 text-decoration-none fw-bold">
                                        {t("SignUpPage.signIn")}
                                    </Link>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SignUp;