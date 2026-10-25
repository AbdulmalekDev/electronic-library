import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from "../../App";
import bookService from '../../services/bookService';
import { FaStar, FaSearch, FaHeart, FaRegHeart, FaBook } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { getImageUrl } from '../../services/imageUtils';
import { useTheme } from '@mui/material/styles';

const Featured = () => {
    const { t } = useTranslation();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();
    const theme = useTheme();
    
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        // context.setisHideSidebarAndHeader(false);
        fetchFeaturedBooks();
    }, []);

    const fetchFeaturedBooks = async () => {
        try {
            context.setProgress(40);
            setLoading(true);
            const response = await bookService.getAllBooks({ featured: true, limit: 100 });
            if (response.data && response.data.success) {
                setFeaturedBooks(response.data.data.books || []);
            }
            context.setProgress(100);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching featured books:', error);
            showError(t("Common.error"));
            context.setProgress(100);
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const response = await bookService.getAllBooks({ search: term, limit: 10 });
            if (response.data && response.data.success) {
                const results = (response.data.data.books || []).filter(
                    book => !featuredBooks.some(fb => fb._id === book._id)
                );
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Error searching books:', error);
        } finally {
            setSearching(false);
        }
    };

    const toggleFeatured = async (book, isFeatured) => {
        try {
            context.setProgress(40);
            const response = await bookService.updateBook(book._id, { featured: isFeatured });
            if (response.data && response.data.success) {
                if (isFeatured) {
                    setFeaturedBooks(prev => [...prev, response.data.data]);
                    setSearchResults(prev => prev.filter(b => b._id !== book._id));
                    showSuccess(t("Featured.add_success"));
                } else {
                    setFeaturedBooks(prev => prev.filter(fb => fb._id !== book._id));
                    showSuccess(t("Featured.remove_success"));
                }
            }
            context.setProgress(100);
        } catch (error) {
            console.error('Error updating featured status:', error);
            showError(t("Common.error"));
            context.setProgress(100);
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-row p-4 align-items-center justify-content-between mb-4">
                <h5 className="mb-0 d-flex align-items-center gap-2 fw-bold">
                    <FaStar className="text-warning" /> {t("Featured.title")}
                </h5>
            </div>

            <div className="row g-4">
                <div className="col-md-7">
                    <div className="card shadow border-0 p-4 min-vh-50" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 opacity-75">
                            {t("Featured.current_featured")}
                            <span className="badge bg-primary rounded-pill shadow-sm ms-2">{featuredBooks.length}</span>
                        </h6>
                        <hr className="opacity-10" />

                        {loading ? (
                            <div className="text-center py-5">
                                <span className="spinner-border text-primary" role="status"></span>
                            </div>
                        ) : featuredBooks.length === 0 ? (
                            <div className="alert bg-primary bg-opacity-10 border-0 text-primary py-4 text-center fw-bold shadow-sm" style={{ borderRadius: '12px' }}>
                                {t("Featured.empty_list")}
                            </div>
                        ) : (
                            <div className="row g-3">
                                {featuredBooks.map(book => (
                                    <div className="col-md-6" key={book._id}>
                                        <div className="card h-100 border-0 p-3 position-relative shadow-sm transition-all hover-light flex-row overflow-hidden shadow-sm" style={{ background: "var(--bg-body)", borderRadius: '12px' }}>
                                            <div className="imgWrapper shadow-sm bg-light rounded" style={{ width: '80px', height: '110px' }}>
                                                {book.coverImage ? (
                                                    <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-100 h-100 object-fit-cover rounded" />
                                                ) : <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary-soft"><FaBook size={30} className="text-secondary opacity-50" /></div>}
                                            </div>
                                            <div className="ms-3 me-3 d-flex flex-column justify-content-center overflow-hidden w-100 text-start">
                                                <h6 className="text-truncate fw-bold mb-1 pe-4" title={book.title}>{book.title}</h6>
                                                <small className="text-muted text-truncate mb-2 opacity-75">{book.author}</small>
                                                <div><span className="badge bg-primary-soft text-primary px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.75rem' }}>{book.category}</span></div>
                                            </div>
                                            <button 
                                                className="btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle p-2 shadow-sm border-0 transition-all"
                                                style={{ color: theme.palette.heart.active, backgroundColor: 'transparent' }}
                                                onClick={() => toggleFeatured(book, false)}
                                                title={t("Common.delete")}
                                            >
                                                <FaHeart size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="card shadow border-0 p-4 sticky-top" style={{ top: '100px', background: "var(--bg-card)", borderRadius: '15px' }}>
                        <h6 className="fw-bold mb-4 opacity-75">{t("Featured.add_books")}</h6>
                        <div className="input-group input-group-lg shadow-sm border-0 mb-4 overflow-hidden rounded-3">
                            <span className="input-group-text bg-body border-0"><FaSearch className="text-primary opacity-50" /></span>
                            <input 
                                type="text" 
                                className="form-control bg-body border-0 shadow-none ps-0" 
                                placeholder={t("Featured.search_placeholder")} 
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {searching && <span className="input-group-text bg-body border-0"><span className="spinner-border spinner-border-sm text-primary"></span></span>}
                        </div>

                        <div className="overflow-auto pe-2 custom-scrollbar" style={{ maxHeight: '60vh' }}>
                            {searchResults.length > 0 ? (
                                <div className="d-flex flex-column gap-3">
                                    {searchResults.map(book => (
                                        <div key={book._id} className="card border-0 p-2 d-flex flex-row align-items-center shadow-sm transition-all hover-light ps-3 pe-3" style={{ cursor: 'pointer', background: "var(--bg-body)", borderRadius: '12px' }}>
                                            <div className="imgWrapper bg-light rounded shadow-sm overflow-hidden" style={{ width: '50px', height: '70px', flexShrink: 0 }}>
                                                {book.coverImage ? (
                                                    <img src={getImageUrl(book.coverImage)} alt={book.title} className="w-100 h-100 object-fit-cover rounded" />
                                                ) : <div className="w-100 h-100 d-flex align-items-center justify-content-center"><FaBook size={20} className="text-secondary opacity-25" /></div>}
                                            </div>
                                            <div className="ms-3 me-3 overflow-hidden flex-grow-1">
                                                <h6 className="mb-0 text-truncate fw-bold" style={{ fontSize: '14px' }}>{book.title}</h6>
                                                <small className="text-muted text-truncate d-block opacity-75" style={{ fontSize: '11px' }}>{book.author}</small>
                                            </div>
                                            <button 
                                                className="btn btn-sm rounded-circle p-2 shadow-sm border-0 transition-all transform-hover"
                                                style={{ color: theme.palette.heart.inactive, backgroundColor: 'transparent' }}
                                                onClick={() => toggleFeatured(book, true)}
                                                title={t("Common.add")}
                                            >
                                                <FaRegHeart size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : searchTerm.length >= 2 && !searching ? (
                                <div className="text-center py-5 text-muted opacity-50">
                                    <h6 className="fw-bold">{t("Featured.no_results")}</h6>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted opacity-50 d-flex flex-column align-items-center gap-3">
                                    <div className="bg-body p-4 rounded-circle shadow-sm">
                                        <FaBook size={40} className="text-primary opacity-25" />
                                    </div>
                                    <p className="mb-0 small fw-bold px-4">{t("Featured.start_searching")}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Featured;
