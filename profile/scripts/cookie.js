// Функция для установки куки
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Время в миллисекундах
        expires = "; expires=" + date.toUTCString(); // Установка даты истечения срока действия куки
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/"; // Запись куки
}

// Функция для получения значения куки
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';'); // Разделение строки куки на отдельные элементы
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length); // Удаление пробелов
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length); // Возврат значения куки
    }
    return null; // Если куки не найдено
}

// Функция для удаления куки
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // Установка истекшего времени
}