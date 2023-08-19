import React from 'react';
import './Popup.css';

export function Popup(props) {
    return (props.trigger) ? (
        <div className="popup">
            <div className="popup-inner">
                {props.children}
            </div>
        </div>
    ) : "";
}

export function formatDate(_date) {
    let date = _date.getDate();
    let month = _date.getMonth() + 1;
    let year = _date.getFullYear();
    let formattedDate = `${year}${'-'}${month < 10 ? `0${month}` : `${month}`}${'-'}${date < 10 ? `0${date}` : `${date}`}`;
    return formattedDate;
}

