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

document.addEventListener('DOMContentLoaded', function() {
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
                  // Устанавливаем куки с именем пользователя и сроком действия 30 дней
                  setCookie('user', username, 30);
                  // Сохраняем остальные данные в localStorage
                  localStorage.setItem('userData', JSON.stringify(data));
                  console.log("Данные пользователя сохранены в localStorage");
                  console.log("Имя пользователя:", localStorage.getItem('user'));
                  console.log("Остальные данные:", JSON.parse(localStorage.getItem('userData')));
                  window.location.href = './account/account.html';
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

  // Автоматическая проверка куки и перенаправление на аккаунт
  const storedUsername = getCookie('user');
  if (storedUsername && window.location.pathname !== './account/account.html') {
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

  // Обработка страницы аккаунта
  if (window.location.pathname.includes('/account')) {
      const user = getCookie('user');
      const userDataString = localStorage.getItem('userData');

      if (!user || !userDataString) {
          alert("Вы не вошли в систему.");
          window.location.href = '../index.html';
          return;
      }

      const userData = JSON.parse(userDataString);

      if (!userData || !userData.codcoins || !userData.currentcourse) {
          console.error("Недостаточно данных для отображения.", userData);
          alert("Недостаточно данных для отображения.");
          return;
      }

      // Отображаем начальные данные
      document.getElementById('username').innerText = user;
      document.getElementById('codcoins').innerText = userData.codcoins;
      document.getElementById('currentcourse').innerText = userData.currentcourse;

      // Подписываемся на изменения в документе пользователя
      db.collection("users").doc(user)
          .onSnapshot(function(snapshot) {
              if (snapshot.exists) {
                  const updatedData = snapshot.data();
                  console.log("Документ обновлен:", updatedData);

                  // Обновляем данные на странице
                  document.getElementById('codcoins').innerText = updatedData.codcoins;
                  document.getElementById('currentcourse').innerText = updatedData.currentcourse;

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

function logout() {
  eraseCookie('user');
  localStorage.clear();
  window.location.href = '../index.html';
}