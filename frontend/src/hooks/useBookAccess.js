import { useState, useCallback } from 'react';
import bookService from '../services/bookService';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Custom hook to unify book reading and downloading operations
 * Handles blob creation, download triggering, temporary object URL lifecycle, and error alerts
 */
export const useBookAccess = () => {
  const { showError, showSuccess } = useNotification();
  const [loadingBookId, setLoadingBookId] = useState(null);
  const [downloadingBookId, setDownloadingBookId] = useState(null);

  const extractErrorMessage = async (err, defaultMsg) => {
    if (err?.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const parsed = JSON.parse(text);
        if (parsed.message) return parsed.message;
      } catch (e) {
        // Fallback to default message
      }
    }
    return err?.response?.data?.message || defaultMsg;
  };

  const handleRead = useCallback(async (bookId) => {
    if (!bookId) return;
    try {
      setLoadingBookId(bookId);
      const response = await bookService.accessBook(bookId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up object URL after new tab starts loading
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Error opening book:', err);
      const msg = await extractErrorMessage(
        err,
        'فشل في فتح الكتاب للقراءة، يرجى التأكد من استيفاء شروط الاستعارة والصلاحيات'
      );
      showError(msg);
    } finally {
      setLoadingBookId(null);
    }
  }, [showError]);

  const handleDownload = useCallback(async (bookId, title) => {
    if (!bookId) return;
    try {
      setDownloadingBookId(bookId);
      const response = await bookService.downloadBook(bookId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'book'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      showSuccess('بدأ تحميل ملف الكتاب بنجاح');
    } catch (err) {
      console.error('Error downloading book:', err);
      const msg = await extractErrorMessage(
        err,
        'فشل في تحميل الكتاب، يرجى التأكد من صلاحية التحميل المعتمدة'
      );
      showError(msg);
    } finally {
      setDownloadingBookId(null);
    }
  }, [showError, showSuccess]);

  return {
    handleRead,
    handleDownload,
    loadingBookId,
    downloadingBookId,
    isLoading: Boolean(loadingBookId),
    isDownloading: Boolean(downloadingBookId)
  };
};

export default useBookAccess;

