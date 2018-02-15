/**
 * Contains the {@link messageGenerator} function
 * @module ext/messageGenerator
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 */

var _ = require('lodash');
var randy = require('randy');
var redis = require('redis');
var async = require('async');

var messageGenerator = function messageGenerator(){

    var self = this;
    this.client = redis.createClient();
    this.client.on('error', function(err){
        console.log('Redis error : %s', err);
    });

    /**
     * Generates random stub messages
     * @param {String} type - the message type
     * @param {String} token - the user token
     */
    this.generate = function(type, token, cb){
       var userMessageGenerators = _.map(getUsers(token), function(user){

            return function genUserMessage(asyncCb){
                if(!type || type === 'notify'){
                    if( (randy.randInt(3) % 3) === 0){      //does this user has notify messages 1/3
                       return asyncCb(null, [generateNotifyMessage(user)]);
                    }
                }
                if(!type || type === 'job'){

                    self.client.hget('messagesQueue', user, function(err, userQueue){
                        if(err){
                            cb(err);
                        }
                        var messages = [];
                        if(userQueue === null){
                            userQueue = {};
                        } else {
                            userQueue = JSON.parse(userQueue);
                        }

                        if ( (randy.randInt(5) % 5) === 0) { // 1/5 luck to have a job running
                            var generated = generateJobMessages(user);
                            var worker = generated[0].content.name;
                            if(userQueue[worker] === undefined || userQueue[worker].length === 0){
                                userQueue[worker] = generated;
                            }
                        }

                        _.each(userQueue, function(msgs, worker){
                            if(_.isArray(userQueue[worker]) && userQueue[worker].length > 0){
                                messages.push(userQueue[worker].shift());
                            }
                        });
                        self.client.hset('messagesQueue', user, JSON.stringify(userQueue));
                        asyncCb(null, messages);
                    });
                }
            };
        });

        async.parallel(userMessageGenerators, cb);
    };

    /**
     * Get a users based on token, if no token is set, we generate  a random number of users (between 0 and 30);
     * @private
     * @param {string} [token]
     * @returns {Array} the generated users
     */
    function getUsers(token){
        var users = [];
        if(token && /-[0-9]+$/.test(token)){
            users.push('user' + token.replace(/(.*)-([0-9]+)$/g, "$2"));

        } else {
            users = _.each(_.range(randy.randInt(30)), function(value){
               return 'user' + value;
            });
        }
        return users;
    }

    /**
     * Generate notify message
     * @private
     * @param {String} token - the user token
     */
    function generateNotifyMessage(user){

        var content = {
            'name' : ['info', 'debug', 'warning', 'error'],
            'msg' : ['ok', 'Internal error', 'Please upgrade', 'RTFM']
        };

        var message = {
            ts: new Date().getTime(),
            type : 'notify',
            user : user,
            content: { }
        };

            _(content).keys().each(function(key){
                 var value = content[key];
                 message.content[key] = randy.choice(value);
            });

        return message;
    }

    /**
     * Generate job messages
     * @private
     * @param {String} token - the user token
     */
    function generateJobMessages(user){

        var messages = [];
        var content = {
                'name' : ['php-composer-worker', 'php-unit-worker', 'php-pmd-worker', 'php-behat-worker'],
                'statusStart': ['waiting', 'wip'],
                'statusEnd': ['success', 'error']
        };
        var name = randy.choice(content.name);
        var isWip = false;
        var i = 0;
        var size = randy.randInt(2, 20, 2);
        var message, status;
        while(i < size){

            if(!isWip){
                status = randy.choice(content.statusStart);
            }

            if (i === size - 1) {
                status = randy.choice(content.statusEnd);
            }

            message = {
                ts: new Date().getTime(),
                type : 'job',
                user : user,
                content: {
                    name : name,
                    status : status
                }
            };

            if(status === 'wip'){
                message.content.wip = Math.round((i * 100) / size);
                isWip = true;
            } else {
                isWip = false;
            }

            messages.push(message);
            i++;

        }
        return messages;
    }

    return self;
};

//expose the factory
module.exports = messageGenerator();
