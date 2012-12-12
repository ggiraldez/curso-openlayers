var express = require('express')
  , http = require('http')
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

http.createServer(app).listen(app.get('port'), function(){
  console.log("Server listening on port " + app.get('port'));
});

