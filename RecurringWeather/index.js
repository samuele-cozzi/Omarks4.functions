const axios = require("axios");

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    // if (myTimer.isPastDue)
    // {
    //     context.log('JavaScript is running late!');
    // }
    // context.log('JavaScript timer trigger function ran!', timeStamp);   

    context.log('JavaScript HTTP trigger function processed a request.');

    try {

        let settings = await getSettings();

        for (let index = 0; index < settings.length; index++) {
            
            try {
                context.log('city:' + settings[index].city);

                if (settings[index].city)  {
                    const weatherToday = await getWeather(settings[index].city);
                    //let response = await postWeather(settings[index].uid, "today", weatherToday)
                    
                    const weatherForecast = await getWeatherOnecall(weatherToday.coord.lat, weatherToday.coord.lon);
                    //const weatherForecast = await getWeatherForecast(settings[index].city);

                    for (let j = 0; j < 3 /*weatherForecast.daily.length*/; j++) {
                        var date = new Date(weatherForecast.daily[j].dt * 1000).toISOString().split('T')[0];
                        response = await postWeather(settings[index].uid, date, weatherForecast.daily[j])
                    }
                }
            }
            catch (error) {
                context.log('Error getting messages', error.message);
            }
        }

        context.res = {
            status: 200, /* Defaults to 200 */
            body: "OK"
        };
    }
    catch (error) {
        context.log('Error: ' + error);

        context.res = {
            status: 500,
            body: error.message
        };
    }
};


async function getSettings() {
    try {
        const response = await axios.get(`https://us-central1-omarks4.cloudfunctions.net/user-api/api/users`);
        //console.log(response.data);
        return response.data;

    } catch (error) {
        console.log('Error getting users settings ', error.message);
    }
}

async function getWeather(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=b985e8aece721f240b9c9871cf128c09`);
        //console.log(response.data);
        return response.data;

    } catch (error) {
        console.log('Error getting today weather ', error.message);
    }
}

async function getWeatherOnecall(lat, lon) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&APPID=b985e8aece721f240b9c9871cf128c09&units=metric`);
        //console.log(response.data);
        return response.data;

    } catch (error) {
        console.log('Error getting today weather ', error.message);
    }
}

async function postWeather(uid, date, body) {
    try {
        const response = await axios({
            url: `https://us-central1-omarks4.cloudfunctions.net/weather-api/api/settings/${uid}/weather/${date}`,
            method: "post",
            data: body
          });

        return response.data;

    } catch (error) {
        console.log('Error post weather ', error.message);
    }
}

async function getWeatherForecast(city) {
    try {
        let _forecast_arr = [];
        let _dayForecast = [];
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&APPID=b985e8aece721f240b9c9871cf128c09`);
        const data = response.data;
        for (let index = 0; index < data.list.length; index++) {
            const _date = formatDate(data.list[index].dt_txt);
            const element = {
                "date": _date,
                "datime": data.list[index].dt,
                "datetime_tx": data.list[index].dt_txt,
                "weather_id": data.list[index].weather[0].id,
                "weather_main": data.list[index].weather[0].main,
                "weather_icon": data.list[index].weather[0].icon,
                "value": data.list[index]
            };
            _forecast_arr.push(element);

        }

        let _forecastXday = _forecast_arr.reduce((r, a) => {
            r[a.date] = [...r[a.date] || [], a];
            return r;
        }, {});

        var _forecastXday_arr = Object.keys(_forecastXday).map(function (key) {
            return { key: key, value: _forecastXday[key] };
        });

        //console.log(_forecastXday_arr);

        for (let index = 0; index < _forecastXday_arr.length; index++) {
            const element = _forecastXday_arr[index].value.reduce(function (r, row) {
                r[row.weather_main] = ++r[row.weather_main] || 1;
                return r;
            }, {});

            var result = Object.keys(element).map(function (key) {
                return {
                    main: key,
                    count: element[key],
                    date: _forecastXday_arr[index].key,
                    day_forecast: _forecastXday_arr[index].value.find(e => e.weather_main === key),
                    hour_forecast: _forecastXday_arr[index].value
                };
            });

            let max_count = Math.max.apply(Math, result.map(function (o) { return o.count; }));
            _dayForecast.push(result.find(e => e.count === max_count));



        }

        return _dayForecast;
    } catch (error) {
        console.log('Error getting messages', error.message);
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}