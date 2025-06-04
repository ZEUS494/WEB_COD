const courses = document.getElementById('courses');

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

function updatePeriodChart(users) {
    console.log(users)
    const validUsers = users.filter(u =>
        u.fullname &&
        typeof u.codcoins === 'number' &&
        !isNaN(u.codcoins) &&
        u.codcoins > 0
    );

    const sortedUsers = validUsers.sort((a, b) => b.codcoins - a.codcoins);
    const top5Users = sortedUsers.slice(0, 5);

    if (top5Users.length === 0) {
        console.warn("Нет пользователей с codcoins > 0");
        return;
    }

    const maxCoins = top5Users[0].codcoins;

    function createBars(container, usersList) {
        container.innerHTML = "";
        usersList.forEach(user => {
            const barHeight = Math.max(10, Math.min(250, (user.codcoins / maxCoins) * 250));
            const bar = document.createElement("div");
            bar.className = "bar";
            bar.innerHTML = `
                <div style="height: ${barHeight}px;"></div>
                <span>${user.fullname.split(' ')[1]}<br>(${user.codcoins})</span>
            `;
            container.appendChild(bar);
        });
    }

    const chart1 = document.querySelector(".chart-wrapper:nth-of-type(1) .bar-container");
    if (chart1) createBars(chart1, top5Users);
}

function updateCoursesChart(users) {
    console.log(users)
    const validUsers = users.filter(u =>
        u.fullname &&
        typeof u.codcoins === 'number' &&
        !isNaN(u.codcoins) &&
        u.codcoins > 0
    );

    const sortedUsers = validUsers.sort((a, b) => b.codcoins - a.codcoins);
    const top5Users = sortedUsers.slice(0, 5);

    if (top5Users.length === 0) {
        console.warn("Нет пользователей с codcoins > 0");
        return;
    }

    const maxCoins = top5Users[0].codcoins;

    function createBars(container, usersList) {
        container.innerHTML = "";
        usersList.forEach(user => {
            const barHeight = Math.max(10, Math.min(250, (user.codcoins / maxCoins) * 250));
            const bar = document.createElement("div");
            bar.className = "bar";
            bar.innerHTML = `
                <div style="height: ${barHeight}px;"></div>
                <span>${user.fullname.split(' ')[1]}<br>(${user.codcoins})</span>
            `;
            container.appendChild(bar);
        });
    }

    const chart3 = document.querySelector(".chart-wrapper:nth-of-type(2) .bar-container");
    if (chart3) createBars(chart3, top5Users);
}

// Обработка изменения курса
courses.addEventListener('change', () => {
    const selectedCourse = courses.value;
    if (!selectedCourse) return;

    db.collection("users")
        .where("currentcourse", "==", selectedCourse)
        .get()
        .then(snapshot => {
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            updateCoursesChart(users);
        })
        .catch(error => {
            console.error("Ошибка фильтрации по курсу:", error);
        });
});

// Загрузка данных при инициализации
db.collection("users")
    .get()
    .then(snapshot => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        updatePeriodChart(users);
        updateCoursesChart(users); // Изначально отображаем всех пользователей
    })
    .catch(error => {
        console.error("Ошибка загрузки данных из Firestore:", error);
    });