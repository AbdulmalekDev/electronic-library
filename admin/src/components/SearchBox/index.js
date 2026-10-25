import React from 'react';
import {IoSearch} from "react-icons/io5";
import { useTranslation } from "react-i18next";
const SearchBox = () => 
{
    const { t } = useTranslation();
    return (
        <div className='SearchBox posotion-relative d-flex align-items-center'>
            <IoSearch className="me-2" />
                <input type="text" placeholder={t("SearchBox.search_placeholder")}/>
        </div>

    )
}

export default SearchBox;
