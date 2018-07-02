const printLink = (data) => {
    console.log(`
[${data.id}] ${data.title}
by ${data.author}

${data.selftext}
`
    );
};

const printComment = (data, depthLevel = 0) => {
    console.log(`${' '.repeat(depthLevel)}[${data.id}] ${data.author}`);
    console.log(`${' '.repeat(depthLevel)}${data.body}`);

    data.replies.data.children.forEach(reply => onPrintDetail(reply, depthLevel + 1));
};

const shortPrintLink = (data) => {
    console.log(`[${data.id}]: ${data.title.substring(0, 100)}...`);
};

const shortPrintComment = (data) => {
    console.log(`[${data.id}]-${data.author}: ${data.body.substring(0, 100)}...`);
};

const onPrintDetail = (entry, depthLevel = 0) => {
    if (entry.kind === 't3') {
        printLink(entry.data);
    } else if (entry.kind === 't1') {
        printComment(entry.data, depthLevel + 1);
    } else if (entry.kind === 'more') {
        console.log('encountered more');
    }
};

class TypePrinter {
    printDetail(listingEntry, depthLevel = 0) {
        onPrintDetail(listingEntry, depthLevel);
    }

    printShort(listingEntry) {
        switch (listingEntry.kind) {
            case 't3':
                shortPrintLink(listingEntry.data);
                break;
            case 't1':
                shortPrintComment(listingEntry.data);
                break;
        }
    }
}

module.exports = {TypePrinter};