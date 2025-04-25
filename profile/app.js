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

// Автоматическое перенаправление на страницу аккаунта, если есть валидные куки
const storedUsername = getCookie('user');
if (storedUsername && window.location.pathname !== '/account/account.html') {
  try {
    const userRef = db.collection("users").doc(storedUsername).get();
    if (userRef.exists) {
      const data = userRef.data();
      localStorage.setItem('userData', JSON.stringify(data));
      window.location.href = './account/account.html';
    }
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

// Логи обработки страницы аккаунта (если мы находимся на аккаунте)
if (window.location.pathname.includes('/account')) {
  const user = getCookie('user');
  const userDataString = localStorage.getItem('userData');

  if (!user || !userDataString) {
    alert("Вы не вошли в систему.");
    window.location.href = '../index.html';
    return;
  }

  const userData = JSON.parse(userDataString);

  if (
    !userData ||
    !userData.codcoins ||
    !userData.currentcourse ||
    !userData.donehws ||
    !userData.notdonehws ||
    !Array.isArray(userData.completedcources)
  ) {
    console.error("Недостаточно данных для отображения.", userData);
    alert("Недостаточно данных для отображения.");
    return;
  }

  // Выгрузка начальных данных на экран
  document.getElementById('username').innerText = user;
  document.getElementById('codcoins').innerText = userData.codcoins;
  document.getElementById('currentcourse').innerText = userData.currentcourse;

  // Обновление полей заданий
  const completedTasksEl = document.getElementById('completed-tasks');
  const uncompletedTasksEl = document.getElementById('uncompleted-tasks');
  completedTasksEl.innerHTML = `${userData.donehws}`;
uncompletedTasksEl.innerHTML = `${userData.notdonehws}`;

  // Обновление списка завершённых курсов
  const completedCoursesEl = document.getElementById('completed-courses');
  completedCoursesEl.textContent = ''; // очищаем предыдущий контент
  userData.completedcources.forEach(course => {
    const courseSpan = document.createElement('span');
    courseSpan.className = 'course-item';
    courseSpan.textContent = course;
    completedCoursesEl.appendChild(courseSpan);
  });

  // Реализация live-подписки на изменения документа пользователя
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

        // Очистка предыдущего содержимого списка курсов
        completedCoursesEl.textContent = '';
        updatedData.completedcources.forEach((course) => {
          const courseSpan = document.createElement('span');
          courseSpan.className = 'course-item';
          courseSpan.textContent = course;
          completedCoursesEl.appendChild(courseSpan);
          completedCoursesEl.appendChild(document.createElement('br')); // Новая строка между элементами
        });

        // Обновляем данные в localStorage
        localStorage.setItem('userData', JSON.stringify(updatedData));
      } else {
        console.error("Документ не найден.");
      }
    }, function(error) {
      console.error("Ошибка получения данных:", error);
    });
}
});

// Функция выхода из системы
function logout() {
  eraseCookie('user');
  localStorage.clear(); // очистка данных профиля
  window.location.href = '../index.html';
}