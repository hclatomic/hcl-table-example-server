
/*
launching nodemon facility :

npx nodemon


*/


import express from 'express';

var fs = require('fs');
var cors = require('cors');
const bodyParser = require('body-parser');
const getUrl = require('url');

const app = express();
const port = 3000;
const baseUrl = '/var/www/html/dev/hcl-table/server/src/json-mock';
const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};



const filter: any = (data: any[], options: any) => {

    /*options = {
        sort: {
            dataProp: 'quantity',
            sortOrder: 'up'
        },
        search: [
            {
            dataProp: 'firstname',
            searchString: 'rod'
            },
        ],
        paging: {
            pageLength: 10,
            requestPage: 3
        }
      }*/


    let ini = JSON.parse(JSON.stringify(data));
    let totalPages = 0;
    let totalRows = ini.length;

    //searching ______________________________________________________
    if (options && options.search && options.search.length) {
        for (const item of options.search) {
            const reg = new RegExp(item.searchString, 'gi');
            ini = ini.filter((row: any) => {
                if (row[item.dataProp].match(reg)) {
                    return row;
                }
            });
        }
        totalRows = ini.length;
    }


    //sorting ______________________________________________________
    if (options && options.sort && options.sort.dataProp) {
        switch (options.sort.sortOrder) {
            case 'up':
                //if (typeof a[options.sort.dataProp] === 'string') {
                ini.sort((a: any, b: any) => {
                    if (typeof a[options.sort.dataProp] === 'string') {
                        return a[options.sort.dataProp].toLowerCase().replace(/[ ]/g, '') > b[options.sort.dataProp].toLowerCase().replace(/[ ]/g, '') ? -1 : 1;
                    }
                    else {
                        return a[options.sort.dataProp] > b[options.sort.dataProp] ? -1 : 1;
                    }
                });
                break;
            case 'down':
                ini.sort((a: any, b: any) => {
                    if (typeof a[options.sort.dataProp] === 'string') {
                        return a[options.sort.dataProp].toLowerCase().replace(/[ ]/g, '') < b[options.sort.dataProp].toLowerCase().replace(/[ ]/g, '') ? -1 : 1;
                    }
                    else {
                        return a[options.sort.dataProp] < b[options.sort.dataProp] ? -1 : 1;
                    }
                });
                break;
        }
    }

    const obj: any = {
        data: ini
    };

    //paging _______________________________________________________
    if (options && options.paging) {
        totalPages = Math.ceil(ini.length / options.paging.pageLength);
        const min = (options.paging.requestPage - 1) * options.paging.pageLength;
        const max = min + options.paging.pageLength;
        ini = ini.slice(min, max);
        obj.paging = {
            totalAvailableRows: totalRows,
            pageLength: options.paging.pageLength,
            currentPage: totalPages < options.paging.requestPage ? 1 : options.paging.requestPage
        };
        obj.data = ini;
    }

    return obj;


};


app.use(cors(corsOptions));
app.use(express.json());


app.post('/', bodyParser.json({ limit: "50mb" }), (req, res) => {
    const options = req.body;
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        //console.log(options);
        const filtered = filter(obj, options);
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});

app.post('/example5', bodyParser.json({ limit: "50mb" }), (req, res) => {
    const options = req.body;
    fs.readFile(baseUrl + '/base.1.subrows.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        const filtered = filter(obj, options);
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});
app.post('/example6', bodyParser.json({ limit: "50mb" }), (req, res) => {
    const options = req.body;
    fs.readFile(baseUrl + '/base.1.subrows.2.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        const filtered = filter(obj, options);
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});
app.get('/', bodyParser.json({ limit: "50mb" }), (req, res) => {

    let str = req.url.replace(/^\/\?/, '');
    const arr = str.split('&');

    const options: any = { paging: {}, sort: {}, search: [] };
    const search: any[] = [];
    for (const item of arr) {
        if (item.match(/pagingPageLength/)) {
            const arr2 = item.split('=');
            options.paging.pageLength = parseInt(arr2[1]);
        }
        else if (item.match(/pagingRequestPage/)) {
            const arr2 = item.split('=');
            options.paging.requestPage = parseInt(arr2[1]);
        }
        else if (item.match(/sortOrder/)) {
            const arr2 = item.split('=');
            options.sort.sortOrder = arr2[1];
        }
        else if (item.match(/sortDataProp/)) {
            const arr2 = item.split('=');
            options.sort.dataProp = arr2[1];
        }
        else if (item.match(/searchDataProp/) || item.match(/searchSearchString/)) {
            search.push(item);
        }
    }

    search.sort((a: any, b: any) => {
        const numa = a.replace(/^.*([0-9]+)=.*$/, '$1');
        const numb = b.replace(/^.*([0-9]+)=.*$/, '$1');
        return numa > numb ? 1 : -1;
    });

    for (let i = 0; i < search.length - 1; i += 2) {
        options.search.push({
            dataProp: search[i + 1].replace(/^.*=(.*)$/, '$1'),
            searchString: search[i].replace(/^.*=(.*)$/, '$1')
        });
    }
    //console.log(options);
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        const filtered = filter(obj, options);
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});

app.post('/subrows1', bodyParser.json({ limit: "50mb" }), (req, res) => {
    const options = req.body;
    fs.readFile(baseUrl + '/base.2.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        const filtered = filter(obj, options);
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});

app.post('/subrows2', bodyParser.json({ limit: "50mb" }), (req, res) => {
    const options = req.body;
    fs.readFile(baseUrl + '/base.3.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        const filtered = filter(obj, options);
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});

app.post('/full', bodyParser.json({ limit: "50mb" }), (req, res) => {
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        res.setHeader('Content-Type', 'application/json');
        res.json(obj);
    });
});

app.post('/full-subrows', bodyParser.json({ limit: "50mb" }), (req, res) => {
    fs.readFile(baseUrl + '/base.1.subrows.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        res.setHeader('Content-Type', 'application/json');
        res.json(obj);
    });
});

app.post('/validateEdit', bodyParser.json({ limit: "50mb" }), (req, res) => {
    res.json({ succes: true });
});

app.get('/', (req, res) => {
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err: any, data: any) {
        res.json(JSON.parse(data));
    });
});
app.post('/live-update', bodyParser.json({ limit: "50mb" }), (req, res) => {
    const options = req.body;
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err: any, data: any) {
        const obj = JSON.parse(data);
        const filtered = filter(obj, options);
        const random = Math.floor(Math.random() * 10);
        filtered.data.map((item: any) => {
            item.quantity = item.quantity * random;
        });
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

