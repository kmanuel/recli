const readline = require('readline');
const axios = require('axios');
const {getAccessHeaders} = require('./reddit_authenticator');

console.log('Welcome to recli Version 1.0');
console.log('For help please enter \'help\'');
console.log('To quit the application enter \'quit\'');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const displayHelp = () => {
    console.log('To list all threads enter \'list\'');
    console.log('To quit the application enter \'quit\'');
};

function toParamsString(options) {
    return Object.entries(options)
        .filter(prop => options.hasOwnProperty(prop[0]))
        .map(prop => `${prop[0]}=${prop[1]}`)
        .join('&');
}

async function readLink(link) {
    const headers = await getAccessHeaders();

    const response = await axios.get(`https://oauth.reddit.com/comments/${link}?limit=5`, {
        headers: {
            'Authorization': headers['Authorization'],
            'User-Agent': headers['User-Agent']
        }
    });

    let mainPost = response.data.filter(d => d.data.dist === 1).map(d => d.data.children)[0];
    let mainData = mainPost
        .map(c => c.data)
    for (let i = 0; i < mainData.length; i++) {
        const {author, title, selftext} = mainData[i];
        console.log('---------------------------------');
        console.log('---------------------------------');
        console.log(author);
        console.log(title);
        console.log(selftext);
        console.log('---------------------------------');
        console.log('---------------------------------');
        console.log('');
    }

    let comments = response.data.filter(d => d.data.dist === null).map(d => d.data.children)[0];
    let commentsData = comments
        .map(c => c.data)
        .filter(d => d.author);


    while (true) {
        const cmd = await getAnswer('');

        if (cmd === 'comments') {
            for (let i = 0; i < commentsData.length; i++) {
                const {author, body, id} = commentsData[i];
                console.log(`[${id}] ${author}: ${body.substring(0, 50)}...`);
            }
        } else if (cmd.startsWith('show')) {
            const commentId = cmd.split(' ')[1];
            commentsData.filter(c => c.id == commentId)
                .forEach(c => {
                    console.log(c.author);
                    console.log(c.body);
                });
        } else if (cmd === 'q') {
            return Promise.resolve;
        } else {
            console.log(`unknown command ${cmd}`)
        }
    }
}

async function getLinks(options) {
    if (!options.limit) {
        options.limit = 5;
    }

    const paramsString = toParamsString(options);

    const headers = await getAccessHeaders();

    const response = await axios.get(`https://oauth.reddit.com/r/webdev/hot?${paramsString}`, {
        headers: {
            'Authorization': headers['Authorization'],
            'User-Agent': headers['User-Agent']
        }
    });

    return response.data;
}

const listThreads = async(params = {}) => {
    const response = await getLinks(params);
    const links = response.data.children;
    links.forEach((link) => console.log(`[${link.data.id}]: ${link.data.title}`));
    while (true) {
        const cmd = await getAnswer('r/webdev>');
        if (cmd.startsWith('next')) {
            const nextParams = {
                limit: params.limit,
                after: response.data.after
            };
            await listThreads(nextParams);
        } else if (cmd.startsWith('prev')) {
            const prevParams = {
                limit: params.limit,
                before: response.data.before
            };
            await listThreads(prevParams);
        } else if (cmd.startsWith('read')) {
            const linkId = cmd.split(' ')[1];
            await readLink(linkId);
        } else if (cmd === 'q') {
            return 'ok';
        } else if (cmd === 'help') {
            console.log('available commands:');
            console.log('\t\'next\' shows the next entries');
            console.log('\t\'prev\' shows the previous entries');
            console.log('\t\'q\' exits from this command');
        } else {
            console.log(`unknown command ${cmd} type 'help' for a list of available commands`);
        }
    }
};

const getAnswer = async(question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

const prompt = async() => {
    const answer = await getAnswer('recli>');
    if (answer === 'q') {
        return Promise.resolve;
    } else if (answer === 'help') {
        displayHelp();
    } else if (answer.startsWith('list')) {
        const limit = answer.split(' ')[1];
        if (limit) {
            await listThreads({
                limit
            });
        } else {
            await listThreads({});
        }
    }
    await prompt();
};

prompt();

// readLink('8rauwf');