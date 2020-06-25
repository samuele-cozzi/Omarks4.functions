const axios = require("axios");

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();

    context.log('JavaScript HTTP trigger function processed a request.');

    try {

        let settings = await getSettings();

        for (let index = 0; index < settings.length; index++) {
            
            try {
                context.log('newsSources:' + settings[index].newsSources);
                context.log('newsQuery:' + settings[index].newsQuery);

                if (settings[index].newsSources)  {
                    await deleteNews(settings[index].uid);

                    const news = await getNews(settings[index].newsSources);
                    
                    // const weatherForecast = await getWeatherOnecall(weatherToday.coord.lat, weatherToday.coord.lon);
                    // //const weatherForecast = await getWeatherForecast(settings[index].city);

                    for (let j = 0; j < news.articles.length; j++) {
                        response = await postNews(settings[index].uid, news.articles[j])
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

async function getNews(sources) {
    try {
        const response = await axios.get(`https://newsapi.org/v2/top-headlines?apiKey=4d67a53c45cc48d99fefe212d12d7ee7&sources=${sources}`);
        //console.log(response.data);
        return response.data;

    } catch (error) {
        console.log('Error getting news ', error.message);
    }
}

async function postNews(uid, body) {
    try {
        const response = await axios({
            url: `https://us-central1-omarks4.cloudfunctions.net/news-api/api/settings/${uid}/news`,
            method: "post",
            data: body
          });

        return response.data;

    } catch (error) {
        console.log('Error post news ', error.message);
    }
}

async function deleteNews(uid) {
    try {
        const response = await axios({
            url: `https://us-central1-omarks4.cloudfunctions.net/news-api/api/settings/${uid}/news`,
            method: "delete"
          });

        return response.data;

    } catch (error) {
        console.log('Error delete news ', error.message);
    }
}
