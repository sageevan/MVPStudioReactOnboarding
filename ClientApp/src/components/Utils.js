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


export function checkCurrencyFormat(price) {
    let count = 0;

    // looping through the items
    for (let i = 0; i < price.length; i++) {

        // check if the character is at that position
        if (price.charAt(i) == '.') {
            count += 1;
        }
    }
    console.log(count);
    if (count == 1 && /^(\d+.)*(\d+)$/.test(price)) {
        return false;
    } else {
        return true;
    }

}

