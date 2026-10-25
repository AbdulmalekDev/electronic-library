import React, { useState, useEffect, useContext } from 'react';
import { MyContext } from "../../App";
import dynamicListService from '../../services/dynamicListService';
import { FaPlus, FaEdit, FaTrash, FaListAlt, FaTimes } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNotification } from '../../contexts/NotificationContext';
import { IconButton, Tooltip, Chip } from '@mui/material';
import ListDialog from './ListDialog';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const DynamicLists = () => {
    const { t } = useTranslation();
    const context = useContext(MyContext);
    const { showSuccess, showError } = useNotification();
    
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedList, setSelectedList] = useState(null);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            context.setProgress(40);
            setLoading(true);
            const response = await dynamicListService.getLists();
            if (response.success) {
                setLists(response.data || []);
            }
            context.setProgress(100);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dynamic lists:', error);
            showError(t("Common.error") || "Error fetching lists");
            context.setProgress(100);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm(t("Common.confirmDelete") || "Are you sure you want to delete this item?")) {
            try {
                context.setProgress(40);
                await dynamicListService.deleteList(id);
                showSuccess(t("Common.success"));
                fetchLists();
                context.setProgress(100);
            } catch (error) {
                showError(t("Common.error"));
                context.setProgress(100);
            }
        }
    };

    const handleOpenDialog = (list = null) => {
        setSelectedList(list);
        setDialogOpen(true);
    };

    const handleCloseDialog = (shouldRefresh = false) => {
        setDialogOpen(false);
        setSelectedList(null);
        if (shouldRefresh) {
            fetchLists();
        }
    };

    return (
        <div className="right-content w-100">
            <div className="card shadow border-0 w-100 flex-column p-4 justify-content-between mb-4" style={{ borderRadius: '15px' }}>
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <h4 className="mb-2 fw-bold d-flex align-items-center gap-2">
                            <FaListAlt className="text-primary" /> {t("dynamicLists.title")}
                        </h4>
                        <p className="text-muted mb-0 small">{t("dynamicLists.subtitle")}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {/* <LanguageSwitcher /> */}
                        <button className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" onClick={() => handleOpenDialog()}>
                            <FaPlus /> {t("dynamicLists.addList")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card shadow border-0 overflow-hidden" style={{ background: "var(--bg-card)", borderRadius: '15px' }}>
                <div className="table-responsive">
                    <table className="table v-align text-center custom-table m-0">
                        <thead>
                            <tr>
                                <th className="text-start">{t("dynamicLists.listName")}</th>
                                <th className="text-start">{t("dynamicLists.listLabel")}</th>
                                <th>{t("dynamicLists.items")}</th>
                                <th>{t("dynamicLists.createdAt")}</th>
                                <th>{t("Common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="py-5 text-center"><div className="spinner-border text-primary"></div></td></tr>
                            ) : lists.length > 0 ? lists.map(list => (
                                <tr key={list._id}>
                                    <td className="text-start fw-bold small" dir="ltr">{list.name}</td>
                                    <td className="text-start">{list.label}</td>
                                    <td>
                                        <div className="d-flex flex-wrap gap-2 justify-content-center pt-2">
                                            {list.items?.map((item, idx) => (
                                                <div key={idx} style={{ position: "relative", display: "inline-flex" }}>
                                                    <Chip 
                                                        label={item.label} 
                                                        size="small" 
                                                        style={{ backgroundColor: item.color, color: '#fff' }} 
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            if (window.confirm(t("Common.confirmDelete") || "Are you sure you want to delete this item?")) {
                                                                const newItems = [...list.items];
                                                                newItems.splice(idx, 1);
                                                                dynamicListService.updateList(list._id, { ...list, items: newItems })
                                                                    .then(() => fetchLists())
                                                                    .catch(() => showError(t("Common.error")));
                                                            }
                                                        }}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: -8,
                                                            right: -8,
                                                            width: 18,
                                                            height: 18,
                                                            minWidth: 18,
                                                            bgcolor: '#f44336',
                                                            color: '#fff',
                                                            zIndex: 1, // إبقاء zIndex منخفض حتى لا يتداخل مع المنبثقات الأخرى
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                            '&:hover': {
                                                                bgcolor: '#d32f2f',
                                                                transform: 'scale(1.1)'
                                                            }
                                                        }}
                                                    >
                                                        <FaTimes size={10} />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            {(!list.items || list.items.length === 0) && <span className="text-muted small">{t("Common.no_data")}</span>}
                                        </div>
                                    </td>
                                    <td className="small text-muted">{new Date(list.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-1">
                                            <Tooltip title={t("Common.edit")}>
                                                <IconButton onClick={() => handleOpenDialog(list)} size="small" className="bg-primary-soft text-primary shadow-sm mx-1">
                                                    <FaEdit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t("Common.delete")}>
                                                <IconButton onClick={() => handleDelete(list._id)} size="small" className="bg-danger-soft text-danger shadow-sm mx-1">
                                                    <FaTrash fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="py-5 text-center text-muted opacity-50 fs-5">{t("dynamicLists.noLists")}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {dialogOpen && (
                <ListDialog 
                    open={dialogOpen} 
                    onClose={handleCloseDialog} 
                    listData={selectedList} 
                />
            )}
        </div>
    );
};

export default DynamicLists;
