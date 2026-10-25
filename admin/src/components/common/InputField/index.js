import React from 'react';
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useTranslation } from "react-i18next";

const InputField = ({
    type = "text",
    placeholder,
    icon,
    value,
    onChange,
    name,
    onFocus,
    onBlur,
    isFocus,
    showPasswordToggle,
    isShowPassword,
    onTogglePassword,
    error,
    autoFocus = false
}) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <div className="mb-3">
            <div className={`form-group position-relative ${isFocus ? "focus" : ""} ${error ? "border-danger" : ""}`}
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                {icon && (
                    <span className="icon" style={{
                        position: 'absolute',
                        top: '4px',
                        left: isRTL ? 'auto' : '10px',
                        right: isRTL ? '10px' : 'auto',
                        zIndex: 10,
                        fontSize: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        height: '38px',
                        color: '#5e5d72'
                    }}>
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    className="form-control"
                    style={{
                        paddingLeft: isRTL ? (showPasswordToggle ? '45px' : '12px') : (icon ? '45px' : '12px'),
                        paddingRight: isRTL ? (icon ? '45px' : '12px') : (showPasswordToggle ? '45px' : '12px'),
                        textAlign: isRTL ? 'right' : 'left',
                        height: '45px',
                        fontSize: '15px'
                    }}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    name={name}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    autoFocus={autoFocus}
                />
                {showPasswordToggle && (
                    <span
                        className="toggleShowPassword"
                        onClick={onTogglePassword}
                        style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            top: '11px',
                            left: isRTL ? '10px' : 'auto',
                            right: isRTL ? 'auto' : '10px',
                            zIndex: 10,
                            color: '#5e5d72',
                            fontSize: '20px'
                        }}
                    >
                        {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                    </span>
                )}
            </div>
            {error && <small className="text-danger d-block mt-1 ms-1 text-start">{error}</small>}
        </div>
    );
};

export default InputField;
