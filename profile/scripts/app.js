const firebaseConfig = {
    apiKey: "AIzaSyBeCuMUazd-l9D0vPqfBrNJYSxCgOG6DeY",
    authDomain: "codweb-4d1aa.firebaseapp.com",
    projectId: "codweb-4d1aa",
    storageBucket: "codweb-4d1aa.firebasestorage.app",
    messagingSenderId: "892570211314",
    appId: "1:892570211314:web:4888edb47d69cbd809d16b",
    measurementId: "G-57GYQLP328"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Основной блок
window.onload = function() {
    fetchUsers(); // Загрузим пользователей при открытии страницы
};

// Извлекаем всех пользователей из Firebase
function fetchUsers(searchTerm = '') {
    db.collection("users").get()
        .then(function(querySnapshot) {
            var list = document.getElementById("usersList");
            list.innerHTML = ''; // очищаем старый список перед повторной загрузкой

            querySnapshot.forEach(function(doc) {
                var username = doc.id; // уникальное имя пользователя из id документа
                
                // Исключаем учетную запись с именем "admin"
                if (username === "admin") return;

                // Фильтрация по запросу (не чувствительна к регистру)
                if (
                    searchTerm &&
                    !(
                        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.data().currentcourse?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                ) return;

                var li = document.createElement("li");
                li.className = "username"; // присваиваем классу 'username'
                li.textContent = username;

                // Информация о пользователе
                var infoDiv = document.createElement("div");
                infoDiv.className = "info";
                infoDiv.innerHTML =
                    `<strong>Пароль:</strong> ${doc.data().password}<br>` +
                    `<strong>Текущий курс:</strong> ${doc.data().currentcourse || "-"}<br>` +
                    `<strong>Завершенные курсы:</strong> ${doc.data().completedcources ? doc.data().completedcources.join(", ") : "-"}<br>` +
                    `<strong>Кодкоины:</strong> ${doc.data().codcoins || 0}<br>` +
                    `<strong>Выполненные задания:</strong> ${doc.data().donehws || 0}<br>` +
                    `<strong>Невыполненные задания:</strong> ${doc.data().notdonehws || 0}`;

                li.appendChild(infoDiv);

                // Добавляем ссылки для редактирования и удаления
                var editLink = document.createElement("a");
                editLink.href = "#";
                editLink.textContent = "(ред.)";
                editLink.className = "editbtn";
                editLink.style.marginLeft = '10px';
                editLink.onclick = function(event) {
                    event.preventDefault();
                    showFullEditForm(username); // открываем полную форму редактирования с передачей username
                };
                li.appendChild(editLink);

                var delLink = document.createElement("a");
                delLink.href = "#";
                delLink.textContent = "(удалить)";
                delLink.className = "deletebtn";
                delLink.style.marginLeft = '10px';
                delLink.onclick = function(event) {
                    event.preventDefault();
                    removeUser(username); // удаляем пользователя по его username
                };
                li.appendChild(delLink);

                list.appendChild(li);
            });
        })
        .catch(function(error) {
            console.error("Ошибка:", error);
        });
}

// Обработка события ввода текста поиска
document.getElementById("searchBox").onkeyup = function() {
    fetchUsers(this.value); // фильтруем пользователей по введённой строке
};

// Открытие полной формы редактирования пользователя
function showFullEditForm(username) {
    const addUserFormVisible = document.getElementById("userFormContainer").style.display !== "none";
    
    if (addUserFormVisible) { // Если форма добавления открыта — сначала закроем её
        hideUserForm();
    }

    document.getElementById("fullEditFormContainer").style.display = "block"; // показываем контейнер
    db.collection("users").doc(username).get()
        .then(function(doc) {
            if (doc.exists) {
                fullPopulateForm(doc.data(), username); // заполняем полную форму существующими данными
            } else {
                console.log("Документ не найден!");
            }
        })
        .catch(function(error) {
            console.error("Ошибка:", error);
        });
}

// Наполнение полной формы данными пользователя
function fullPopulateForm(data, username) {
    document.getElementById("editUsernameField").value = username; // фиксируем имя пользователя
    document.getElementById("editPasswordField").value = data.password || '';
    document.getElementById("editCurrentCourseField").value = data.currentcourse || '';
    document.getElementById("editCompletedCoursesField").value = data.completedcources ? data.completedcources.join("\n") : '';
    document.getElementById("editCodeCoinsField").value = data.codcoins || 0;
    document.getElementById("editDoneHWsField").value = data.donehws || 0;
    document.getElementById("editNotDoneHWsField").value = data.notdonehws || 0;
}

// Отправка полной формы редактирования
function submitFullEditForm() {
    var username = document.getElementById("editUsernameField").value;
    var password = document.getElementById("editPasswordField").value;
    var currentCourse = document.getElementById("editCurrentCourseField").value;
    var completedCourses = document.getElementById("editCompletedCoursesField").value.split("\n");
    var codeCoins = Number(document.getElementById("editCodeCoinsField").value);
    var doneHWs = Number(document.getElementById("editDoneHWsField").value);
    var notDoneHWs = Number(document.getElementById("editNotDoneHWsField").value);

    var userData = {
        password: password,
        currentcourse: currentCourse,
        completedcources: completedCourses,
        codcoins: codeCoins,
        donehws: doneHWs,
        notdonehws: notDoneHWs
    };

    // Обновляем существующие данные пользователя
    db.collection("users").doc(username).set(userData)
        .then(function() {
            console.log("Данные пользователя обновлены!");
            hideFullEditForm();
            fetchUsers(); // перезагружаем список пользователей
        })
        .catch(function(error) {
            console.error("Ошибка:", error);
        });
}

// Скрытие полной формы редактирования
function hideFullEditForm() {
    document.getElementById("fullEditFormContainer").style.display = "none";
}

// Открытие формы добавления пользователя
function showUserForm() {
    const fullEditFormVisible = document.getElementById("fullEditFormContainer").style.display !== "none";
    
    if (fullEditFormVisible) { // Если полная форма редактирования открыта — сначала закроем её
        hideFullEditForm();
    }

    document.getElementById("userFormContainer").style.display = "block"; // показываем контейнер
    document.getElementById("userForm").reset(); // сбрасываем форму
}

// Наполнение формы данными пользователя (только при редактировании)
function populateForm(data, username) {
    document.getElementById("usernameField").value = username; // фиксируем имя пользователя
    document.getElementById("passwordField").value = data.password || '';
    document.getElementById("currentCourseField").value = data.currentcourse || '';
    document.getElementById("completedCoursesField").value = data.completedcources ? data.completedcources.join("\n") : '';
}

// Отправка формы добавления пользователя
function submitUserForm() {
    var username = document.getElementById("usernameField").value;
    var password = document.getElementById("passwordField").value;
    var currentCourse = document.getElementById("currentCourseField").value;
    var completedCourses = document.getElementById("completedCoursesField").value.split("\n");

    // Проверяем наличие такого пользователя
    db.collection("users").doc(username).get()
        .then(function(doc) {
            if (doc.exists) {
                // Пользователь уже существует
                document.getElementById("errorMessage").style.display = "block";
                setTimeout(function() {
                    document.getElementById("errorMessage").style.display = "none";
                }, 3000); // сообщение исчезает через 3 секунды
            } else {
                // Устанавливаем начальные значения
                var defaultValues = {
                    codcoins: 0,
                    donehws: 0,
                    notdonehws: 0
                };

                var userData = Object.assign(defaultValues, {
                    password: password,
                    currentcourse: currentCourse,
                    completedcources: completedCourses
                });

                // Создаем нового пользователя
                db.collection("users").doc(username).set(userData)
                    .then(function() {
                        console.log("Новый пользователь создан!");
                        hideUserForm();
                        fetchUsers(); // перезагружаем список пользователей
                    })
                    .catch(function(error) {
                        console.error("Ошибка:", error);
                    });
            }
        })
        .catch(function(error) {
            console.error("Ошибка:", error);
        });
}

// Скрытие формы добавления пользователя
function hideUserForm() {
    document.getElementById("userFormContainer").style.display = "none";
}

// Основной обработчик клика для каждого пользователя
function setupDeleteHandler(linkElement, username) {
    linkElement.onclick = function(event) {
        event.preventDefault();
        removeUser(username, this); // Передача имени пользователя и текущего элемента
    };
}

// Функция удаления пользователя с временным подтверждением
function removeUser(username, linkElement) {
    let initialText = linkElement.textContent.trim(); // Сохраняем исходный текст
    let originalClickHandler = linkElement.onclick; // Сохраняем оригинальный обработчик клика
    let counter = 5;
    let intervalID;

    // Переопределение обработчика клика на кнопку во время ожидания подтверждения
    function resetButton() {
        clearInterval(intervalID);
        linkElement.textContent = initialText;
        linkElement.classList.remove('confirm');
        linkElement.onclick = originalClickHandler; // Восстанавливаем стандартный обработчик
    }

    // Первый клик активирует режим ожидания подтверждения
    linkElement.classList.add('confirm');
    linkElement.textContent = `(подтвердить ${counter} с.)`;

    // Обратный отсчет
    intervalID = setInterval(() => {
        counter--;
        linkElement.textContent = `(подтвердить ${counter} с.)`;

        if (counter <= 0) {
            clearInterval(intervalID);
            resetButton(); // Восстановление исходного вида кнопки
        }
    }, 1000);

    // Второй клик подтверждает удаление
    linkElement.onclick = function confirmDeletion() {
        clearInterval(intervalID);
        resetButton(); // Вернуть первоначальный вид кнопки

        // Удаляем пользователя
        db.collection("users").doc(username).delete()
            .then(function() {
                console.log("Пользователь успешно удалён!");
                fetchUsers(); // Перезагрузка списка пользователей
            })
            .catch(function(error) {
                console.error("Ошибка:", error);
            });
    };
}

// Генерация списка пользователей
function fetchUsers(searchTerm = '') {
    db.collection("users").get()
        .then(function(querySnapshot) {
            var list = document.getElementById("usersList");
            list.innerHTML = ''; // Очистка старого списка

            querySnapshot.forEach(function(doc) {
                var username = doc.id;
                if (username === "admin") return;

                var li = document.createElement("li");
                li.className = "username";
                li.innerHTML = `<strong>Логин: </strong>${username}` ;

                // Инфоблок
                var infoDiv = document.createElement("div");
                infoDiv.className = "info";
                infoDiv.innerHTML = ` <strong>Пароль:</strong> ${doc.data().password}<br> <strong>Текущий курс:</strong> ${doc.data().currentcourse || '-'}<br> <strong>Завершенные курсы:</strong> ${doc.data().completedcources ? doc.data().completedcources.join(', ') : '-'}<br> <strong>Кодкоины:</strong> ${doc.data().codcoins || 0}<br> <strong>Выполненные задания:</strong> ${doc.data().donehws || 0}<br> <strong>Невыполненные задания:</strong> ${doc.data().notdonehws || 0} `;
                li.appendChild(infoDiv);

                // Ссылка на редактирование
                var editLink = document.createElement("a");
                editLink.href = '#';
                editLink.textContent = '(ред.)';
                editLink.className = 'editbtn';
                editLink.style.marginLeft = '10px';
                editLink.onclick = function(event) {
                    event.preventDefault();
                    showFullEditForm(username);
                };
                li.appendChild(editLink);

                // Ссылка на удаление
                var delLink = document.createElement("a");
                delLink.href = '#';
                delLink.textContent = '(удалить)';
                delLink.className = 'deletebtn';
                delLink.style.marginLeft = '10px';
                setupDeleteHandler(delLink, username); // Установка обработчика удаления
                li.appendChild(delLink);

                list.appendChild(li);
            });
        })
        .catch(function(error) {
            console.error("Ошибка:", error);
        });
}

// Регистрация обработчиков событий
document.getElementById("addUserButton").onclick = function() {
    showUserForm(); // запускаем форму создания нового пользователя
};

document.getElementById("userForm").onsubmit = function(e) {
    e.preventDefault();
    submitUserForm(); // отправляем данные пользователя
};

document.getElementById("fullEditForm").onsubmit = function(e) {
    e.preventDefault();
    submitFullEditForm(); // отправляем данные из полной формы редактирования
};

document.getElementById("cancelButton").onclick = hideUserForm; // закрываем форму добавления
document.getElementById("editCancelButton").onclick = hideFullEditForm; // закрываем полную форму редактирования