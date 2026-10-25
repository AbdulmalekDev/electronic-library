import Button from "@mui/material/Button";
import { MdDashboard } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";
import { FaProductHunt } from "react-icons/fa";
import { FaCartArrowDown } from "react-icons/fa6";
import { MdMessage } from "react-icons/md";
import { FaBell } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { IoMdLogOut } from "react-icons/io";
import { Link } from "react-router-dom";
import {  useState } from "react";
import { RiAccountCircleLine } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
// import { MyContext } from "../../App";useContext,
const Sidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isToggleSubMenu, setIsToggleSubMenu] = useState(false);
  // const context = useContext(MyContext);
  const isOpenSubmenu = (index) => {
    setActiveTab(index);
    setIsToggleSubMenu(!isToggleSubMenu);
  };
  return (
    <>
      <div className="siderbar">
        <ul className="menu-list">
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 0 ? 'active' : ''} `}
                onClick={() => isOpenSubmenu(0)}
              >
                <span className="icon">
                  <MdDashboard />
                </span>
                Dashboard
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Button
              className={`w-100 ${
                activeTab === 1 && isToggleSubMenu === true ? "active" : ""
              } `}
              onClick={() => isOpenSubmenu(1)}
            >
              <span className="icon">
                <FaProductHunt />
              </span>
              Products
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 1 && isToggleSubMenu === true
                  ? "colapse"
                  : "colapsed"
              } `}
            >
              <ul className="submenu">
                <li>
                  <Link to="/products">Product List</Link>
                </li>
                <li>
                  <Link to="/product/details">Product View</Link>
                </li>
                <li>
                  <Link to="/product/upload">Product Upload</Link>
                </li>
              </ul>
            </div>
          </li>
          
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 2 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(2)}
              >
                <span className="icon">
                  <FaCartArrowDown />
                </span>
                Orders
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 3 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(3)}
              >
                <span className="icon">
                  <MdMessage />
                </span>
                Messages
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 4 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(4)}
              >
                <span className="icon">
                  <FaBell />
                </span>
                Notifications
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 5 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(5)}
              >
                <span className="icon">
                  <IoIosSettings />
                </span>
                Settings
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to={'/login'}>
            <Button
              className={`w-100 ${activeTab === 6 ? "active" : ""} `}
              onClick={() => isOpenSubmenu(6)}
            >
              <span className="icon">
                <FaUser />
              </span>
              Login
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            </Link>
          </li>
          <li>
            <Link to={'/signUp'}>
              <Button
                className={`w-100 ${activeTab === 7 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(7)}
              >
                <span className="icon">
                  <FaUser />
                </span>
                Sign Up
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 8 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(8)}
              >
                <span className="icon">
                  <FaCartArrowDown />
                </span>
                Orders
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 9 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(9)}
              >
                <span className="icon">
                  <MdMessage />
                </span>
                Messages
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Button
                className={`w-100 ${activeTab === 10 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(10)}
              >
                <span className="icon">
                  <FaBell />
                </span>
                Notifications
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link>
          </li>
          <li>
           
            {/* <Link to="/">
              <Button
                className={`w-100 ${activeTab === 11 ? "active" : ""} `}
                onClick={() => isOpenSubmenu(11)}
              >
                <span className="icon">
                  <FaBell />
                </span>
                Notifications
                <span className="arrow">
                  <FaAngleRight />
                </span>
              </Button>
            </Link> */}
          </li>
        </ul>
        {/* <br/> */}
        <div className="logoutWrapper">
          <div className="logoutBox">
            <Button variant="contained">
              <IoMdLogOut />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar;
