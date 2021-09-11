const htmlBody = document.getElementsByTagName('body');
const cityInput = document.querySelector('.city-input');
const cityName = document.querySelector('.city-name');
const searchBtn = document.querySelector('.search-btn');
const currentCityCard = document.querySelector('.current-city-info-container');
const map = document.querySelector('.city-map');
const errorMessage = document.querySelector('.error-message');
const forecastContainer = document.querySelector('.daily-forecast-container');
const forecastByDay = document.querySelector('.day-forecast-container');
const forecastByHour = document.querySelector('.hour-forecast-container');
let city = "";

// here i added a function that converts api time to local time.
// api time is in sec, i will convert in miliseconds, and display them as local format
function transformToLocalDateFormat(date){
    let currentDate = new Date(date * 1000);
        let month = currentDate.getMonth() + 1; //months from 1-12, but this method returns januarry as 0, feb as 1 etc
        let day = currentDate.getDate();
        let year = currentDate.getFullYear();
    return  day + '/' + month + '/' + year;
}

cityInput.addEventListener("keypress", enterKeyValidation);
function enterKeyValidation(e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    searchBtn.click();
  }
}


searchBtn.addEventListener('click', setQuery );


function setQuery(){
    if(cityInput.value){
        getResults(cityInput.value);
        getForecastWeather(cityInput.value); // i added both functions so i use the same querry -- in this case same city name
        
    }
    
}

function getResults(query){
    fetch(`https://api.openweathermap.org/data/2.5/weather?appid=69518b1f8f16c35f8705550dc4161056&units=metric&q=${query}`)
        .then(currentWeather => currentWeather.json())
        .then(displayResults)
        // .then(setBackground)
}

function displayResults (currentWeather) {
    if(currentWeather.name === undefined){
        errorMessage.classList.remove('hidden');
        errorMessage.innerText = 'Please type in a valid city name';
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    } else {
        //made visible the current weather card, the 6days forecast and the map
        currentCityCard.classList.remove('hidden'); 
        forecastContainer.classList.remove('hidden'); 
        map.classList.remove('hidden-map');
        cityInput.value = ""; // here i reseted the input
        // now i added the current weather info for selected city 
        let city = document.querySelector('.city-name');
        city.innerText = `${currentWeather.name}, ${currentWeather.sys.country}`
        let currentDate = document.querySelector('.current-date');
        currentDate.innerText = transformToLocalDateFormat(currentWeather.dt);
        let descriptionImg = document.querySelector('.description-img');
        descriptionImg.src =  `http://openweathermap.org/img/w/${currentWeather.weather[0].icon}.png`;
        let descriptionText = document.querySelector('.current-description');
        descriptionText.innerText = `${currentWeather.weather[0].description}`;
        let currentTemp = document.querySelector('.current-temp');
        currentTemp.innerText = Math.round(`${currentWeather.main.temp}`) + '°C';
        let tempRange = document.querySelector('.current-day-temp-range');
        //the api does not show correct temp range
        tempRange.innerText = 'Temp range: ' + Math.round(`${currentWeather.main.temp_min}`) + '/' +  (Math.round(`${currentWeather.main.temp_max}`) + ' °C');
        let humidity = document.querySelector('.current-day-humidity');
        humidity.innerText = `Humidity: ${currentWeather.main.humidity}%`;
        let pressure = document.querySelector('.current-day-pressure');
        pressure.innerText = `Pressure: ${currentWeather.main.pressure} hPa`;

        setBackground(currentWeather.weather[0].icon);
        forecastByHour.innerHTML ="";
    }
}



// adding six days forecast functionality
//we already set the query parameter above

function getForecastWeather(query){
    fetch(`https://api.openweathermap.org/data/2.5/forecast?appid=69518b1f8f16c35f8705550dc4161056&units=metric&q=${query}`)
        .then(forecastWeather => forecastWeather.json())
        .then(data => showForecast(data))
        .catch((error) => { console.log(error)});
        // .then(showHourlyForecast)
}


function showForecast(forecastWeather){
    city = forecastWeather.city.name;
    let currentDate = new Date(`${forecastWeather.list[0].dt}` * 1000);
        let month = currentDate.getMonth() + 1; //months from 1-12, but this method returns januarry as 0, feb as 1 etc
        let today = currentDate.getDate() ;
    
    let createForecastCards = ``;

    for(let j=0; j<6; j++){
       
        for(let i=0; i<forecastWeather.list.length ; i++){
            let currentListDate = new Date(`${forecastWeather.list[i].dt}` * 1000);
            if(currentListDate.getDate() == today){
                let date = today + " / " + month;
                createForecastCards += 
                // am folosit atributul current-day sa stochez ziua afisata pe fiecare buton
                `<div>
            <button class="day-forecast" current-day=${today}> 
            <h2 class="day-date">${date}</h2>
<img class="description-img" src="http://openweathermap.org/img/w/${forecastWeather.list[i].weather[0].icon}.png" alt="icon">
            <h2 class="day-temp">${Math.round(forecastWeather.list[i].main.temp)} °C</h2>
            <p class="day-description">${forecastWeather.list[i].weather[0].description}</p>
            </button>
            </div> `
            forecastByDay.innerHTML = createForecastCards;
            today += 1;
            break;
            }
            
            // today += 1; // here i add a day to current day for each card 
        }
      
    }
    }



//i will add the forecast by hour with an event listener by clicking on each day card
forecastByDay.addEventListener('click', (ev) =>{
    let currentDay = ev.target.parentElement.getAttribute('current-day');
    showHourlyForecast(currentDay);
});

function showHourlyForecast(day){
    fetch(`https://api.openweathermap.org/data/2.5/forecast?appid=69518b1f8f16c35f8705550dc4161056&units=metric&q=${city}`)
        .then(response => response.json())
        .then(data => {
            let createHourCards = ``;
            data.list.forEach(element => {
                let currentListDate = new Date(element.dt * 1000);
                
                if(currentListDate.getDate() == day){
                    createHourCards += 
                    `<div class="hour-forecast">
                    <h3>${currentListDate.getHours()}:00</h3>
                    <img src="http://openweathermap.org/img/w/${element.weather[0].icon}.png"  alt="icon">
                    <h3>${Math.round(element.main.temp)}°C</h3>
                    <p>${element.weather[0].description}</p>
                </div>
                    `
                }
               
            }) 
            forecastByHour.innerHTML = createHourCards;
            
        });

    
}

function setBackground(icon) {
    // first i want to be sure that i will not add multiple backgrounds
    let videoBackgrounds = document.querySelectorAll('video');
    videoBackgrounds.forEach(element => element.classList.remove('video-active'));

    let clearDayBackground = document.querySelector('.clear_day');
    let clearNightBackground = document.querySelector('.clear_night');
    let cloudsDayBackground = document.querySelector('.clouds_day');
    let cloudsNightBackground = document.querySelector('.clouds_night');
    let rainDayBackground = document.querySelector('.rain_day');
    let rainNightBackground = document.querySelector('.rain_night');
    let thunderstormNightBackground = document.querySelector('.thunderstorm_night');
    let snowfallDayBackground = document.querySelector('.snowfall_day');
    let snowfallNightBackground = document.querySelector('.snowfall_night');
    let mistBackground = document.querySelector('.mist');

    // i will give the correct video a class that displays it in the page
    // if it maches the right icon
    switch(icon){
        case '01d':
            clearDayBackground.classList.add('video-active');
            break;
        case  '01n':
            clearNightBackground.classList.add('video-active');
            break;
        case '02d':
        case '03d':
        case '04d':
            cloudsDayBackground.classList.add('video-active');
            break;
        case '02n':
        case '03n':
        case '04n':
            cloudsNightBackground.classList.add('video-active');
            break;
        case '09d':
        case '10d':
            rainDayBackground.classList.add('video-active');
            break;
        case '09n':
        case '10n':
            rainNightBackground.classList.add('video-active');
            break;
        case '11d':
        case '11n':
            thunderstormNightBackground.classList.add('video-active');
            break;
        case '13d':
            snowfallDayBackground.classList.add('video-active');
            break;
        case '13n':
            snowfallNightBackground.classList.add('video-active');
            break;
        case '50d':
        case '50n':
            mistBackground.classList.add('video-active');
            break;
    }
};



//things remained to do: 
// display the corect map
// reset the hour forecast every time a new city is entered