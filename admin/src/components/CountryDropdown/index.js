// import React, { useContext, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Button from "@mui/material/Button";
// import { FaAngleDown } from "react-icons/fa6";
// import "../../App.css";
// import Dialog from "@mui/material/Dialog";
// import { IoIosSearch } from "react-icons/io";
// import { MdClose, MdFilterList } from "react-icons/md";
// import { useState } from "react";
// import Slide from "@mui/material/Slide";
// import { MyContext } from "../../App";
// import { Link, useParams } from "react-router-dom";
// import { TransitionProps } from "@mui/material/transitions";
// const Transition = React.forwardRef(function Transition(
//   props: TransitionProps & {
//     children: React.ReactElement<any, any>,
//   },
//   ref: React.Ref<unknown>
// ) {
//   return <Slide direction="up" ref={ref} {...props} />;
// });
// const CountryDropdown = (props) => {
//   const {t} = useContext(MyContext);
//   const [IsOpenModal, setIsOpenModal] = useState(false);
//   const [selectedTab, setselectedTab] = useState(null);
//   const [countryList, setCountryList] = useState([]);
//     let { id } = useParams();
//   const context = useContext(MyContext);
//   const selectCountry = (index, country) => {
//     setselectedTab(index);
//     setIsOpenModal(false);
//     context.setselectedtCountry(country);
//   };

//     useEffect(() => {
//     // context.setSelectedLocation(props.selectedLocation);
//     setCountryList(context.countryList);
//   }, []);

//   useEffect(() => {
//     context.setselectedtCountry(props.selectedLocation);
//     setCountryList(context.countryList);
//   }, [props.selectedLocation]);

//   const filterList = (e) => {
//     const keyword = e.target.value.toLowerCase();
//     if (keyword !== "") {
//       const list = countryList.filter((item) => {
//         return item.country.toLowerCase().includes(keyword);
//       });
//       setCountryList(list);
//     } else {
//       setCountryList(context.countryList);
//     }
//   };
//   // useEffect(()=>{})
//   return (
//     <>
//       <Button className="countryDrop" onClick={() => setIsOpenModal(true)}>
//         <div className="text-info d-flex flex-column">
//           {/* <span className="lable">Your Location </span> */}
//           <span className="name">
//             {context.selectedtCountry !== ""
//               ? context.selectedtCountry?.length > 10
//                 ? context.selectedtCountry?.substr(0, 10) + "...."
//                 : context.selectedtCountry
//               : t("CountryDropdown.selectLocation")}
//           </span>
//         </div>
//         <span className="ms-auto">
//           <FaAngleDown />
//         </span>
//       </Button>

//       <Dialog
//         open={IsOpenModal}
//         onClose={() => setIsOpenModal(false)}
//         className="locationModel"
//         slots={{ transition: Transition }}
//       >
//         <h4 className="mb-0">{t("CountryDropdown.chooseDeliveryLocation")} </h4>
//         <p>{t("CountryDropdown.enterAddress")}</p>
//         <Button className="close_" onClick={() => setIsOpenModal(false)}>
//           <MdClose />
//         </Button>
//         <div className="headerSearch w-100">
//           <input
//             type="text"
//             placeholder={t("CountryDropdown.searchYourArea")}
//             onChange={filterList}
//           />
//           <Button>
//             {" "}
//             <IoIosSearch />
//           </Button>
//         </div>
//         <ul className="countryList mt-3">
//           {countryList?.length !== 0 &&
//             countryList?.map((item, index) => {
//               return (
//                 <li key={index}>
//                   <Button
//                     onClick={() => selectCountry(index, item.country)}
//                     className={`${selectedTab === index ? "active" : " "}`}
//                   >
//                     {item.country}
//                   </Button>
//                 </li>
//               );
//             })}
//         </ul>
//       </Dialog>
//     </>
//   );
// };

// export default CountryDropdown;
