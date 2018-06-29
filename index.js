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
        switch (cmd) {
            case 'next':
                const nextParams = {
                    limit: params.limit,
                    after: response.data.after
                };
                await listThreads(nextParams);
                break;
            case 'prev':
                const prevParams = {
                    limit: params.limit,
                    before: response.data.before
                };
                await listThreads(prevParams);
                break;
            case 'q':
                return 'ok';
            case 'help': {
                console.log('available commands:');
                console.log('\t\'next\' shows the next entries');
                console.log('\t\'prev\' shows the previous entries');
                console.log('\t\'q\' exits from this command');
                break;
            }
            default:
                console.log(`unknown command ${cmd} type 'help' for a list of available commands`);
                break;
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