import { HiDotsVertical } from "react-icons/hi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { IoIosTimer } from "react-icons/io";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const DashboardBox = (props) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = i18n.language === 'ar';

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div
      className="dashboardBox"
      style={{
        backgroundImage: `linear-gradient(to ${isRtl ? 'left' : 'right'}, ${props.color[0]}, ${props.color[1]})`,
      }}
    >
      {/* Grow/Down Icon */}
      {props.grow ? (
        <span className="chart">
          <FaArrowUp />
        </span>
      ) : (
        <span className="chart">
          <FaArrowDown />
        </span>
      )}

      {/* Info Section */}
      <div className="d-flex w-100 align-items-center">
        <div className="col1 flex-grow-1">
          <h4 className="text-white mb-1" style={{ fontSize: '0.95rem', opacity: 0.85 }}>{props.title}</h4>
          <span className="text-white fw-bold" style={{ fontSize: '1.8rem', lineHeight: 1 }}>
            {props.count
              ? typeof props.count === "object"
                ? Object.values(props.count).find((val) => typeof val === "number")
                : props.count
              : 0}
          </span>
        </div>

        {/* Top Icon */}
        <div>
          {props.icon && (
            <span
              className="icon d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '1.3rem'
              }}
            >
              {props.icon}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Section with Dropdown */}
      <div className="d-flex align-items-center w-100 bottomEle mt-3">
        <h6 className="text-white mb-0 mt-0 opacity-75" style={{ fontSize: '0.8rem' }}>{t("DashboardBox.last_month")}</h6>

        <div className={`${isRtl ? 'me-auto' : 'ms-auto'} dropdown position-relative`}>
          <button className="btn text-white p-0 border-0" onClick={toggleDropdown}>
            <HiDotsVertical size={18} />
          </button>

          {isOpen && (
            <div
              className={`dropdown-menu ${isRtl ? 'dropdown-menu-start' : 'dropdown-menu-end'} show shadow border-0 p-2`}
              style={{ position: 'absolute', top: '25px', zIndex: 1000, minWidth: '150px' }}
            >
              <button className="dropdown-item d-flex align-items-center py-2 gap-2" onClick={() => setIsOpen(false)}>
                <IoIosTimer /> {t("DashboardBox.last_day")}
              </button>
              <button className="dropdown-item d-flex align-items-center py-2 gap-2" onClick={() => setIsOpen(false)}>
                <IoIosTimer /> {t("DashboardBox.last_week")}
              </button>
              <button className="dropdown-item d-flex align-items-center py-2 gap-2" onClick={() => setIsOpen(false)}>
                <IoIosTimer /> {t("DashboardBox.last_month")}
              </button>
              <button className="dropdown-item d-flex align-items-center py-2 gap-2" onClick={() => setIsOpen(false)}>
                <IoIosTimer /> {t("DashboardBox.last_year")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBox;
