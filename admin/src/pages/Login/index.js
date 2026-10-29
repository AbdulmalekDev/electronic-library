import React, {  useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import Logo from "../../assets/images/download.png";
import patter from "../../assets/images/Backgroudlogin_files/pattern.df9a7a28fc13484d1013.webp";
import GoogleLogoImge from "../../assets/images/GoogleLogoImge.png";

// Common Components
import InputField from "../../components/common/InputField";
import SubmitButton from "../../components/common/SubmitButton";

const Login = () => {
    const { t } = useTranslation();
    const [inputIndex, setInputIndex] = useState(null);
    const [isShowPassword, setisShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formFields, setFormFields] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const onchangeInput = (e) => {
        setFormFields(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        if (error) setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!formFields.email || !formFields.password) {
            showError(t("LoginPage.fillAllFields"));
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const res = await login(formFields.email, formFields.password);

            if (res.success) {
                showSuccess(t("LoginPage.loginSuccess"));
                navigate("/");
            } else {
                showError(res.message || t("LoginPage.loginFailed"));
            }
        } catch (err) {
            showError(err.response?.data?.message || t("LoginPage.loginFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <img src={patter} className="loginPatter" alt="no-image" />
            <section className="loginSection">
                <div className="loginBox">
                    <div className="logo text-center">
                        <img src={Logo} width={"60px"} alt="no-image" />
                        <h5 className="font-weight-bold">{t("LoginPage.loginToHotash")}</h5>
                    </div>
                    <div className="wrapper mt-3 card border p-4">
                        <form onSubmit={handleLogin}>
                            <InputField
                                type="text"
                                placeholder={t("LoginPage.enterYourEmail")}
                                icon={<MdEmail />}
                                name="email"
                                value={formFields.email}
                                onChange={onchangeInput}
                                isFocus={inputIndex === 0}
                                onFocus={() => setInputIndex(0)}
                                onBlur={() => setInputIndex(null)}
                                autoFocus
                            />

                            <InputField
                                type={isShowPassword ? "text" : "password"}
                                placeholder={t("LoginPage.enterYourPassword")}
                                icon={<RiLockPasswordFill />}
                                name="password"
                                value={formFields.password}
                                onChange={onchangeInput}
                                isFocus={inputIndex === 1}
                                onFocus={() => setInputIndex(1)}
                                onBlur={() => setInputIndex(null)}
                                showPasswordToggle
                                isShowPassword={isShowPassword}
                                onTogglePassword={() => setisShowPassword(!isShowPassword)}
                            />

                            <SubmitButton
                                isLoading={isLoading}
                                text={t("LoginPage.signIn")}
                                loadingText={t("Common.loading")}
                            />

                            <div className="form-group text-center">
                                <Link to={"/forgot-password"} className="link color ms-2 text-decoration-none fw-bold">
                                    {t("LoginPage.forgotPassword")}
                                </Link>
                            </div>

                            <div className="form-group text-center mb-0">
                                <div className="d-flex align-items-center justify-content-center or mt-3 mb-3">
                                    <span className="line"></span>
                                    <span className="txt">{t("LoginPage.or")}</span>
                                    <span className="line"></span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 btn-lg btn-big loginWithGoogle d-flex align-items-center justify-content-center"
                                    onClick={() => showError("Google Login is temporarily unavailable.")}
                                >
                                    <img src={GoogleLogoImge} width={"25px"} alt="no-image" className="me-2" /> {t("LoginPage.signInWithGoogle")}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="wrapper mt-3 card border footer p-3">
                        <span className="text-center">
                            {t("LoginPage.dontHaveAccount")}
                            <Link to={"/signup"} className="link color ms-2 text-decoration-none fw-bold">
                                {t("LoginPage.register")}
                            </Link>
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Login;
