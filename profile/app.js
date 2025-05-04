// Настройка конфигурации Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBeCuMUazd-l9D0vPqfBrNJYSxCgOG6DeY",
  authDomain: "codweb-4d1aa.firebaseapp.com",
  projectId: "codweb-4d1aa",
  storageBucket: "codweb-4d1aa.firebasestorage.app",
  messagingSenderId: "892570211314",
  appId: "1:892570211314:web:4888edb47d69cbd809d16b",
  measurementId: "G-57GYQLP328"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      console.log(`Логин: ${username}, Пароль: ${password}`);

      try {
        const userRef = await db.collection("users").doc(username).get();

        if (!userRef.exists) {
          alert("Пользователь не найден");
          return;
        }

        const data = userRef.data();

        if (data.password === password) {
          // Установка куков и сохранение данных в Local Storage
          setCookie('user', username, 30); // Куки будут храниться 30 дней
          localStorage.setItem('userData', JSON.stringify(data));

          // Проверка, является ли пользователь администратором
          if (username === 'admin') {
            // Переадресация на административный интерфейс
            window.location.href = './admin/admin.html';
          } else {
            // Все остальные пользователи направляются на обычную страницу аккаунта
            window.location.href = './account/account.html';
          }
        } else {
          alert("Неверный пароль");
        }
      } catch (error) {
        console.error("Ошибка:", error);
      }
    });
  } else {
    console.error("Элемент 'loginForm' не найден!");
  }

  // Логи обработки страницы аккаунта (если мы находимся на аккаунте)
  if (window.location.pathname.includes('/account')) {
    const user = getCookie('user');

    if (!user) {
      window.location.href = '../index.html';
      return;
    }

    // Чтение данных пользователя из Firestore
    db.collection("users").doc(user).get().then(doc => {
      if (!doc.exists) {
        window.location.href = '../index.html';
        return;
      }

      const userData = doc.data();

      // Проверяем обязательные поля
      if (
        typeof userData.codcoins !== 'number' ||
        typeof userData.currentcourse !== 'string' ||
        typeof userData.donehws !== 'number' ||
        typeof userData.notdonehws !== 'number' ||
        !Array.isArray(userData.completedcources)
      ) {
        console.error("Недостаточно данных для отображения.", userData);
        alert("Недостаточно данных для отображения.");
        return;
      }

      // Выгружаем начальные данные на экран
      document.getElementById('username').innerText = userData.fullname;
      document.getElementById('codcoins').innerText = userData.codcoins;
      document.getElementById('currentcourse').innerText = userData.currentcourse;

      // Обновляем поля выполненных заданий
      const completedTasksEl = document.getElementById('completed-tasks');
      const uncompletedTasksEl = document.getElementById('uncompleted-tasks');
      completedTasksEl.innerHTML = `${userData.donehws}`;
      uncompletedTasksEl.innerHTML = `${userData.notdonehws}`;

      // Обновляем список завершённых курсов
      updateCompletedCoursesList(userData.completedcources);

      // Реализуем live-подписку на изменения документа пользователя
      db.collection("users")
        .doc(user)
        .onSnapshot(function(snapshot) {
          if (snapshot.exists) {
            const updatedData = snapshot.data();
            console.log("Обновлены данные пользователя:", updatedData);

            // Обновляем данные на экране
            document.getElementById('codcoins').innerText = updatedData.codcoins;
            document.getElementById('currentcourse').innerText = updatedData.currentcourse;
            completedTasksEl.innerHTML = `${updatedData.donehws}`;
            uncompletedTasksEl.innerHTML = `${updatedData.notdonehws}`;

            // Обновляем список завершённых курсов
            updateCompletedCoursesList(updatedData.completedcources);

            // Обновляем данные в localStorage
            localStorage.setItem('userData', JSON.stringify(updatedData));
          } else {
            console.error("Документ не найден.");
          }
        }, function(error) {
          console.error("Ошибка получения данных:", error);
        });
    }).catch(err => {
      console.error("Ошибка загрузки данных пользователя:", err);
    });
  }
});

// Функция выхода из системы
function logout() {
  eraseCookie('user');
  localStorage.clear(); // очистка данных профиля
  window.location.href = '../index.html';
}

// Функция для обновления списка завершённых курсов
function updateCompletedCoursesList(completedCourses) {
  const completedCoursesEl = document.getElementById('completed-cources');
  completedCoursesEl.textContent = ''; // очищаем предыдущий контент

  if (completedCourses.length > 0) {
    completedCourses.forEach((course) => {
      const courseSpan = document.createElement('span');
      courseSpan.className = 'course-item';
      courseSpan.textContent = course;
      completedCoursesEl.appendChild(courseSpan);
      completedCoursesEl.appendChild(document.createElement('br')); // добавляем перенос строки между элементами
    });
  } else {
    completedCoursesEl.textContent = 'У вас пока нет завершённых курсов.';
  }
}

// Вспомогательные функции для работы с куками
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // устанавливаем срок хранения
    expires = "; expires=" + date.toUTCString(); // форматируем строку для даты окончания
  }
  document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function getCookie(name) {
  let nameEQ = encodeURIComponent(name) + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i].trim(); // чистим лишние пробелы
    if(c.startsWith(nameEQ)) return decodeURIComponent(c.slice(nameEQ.length)); // возвращаем значение
  }
  return null; // куку не нашли
}

function eraseCookie(name) {
  document.cookie = encodeURIComponent(name) + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}