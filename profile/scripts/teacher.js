document.addEventListener('DOMContentLoaded', function() {
    const teacherLogin = getCookie('teacher');
    if (!teacherLogin) {
        window.location.href = '../index.html';
        return;
    }

    const db = firebase.firestore();
    const mainContainer = document.querySelector('main');
    
    // Очищаем основной контейнер и добавляем структуру
    mainContainer.innerHTML = `
        <div class="teacher-info">
            <h2 id="teacher-name"></h2>
            <p>Ваш логин: <span id="teacher-login"></span></p>
        </div>
        
        <div class="filial-tabs" id="filial-tabs"></div>
        
        <div class="pupils-container" id="pupils-container"></div>
    `;

    // Переменные для хранения данных
    let pupilsByFilial = {};
    let allTimes = [];
    let currentTimeFilter = 'Все времена';

    // Загружаем данные учителя и его учеников
    Promise.all([
        db.collection("teachers").where("login", "==", teacherLogin).limit(1).get(),
        db.collection("users").where("teacher_login", "==", teacherLogin).get()
    ]).then(async ([teacherSnapshot, pupilsSnapshot]) => {
        if (teacherSnapshot.empty) {
            console.error("Учитель не найден");
            return;
        }

        // Устанавливаем данные учителя
        const teacherData = teacherSnapshot.docs[0].data();
        document.getElementById('teacher-name').textContent = teacherData.fullname;
        document.getElementById('teacher-login').textContent = teacherData.login;

        if (pupilsSnapshot.empty) {
            document.getElementById('pupils-container').innerHTML = '<p>У вас пока нет учеников</p>';
            return;
        }

        // Группируем учеников по филиалам и собираем все времена
        pupilsByFilial = {};
        const timesSet = new Set();
        
        pupilsSnapshot.forEach(doc => {
            const pupilData = doc.data();
            const filial = pupilData.filial || 'Без филиала';
            const time = pupilData.time || 'Без времени';
            
            timesSet.add(time);
            
            if (!pupilsByFilial[filial]) {
                pupilsByFilial[filial] = [];
            }
            pupilsByFilial[filial].push({
                login: doc.id,
                data: pupilData
            });
        });

        // Преобразуем Set в массив и сортируем
        allTimes = Array.from(timesSet).sort();
        
        // Сортируем филиалы по алфавиту
        const sortedFilials = Object.keys(pupilsByFilial).sort();
        
        // Создаем вкладки для каждого филиала
        createFilialTabs(sortedFilials);
        
        // Сортируем учеников внутри каждого филиала по времени
        for (const filial in pupilsByFilial) {
            pupilsByFilial[filial].sort((a, b) => {
                const timeA = a.data.time || '';
                const timeB = b.data.time || '';
                return timeA.localeCompare(timeB);
            });
        }

        // Отображаем данные для первого филиала
        if (sortedFilials.length > 0) {
            displayPupilsForFilial(sortedFilials[0]);
        } else {
            document.getElementById('pupils-container').innerHTML = '<p>Нет учеников</p>';
        }

    }).catch(error => {
        console.error("Ошибка загрузки данных:", error);
    });

    // Функция создания вкладок филиалов
    function createFilialTabs(filials) {
        const tabsContainer = document.getElementById('filial-tabs');
        tabsContainer.innerHTML = '';
        
        filials.forEach(filial => {
            const tab = document.createElement('button');
            tab.className = 'filial-tab';
            tab.textContent = filial;
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filial-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                displayPupilsForFilial(filial);
            });
            
            if (filials.indexOf(filial) === 0) {
                tab.classList.add('active');
            }
            
            tabsContainer.appendChild(tab);
        });
    }

    // Функция отображения учеников для конкретного филиала с учетом фильтра по времени
    function displayPupilsForFilial(filial) {
        const container = document.getElementById('pupils-container');
        container.innerHTML = '';
        
        if (!pupilsByFilial[filial]) {
            container.innerHTML = '<p>Нет учеников в этом филиале</p>';
            return;
        }
        
        // Создаем таблицу
        const table = document.createElement('table');
        table.className = 'pupils-table';
        
        // Заголовок таблицы
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th id="time-header">Время</th>
                <th>ФИО</th>
                <th>Логин</th>
                <th>Кодкоины</th>
                <th>Выполнено ДЗ</th>
                <th>Не выполнено ДЗ</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Тело таблицы
        const tbody = document.createElement('tbody');
        
        // Фильтруем учеников по выбранному времени
        const filteredPupils = pupilsByFilial[filial].filter(pupil => {
            if (currentTimeFilter === 'Все времена') return true;
            return pupil.data.time === currentTimeFilter;
        });
        
        filteredPupils.forEach(({login, data}) => {
            const row = document.createElement('tr');
            row.dataset.login = login;
            
            // Нередактируемые ячейки
            row.innerHTML = `
                <td>${data.time || 'не указано'}</td>
                <td>${data.fullname || login}</td>
                <td>${login}</td>
                <td class="editable-cell" data-field="codcoins">${data.codcoins || 0}</td>
                <td class="editable-cell" data-field="donehws">${data.donehws || 0}</td>
                <td class="editable-cell" data-field="notdonehws">${data.notdonehws || 0}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
        
        // Добавляем обработчики для редактируемых ячеек
        document.querySelectorAll('.editable-cell').forEach(cell => {
            cell.addEventListener('click', function(e) {
                if (this.querySelector('input')) return;
                
                const originalValue = this.textContent.trim();
                const field = this.dataset.field;
                const login = this.closest('tr').dataset.login;
                
                this.dataset.originalContent = this.innerHTML;
                this.dataset.originalValue = originalValue;
                
                const input = document.createElement('input');
                input.type = 'number';
                input.value = originalValue;
                input.className = 'cell-input';
                
                const buttons = document.createElement('div');
                buttons.className = 'cell-buttons';
                
                const confirmBtn = document.createElement('button');
                confirmBtn.className = 'cell-btn confirm-btn';
                confirmBtn.innerHTML = '✓';
                confirmBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    saveCellEdit(this, login, field, input.value);
                });
                
                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'cell-btn cancel-btn';
                cancelBtn.innerHTML = '✕';
                cancelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cancelCellEdit(this);
                });
                
                buttons.appendChild(confirmBtn);
                buttons.appendChild(cancelBtn);
                
                this.innerHTML = '';
                this.appendChild(input);
                this.appendChild(buttons);
                
                input.focus();
            });
        });
        
        // Добавляем обработчик клика на заголовок "Время"
        const timeHeader = document.getElementById('time-header');
        timeHeader.addEventListener('click', function(e) {
            e.stopPropagation();
            showTimeFilter(this);
        });
    }

    // Функция для отображения выпадающего списка фильтрации по времени
    function showTimeFilter(headerElement) {
        const oldDropdown = document.querySelector('.time-filter-dropdown');
        if (oldDropdown) oldDropdown.remove();
        
        const dropdown = document.createElement('div');
        dropdown.className = 'time-filter-dropdown';
        
        // Добавляем пункт "Все времена"
        const allOption = document.createElement('div');
        allOption.textContent = 'Все времена';
        allOption.className = 'time-filter-option';
        allOption.addEventListener('click', () => {
            currentTimeFilter = 'Все времена';
            updateTimeFilter();
            dropdown.remove();
        });
        dropdown.appendChild(allOption);
        
        // Добавляем все времена
        allTimes.forEach(time => {
            const option = document.createElement('div');
            option.textContent = time;
            option.className = 'time-filter-option';
            option.addEventListener('click', () => {
                currentTimeFilter = time;
                updateTimeFilter();
                dropdown.remove();
            });
            dropdown.appendChild(option);
        });
        
        // Позиционируем выпадающий список
        const rect = headerElement.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.top = `${rect.bottom}px`;
        dropdown.style.width = `${rect.width}px`;
        
        document.body.appendChild(dropdown);
        
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!dropdown.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 0);
    }

    // Функция для обновления фильтра по времени
    function updateTimeFilter() {
        const activeTab = document.querySelector('.filial-tab.active');
        if (activeTab) {
            displayPupilsForFilial(activeTab.textContent);
        }
    }

    // Функция сохранения изменений в ячейке
    function saveCellEdit(cell, login, field, newValue) {
        const db = firebase.firestore();
        const updateData = {};
        updateData[field] = parseInt(newValue) || 0;
        
        db.collection("users").doc(login).update(updateData)
            .then(() => {
                cell.innerHTML = newValue;
                
                // Обновляем данные в pupilsByFilial
                for (const filial in pupilsByFilial) {
                    const pupil = pupilsByFilial[filial].find(p => p.login === login);
                    if (pupil) {
                        pupil.data[field] = parseInt(newValue) || 0;
                        break;
                    }
                }
            })
            .catch(error => {
                console.error("Ошибка при сохранении:", error);
                alert('Не удалось сохранить изменения');
                cancelCellEdit(cell);
            });
    }

    // Функция отмены редактирования ячейки
    function cancelCellEdit(cell) {
        cell.innerHTML = cell.dataset.originalContent;
    }

    // Обработчик кнопки выхода
    document.getElementById('logoutBtn').addEventListener('click', function() {
        eraseCookie('teacher');
        localStorage.removeItem('teacherData');
        window.location.href = '../index.html';
    });
});