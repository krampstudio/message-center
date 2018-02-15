/**
 * Contains the {@link MessagePoller} class
 * @exports messagePoller
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 */

var events          = require('events');
var util            = require('util');
var _               = require('lodash');
var domain          = require('domain');
var url             = require('url');
var logger          = require('./logFactory').logger;
var clientFactory   = require('./clientFactory');

/**
 * The Message Poller will pull periodically messages from an endpoint
 * and push them through events.
 *
 * @constructor MessagePoller
 * @augments EventEmitter
 * @param {Object} options - the poller options
 * @param {Number} [options.delay = 1000] - the polling frequency in ms
 * @param {Number} [options.timeout = 60] - the request timeout in seconds
 * @param {String} options.endpoint - where to poll the messages from
 * @param {String} [options.type] - the kind of messages to poll (careful, all the messages if not set)
 */
function MessagePoller(options){
    //call constructor with the current context
    events.EventEmitter.call(this);

    //set up options
    this.options = _.defaults(options || {}, {
        'delay' : 1000,
        'timeout' : 60
    });

    //todo test uncaught error
    if(!this.options.endpoint || url.parse(this.options.endpoint).host === null){
        this.emit('error', new Error('A valid endpoint is required to use the MessagePoller'));
    }

    logger.debug('MessagePoller created with options %j', this.options);

    //Todo check also delay and timeout


    this.iHandler = null;
}
util.inherits(MessagePoller, events.EventEmitter);

/**
 * Start to poll messages
 * @memberOf MessagePoller
 * @param {String} type - the message type
 * @param {String} [token] - the token of the user to get the messages from, if no token it retrieve all the messages
 * @fires MessagePoller#start
 * @fires MessagePoller#error
 * @fires MessagePoller#message
 */
MessagePoller.prototype.start = function(type, token){
    var self = this;

    //use domain to catch polling errors
    this.pollingDomain = domain.create();
    this.pollingDomain.type = 'Message Polling Error';
    this.pollingDomain.on('error', function pollingDomainError(err){
        if(err){
            logger.error("%s : %s", err.domain.type, err.message);
            logger.error(err.stack);

            self.stop();
            /**
             * @event MessagePoller#error
             * @type Error
             */
            self.emit('error', err);
        }
    });

    //polling error context
    this.pollingDomain.run(function runPollingDomain(){

        logger.debug("Starting message polling for %s all %ss [%s]", self.options.delay, type, (token) ? token : 'public');

        //polling timer
        self.iHandler = setInterval(function(){

            logger.debug("Polling messages for %s [%s]", type, (token) ? token : 'public');

            //initialize the client
            var client = clientFactory.getClient(self.options.endpoint, token);
            var resource = client.rootResource;
            if(self.options.type){
                resource += '/' + self.options.type;
            }
            client.get(resource, function(err, req, res, data){
                if(err){
                    throw err;
                }
                //logger.debug("Request : %j\\nResponse : %j\\nData : %j ", req, res, data);

                if(data && _.isArray(data) && data.length > 0){
                    return self.emit('message', data);
                }
                logger.debug("Empty or invalid message data : %j", data);
                return;
            });

        }, self.options.delay);

        /**
         * Start the type of message the poller has started for
         * @event MessagePoller#start
         * @type {string}
         */
        return self.emit('start', type);
    });
};

/**
 * Verify whether the poller is started
 * @memberOf MessagePoller
 * @returns {Boolean} true if it is started
 */
MessagePoller.prototype.isStarted = function(){
    return this.iHandler !== null && this.iHandler._repeat === true;
};

/**
 * Stop polling messages
 * @memberOf MessagePoller
 * @params {Boolean} [definitly=false] - if you would not restart it
 * @fires MessagePoller#stop
 * @fires MessagePoller#error
 */
MessagePoller.prototype.stop = function(definitly){
    if(this.isStarted){
        //stop it
        clearInterval(this.iHandler);

        //and check
        if(this.isStarted){

            if(definitly){
                clientFactory.destroy(this.options.endpoint, this.options.type, this.options.token);
            }

            /**
             * @event MessagePoller#stop
             */
            this.emit('stop');

        } else {

            //todo retry

            /**
             * @event MessagePoller#error
             * @type {Error}
             */
            this.emit('error', new Error('Unable to stop the message poller'));
        }
        if(this.pollingDomain !== undefined){
            this.pollingDomain.dispose();
        }
    }
};

exports = module.exports = MessagePoller;
