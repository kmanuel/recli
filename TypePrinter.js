const printLink = (data) => {
    console.log(`
[${data.id}] ${data.title}
by ${data.author}

${data.selftext}
`
    );
};

const printComment = (data) => {
    console.log(`
[${data.id}] ${data.author}
${data.body}
`
    )
};

const shortPrintLink = (data) => {
    console.log(`[${data.id}]: ${data.title.substring(0, 100)}...`);
};

const shortPrintComment = (data) => {
    console.log(`[${data.id}]-${data.author}: ${data.body.substring(0, 100)}...`);
};

class TypePrinter {
    printDetail(listingEntry) {
        if (listingEntry.kind === 't3') {
            printLink(listingEntry.data);
        } else if (listingEntry.kind === 't1') {
            printComment(listingEntry.data);
        }
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