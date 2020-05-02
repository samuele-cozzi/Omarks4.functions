module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    context.log('JavaScript HTTP trigger function processed a request.');

    try {

        let settings = await getSettings();

        for (let index = 0; index < settings.length; index++) {
            
            try {
                context.log('city:' + settings[index].city);

                if (settings[index].city)  {
                    
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

