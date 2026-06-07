
const API_URLS = [
    "https://randomuser.me/api/", // Index 0
    "https://dog.ceo/api/breeds/image/random", // Index 1
    "https://api.open-meteo.com/v1/forecast?latitude=21.03&longitude=105.85&current_weather=true" // Index 2
];

const refreshBtn = document.getElementById('refreshBtn');
const timeDisplay = document.getElementById('timeDisplay');

async function fetchAPI(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
    return r.json();
}

async function loadDashboard() {
    const startTime = Date.now();
    
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> Đang tải...';
    timeDisplay.textContent = 'Đang tải dữ liệu...';
    
    [0, 1, 2].forEach(index => showWidgetLoading(index));

    const results = await Promise.allSettled([
        fetchAPI(API_URLS[0]),
        fetchAPI(API_URLS[1]),
        fetchAPI(API_URLS[2])
    ]);
    
    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            renderWidget(index, result.value);
        } else {
            renderWidgetError(index, result.reason.message || "Lỗi không xác định");
        }
    });

    const timeTaken = Date.now() - startTime;
    timeDisplay.textContent = `Data loaded in ${timeTaken} ms`;
    console.log(`Loaded in ${timeTaken}ms`);

    refreshBtn.disabled = false;
    refreshBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Refresh All';
}

function showWidgetLoading(index) {
    const content = document.getElementById(`content-${index}`);
    content.innerHTML = `
        <div class="spinner"></div>
        <p style="color: #888;">Đang tải dữ liệu...</p>
    `;
}

function renderWidgetError(index, message) {
    const content = document.getElementById(`content-${index}`);
    content.innerHTML = `
        <div class="widget-error">
            <i class="fa-solid fa-triangle-exclamation"></i> 
            <p><strong>Thất bại!</strong></p>
            <p>${message}</p>
        </div>
    `;
}

function renderWidget(index, data) {
    const content = document.getElementById(`content-${index}`);
    
    switch(index) {
        case 0:
            const user = data.results[0];
            content.innerHTML = `
                <img src="${user.picture.large}" class="user-avatar" alt="Avatar">
                <h3>${user.name.first} ${user.name.last}</h3>
                <p><i class="fa-solid fa-envelope" style="color:#888"></i> ${user.email}</p>
                <p><i class="fa-solid fa-earth-americas" style="color:#888"></i> ${user.location.country}</p>
            `;
            break;

        case 1:
            content.innerHTML = `
                <img src="${data.message}" class="dog-image" alt="Random Dog">
            `;
            break;

        case 2:
            const weather = data.current_weather;
            content.innerHTML = `
                <p>Nhiệt độ hiện tại</p>
                <div class="weather-temp">${weather.temperature}°C</div>
                <p><i class="fa-solid fa-wind"></i> Gió: ${weather.windspeed} km/h</p>
            `;
            break;
    }
}

refreshBtn.addEventListener('click', loadDashboard);

document.addEventListener('DOMContentLoaded', loadDashboard);