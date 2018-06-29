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

async function getLinks(params) {
    params = params || 'limit=5';
    const headers = await getAccessHeaders();
    const response = await axios.get('https://oauth.reddit.com/r/webdev/hot?' + params, {
        headers: {
            'Authorization': headers['Authorization'],
            'User-Agent': headers['User-Agent']
        }
    });

    return response.data;
}
const listThreads = async(params = 'limit=5') => {
    const response = await getLinks(params);
    const links = response.data.children;
    links.forEach((link) => console.log(`[${link.data.id}]: ${link.data.title}`));
    while (true) {
        const cmd = await getAnswer('r/webdev>');
        switch (cmd) {
            case 'next':
                await listThreads(`limit=5&after=${response.data.after}`);
                break;
            case 'prev':
                await listThreads(`limit=5&before=${response.data.before}`);
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
    } else if (answer === 'list') {
        await listThreads();
    }
    await prompt();
};

prompt();