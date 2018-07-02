const readline = require('readline');
const rawjs = require('raw.js');

const {TypePrinter} = require('./TypePrinter');

require('dotenv').config();

const defaultOptions = {
    limit: 5
};

function initRaw() {
    const {
        REDDIT_CLIENT_ID,
        REDDIT_CLIENT_SECRET,
        REDDIT_USERNAME,
        REDDIT_PASSWORD
    } = process.env;

    const reddit = new rawjs('recli/0.1 by klowdsky');

    reddit.setupOAuth2(REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET);
    reddit.auth({"username": REDDIT_USERNAME, "password": REDDIT_PASSWORD}, (err, response) => {
        if (err) {
            console.log('unable to authenticate user: ' + err);
        }
    });

    return reddit;
}

const reddit = initRaw();
const printer = new TypePrinter();

console.log('Welcome to recli Version 1.0');
console.log('For help please enter \'help\'');
console.log('To quit the application enter \'quit\'');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const state = {
    place: 'overview',
    placename: null,
    data: null,
    inSubreddit: function () {
        return this.data.children.every(c => c.kind === 't3');
    },
    inLink: function () {
        return this.place === 'link';
    }
};

const switchToSubreddit = (line) => {
    state.place = 'subreddit';
    state.placename = line.split('/')[1];
};

const showHot = () => {
    reddit.hot({
        ...defaultOptions,
        r: state.placename
    }, (err, res) => {
        state.data = res;
        showData();
    })
};

const showData = () => {
    state.data.children.forEach(printer.printShort);
};

const showLink = (id) => {
    reddit.comments({
        ...defaultOptions,
        link: id
    }, (err, res, link) => {
        link.data.children.forEach(printer.printDetail);
        res.data.children.forEach(printer.printDetail);
        state.data = res.data;
        state.place = 'link';
        state.placename = id;
    })
};

const showComment = (id) => {
    reddit.comments({
        ...defaultOptions,
        comment: id
    }, (err, res) => {
        res.place = 'comment';
        res.placename = id;
        res.data = res;
    });
};

const show = (id) => {
    if (state.inSubreddit()) {
        showLink(id);
    } else if (state.inLink()) {
        showComment(id);
    } else {
        console.log(`open ${id} NOT in subreddit`);
    }

};

const more = () => {
    console.log('more');
};

rl.setPrompt('recli>');
rl.prompt();

const handleAction = (line) => {
    if (line.startsWith('r/')) {
        switchToSubreddit(line);
        rl.setPrompt(`${state.placename}>`);
    } else if (line.startsWith('hot')) {
        showHot(line);
    } else if (line.startsWith('show')) {
        show(line.split(' ')[1]);
    } else if (line.startsWith('more')) {
        more();
    } else if (line.startsWith('state')) {
        console.log(state);
    } else if (line === 'exit') {
        rl.close();
        process.exit(0);
    } else {
        console.log('unknown command');
    }
}

rl.on('line', (line) => {
    handleAction(line);
    rl.prompt();
});