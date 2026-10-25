import React from "react";
import { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";

import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import CircularProgress from '@mui/material/CircularProgress';
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import clotheimge from "../../assets/images/clothe.webp";
import Pagination from "@mui/material/Pagination";
import { MyContext } from "../../App";
//start code copy
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import MdExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Checkbox from "@mui/material/Checkbox";
import { deteteData, editData, fetchDataFromApi } from "../../utils/api";
import { deleteData } from '../../utils/api'
const label = { inputProps: { "aria-label": "Checkbox demo" } };

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];

  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});
//End copy code

const data = [
  ["Year", "Sales", "Expenses"],
  ["2013", 1000, 400],
  ["2014", 1170, 460],
  ["2015", 660, 1120],
  ["2016", 1030, 540],
];

const options = {
  backgroundColor: "transparent",
  chartArea: { width: "100%", height: "80%" },
};

const Category = () => {
  const [catData, setCataData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [editFileds , SetEditeFileds] = useState({});
  const [editId, setEditId] = useState(null);
  const [page, setPage ] = useState(1);
  const [isLoading , setIsLoading ]= useState(false);
  const [formFields , setFormFields] = useState ({
    name:'',
    images:[],
    color:''
  });
  const [anchorEl, setAnchorEl] = useState(null);

  const context = useContext(MyContext);
  useEffect(() => {
    // context.setisHideSidebarAndHeader(false);
    window.scrollTo(0,0);
    context.setProgress(20);
    fetchDataFromApi("/api/category").then((res) => {
      setCataData(res);
      // console.log(res);
      context.setProgress(100);
    });
  }, []);

  const changeInput =(e)=>{
    setFormFields(()=>(
      {
        ...formFields,
        [e.target.name]:e.target.value
      }
    ))
  }
  const addImageUrl =(e)=>{
    const arr=[];
    arr.push(e.target.value);
     setFormFields(()=>(
      {
        ...formFields,
        [e.target.name]:arr
      }
    ))
  }
  const handleClose = () => {
    setOpen(false);
  };
  const editCateory = (id) => {
      setFormFields({
        name:'',
        images:'' ,
        color:'' 
      });
    setOpen(true);
    setEditId(id);
    
      fetchDataFromApi(`/api/category/${id}`).then((res) => {
        setFormFields({
        name:res.name ,
        images:res.images ,
        color:res.color 
      })
        
      // setCataData(res);
      // console.log(res);
    });
  };
  const cateoryEditeFun =(e)=>{
   e.preventDefault();
    setIsLoading(true);
    context.setProgress(40);
  editData(`/api/category/${editId}`,formFields).then((res)=>{
      fetchDataFromApi(`/api/category`).then((res) => {
      setCataData(res);
      setOpen(false);
      setIsLoading(false);

    });
    context.setAlterBox({
      open:true,
      error:false,
      msg:'The Category Update !'
      
    });
    context.setProgress(100);
  })
}
const deleteCat=(id)=>{
  deleteData(`/api/category/${id}`).then((res)=>{
       fetchDataFromApi(`/api/category`).then((res) => {
      setCataData(res);
      });
  })
}
const handleChange = (event ,value )=>{
   context.setProgress(40);
      fetchDataFromApi(`/api/category?page=${value}`).then((res) => {
      setCataData(res);
      // console.log(res);
       context.setProgress(100);
      });
}
  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Category List</h5>
          <div className="ms-auto d-flex align-items-center">
          <Breadcrumbs aria-label="breadcrumb" className="ms-auto breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Category"
              icon={<HomeIcon fontSize="small" />}
            />
            <StyledBreadcrumb
              label="Category"
              deleteIcon={<MdExpandMore fontSize="small" />}
            />
          </Breadcrumbs>
          <Link to="/category/add"><Button className="btn-blue ms-3 pe-3 ps-3">Add Category</Button></Link>
          </div>
        </div>

       

        <div className="card shadow border-0 p-3 mt-4">
          <div className="table-responsive mt-3">
            <table className="table table-bordered v-align">
              <thead className="thead-dark">
                <tr>
                  <th>UID</th>
                  <th style={{ width: "100px" }}>Image</th>
                  <th>Category</th>
                  <th>Color</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {catData?.categoryList?.length !== 0 && catData?.
                  categoryList?.map((item, index) => {
                    return (
                      <tr>
                        <td>
                          <div className="d-flex align-items-center ms-1">
                            <Checkbox {...label} />
                            <span>#{index + 1}</span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center productBox">
                            <div className="imgWrapper">
                              <div className="img card shadow m-0">
                                <img
                                  src={item.images?.[0]}
                                  alt="ImageNotFound"
                                  className="w-100"
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{item.name}</td>
                        <td>{item.color}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            {/* <Link to="/products/details">
                        <Button color="secondary" className="secondary">
                        <FaEye/></Button>
                        </Link> onClick={editCat}*/}

                            <Button
                              color="success"
                              className="success"
                              onClick={()=>editCateory(item._id)}
                            >
                              <FaPencilAlt />
                            </Button>
                            <Button color="error" className="error" onClick={()=>deleteCat(item._id)}>
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="d-flex tableFooter">
                <Pagination
                count={catData?.totalPages}
                color="primary"
                className="pagination"
                showFirstButton
                showLastButton
                onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      <Dialog
        className="editModel"
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Edit Category</DialogTitle>
        <form  >
        <DialogContent>
           <div className="form-group mb-3">
           <TextField
            autoFocus
            required
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            value={formFields.name}
            onChange={changeInput}
          />
         </div>
          <div className="form-group mb-3">
            <TextField
            autoFocus
            required
            margin="dense"
            name="images"
            label="Category Image"
            type="text"
            fullWidth
            value={formFields.images}
             onChange={addImageUrl}
          />
          </div>
           <div className="form-group mb-3">
           <TextField
            autoFocus
            required
            margin="dense"
            name="color"
            label="Category Color"
            type="text"
            fullWidth 
            value={formFields.color}
            onChange={changeInput}
          />
          </div>
           
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            Cancel
          </Button>
          <Button onClick={cateoryEditeFun} variant="contained" color="primary">
           {  isLoading===true ?  <CircularProgress color="inherit" className="ms-3 loader" />
           : 'Submit'  }
          </Button>
        </DialogActions>
        </form>
        <br/>
      </Dialog>
    </>
  );
};
export default Category;
