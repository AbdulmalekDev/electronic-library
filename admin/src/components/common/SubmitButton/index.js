import React from 'react';

const SubmitButton = ({ 
    isLoading, 
    loadingText, 
    text, 
    icon, 
    className = "btn btn-primary btn-lg w-100 btn-big p-3",
    type = "submit",
    disabled = false
}) => {
    return (
        <div className="form-group">
            <button
                type={type}
                className={className}
                disabled={isLoading || disabled}
            >
                {isLoading ? (
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        {loadingText || "جاري التحميل..."}
                    </div>
                ) : (
                    <div className="d-flex align-items-center justify-content-center">
                        {icon && <span className="me-2 d-flex">{icon}</span>}
                        {text}
                    </div>
                )}
            </button>
        </div>
    );
};

export default SubmitButton;
