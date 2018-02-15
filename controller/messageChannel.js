/**
  * Help you to create a controller to handle messages polling through a Socket.io channel
  * @module controller/messageChannel
  * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
  */

var logger  = require('../lib/logFactory').logger;
var MessagePoller = require('../lib/messagePoller');
var _ = require('lodash');
var conf = require('../conf/config.json');

/**
 * Creates a message channel and polls messages
 * @param {String} type - The type of message to poll
 * @param {Object} io - The Socket.io server instance
 */
module.exports = function(type, io){

    //create a channel
    io.of('/' + type).on('connection', function(socket) {
        logger.info("Socket %s connection opened by client on channel %s", socket.id, type);

        var messagerPoller = new MessagePoller({
            type : type,
            endpoint : conf.poller.endpoint,
            delay: conf.poller.interval
        });
        messagerPoller.on('error', function(err){
			logger.error("Stop polling due to error %s", err);
            socket.emit('error', err.message);
        });

        socket.on('token', function(token){
            if(token !== undefined && _.isString(token) && !_.isEmpty(token)){
                logger.debug("Received token %s", token);
                messagerPoller.start(type, token);
            } else {
                logger.info("Empty token, back to public messages");
                messagerPoller.start(type);
            }
            messagerPoller.on('message', function(messages){
                socket.emit('message', messages);
            });
        });

        socket.on('disconnect', function(){
            logger.info("Socket %s disconnected by client", socket.id);
            messagerPoller.stop();
        });
   });
};
