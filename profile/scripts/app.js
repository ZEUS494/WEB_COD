const firebaseConfig = {
    apiKey: "AIzaSyBeCuMUazd-l9D0vPqfBrNJYSxCgOG6DeY",
    authDomain: "codweb-4d1aa.firebaseapp.com",
    projectId: "codweb-4d1aa",
    storageBucket: "codweb-4d1aa.appspot.com",
    messagingSenderId: "892570211314",
    appId: "1:892570211314:web:4888edb47d69cbd809d16b",
    measurementId: "G-57GYQLP328"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentlyEditingCell = null;
let activeTimers = {};

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initInterface();
    fetchUsers();
    initTabSwitching();
    document.getElementById("fullEditForm").addEventListener("submit", submitFullEditForm);
    document.getElementById("userForm").addEventListener("submit", submitUserForm);
});

function checkAdminAuth() {
    const storedUsername = getCookie('user');
    if (!storedUsername || storedUsername !== 'admin') {
        window.location.href = "../index.html";
    }
}

function initInterface() {
    document.getElementById('addUserButton').addEventListener('click', showUserForm);
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitUserForm();
    });
    document.getElementById('cancelButton').addEventListener('click', hideUserForm);
    document.getElementById('fullEditForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitFullEditForm();
    });
    document.getElementById('editCancelButton').addEventListener('click', hideFullEditForm);
    document.getElementById('searchBox').addEventListener('input', function() {
        fetchUsers(this.value);
    });
    document.getElementById('coursesSelect').addEventListener('change', filterCourses);
}

function initTabSwitching() {
    const tabs = {
        'switch-to-edit': 'content1',
        'switch-to-addition': 'content2',
        'switch-to-tables': 'content3'
    };
    
    for (const [btnId, contentId] of Object.entries(tabs)) {
        document.getElementById(btnId).addEventListener('click', function() {
            document.querySelectorAll('[class^="content"]').forEach(el => {
                el.style.display = 'none';
            });
            document.getElementById(contentId).style.display = 'block';
            document.querySelectorAll('.switch-btns').forEach(btn => {
                btn.style.border = 'none';
                btn.style.color = '#a4a4a4';
            });
            this.style.border = '3px solid #ffd000';
            this.style.color = '#000';
            if (contentId === 'content3') {
                fetchUsers();
            }
        });
    }
}

function fetchUsers(searchTerm = '') {
  db.collection("users").get()
    .then(querySnapshot => {
      const usersList = document.getElementById("usersList");
      usersList.innerHTML = '';
      
      const courses = {};
      
      querySnapshot.forEach(doc => {
        const username = doc.id;
        if (username === "admin") return;
        
        const userData = doc.data();
        if (searchTerm && 
            !username.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !(userData.currentcourse || '').toLowerCase().includes(searchTerm.toLowerCase())) {
          return;
        }
        
        addUserToList(username, userData);
        
        const course = userData.currentcourse || "Без курса";
        if (!courses[course]) courses[course] = [];
        courses[course].push({
          username: username,
          ...userData
        });
      });
      
      createCoursesTable(courses);
    })
    .catch(error => {
      console.error("Ошибка загрузки пользователей:", error);
    });
}

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

function createCoursesTable(courses) {
    const tableList = document.getElementById("tableList");
    const coursesSelect = document.getElementById("coursesSelect");
    
    tableList.innerHTML = '';
    coursesSelect.innerHTML = '<option value="all">Все курсы</option>';
    
    Object.keys(courses).forEach(course => {
        if (courses[course].length > 0) {
            const option = document.createElement("option");
            option.value = course;
            option.textContent = course;
            coursesSelect.appendChild(option);
            
            const table = document.createElement("table");
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            table.style.marginBottom = "30px";
            table.style.tableLayout = "fixed";
            
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

function filterCourses() {
    const selectedCourse = document.getElementById("coursesSelect").value;
    const tables = document.querySelectorAll("#tableList table");
    
    tables.forEach(table => {
        const courseName = table.querySelector("th").textContent;
        table.style.display = (selectedCourse === "all" || courseName === selectedCourse) ? "" : "none";
    });
}

function makeCellEditable(cell, studentData) {
    if (cell === currentlyEditingCell) return;
    
    if (currentlyEditingCell) {
        cancelEdit(currentlyEditingCell);
    }

    const field = cell.dataset.field;
    const currentValue = studentData[field] || '';
    
    cell.dataset.originalContent = cell.innerHTML;
    cell.dataset.originalValue = currentValue;
    
    const input = document.createElement('input');
    input.type = field === 'age' ? 'number' : 'text';
    input.value = currentValue === '-' ? '' : currentValue;
    input.className = 'cell-input';
    
    const buttons = document.createElement('div');
    buttons.className = 'cell-buttons';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'cell-btn save-btn';
    saveBtn.innerHTML = '✓';
    saveBtn.onclick = (e) => {
        e.stopPropagation();
        saveEdit(cell, input.value, studentData.username, field);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cell-btn cancel-btn';
    cancelBtn.innerHTML = '✕';
    cancelBtn.onclick = (e) => {
        e.stopPropagation();
        cancelEdit(cell);
    };
    
    buttons.appendChild(saveBtn);
    buttons.appendChild(cancelBtn);
    
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.appendChild(buttons);
    
    input.focus();
    
    currentlyEditingCell = cell;
}

function cancelEdit(cell) {
    if (!cell) return;
    
    cell.innerHTML = cell.dataset.originalContent;
    
    const field = cell.dataset.field;
    if (field !== 'username') {
        cell.addEventListener('click', handleCellClick);
    }
    
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

function initTable() {
    const table = document.getElementById('tableList');
    
    table.addEventListener('click', function(e) {
        const cell = e.target.closest('.editable-cell');
        if (!cell || cell.dataset.field === 'username') return;
        
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

function showUserForm() {
    document.getElementById("userFormContainer").style.display = "block";
    document.getElementById("userForm").reset();
    
    const now = new Date();
    document.getElementById("creationTimeField").value = 
        now.getHours().toString().padStart(2, '0') + ':' + 
        now.getMinutes().toString().padStart(2, '0');
    
    document.getElementById("filialSelect").value = "ПАН";
    
    loadTeachers();
}


function hideUserForm() {
    document.getElementById("userFormContainer").style.display = "none";
}

async function loadTeachers() {
    console.log("Загрузка учителей...");
    const teacherSelect = document.getElementById("teacherSelect");
    teacherSelect.innerHTML = '<option value="">Выберите учителя</option>';

    try {
        const querySnapshot = await db.collection("teachers").get();
        console.log("Получено учителей:", querySnapshot.size);
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (!data.login) {
                console.warn("У учителя нет логина:", doc.id);
                return;
            }
            
            const option = document.createElement("option");
            option.value = data.login;
            option.textContent = `${data.fullname || 'Без имени'} (${data.login})`;
            teacherSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Ошибка загрузки учителей:", error);
    }
}

async function addPupilToTeacher(teacherDocId, pupilLogin) {
  try {
    const teacherRef = db.collection("teachers").doc(teacherDocId);
    
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(teacherRef);
      if (!doc.exists) {
        throw new Error("Учитель не найден");
      }

      const currentPupils = doc.data().pupils || [];
      if (!currentPupils.includes(pupilLogin)) {
        transaction.update(teacherRef, {
          pupils: [...currentPupils, pupilLogin]
        });
      }
    });

    console.log(`Ученик ${pupilLogin} добавлен к учителю ${teacherDocId}`);
    return true;
  } catch (error) {
    console.error("Ошибка при добавлении ученика:", error);
    throw error;
  }
}

async function submitUserForm(e) {
    e.preventDefault();
    console.log("Начало создания пользователя");
    
    const username = document.getElementById("usernameField").value.trim();
    const password = document.getElementById("passwordField").value;
    const fullname = document.getElementById("fullnameField").value;
    const age = document.getElementById("ageField").value;
    const currentCourse = document.getElementById("currentCourseField").value;
    const completedCourses = document.getElementById("completedCoursesField").value.split('\n');
    const creationTime = document.getElementById("creationTimeField").value;
    const teacherLogin = document.getElementById("teacherSelect").value;
    const filial = document.getElementById("filialSelect").value;

    if (!username || !password || !teacherLogin) {
        const errorMsg = !teacherLogin ? "Не выбран учитель!" : "Логин и пароль обязательны!";
        alert(errorMsg);
        return;
    }

    try {
        const userDoc = await db.collection("users").doc(username).get();
        if (userDoc.exists) {
            alert("Пользователь с таким логином уже существует!");
            return;
        }

        // Проверяем существование учителя
        const teacherQuery = await db.collection("teachers")
            .where("login", "==", teacherLogin)
            .limit(1)
            .get();

        if (teacherQuery.empty) {
            alert("Выбранный учитель не найден в системе!");
            return;
        }

        const userData = {
            password: password,
            fullname: fullname,
            age: age,
            currentcourse: currentCourse,
            completedcources: completedCourses.filter(c => c.trim() !== ""),
            codcoins: 0,
            donehws: 0,
            notdonehws: 0,
            time: creationTime,
            teacher_login: teacherLogin,
            filial: filial,
        };

        await db.collection("users").doc(username).set(userData);
        alert("Пользователь успешно создан!");
        hideUserForm();
        fetchUsers();
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка: " + error.message);
    }
}

async function submitUserForm(e) {
    e.preventDefault();
    console.log("Начало создания пользователя");
    
    const username = document.getElementById("usernameField").value.trim();
    const password = document.getElementById("passwordField").value;
    const fullname = document.getElementById("fullnameField").value;
    const age = document.getElementById("ageField").value;
    const currentCourse = document.getElementById("currentCourseField").value;
    const completedCourses = document.getElementById("completedCoursesField").value.split('\n');
    const creationTime = document.getElementById("creationTimeField").value;
    const teacherLogin = document.getElementById("teacherSelect").value;
    const filial = document.getElementById("filialSelect").value;

    console.log("Полученные данные:", {
        username, password, fullname, age, currentCourse, 
        completedCourses, creationTime, teacherLogin
    });

    if (!username || !password || !teacherLogin) {
        const errorMsg = !teacherLogin ? "Не выбран учитель!" : "Логин и пароль обязательны!";
        alert(errorMsg);
        console.error("Ошибка валидации:", errorMsg);
        return;
    }

    try {
        console.log("Проверка существования пользователя...");
        const userDoc = await db.collection("users").doc(username).get();
        if (userDoc.exists) {
            console.error("Пользователь уже существует:", username);
            alert("Пользователь с таким логином уже существует!");
            return;
        }

        console.log("Поиск учителя с login =", teacherLogin);
        const teacherQuery = await db.collection("teachers")
            .where("login", "==", teacherLogin)
            .limit(1)
            .get();

        if (teacherQuery.empty) {
            console.error("Учитель не найден:", teacherLogin);
            alert("Выбранный учитель не найден в системе!");
            return;
        }

        const teacherDocId = teacherQuery.docs[0].id;
        console.log("Найден учитель:", teacherDocId);

        const userData = {
            password: password,
            fullname: fullname,
            age: age,
            currentcourse: currentCourse,
            completedcources: completedCourses.filter(c => c.trim() !== ""),
            codcoins: 0,
            donehws: 0,
            notdonehws: 0,
            time: creationTime,
            teacher_login: teacherLogin,
            filial: filial,
        };

        console.log("Данные для сохранения:", userData);

        console.log("Сохранение пользователя...");
        await db.collection("users").doc(username).set(userData);
        console.log("Пользователь сохранен");

        console.log("Обновление списка учеников учителя...");
        await db.collection("teachers").doc(teacherDocId).update({
            pupils: firebase.firestore.FieldValue.arrayUnion(username)
        });
        console.log("Учитель обновлен");

        alert("Пользователь успешно создан!");
        hideUserForm();
        fetchUsers();
    } catch (error) {
        console.error("Полная ошибка:", error);
        alert("Ошибка: " + error.message);
    }
}

let currentEditingUser = null;

function showFullEditForm(username) {
    currentEditingUser = username;
    
    hideUserForm();
    
    const usernameField = document.getElementById("editUsernameField");
    usernameField.value = username;
    usernameField.readOnly = true;
    usernameField.style.backgroundColor = "";
    
    document.getElementById("fullEditFormContainer").style.display = "block";
    
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

function hideFullEditForm() {
    document.getElementById("fullEditFormContainer").style.display = "none";
    currentEditingUser = null;
}

document.getElementById('addUserButton').addEventListener('click', showUserForm);
document.getElementById('cancelButton').addEventListener('click', hideUserForm);
document.getElementById('editCancelButton').addEventListener('click', hideFullEditForm);

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
    
    const username = document.getElementById("editUsernameField").value;
    if (!username) {
        alert("Ошибка: не указан пользователь");
        return;
    }

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

    console.log("Попытка сохранения:", { username, userData });

    db.collection("users").doc(username).update(userData)
        .then(() => {
            console.log("Успешно сохранено в Firestore");
            alert("Изменения успешно сохранены!");
            hideFullEditForm();
            fetchUsers();
        })
        .catch(error => {
            console.error("Ошибка сохранения:", error);
            alert("Ошибка при сохранении: " + error.message);
        });
}

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

function resetDeleteButton(button) {
    button.textContent = '(удалить)';
    button.style.color = '';
    button.onclick = function(e) {
        e.preventDefault();
        startDeletionTimer(button.dataset.username, button);
    };
}

function removeUser(username) {
    db.collection("users").doc(username).delete()
        .then(() => {
            fetchUsers();
        })
        .catch(error => {
            console.error("Ошибка удаления:", error);
        });
}

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