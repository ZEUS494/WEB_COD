document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    
    // Проверяем наличие ранее загруженного изображения в localStorage
    if ('savedImage' in localStorage && localStorage.savedImage !== '') {
        displayImage(localStorage.savedImage);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file || !file.type.startsWith("image/")) return alert("Выберите файл изображения!");

        // Создаем объект FileReader для чтения содержимого файла
        const reader = new FileReader();

        reader.onload = (event) => {
            const dataURL = event.target.result;
            
            // Сохраняем путь к файлу в localStorage
            localStorage.setItem('savedImage', dataURL);
            
            // Теперь используем выбранное изображение как фон
            displayImage(dataURL);
        };

        // Читаем содержимое выбранного файла
        reader.readAsDataURL(file);
    }

    function displayImage(src) {
        // Применяем изображение как фон элемента #imagePreview
        imagePreview.style.backgroundImage = `url(${src})`;
    }

    // Присоединяем обработчик события выбора файла
    imageInput.addEventListener('change', handleFileSelect);
});