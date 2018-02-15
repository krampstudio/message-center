/**
 * ContinuousPHP message-center app main entry point.
 * Initialize and start the application server.
 * @module app
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 */

var Bootstrap = require('./lib/bootstrap');

//initialization of services
var bootstrap = new Bootstrap();
bootstrap.on('error', function(err){
    console.error("Unable to bootstrap : " + err);
    process.exit();
});
bootstrap.start();

var logger = bootstrap.logger;
var sioStore = bootstrap.sioStore;
var serverConf = bootstrap.conf.get('server');
var path = require('path');
var express = require('express');
var controller = require('./controller');
var sio = require('socket.io');

//create an http server using express
var app = express();
var server = http.createServer(app);

//setup socket.io
var io = sio.listen(server, {
    logger : logger,
    store : sioStore
});

//set up middlewares
app.use(function logRequests(req, res, next){
    logger.info("%s %s : %j", req.method, req.url, req.params);
    next();
});
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());

//instantiate the message controlllers
controller.job(io);

//start the server
server.listen(serverConf.port, serverConf.address, function(){
    logger.info("Server started using %j", serverConf);
});
