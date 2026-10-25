const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'مورد غير موجود';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'قيمة مكررة';
    
    // Check which field has the duplicate
    const duplicateField = Object.keys(err.keyValue)[0];
    if (duplicateField === 'username') {
      message = 'اسم المستخدم مستخدم مسبقاً';
    } else if (duplicateField === 'email') {
      message = 'البريد الإلكتروني مستخدم مسبقاً';
    } else if (duplicateField === 'referenceNumber') {
      message = 'الرقم المرجعي مستخدم مسبقاً';
    }
    
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'رمز غير صحيح', statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    error = { message: 'انتهت صلاحية الرمز', statusCode: 401 };
  }

  console.error(err.stack);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;