/**
 * Start a server that produces random samples messages
 * @module ext/server
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 */

var messageGenerator = require('./messageGenerator');
var restify = require("restify");
var _ = require('lodash');
var server = restify.createServer();

/**
 * Serve the messages:
 * calls the generator using the request
 * and write the messages to the response.
 * @param {HttpRequest} req - the http request
 * @param {HttpResponse} res - the http response
 * @param {Function} next - to call the next layer in the routing middleware
 */
function serveMessages(req, res){

    if(req.accepts('application/json')){
        messageGenerator.generate(req.params.type, req.header('XToken'), function(err, messages){
           res.json(_.flatten(messages));
        }) ;
    }
}


server.use(restify.queryParser());
server.get('/messages/:type', serveMessages);
//server.get('/messages', serveMessages);

//start the server
server.listen(4000, function(){
    console.log('Server listening on http://localhost:4000');
});
