const axios = require("axios");
const {google} = require('googleapis');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const code = req.query.code;
    const id = req.query.state;

    try {
        let user = await getUser(id);
        context.log('user: ' + JSON.stringify(user));

        const oauth2Client = new google.auth.OAuth2(
            user.provider.client_id,
            user.provider.client_secret,
            "https://omarks4-functions.azurewebsites.net/api/auth"
          );
        let tokens = await getToken(oauth2Client, code);

        context.log('tokens: ' + JSON.stringify(tokens));

        let res = await postToken(id, tokens);

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

async function getToken(oauth2Client, code) {
    try {
        const {tokens} = await oauth2Client.getToken(code)
        //console.log(response.data);
        return tokens;

    } catch (error) {
        console.log('Error getting users settings ', error.message);
    }
}

async function postToken(uid, body) {
    try {
        const response = await axios({
            url: `https://us-central1-omarks4.cloudfunctions.net/setting-api/api/users/${uid}/tokens`,
            method: "post",
            data: body
          });

        return response.data;

    } catch (error) {
        console.log('Error post tokens ', error.message);
    }
}