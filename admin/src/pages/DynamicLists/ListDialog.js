import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  useTheme,
  Box,
  Typography,
} from "@mui/material";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import dynamicListService from "../../services/dynamicListService";
import { useNotification } from "../../contexts/NotificationContext";
import { MyContext } from "../../App";
import { useTranslation } from "react-i18next";

const ListDialog = ({ open, onClose, listData }) => {
  const { showSuccess, showError } = useNotification();
  const context = useContext(MyContext);
  const theme = useTheme();
  const { t } = useTranslation();
  const isEdit = Boolean(listData);

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    items: [],
  });

  const [deleteDialog, setDeleteDialog] = useState({ open: false, index: null });

  useEffect(() => {
    if (listData) {
      setFormData({
        name: listData.name || "",
        label: listData.label || "",
        items: listData.items || [],
      });
    }
  }, [listData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { value: "", label: "", color: "#0858f7" }],
    });
  };

  const confirmRemoveItem = (index) => {
    if (formData.items.length <= 1) {
      showError(t("Common.error") || "Cannot delete the last item");
      return;
    }
    setDeleteDialog({ open: true, index });
  };

  const executeRemoveItem = () => {
    const { index } = deleteDialog;
    if (index !== null) {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      setFormData({ ...formData, items: newItems });
      showSuccess(t("Common.success"));
    }
    setDeleteDialog({ open: false, index: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      context.setProgress(40);

      if (isEdit) {
        await dynamicListService.updateList(listData._id, formData);
        showSuccess(t("Common.success"));
      } else {
        await dynamicListService.createList(formData);
        showSuccess(t("Common.success"));
      }
      context.setProgress(100);
      onClose(true); // true to refresh the main list
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || t("Common.error"));
      context.setProgress(100);
    }
  };

  const inputBg = theme.palette.mode === "dark" ? "#121212" : "#f5f5f5";

  return (
    <>
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
      dir="rtl"
    >
      <DialogTitle
        className="fw-bold bg-light"
        style={{ backgroundColor: theme.palette.background.paper }}
      >
        {isEdit ? t("dynamicLists.editList") : t("dynamicLists.newList")}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent
          dividers
          style={{ backgroundColor: theme.palette.background.default }}
        >
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <TextField
                label={t("dynamicLists.listName")}
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                disabled={isEdit}
                dir="ltr"
                placeholder={t("dynamicLists.placeholderName")}
                sx={{ backgroundColor: theme.palette.background.paper }}
              />
            </div>
            <div className="col-md-6">
              <TextField
                label={t("dynamicLists.listLabel")}
                name="label"
                value={formData.label}
                onChange={handleChange}
                fullWidth
                required
                sx={{ backgroundColor: theme.palette.background.paper }}
              />
            </div>

            <div className="col-12 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6
                  className="fw-bold m-0"
                  style={{ color: theme.palette.text.primary }}
                >
                  {t("dynamicLists.itemsList")}
                </h6>
                <Button
                  startIcon={<FaPlus />}
                  onClick={addItem}
                  variant="contained"
                  size="small"
                  disableElevation
                >
                  {t("dynamicLists.addItem")}
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "relative",
                    display: "flex",
                    gap: 3,
                    alignItems: "center",
                    mb: 2,
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    boxShadow: 1,
                    backgroundColor: theme.palette.background.paper,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                  }}
                >
                    
                  <TextField
                    label={t("dynamicLists.itemValue")}
                    size="small"
                    value={item.value}
                    onChange={(e) =>
                      handleItemChange(index, "value", e.target.value)
                    }
                    required
                    dir="ltr"
                    fullWidth
                  />
                  <TextField
                    label={t("dynamicLists.itemLabel")}
                    size="small"
                    value={item.label}
                    onChange={(e) =>
                      handleItemChange(index, "label", e.target.value)
                    }
                    required
                    fullWidth
                  />
                  <div className="d-flex align-items-center gap-2">
                    <label
                      className="small mb-0"
                      style={{
                        whiteSpace: "nowrap",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {t("dynamicLists.itemColor")}:
                    </label>
                    {/* <input
                                            type="color"
                                            value={item.color}
                                            onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                                            style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: 'transparent' }}
                                        /> */}
                    <TextField
                      label={t("dynamicLists.itemColor")}
                      size="small"
                      value={item.color}
                      onChange={(e) =>
                        handleItemChange(index, "color", e.target.value)
                      }
                      required
                      fullWidth
                      placeholder={t("dynamicLists.placeholderColor")}
                      inputProps={{ dir: "ltr" }}
                    />
                  </div>
                  <div className="d-flex align-items-center">
                    <IconButton 
                      onClick={() => confirmRemoveItem(index)} 
                      size="small" 
                      color="error"
                      sx={{ 
                        color: "#f44336", 
                        bgcolor: "transparent",
                        border: "1px solid #f44336",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "#f44336", color: "#fff", transform: "scale(1.1)" } 
                      }}
                    >
                      <FaTimes size={16} />
                    </IconButton>
                  </div>
                </Box>
              ))}
              {formData.items.length === 0 && (
                <div
                  className="text-center p-4 border rounded"
                  style={{
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t("dynamicLists.noItems")}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions
          style={{ backgroundColor: theme.palette.background.paper }}
        >
          <Button
            onClick={() => onClose(false)}
            color="inherit"
            style={{ color: theme.palette.text.primary }}
          >
            {t("Common.cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disableElevation
          >
            {t("dynamicLists.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>

    {/* Professional Delete Confirmation Dialog */}
    <Dialog
      open={deleteDialog.open}
      onClose={() => setDeleteDialog({ open: false, index: null })}
      maxWidth="xs"
      fullWidth
      dir={document.documentElement.dir || "rtl"}
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
        {t("Common.delete")}
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">
          {t("Common.confirmDelete")}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => setDeleteDialog({ open: false, index: null })} 
          color="inherit"
        >
          {t("Common.cancel")}
        </Button>
        <Button 
          onClick={executeRemoveItem} 
          variant="contained" 
          color="error" 
          disableElevation
        >
          {t("Common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default ListDialog;
