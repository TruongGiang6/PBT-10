
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherState = document.getElementById('weatherState');
const historyContainer = document.getElementById('historyContainer');


let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];

renderHistory();


searchBtn.addEventListener('click', () => handleSearch());
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});


function handleSearch(cityFromHistory = null) {
    const city = cityFromHistory || cityInput.value.trim();
    if (!city) return;
    
    fetchWeather(city);
}

async function fetchWeather(city) {
    // State 1: LOADING
    renderLoading();

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`Không tìm thấy thành phố "${city}"!`);
        }

        const { latitude, longitude, name } = geoData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`;
        const weatherRes = await fetch(weatherUrl);
        
        if (!weatherRes.ok) throw new Error("Lỗi kết nối máy chủ thời tiết!");
        
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const weatherDesc = getWeatherDescription(current.weather_code);

        renderSuccess({
            city: name,
            temp: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            desc: weatherDesc.text,
            icon: weatherDesc.icon
        });

        updateHistory(name);

    } catch (error) {
        renderError(error.message || "Đã xảy ra lỗi mạng. Vui lòng thử lại!");
    }
}

function renderLoading() {
    weatherState.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
    `;
}

function renderError(message) {
    weatherState.innerHTML = `
        <div class="error-msg">
            <i class="fa-solid fa-triangle-exclamation"></i> ${message}
        </div>
    `;
}

function renderSuccess(data) {
    weatherState.innerHTML = `
        <div class="weather-info">
            <h3>${data.city}</h3>
            <div class="weather-icon">${data.icon}</div>
            <div class="temp">${data.temp}°C</div>
            <div class="details">
                <span><i class="fa-solid fa-droplet"></i> ${data.humidity}%</span>
                <span>${data.desc}</span>
            </div>
        </div>
    `;
}


function updateHistory(city) {
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== city.toLowerCase());
    
    searchHistory.unshift(city);

    if (searchHistory.length > 5) {
        searchHistory.pop();
    }

    localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    
    renderHistory();
}

function renderHistory() {
    historyContainer.innerHTML = "";
    searchHistory.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'history-btn';
        btn.textContent = city;
        btn.addEventListener('click', () => {
            cityInput.value = city;
            handleSearch(city);
        });
        historyContainer.appendChild(btn);
    });
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: { text: "Trời quang", icon: '<i class="fa-solid fa-sun"></i>' },
        1: { text: "Ít mây", icon: '<i class="fa-solid fa-cloud-sun"></i>' },
        2: { text: "Nhiều mây", icon: '<i class="fa-solid fa-cloud"></i>' },
        3: { text: "U ám", icon: '<i class="fa-solid fa-cloud"></i>' },
        45: { text: "Sương mù", icon: '<i class="fa-solid fa-smog"></i>' },
        48: { text: "Sương mù lạnh", icon: '<i class="fa-solid fa-smog"></i>' },
        51: { text: "Mưa phùn nhẹ", icon: '<i class="fa-solid fa-cloud-rain"></i>' },
        53: { text: "Mưa phùn vừa", icon: '<i class="fa-solid fa-cloud-rain"></i>' },
        61: { text: "Mưa nhẹ", icon: '<i class="fa-solid fa-cloud-showers-heavy"></i>' },
        63: { text: "Mưa vừa", icon: '<i class="fa-solid fa-cloud-showers-heavy"></i>' },
        80: { text: "Mưa rào", icon: '<i class="fa-solid fa-cloud-showers-water"></i>' },
        95: { text: "Giông bão", icon: '<i class="fa-solid fa-cloud-bolt"></i>' }
    };
    return weatherCodes[code] || { text: "Không rõ", icon: '<i class="fa-solid fa-temperature-half"></i>' };
}