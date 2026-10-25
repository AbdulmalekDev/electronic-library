// import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/navigation";
// import { Navigation } from "swiper/modules";
// import { InnerImageZoom } from "react-inner-image-zoom";
// import "@fortawesome/fontawesome-free/css/all.min.css";
// import "./index.css";
// import { MyContext, myContext } from "../../App";
// import { useContext, useRef, useState } from "react";
// const ProductZoom = (props) => {
//   // console.log(props)
//   const [slideIndex, setSlideIndex] = useState(0);
//   const zoomSliderBig = useRef();
//   const zoomSlider = useRef();

//   const context = useContext(MyContext);

//   const goto = (index) => {
//     setSlideIndex(index);
//     zoomSlider.current.swiper.slideTo(index);
//     zoomSliderBig.current.swiper.slideTo(index);
//     // zoomSlider.current?.slickGoTo(index);
//     // zoomSliderBig.current?.slickGoTo(index);
//   };

//   return (
//     <div className="productZoom">
//       <div className="productZoom  productZoomBig position-relative mb-3">
//         <div className="badge bg-primary">{props?.discount}%</div>
//         <Swiper
//           slidesPerView={1}
//           spaceBetween={0}
//           navigation={false}
//           slidesPerGroup={1}
//           modules={[Navigation]}
//           className="zoomSliderBig"
//           ref={zoomSliderBig}>
//           {
//           props?.images?.map((item,index) => {
//             return (
//               <SwiperSlide>
//               <div className="item"  key={index}>
//                   <InnerImageZoom
//                     zoomType="hover"
//                     zoomScale={1}
//                     src={`http://localhost:5000/upload/${item}`}
//                     className="w-100"/>
//                 </div>
//               </SwiperSlide>
//             )
//           })}
//         </Swiper>
//       </div>

//       <Swiper
//         slidesPerView={4}
//         spaceBetween={0}
//         navigation={true}
//         slidesPreGrop={1}
//         modules={[Navigation]}
//         className="zoomSlider"
//         ref={zoomSlider} >
//             {
//           props?.images?.map((img,index) => {
//             return (
//               <SwiperSlide>
//           <div className={`item ${slideIndex === index && "item_active"} `} key={index}>
//             <img
//               src={`http://localhost:5000/upload/${img}`}
//               className="w-100"
//               onClick={() => goto(index)} 
//               alt="no-image"/>
//           </div>
//               </SwiperSlide>
//             )
//           })}
      
//       </Swiper>
//     </div>
//   );
// };
// export default ProductZoom;
