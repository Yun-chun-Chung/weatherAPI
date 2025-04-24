const url = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-75E82891-1AFB-4E06-8A92-403DCA5FC429';

// 更新下拉式選單的時間選項
const updateSelectTime = (data) => {
    const timeRangeSelect = document.querySelector('.timeRangeSelect');
    const timeArr = data[0].weatherElement[0].time;
    let content = '';

    timeArr.forEach((item) => {
        const startTime = item.startTime.slice(5, 16).replace('-', '/');
        const endTime = item.endTime.slice(5, 16).replace('-', '/');
        content += `<option value="${item.startTime}">${startTime} - ${endTime}</option>`;
    });

    timeRangeSelect.innerHTML = content;
};

// 取得天氣資料並渲染
const getData = (locations, selectedTime) => {
    return locations.map((item) => {
        const weatherElement = item.weatherElement;
        const weatherData = [];

        weatherElement[0].time.forEach((time, i) => {
            const data = {
                startTime: time.startTime,
                endTime: time.endTime,
                weatherDescription: time.parameter.parameterName,
                weatherValue: time.parameter.parameterValue,
                rainProbability: `${weatherElement[1].time[i].parameter.parameterName}%`,
                minTemperature: `${weatherElement[2].time[i].parameter.parameterName}°`,
                Temperature: weatherElement[3].time[i].parameter.parameterName,
                maxTemperature: weatherElement[4].time[i].parameter.parameterName,
                feelsLikeTemperature: `${weatherElement[4].time[i].parameter.parameterName}°`
            };
            weatherData.push(data);
        });

        return {
            locationName: item.locationName,
            weather: weatherData.find(item => item.startTime === selectedTime)
        };
    });
};

// 渲染天氣卡片
const renderWeather = (locations) => {
    const container = document.querySelector('.container');
    container.innerHTML = '';

    locations.forEach(item => {
        const cityName = item.locationName;
        const weather = item.weather; // 取得選擇的時間的天氣資料

        const weatherTime = formatDate(weather.startTime);
        const weekday = getDayOfWeek(weather.startTime);
        const weatherIconSrc = checkImg(weather.weatherDescription, new Date(weather.startTime).getHours());
        // const temperature = weatherTemperature(weather.Temperature); -> 天氣描述
        const minTemperature = weather.minTemperature;
        const maxTemperature = weather.maxTemperature;
        const rainProbability = weatherRain(weather.rainProbability);

        console.log(`${cityName},${weather.weatherDescription}`);


        container.innerHTML += `
            <div class="weather-card bg-slate-400/40">
                <div class="card-top">
                    <div class="cityName">${cityName}</div>
                    <div class="weatherTime">${weatherTime}<br>${weekday}</div>
                </div>
                <div class="card-middle">
                    <div class="Icon"><img src="${weatherIconSrc}" alt="Weather Icon"></div>
                    <div class="weatherDescribe">${weather.weatherDescription}</div>
                    
                    <div class="temperature"><img src="../img/temperature.svg" alt="Temperature Icon">${maxTemperature} / ${minTemperature}</div>
                </div>
                <div class="card-bottom">
                    <div class="rainning">${rainProbability}</div>
                </div>
            </div>
        `;
        // <div class="temperature">${temperature}</div> ->要加天氣描述再放上去
    });

};

// 找星期幾
function getDayOfWeek(dateDay) {
    const date = new Date(dateDay);
    const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
    return `星期${daysOfWeek[date.getDay()]}`;
}

// 格式化日期
function formatDate(dateDay) {
    const date = new Date(dateDay);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}


// 判斷天氣圖示
const checkImg = (description, time) => {
    const isDayTime = (time >= 6 && time < 18); // 判斷是白天或晚上
    const weatherImgs = {
        '晴天': '01',
        '晴時多雲': '02',
        '多雲時晴': '03',
        '多雲': '04',
        '多雲時陰': '05',
        '陰時多雲': '06',
        '陰天': '07',
        '有雲有雨': '08',
        '多雲陣雨': '08',
        '多雲短暫雨': '08',
        '多雲短暫陣雨': '08',
        '短暫暫雨': '08',
        '陰短暫雨': '10',
        '陰陣雨': '10',
        '陰短暫陣雨': '10',
        '多雲時陰短暫陣雨': '10',
        '陰時多雲短暫陣雨': '10',
        '雷陣雨': '17',
    };

    const imgFile = weatherImgs[description];
    if (!imgFile) return `./img/10.svg`;
    return isDayTime ? `./img/${imgFile}.svg` : `./img/${imgFile} (1).svg`;
};


// 顯示雨傘icon
function weatherRain(rainning) {
    return rainning ? `<img src="../img/umbrella.svg" alt="Rain Icon"> ${rainning}` : '';
}

// 溫度描述 -> temperature
// function weatherTemperature(Temperature) {
//     return` ${Temperature}`;
// }


// 取得資料
fetch(url)
    .then(response => response.json())
    .then(result => {
        const locations = result.records.location;
        updateSelectTime(result.records.location); // 更新下拉式選單

        let selectedTime = result.records.location[0].weatherElement[0].time[0].startTime; // 預設都抓第0筆資料
        const weatherData = getData(locations, selectedTime);
        renderWeather(weatherData);

        // 監聽下拉式選單的變化
        const timeRangeSelect = document.querySelector('.timeRangeSelect');
        timeRangeSelect.addEventListener('change', (event) => {
            selectedTime = event.target.value;
            const updatedWeatherData = getData(locations, selectedTime);
            renderWeather(updatedWeatherData);
        });

        // 區域選擇功能
        const Area = {
            all: ['臺北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '宜蘭縣', '臺中市', '彰化縣', '南投縣', '雲林縣', '苗栗縣', '臺南市', '高雄市', '屏東縣', '嘉義市', '嘉義縣', '花蓮縣', '臺東縣', '澎湖縣', '金門縣', '連江縣'],
            north: ['臺北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '宜蘭縣'],
            west: ['苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣'],
            south: ['嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣', '澎湖縣'],
            east: ['花蓮縣', '臺東縣'],
            Island: ['金門縣', '連江縣']
        };

        const areaList = document.querySelector('.area-list');
        const areas = document.querySelectorAll('.area');

        areaList.addEventListener('click', function (e) {
            if (e.target.classList.contains('area')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });

                areas.forEach(area => area.classList.remove('active'));
                e.target.classList.add('active');

                const region = e.target.classList[1].split('-')[1];
                const filterLocations = locations.filter(city => Area[region].includes(city.locationName));
                const weatherData = getData(filterLocations, selectedTime);
                renderWeather(weatherData);
            }
        });
    })
    .catch(error => console.error("發生錯誤：", error));
