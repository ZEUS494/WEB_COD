// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBeCuMUazd-l9D0vPqfBrNJYSxCgOG6DeY",
    authDomain: "codweb-4d1aa.firebaseapp.com",
    projectId: "codweb-4d1aa",
    storageBucket: "codweb-4d1aa.appspot.com",
    messagingSenderId: "892570211314",
    appId: "1:892570211314:web:4888edb47d69cbd809d16b",
    measurementId: "G-57GYQLP328"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Глобальные переменные
let currentlyEditingCell = null;
let activeTimers = {};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    checkAdminAuth();
    
    // Инициализация интерфейса
    initInterface();
    
    // Загрузка пользователей
    fetchUsers();
    
    // Инициализация переключения между вкладками
    initTabSwitching();

    // Инициализация формы
    document.getElementById("fullEditForm").addEventListener("submit", submitFullEditForm);

    document.getElementById("userForm").addEventListener("submit", submitUserForm);
});

// Проверка прав администратора
function checkAdminAuth() {
    const storedUsername = getCookie('user');
    if (!storedUsername || storedUsername !== 'admin') {
        window.location.href = "../index.html";
    }
}

// Инициализация интерфейса
function initInterface() {
    // Кнопка добавления пользователя
    document.getElementById('addUserButton').addEventListener('click', showUserForm);
    
    // Форма добавления пользователя
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitUserForm();
    });
    
    // Кнопка отмены в форме добавления
    document.getElementById('cancelButton').addEventListener('click', hideUserForm);
    
    // Форма редактирования пользователя
    document.getElementById('fullEditForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitFullEditForm();
    });
    
    // Кнопка отмены в форме редактирования
    document.getElementById('editCancelButton').addEventListener('click', hideFullEditForm);
    
    // Поиск пользователей
    document.getElementById('searchBox').addEventListener('input', function() {
        fetchUsers(this.value);
    });
    
    // Фильтрация курсов
    document.getElementById('coursesSelect').addEventListener('change', filterCourses);
}

// Инициализация переключения вкладок
function initTabSwitching() {
    const tabs = {
        'switch-to-edit': 'content1',
        'switch-to-addition': 'content2',
        'switch-to-tables': 'content3'
    };
    
    for (const [btnId, contentId] of Object.entries(tabs)) {
        document.getElementById(btnId).addEventListener('click', function() {
            // Скрываем все контенты
            document.querySelectorAll('[class^="content"]').forEach(el => {
                el.style.display = 'none';
            });
            
            // Показываем нужный контент
            document.getElementById(contentId).style.display = 'block';
            
            // Обновляем стили кнопок
            document.querySelectorAll('.switch-btns').forEach(btn => {
                btn.style.border = 'none';
                btn.style.color = '#a4a4a4';
            });
            
            // Выделяем активную кнопку
            this.style.border = '3px solid #ffd000';
            this.style.color = '#000';
            
            // Если переключились на таблицы, обновляем их
            if (contentId === 'content3') {
                fetchUsers();
            }
        });
    }
}

// Загрузка пользователей
function fetchUsers(searchTerm = '') {
    db.collection("users").get()
        .then(querySnapshot => {
            const usersList = document.getElementById("usersList");
            usersList.innerHTML = '';
            
            const courses = {};
            
            querySnapshot.forEach(doc => {
                const username = doc.id;
                if (username === "admin") return;
                
                // Фильтрация по поиску
                const userData = doc.data();
                if (searchTerm && 
                    !username.toLowerCase().includes(searchTerm.toLowerCase()) && 
                    !(userData.currentcourse || '').toLowerCase().includes(searchTerm.toLowerCase())) {
                    return;
                }
                
                // Добавление в список пользователей
                addUserToList(username, userData);
                
                // Группировка по курсам для таблицы
                const course = userData.currentcourse || "Без курса";
                if (!courses[course]) courses[course] = [];
                courses[course].push({
                    username: username,
                    ...userData
                });
            });
            
            // Создание таблицы
            createCoursesTable(courses);
        })
        .catch(error => {
            console.error("Ошибка загрузки пользователей:", error);
        });
}

// Добавление пользователя в список
function addUserToList(username, userData) {
    const li = document.createElement("li");
    li.className = "username";
    li.innerHTML = `<strong>Логин: </strong> ${username}`;
    
    const infoDiv = document.createElement("div");
    infoDiv.className = "info";
    infoDiv.innerHTML = `
        <strong>Пароль:</strong> ${userData.password || '-'}<br><br>
        <strong>ФИО:</strong> ${userData.fullname || '-'}<br>
        <strong>Возраст:</strong> ${userData.age || '-'}<br><br>
        <strong>Текущий курс:</strong> ${userData.currentcourse || '-'}<br>
        <strong>Завершенные курсы:</strong> ${userData.completedcources ? userData.completedcources.join(", ") : '-'}<br><br>
        <strong>Кодкоины:</strong> ${userData.codcoins || 0}<br>
        <strong>Выполненные задания:</strong> ${userData.donehws || 0}<br>
        <strong>Невыполненные задания:</strong> ${userData.notdonehws || 0}`;
    
    li.appendChild(infoDiv);
    
    // Кнопка редактирования
    const editLink = document.createElement("a");
    editLink.href = "#";
    editLink.textContent = "(ред.)";
    editLink.className = "editbtn";
    editLink.style.marginLeft = '10px';
    editLink.addEventListener('click', e => {
        e.preventDefault();
        showFullEditForm(username);
    });
    li.appendChild(editLink);
    
    // Кнопка удаления
    const delLink = document.createElement("a");
    delLink.href = "#";
    delLink.textContent = "(удалить)";
    delLink.className = "deletebtn";
    delLink.style.marginLeft = '10px';
    delLink.dataset.username = username;
    delLink.addEventListener('click', e => {
        e.preventDefault();
        startDeletionTimer(username, delLink);
    });
    li.appendChild(delLink);
    
    document.getElementById("usersList").appendChild(li);
}

// Создание таблицы пользователей по курсам
function createCoursesTable(courses) {
    const tableList = document.getElementById("tableList");
    const coursesSelect = document.getElementById("coursesSelect");
    
    tableList.innerHTML = '';
    coursesSelect.innerHTML = '<option value="all">Все курсы</option>';
    
    // Добавление курсов в выпадающий список
    Object.keys(courses).forEach(course => {
        if (courses[course].length > 0) {
            const option = document.createElement("option");
            option.value = course;
            option.textContent = course;
            coursesSelect.appendChild(option);
            
            // Создание таблицы для курса
            const table = document.createElement("table");
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            table.style.marginBottom = "30px";
            table.style.tableLayout = "fixed";
            
            // Заголовок таблицы
            const captionRow = document.createElement("tr");
            const captionCell = document.createElement("th");
            captionCell.textContent = course;
            captionCell.colSpan = 4;
            captionCell.style.padding = "10px";
            captionCell.style.border = "1px solid #ddd";
            captionCell.style.textAlign = "center";
            captionCell.style.fontWeight = "bold";
            captionRow.appendChild(captionCell);
            
            const tempThead = document.createElement("thead");
            tempThead.appendChild(captionRow);
            table.appendChild(tempThead);
            
            // Заголовки столбцов
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            
            const headers = ["ФИО", "Возраст", "Логин", "Пароль"];
            const columnWidths = ["40%", "15%", "25%", "20%"];
            
            headers.forEach((headerText, index) => {
                const th = document.createElement("th");
                th.textContent = headerText;
                th.style.padding = "8px";
                th.style.border = "1px solid #ddd";
                th.style.textAlign = "left";
                th.style.fontWeight = "normal";
                th.style.width = columnWidths[index];
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Тело таблицы
            const tbody = document.createElement("tbody");
            
            courses[course].forEach(student => {
                const row = document.createElement("tr");
                row.style.borderBottom = "1px solid #ddd";
                
                const fields = ["fullname", "age", "username", "password"];
                fields.forEach((field, index) => {
                    const cell = document.createElement("td");
                    cell.className = field === "username" ? "" : "editable-cell";
                    cell.dataset.field = field;
                    cell.dataset.username = student.username;
                    
                    const contentDiv = document.createElement("div");
                    contentDiv.textContent = student[field] || '-';
                    contentDiv.style.maxHeight = "60px";
                    contentDiv.style.overflowY = "auto";
                    contentDiv.style.padding = "3px";
                    contentDiv.style.width = "100%";
                    contentDiv.style.boxSizing = "border-box";
                    
                    cell.appendChild(contentDiv);
                    cell.style.padding = "0";
                    cell.style.border = "1px solid #ddd";
                    cell.style.width = columnWidths[index];
                    
                    if (field !== "username") {
                        cell.addEventListener('click', function() {
                            makeCellEditable(this, {
                                username: student.username,
                                [field]: student[field] || ''
                            });
                        });
                    }
                    
                    row.appendChild(cell);
                });
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            tableList.appendChild(table);
        }
    });
}

// Фильтрация курсов
function filterCourses() {
    const selectedCourse = document.getElementById("coursesSelect").value;
    const tables = document.querySelectorAll("#tableList table");
    
    tables.forEach(table => {
        const courseName = table.querySelector("th").textContent;
        table.style.display = (selectedCourse === "all" || courseName === selectedCourse) ? "" : "none";
    });
}

function makeCellEditable(cell, studentData) {
    // Если кликаем по уже редактируемой ячейке - ничего не делаем
    if (cell === currentlyEditingCell) return;
    
    // Закрываем предыдущее редактирование
    if (currentlyEditingCell) {
        cancelEdit(currentlyEditingCell);
    }

    const field = cell.dataset.field;
    const currentValue = studentData[field] || '';
    
    // Сохраняем оригинальное содержимое
    cell.dataset.originalContent = cell.innerHTML;
    cell.dataset.originalValue = currentValue;
    
    // Создаем input
    const input = document.createElement('input');
    input.type = field === 'age' ? 'number' : 'text';
    input.value = currentValue === '-' ? '' : currentValue;
    input.className = 'cell-input';
    
    // Создаем кнопки
    const buttons = document.createElement('div');
    buttons.className = 'cell-buttons';
    
    // Кнопка сохранения
    const saveBtn = document.createElement('button');
    saveBtn.className = 'cell-btn save-btn';
    saveBtn.innerHTML = '✓';
    saveBtn.onclick = (e) => {
        e.stopPropagation();
        saveEdit(cell, input.value, studentData.username, field);
    };
    
    // Кнопка отмены
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cell-btn cancel-btn';
    cancelBtn.innerHTML = '✕';
    cancelBtn.onclick = (e) => {
        e.stopPropagation();
        cancelEdit(cell);
    };
    
    buttons.appendChild(saveBtn);
    buttons.appendChild(cancelBtn);
    
    // Заменяем содержимое ячейки
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.appendChild(buttons);
    
    // Фокус на input
    input.focus();
    
    // Сохраняем ссылку на текущую ячейку
    currentlyEditingCell = cell;
}

function cancelEdit(cell) {
    if (!cell) return;
    
    // Восстанавливаем оригинальное содержимое
    cell.innerHTML = cell.dataset.originalContent;
    
    // Восстанавливаем обработчик клика
    const field = cell.dataset.field;
    if (field !== 'username') {
        cell.addEventListener('click', handleCellClick);
    }
    
    // Сбрасываем текущую ячейку
    currentlyEditingCell = null;
}

function handleCellClick(e) {
    const cell = e.currentTarget;
    const row = cell.parentNode;
    const username = row.cells[2].textContent.trim();
    const field = cell.dataset.field;
    const value = cell.textContent.trim();
    
    makeCellEditable(cell, {
        username: username,
        [field]: value === '-' ? '' : value
    });
}

// Инициализация таблицы
function initTable() {
    const table = document.getElementById('tableList');
    
    // Делегирование событий
    table.addEventListener('click', function(e) {
        const cell = e.target.closest('.editable-cell');
        if (!cell || cell.dataset.field === 'username') return;
        
        // Если клик по кнопкам в активной ячейке - игнорируем
        if (currentlyEditingCell && e.target.closest('.cell-btn', currentlyEditingCell)) {
            return;
        }
        
        handleCellClick({ currentTarget: cell });
    });
}

function saveEdit(cell, newValue, username, field) {
    const updateData = {};
    updateData[field] = field === 'age' ? parseInt(newValue) || 0 : newValue;
    
    db.collection("users").doc(username).update(updateData)
        .then(() => {
            const contentDiv = document.createElement('div');
            contentDiv.textContent = newValue || '-';
            cell.innerHTML = '';
            cell.appendChild(contentDiv);
            currentlyEditingCell = null;
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert('Не удалось сохранить изменения');
            cancelEdit(cell);
        });
}

function cancelEdit(cell) {
    cell.innerHTML = cell.dataset.originalContent;
    currentlyEditingCell = null;
}

// Работа с формами пользователей
function showUserForm() {
    document.getElementById("userFormContainer").style.display = "block";
    document.getElementById("userForm").reset();
    document.getElementById("errorMessage").style.display = "none";
}

function hideUserForm() {
    document.getElementById("userFormContainer").style.display = "none";
}

function submitUserForm() {
    const username = document.getElementById("usernameField").value;
    const password = document.getElementById("passwordField").value;
    const fullname = document.getElementById("fullnameField").value;
    const age = document.getElementById("ageField").value;
    const currentCourse = document.getElementById("currentCourseField").value;
    const completedCourses = document.getElementById("completedCoursesField").value.split("\n");
    
    // Проверка существования пользователя
    db.collection("users").doc(username).get()
        .then(doc => {
            if (doc.exists) {
                document.getElementById("errorMessage").style.display = "block";
                setTimeout(() => {
                    document.getElementById("errorMessage").style.display = "none";
                }, 3000);
                return;
            }
            
            // Создание нового пользователя
            const userData = {
                password: password,
                fullname: fullname,
                age: age,
                currentcourse: currentCourse,
                completedcources: completedCourses,
                codcoins: 0,
                donehws: 0,
                notdonehws: 0
            };
            
            return db.collection("users").doc(username).set(userData);
        })
        .then(() => {
            alert("Пользователь успешно создан");
            hideUserForm();
            fetchUsers();
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Ошибка при создании пользователя");
        });
}

// Глобальная переменная для хранения текущего редактируемого пользователя
let currentEditingUser = null;

// Функция открытия формы редактирования
function showFullEditForm(username) {
    // Сохраняем логин пользователя
    currentEditingUser = username;
    
    // Закрываем форму добавления если открыта
    hideUserForm();
    
    // Заполняем поле логина (оно readonly)
    const usernameField = document.getElementById("editUsernameField");
    usernameField.value = username;
    usernameField.readOnly = true;
    usernameField.style.backgroundColor = "";
    
    // Показываем форму
    document.getElementById("fullEditFormContainer").style.display = "block";
    
    // Загружаем данные пользователя
    db.collection("users").doc(username).get()
        .then(doc => {
            if (!doc.exists) {
                throw new Error("Пользователь не найден");
            }
            
            const data = doc.data();
            document.getElementById("editPasswordField").value = data.password || "";
            document.getElementById("editFullnameField").value = data.fullname || "";
            document.getElementById("editAgeField").value = data.age || "";
            document.getElementById("editCurrentCourseField").value = data.currentcourse || "";
            document.getElementById("editCompletedCoursesField").value = 
                data.completedcources ? data.completedcources.join("\n") : "";
            document.getElementById("editCodeCoinsField").value = data.codcoins || 0;
            document.getElementById("editDoneHWsField").value = data.donehws || 0;
            document.getElementById("editNotDoneHWsField").value = data.notdonehws || 0;
        })
        .catch(error => {
            console.error("Ошибка загрузки:", error);
            alert("Не удалось загрузить данные: " + error.message);
            hideFullEditForm();
        });
}

async function submitUserForm(e) {
    e.preventDefault();
    
    // Получаем данные из формы
    const username = document.getElementById("usernameField").value.trim();
    const password = document.getElementById("passwordField").value;
    const fullname = document.getElementById("fullnameField").value;
    const age = document.getElementById("ageField").value;
    const currentCourse = document.getElementById("currentCourseField").value;
    const completedCourses = document.getElementById("completedCoursesField").value.split('\n');
    
    // Проверяем заполнение обязательных полей
    if (!username || !password) {
        alert("Логин и пароль обязательны для заполнения!");
        return;
    }

    try {
        // 1. Проверяем существование пользователя
        const userDoc = await db.collection("users").doc(username).get();
        
        if (userDoc.exists) {
            // Показываем ошибку под полем логина
            const errorElement = document.getElementById("errorMessage");
            errorElement.textContent = "Пользователь с таким логином уже существует!";
            errorElement.style.display = "block";
            
            // Подсвечиваем поле с ошибкой
            document.getElementById("usernameField").style.border = "1px solid red";
            return;
        }

        // 2. Создаем нового пользователя
        const userData = {
            password: password,
            fullname: fullname,
            age: age,
            currentcourse: currentCourse,
            completedcources: completedCourses.filter(c => c.trim() !== ""),
            codcoins: 0,
            donehws: 0,
            notdonehws: 0
        };

        await db.collection("users").doc(username).set(userData);
        
        alert("Пользователь успешно создан!");
        hideUserForm();
        fetchUsers(); // Обновляем список
    } catch (error) {
        console.error("Ошибка создания пользователя:", error);
        alert("Произошла ошибка: " + error.message);
    }
}

// Функция закрытия формы
function hideFullEditForm() {
    document.getElementById("fullEditFormContainer").style.display = "none";
    currentEditingUser = null; // Сбрасываем текущего пользователя
}

// Обработчики кнопок
document.getElementById('addUserButton').addEventListener('click', showUserForm);
document.getElementById('cancelButton').addEventListener('click', hideUserForm);
document.getElementById('editCancelButton').addEventListener('click', hideFullEditForm);

// Обработчики отправки форм
document.getElementById("userForm").addEventListener("submit", function(e) {
    e.preventDefault();
    submitUserForm();
});

document.getElementById("fullEditForm").addEventListener("submit", function(e) {
    e.preventDefault();
    submitFullEditForm();
});

function submitFullEditForm(e) {
    e.preventDefault();
    
    // 1. Получаем имя пользователя (оно readonly)
    const username = document.getElementById("editUsernameField").value;
    if (!username) {
        alert("Ошибка: не указан пользователь");
        return;
    }

    // 2. Собираем данные из формы
    const userData = {
        password: document.getElementById("editPasswordField").value || "",
        fullname: document.getElementById("editFullnameField").value || "",
        age: document.getElementById("editAgeField").value || "",
        currentcourse: document.getElementById("editCurrentCourseField").value || "",
        completedcources: document.getElementById("editCompletedCoursesField").value
            .split('\n')
            .map(c => c.trim())
            .filter(c => c !== ""),
        codcoins: parseInt(document.getElementById("editCodeCoinsField").value) || 0,
        donehws: parseInt(document.getElementById("editDoneHWsField").value) || 0,
        notdonehws: parseInt(document.getElementById("editNotDoneHWsField").value) || 0
    };

    console.log("Попытка сохранения:", { username, userData }); // Отладочная информация

    // 3. Сохраняем в Firestore
    db.collection("users").doc(username).update(userData)
        .then(() => {
            console.log("Успешно сохранено в Firestore");
            alert("Изменения успешно сохранены!");
            hideFullEditForm();
            fetchUsers(); // Обновляем список
        })
        .catch(error => {
            console.error("Ошибка сохранения:", error);
            alert("Ошибка при сохранении: " + error.message);
        });
}

// Альтернативная версия с таймером подтверждения
function startDeletionTimer(username, button) {
    clearTimeout(activeTimers[username]);
    
    let secondsRemaining = 5;
    button.textContent = `(Подтвердить (${secondsRemaining}))`;
    button.style.color = '#fdd000';
    
    activeTimers[username] = setInterval(() => {
        secondsRemaining--;
        
        if (secondsRemaining >= 0) {
            button.textContent = `(Подтвердить (${secondsRemaining}))`;
        } else {
            clearInterval(activeTimers[username]);
            delete activeTimers[username];
            resetDeleteButton(button);
        }
    }, 1000);
    
    button.onclick = function(e) {
        e.preventDefault();
        clearInterval(activeTimers[username]);
        delete activeTimers[username];
        removeUser(username);
    };
}

// Вспомогательные функции
function resetDeleteButton(button) {
    button.textContent = '(удалить)';
    button.style.color = '';
    button.onclick = function(e) {
        e.preventDefault();
        startDeletionTimer(button.dataset.username, button);
    };
}

// Функция удаления пользователя
function removeUser(username) {
    db.collection("users").doc(username).delete()
        .then(() => {
            fetchUsers(); // Просто обновляем список
        })
        .catch(error => {
            console.error("Ошибка удаления:", error);
        });
}

// Вспомогательные функции
function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function logout() {
    document.cookie = 'user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.clear();
    window.location.href = '../index.html';
}