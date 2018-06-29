const axios = require('axios');
const btoa = require('btoa');
require('dotenv').config();

const {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_USERNAME,
    REDDIT_PASSWORD
} = process.env;

let accessToken = null;
const userAgent = 'recli/0.1 by klowdsky';

const fetchAccessToken = async() => {

    const requestUrl = 'https://www.reddit.com/api/v1/access_token';
    const basicAuth = 'Basic ' + btoa(REDDIT_CLIENT_ID + ':' + REDDIT_CLIENT_SECRET);
    const body = `grant_type=password&username=${REDDIT_USERNAME}&password=${REDDIT_PASSWORD}`;

    const accessToken = await axios
        .post(requestUrl, body, {
            headers: {
                'Authorization': basicAuth,
                'User-Agent': userAgent
            }
        })
        .then((response) => {
            return response.data.access_token;
        })
        .catch((error) => {
            console.error(error);
        });

    return accessToken;
};

const getAccessHeaders = async() => {
    let token;
    if (accessToken !== null) {
        token = accessToken
    } else {
        token = await fetchAccessToken();
        accessToken = token;
    }
    return headersFromToken(token);
};

const  headersFromToken = (token) => {
    const tokenAuth = 'bearer ' + token;
    return {
        'Authorization': tokenAuth,
        'User-Agent': userAgent
    }
};

module.exports = { getAccessHeaders };
