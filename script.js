const form = document.querySelector('form');
const img = document.querySelector('img');
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector('.location-btn');
const dropdownCont = document.querySelector('.dropdown-cont');
const bottomCont = document.querySelector('.bottom');
const widgetCont = document.querySelector('.widget-cont');
const hoursCont = document.querySelector('.hours-cont');

let dropdownOptions = document.querySelectorAll('.option-btn');
let hovered = false;
let destination = {
}
let imageSrc = {
    clouds: './images/cloud.png',
    lightning: './images/lightning.png',
    rain: './images/rain.png',
    snow: './images/snow.png',
    sun: './images/sun.png',
    suncloud: './images/suncloud.png'
}

class Option {
    constructor(main, support = '', lat, lon) {
        this.main = main;
        this.support = support;
        this.lat = lat;
        this.lon = lon;
      }
    build() {
        const optionCont = document.createElement('button');
        optionCont.classList.add('option-btn');
        optionCont.innerText = `${this.main}, ${this.support}`;
        optionCont.value = `${this.lat}, ${this.lon}`;

        return optionCont
    }
}

class Widget {
    constructor(infoObject) {
        this.title = infoObject.title;
        this.temp = infoObject.temp;
        this.feelsLike = infoObject.feelsLike;
        this.rise = infoObject.rise;
        this.set = infoObject.set;
        this.src = infoObject.src;
    }
    build() {
        const wCont = document.createElement('div');
        wCont.classList.add('w-cont');

        wCont.append(this.img(), this.wTitle(), this.temps(), this.sunset());

        return wCont
    }
    wTitle() {
        const wTitle = document.createElement('h3');
        wTitle.classList.add('w-title', 'w-text');
        wTitle.innerText = this.title;

        return wTitle
    }
    temps() {
        const tempCont = document.createElement('div');
        tempCont.classList.add('w-sub');

        const wATemp = document.createElement('h3');
        wATemp.classList.add('w-atemp', 'w-subtitle', 'w-text');
        wATemp.innerText = `Temp: ${Math.round(this.temp)}˚C`;

        const wFLTemp = document.createElement('h3');
        wFLTemp.classList.add('w-atemp', 'w-subtitle', 'w-text');
        wFLTemp.innerText = `Feels: ${Math.round(this.feelsLike)}˚C`;

        tempCont.append(wATemp, wFLTemp);

        return tempCont
    }
    sunset() {
        const sunsetCont = document.createElement('div');
        sunsetCont.classList.add('w-sub');

        const sRiseCont = document.createElement('div');
        sRiseCont.classList.add('sun-cont');

        const sRiseImg = document.createElement('img');
        sRiseImg.classList.add('sun-img');
        sRiseImg.src = "./images/sunrise.png";
        sRiseImg.alt = "sunrise";

        const wSRise = document.createElement('h3');
        wSRise.classList.add('w-srise', 'w-subtitle', 'w-text');
        wSRise.innerText = `${this.rise}`;

        const sSetCont = document.createElement('div');
        sSetCont.classList.add('sun-cont');

        const sSetImg = document.createElement('img');
        sSetImg.classList.add('sun-img', 'sunset-img');
        sSetImg.src = "./images/sunset.png";
        sSetImg.alt = "sunset";

        const wSSet = document.createElement('h3');
        wSSet.classList.add('w-sset', 'w-subtitle', 'w-text');
        wSSet.innerText = `${this.set}`;

        sRiseCont.append(sRiseImg, wSRise);
        sSetCont.append(sSetImg, wSSet);

        sunsetCont.append(sRiseCont, sSetCont);

        return sunsetCont
    }
    img() {
        const wImg = document.createElement('img');
        wImg.classList.add('w-img');
        wImg.src = this.src;

        return wImg
    }
}

class HourWidget {
    constructor(infoObject) {
        this.temp = infoObject.temp;
        this.time = infoObject.time;
        this.src = infoObject.src;
    }
    build() {
        const dayCont = document.createElement('div');
        dayCont.classList.add('hour-cont');

        const dayImg = document.createElement('img');
        dayImg.classList.add('hour-img');
        dayImg.src = this.src;

        const dayTemp = document.createElement('h3');
        dayTemp.classList.add('hour-temp', 'w-subtitle', 'w-text');
        dayTemp.innerText = `${Math.round(this.temp)}˚C`;

        const day = document.createElement('h3');
        day.classList.add('hour', 'w-subtitle', 'w-text');
        day.innerText = `${this.time}`;

        dayCont.append(dayImg, dayTemp, day);

        return dayCont
    }
}

async function searchDay(dest) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${dest.latitude}&lon=${dest.longitude}&appid=cfb3643bbe5fcd28991d13d72a8fe170&units=metric`)
        const data = await response.json();

        let infoObject = {
            title: dest.name.split(',')[0],
            temp: data.main.temp,
            feelsLike: data.main.feels_like,
            rise: convertUnixTime(data.sys.sunrise),
            set: convertUnixTime(data.sys.sunset),
            src: checkImgSrc(data.weather[0].main)
        }

        const widget = new Widget(infoObject);

        widgetCont.innerHTML = ``;
        widgetCont.append(widget.build());

        if (localStorage.getItem("recent-location")) {
            const info = JSON.parse(localStorage.getItem("recent-location"));

            if (dest.name !== info.name) updateStorage();
        } else {
            updateStorage();
        }
    } catch (error) {
        console.error(`Oops, an error occured with the API: ${error}`)
    }
}

async function searchHours(dest) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${dest.latitude}&lon=${dest.longitude}&cnt=5&appid=cfb3643bbe5fcd28991d13d72a8fe170&units=metric`)
        const data = await response.json();

        hoursCont.innerHTML = ``;

        Object.values(data.list).forEach((value) => {
            let infoObject = {
                temp: value.main.temp,
                time: convertUnixTime(value.dt),
                src: checkImgSrc(value.weather[0].main)
            }

            const widget = new HourWidget(infoObject).build();

            hoursCont.append(widget);
        });

    } catch (error) {
        console.error(`Oops, an error occured with the API: ${error}`)
    }
}

function geoFindMe(e) {
    e.preventDefault();

    async function success(position) {
        const latitude  = position.coords.latitude;
        const longitude = position.coords.longitude;
        const response = await fetch(`https://us1.locationiq.com/v1/reverse?key=pk.7ddaffa1d2c2e9caa53dad513ab187fc&lat=${latitude}&lon=${longitude}&format=json`);
        const data = await response.json();

        destination.latitude = latitude;
        destination.longitude = longitude;

        if (data.address.village) {
            searchInput.value = `${data.address.village}, ${data.address.town}`;
            destination.name = `${data.address.village}, ${data.address.town}`;
        } else if (data.address.town) {
            searchInput.value = `${data.address.town}, ${data.address.country}`;
            destination.name = `${data.address.town}, ${data.address.country}`;
        } else if (data.address.city) {
            searchInput.value = `${data.address.city}, ${data.address.country}`;
            destination.name = `${data.address.city}, ${data.address.country}`;
        } else {
            searchInput.value = `We can't find your location...`;
            destination.name = ``;
        }

        searchBtn.click();
    }

    function error() {
        searchInput.value = `We can't find your location...`;
    }

    if (!navigator.geolocation) {
        searchInput.value = 'Geolocation is not supported by your browser';
    } else {
        searchInput.value = 'Loading...';
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

async function autoComplete() {
    let input = searchInput.value;

    if (input.length === 0) {
        dropdownCont.innerHTML = ``;
        dropdownCont.style.display = 'none';
        return 
    }

    try {
        if (input.length === 0) return

        input = input.split(' ').join('%20');
        dropdownCont.innerHTML = ``;

        const response = await fetch(`https://api.locationiq.com/v1/autocomplete?key=pk.7ddaffa1d2c2e9caa53dad513ab187fc&q=${input}&limit=5&dedupe=1`)
        const data = await response.json();

        Object.values(data).forEach((value) => {
            const option = new Option(value.address.name, value.address.country, value.lat, value.lon);
            dropdownCont.append(option.build());
        });

        if (dropdownCont.childNodes.length > 0) dropdownCont.style.display = 'block';

        addDropdownListeners();
    } catch (error) {
        dropdownCont.innerHTML = ``;
        dropdownCont.style.display = 'none';

        console.error(`Most likely typed too fast for a FREE API: ${error}`)
    }
}

function closeDropdown() {
    if (hovered) return

    dropdownCont.innerHTML = ``;
    dropdownCont.style.display = 'none';
}

function inputOption(e) {
    const posArray = e.target.value.split(',');

    destination.latitude = posArray[0].trim();
    destination.longitude = posArray[1].trim();
    destination.name = e.target.innerText;

    searchInput.value = e.target.innerText;
}

function convertUnixTime(unix) {
    let a = new Date(unix * 1000);
    let minutes = a.getMinutes().toString();

    if (minutes === 6) minutes = '00'
    if (minutes.length === 1) minutes = minutes.concat('0')

    return `${a.getHours()}:${minutes}`
}

function checkImgSrc(weather) {
    if (weather === "Thunderstorm") return imageSrc.lightning;
    if (weather === "Drizzle") return imageSrc.rain;
    if (weather === "Rain") return imageSrc.rain;
    if (weather === "Snow") return imageSrc.snow;
    if (weather === "Clear") return imageSrc.sun;

    return imageSrc.clouds
}

function addDropdownListeners() {
    dropdownOptions = document.getElementsByClassName('option-btn');

    Array.from(dropdownOptions).forEach(option => {
        option.addEventListener('click', inputOption);
    });
}

function loadStorage() {
    if (localStorage.getItem('recent-location')) {
        const info = JSON.parse(localStorage.getItem("recent-location"));

        searchDay(info);
        searchHours(info);
    }
}

function updateStorage() {
    localStorage.setItem("recent-location", JSON.stringify(destination));
}

function displayDropdown() {
    console.log(this)
}

loadStorage();

searchInput.addEventListener('input', autoComplete);
locationBtn.addEventListener('click', geoFindMe);
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (searchInput.value.length === 0) return

    searchDay(destination);
    searchHours(destination);
});

dropdownOptions.forEach(option => {
    option.addEventListener('click', inputOption);
});

document.addEventListener('click', closeDropdown);

dropdownCont.addEventListener('mouseenter', () => {
    hovered = true;
});
dropdownCont.addEventListener('mouseleave', () => {
    hovered = false;
});

let hover = false;

setTimeout(() => {
    const hourConts = hoursCont.querySelectorAll('.hour-cont');

    hourConts.forEach(cont => cont.addEventListener('mouseenter', scaleWidget))
    hourConts.forEach(cont => cont.addEventListener('mouseleave', shrinkWidget))
}, 100);

function scaleWidget() {
    this.style.transform = "scale(1.1)"
}

function shrinkWidget() {
    this.style.transform = "scale(1)"
}