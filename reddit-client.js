const axios = require('axios');
const {getAccessHeaders} = require('./reddit_authenticator');

function toParamsString(options) {
    return Object.entries(options)
        .filter(prop => options.hasOwnProperty(prop[0]))
        .map(prop => `${prop[0]}=${prop[1]}`)
        .join('&');
}

async function getLinks(subreddit = 'webdev', options = {}) {
    if (!options.limit) {
        options.limit = 5;
    }

    const paramsString = toParamsString(options);

    const headers = await getAccessHeaders();

    const response = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot?${paramsString}`, {
        headers: {
            'Authorization': headers['Authorization'],
            'User-Agent': headers['User-Agent']
        }
    });

    return response.data;
}

const getLinksListing = async(subReddit, options = {}) => {
    return await getLinks(subReddit, options);
};

const getLinksAfter = async(listing) => {
    const subReddit = listing.data.children[0].data.subreddit;
    const after = listing.data.after;
    return await getLinksListing(subReddit, {after: after})
};

const getLinksBefore = async(listing) => {
    const subReddit = listing.data.children[0].data.subreddit;
    const before = listing.data.before;
    return await getLinksListing(subReddit, {before: before})
};


async function getComments(linkId, options = {}) {
    if (!options.limit) {
        options.limit = 5;
    }

    const paramsString = toParamsString(options);

    const headers = await getAccessHeaders();

    // call https://oauth.reddit.com/comments/8rauwf?limit=3 here
    const url = `https://oauth.reddit.com/comments/${linkId}?limit=3`;

    const response = await axios.get(url, {
        headers: {
            'Authorization': headers['Authorization'],
            'User-Agent': headers['User-Agent']
        }
    });

    return response.data;
}


const getCommentsForLink = async (link) => {
    const linkId = link.data.id;
    const comments = await getComments(linkId);

    return {
        link: comments[0],
        replies: comments[1]
    };
};


module.exports = {
    client: {
        getLinksListing,
        getLinksAfter,
        getLinksBefore,
        getCommentsForLink
    }
};

