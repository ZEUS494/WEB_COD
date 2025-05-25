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

function updateCharts(users) {
    console.log(users)
    // Фильтруем только тех, у кого есть fullname и codcoins > 0
    const validUsers = users.filter(u => 
        u.fullname && 
        typeof u.codcoins === 'number' && 
        !isNaN(u.codcoins) &&
        u.codcoins > 0
    );

    // Сортируем по codcoins по убыванию
    const sortedUsers = validUsers.sort((a, b) => b.codcoins - a.codcoins);

    // Берём топ-5
    const top5Users = sortedUsers.slice(0, 5);

    if (top5Users.length === 0) {
        console.warn("Нет пользователей с codcoins > 0");
        return;
    }

    const maxCoins = top5Users[0].codcoins;

    // Создаем элементы баров
    function createBars(container, usersList) {
        container.innerHTML = ""; // Очищаем старые данные

        usersList.forEach(user => {
            const barHeight = Math.max(10, Math.min(250, (user.codcoins / maxCoins) * 250)); // Ограничиваем высоту

            const bar = document.createElement("div");
            bar.className = "bar";
            bar.innerHTML = `
                <div style="height: ${barHeight}px;"></div>
                <span>${user.fullname} (${user.codcoins})</span>
            `;
            container.appendChild(bar);
        });
    }

    // Обновляем оба графика
    const chart1 = document.querySelector(".chart-wrapper:nth-of-type(1) .bar-container");
    const chart2 = document.querySelector(".chart-wrapper:nth-of-type(2) .bar-container");

    if (chart1) createBars(chart1, top5Users);
    if (chart2) createBars(chart2, top5Users);
}

// Загрузка всех пользователей из Firestore
db.collection("users")
    .get()
    .then(snapshot => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        updateCharts(users);
    })
    .catch(error => {
        console.error("Ошибка загрузки данных из Firestore:", error);
    });