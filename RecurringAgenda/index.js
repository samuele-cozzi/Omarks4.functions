const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const calendar = google.calendar('v3');

const axios = require("axios");

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    context.log('JavaScript HTTP trigger function processed a request.');

    try {

        let settings = await getSettings();

        for (let index = 0; index < settings.length; index++) {
            
            try {
                let user = await getUser(settings[index].uid);
                context.log('user: ' + JSON.stringify(user));

                if (user.settings.access_token)  {
                    
                    const oAuth2Client = new OAuth2(
                        user.provider.client_id,
                        user.provider.client_secret,
                        "https://omarks4-functions.azurewebsites.net/api/auth"
                    );
                
                    oAuth2Client.setCredentials({
                        refresh_token: user.settings.refresh_token
                    });

                    const calendars = await calendar.calendarList.list({
                        auth: oAuth2Client,
                        //calendarId: 'samuele.cozzi@gmail.com',
                        // timeMin: (new Date()).toISOString(),
                        // maxResults: 10,
                        // singleEvents: true,
                        // orderBy: 'startTime',
                        // prettyPrint: true
                    });
            
                    console.log(JSON.stringify(calendars));

                    for (let i = 0; i < calendars.data.items.length; i++) {
                    
                        const events = await calendar.events.list({
                            auth: oAuth2Client,
                            calendarId: calendars.data.items[i].id,
                            timeMin: (new Date()).toISOString(),
                            maxResults: 10,
                            singleEvents: true,
                            orderBy: 'startTime',
                          });

                        for (let j = 0; j < events.data.items.length; j++) {
                            const event = events.data.items[j];

                            response = await postCalendar(settings[index].uid, event.id, event);
                            console.log(JSON.stringify(event));
                        }

                        
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


async function getUser(user_id) {
    try {
        const response = await axios.get(`https://us-central1-omarks4.cloudfunctions.net/user-api/api/users/${user_id}`);
        //console.log(response.data);
        return response.data;

    } catch (error) {
        console.log('Error getting users settings ', error.message);
    }
}

async function getSettings() {
    try {
        const response = await axios.get(`https://us-central1-omarks4.cloudfunctions.net/user-api/api/users`);
        //console.log(response.data);
        return response.data;

    } catch (error) {
        console.log('Error getting users settings ', error.message);
    }
}


async function postCalendar(uid, eventid, body) {
    try {
        const response = await axios({
            url: `https://us-central1-omarks4.cloudfunctions.net/calendar-api/api/settings/${uid}/calendar/${eventid}`,
            method: "post",
            data: body
          });

        return response.data;

    } catch (error) {
        console.log('Error post weather ', error.message);
    }
}