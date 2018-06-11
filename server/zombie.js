const Browser = require('zombie');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');

const publicDir = path.join(__dirname, "/../dist");
app.use(express.static(publicDir));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, "www/index.html")));
app.get('/phaser.png', (req, res) => res.sendFile(path.join(__dirname, "www/phaser.png")));

http.listen(4335, function() {
        console.log('Example app listening on port 4335!');
        Browser.visit("http://localhost:4335",function(error, browser) {
            //console.log(browser.html());
        });
    }
);