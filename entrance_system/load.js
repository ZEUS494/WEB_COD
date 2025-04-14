document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    const content = document.querySelector('.content');

    // Через одну секунду убиваем элемент загрузки
    setTimeout(function() {
        loader.style.display = 'none';
        
        // Убираем блюр с основного контента
        content.classList.add('blur-off');
    }, 300); // задержка
});