export function formatDate(_date) {
    console.log(_date);
    let date = _date.getDate();
    let month = _date.getMonth() + 1;
    let year = _date.getFullYear();
    let formattedDate = `${year}${'-'}${month < 10 ? `0${month}` : `${month}`}${'-'}${date < 10 ? `0${date}` : `${date}`}`;
    console.log(formattedDate);
    return formattedDate;
}