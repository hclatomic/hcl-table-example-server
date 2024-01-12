"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var fs = require('fs');
var cors = require('cors');
const bodyParser = require('body-parser');
const app = (0, express_1.default)();
const port = 3000;
const baseUrl = '/var/www/html/dev/hcl-table/server/src/json-mock';
const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
const filter = (data, options) => {
    /*options = {
        sort: {
            dataProp: 'quantity',
            dir: 'up'
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
    console.log(options);
    let ini = JSON.parse(JSON.stringify(data));
    let totalPages = 0;
    let totalRows = ini.length;
    //searching ______________________________________________________
    if (options && options.search) {
        for (const item of options.search) {
            const reg = new RegExp(item.searchString, 'gi');
            ini = ini.filter((row) => {
                if (row[item.dataProp].match(reg)) {
                    return row;
                }
            });
        }
        totalRows = ini.length;
    }
    //sorting ______________________________________________________
    if (options && options.sort) {
        switch (options.sort.dir) {
            case 'up':
                //if (typeof a[options.sort.dataProp] === 'string') {
                ini.sort((a, b) => {
                    if (typeof a[options.sort.dataProp] === 'string') {
                        return a[options.sort.dataProp].toLowerCase().replace(/[ ]/g, '') > b[options.sort.dataProp].toLowerCase().replace(/[ ]/g, '') ? -1 : 1;
                    }
                    else {
                        return a[options.sort.dataProp] > b[options.sort.dataProp] ? -1 : 1;
                    }
                });
                break;
            case 'down':
                ini.sort((a, b) => {
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
    const obj = {
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
    //console.log(options, obj);
    return obj;
};
app.use(cors(corsOptions));
app.use(express_1.default.json());
app.post('/', bodyParser.json({ limit: "50mb" }), (req, res) => {
    const options = req.body;
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err, data) {
        const obj = JSON.parse(data);
        const filtered = filter(obj, options);
        res.setHeader('Content-Type', 'application/json');
        res.json(filtered);
    });
});
app.post('/full', bodyParser.json({ limit: "50mb" }), (req, res) => {
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err, data) {
        const obj = JSON.parse(data);
        res.setHeader('Content-Type', 'application/json');
        res.json(obj);
    });
});
app.post('/full-subrows', bodyParser.json({ limit: "50mb" }), (req, res) => {
    fs.readFile(baseUrl + '/base.1.subrows.json', 'utf8', function (err, data) {
        const obj = JSON.parse(data);
        res.setHeader('Content-Type', 'application/json');
        res.json(obj);
    });
});
app.get('/', (req, res) => {
    fs.readFile(baseUrl + '/base.1.json', 'utf8', function (err, data) {
        res.json(JSON.parse(data));
    });
});
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map