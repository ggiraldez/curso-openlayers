var express = require('express')
  , http = require('http')
  , url = require('url')
  , path = require('path');

var app = new express();

app.configure(function() {
    app.set('port', 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'shared')));
    app.use('/slides', express.static(path.join(__dirname, 'slides')));
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.sendfile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/slides', function(req, res) {
    res.redirect('/slides/intro.html');
});
app.get('/proxy', function(req, res) {
    var req_url = req.param('url');
    if (!req_url || !url.parse(req_url)) {
        res.send(400, 'falta el parámetro url');
    } else {
        var client_req = http.get(url.parse(req_url), function(client_res) {
            res.writeHead(client_res.statusCode, client_res.headers);
            client_res.on('data', function(chunk) {
                res.write(chunk);
            });
            client_res.on('end', function() {
                res.end();
            });
        });
        client_req.on('error', function(err) {
            console.error('error proxying ' + req_url + ': ' + err.message);
            console.error(err);
            res.send(500, err.message);
        });
    }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Server listening on port " + app.get('port'));
});

