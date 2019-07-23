var express = require("express");
var mysql = require('mysql');
var app = express();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fetch = require("node-fetch");
const dotenv = require('dotenv');
const schedule = require('node-schedule');
const path = require('path');
dotenv.config();

var pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DB,
    debug: false
});

function addRow(remain) {
    let insertQuery = 'INSERT INTO ?? (??) VALUES (?)';
    let query = mysql.format(insertQuery, ["data_usage", "remain", remain]);
    pool.query(query, (err, response) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}

function getUsage(cb) {
    return pool.query("select * from data_usage", function (err, rows) {
        if (err) {
            cb('Error occurred' + err );
        }
        return cb(null, rows);
    });
}

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

app.get("/get", function (req, res) {
    getBalance();
    res.send('done');
});

app.get("/balances", function(req,res){
    getUsage((err, result) => {
        if(err != null){
            res.json(err);
        }
        res.json(result);
    });
});

const getBalance = () => {
    const resourceLoader = new jsdom.ResourceLoader({
        strictSSL: false,
    });
    options = {
        runScripts: 'dangerously',
        resources: "usable",
        resources: resourceLoader
    };

    JSDOM.fromURL('https://topup.tnm.co.mw/prepaid/', options)
        .then(dom => {
            checkResult(dom, 0);
        }).catch(e => console.log('An error happened.'));
}

const checkResult = (dom, i) => {
    const loader = dom.window.document.querySelector("#preloader");
    if (i == 4) {
        console.log('timeout...');
    }
    else {
        if (dom.window.getComputedStyle(loader, null).display == 'none') {
            const target = dom.window.document.querySelector("#balances > div:nth-child(3) > div > div.balance-details > div:nth-child(2)");
            if (target.textContent != '') {
                const rd = Number(target.textContent.replace(/[^0-9\.-]+/g, ""));
                addRow(rd);
            } else {
                console.log('waiting for the document to be ready: ', i);
                setTimeout(() => {
                    checkResult(dom, i + 1);
                }, 5000);
            }
        }
        else {
            console.log('loading: ', i);
            setTimeout(() => {
                checkResult(dom, i + 1);
            }, 5000);
        }
    }
}

app.listen(3000);

var rule = new schedule.RecurrenceRule();
rule.minute = [0,30];
var j = schedule.scheduleJob(rule, function () {
    console.log('scheduled job');
    getBalance();
});