// Функция для установки куки
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Устанавливаем срок хранения
        expires = "; expires=" + date.toUTCString(); // Форматируем строку для даты окончания
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/"; // Сохраняем куки
}

// Функция для получения значения куки
function getCookie(name) {
    let nameEQ = encodeURIComponent(name) + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i].trim(); // Чистим лишние пробелы
        if(c.startsWith(nameEQ)) return decodeURIComponent(c.slice(nameEQ.length)); // Возвращаем значение
    }
    return null; // Куки не найдено
}

// Функция для удаления куки
function eraseCookie(name) {
    document.cookie = encodeURIComponent(name) + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // Ставим устаревшую дату
}