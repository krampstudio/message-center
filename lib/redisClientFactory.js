var _ = require('lodash');
var redis = require('redis');
var genericPool = require('generic-pool');
var logger = require('./logFactory').logger;
var cache = {};

/**
 * Gives you a configured instance of the redis client.
 * Init can be called once, then you can access the client property from other modules.
 * @example //module a
 *          var client = require(./redisClientFactory').init(conf);
 *
 *          //module b after a
 *          var client = require(./redisClientFactory').client;
 *
 * @exports rediClientFactory
 */
function redisClientFactory(){
    var self = this;

    /**
     * Initialize the redis client
     * @param {Object} conf - the redis configuration
     * @param {String} conf.host - the redis host
     * @param {Number} conf.port - the redis port
     * @param {String} [conf.auth] - the redis password
     * @param {Number} conf.db - the redis database number to select
     * @returns {RedisClient}
     */
    this.init = function(conf){

        //creates a connection pool
        self.pool = genericPool.Pool({
            name : 'redis-pool',
            create : function (cb){
                var client = redis.createClient(conf.port, conf.host);
                if(conf.auth){
                    client.auth(conf.auth);
                }

                client.on('error', function(err){
                    logger.err(err);
                });

                client.select(conf.db, function(){
                    logger.info('Redis database %d selected on %s:%d', conf.db, conf.host, conf.port);
                    cb(null, client);
               });
            },
            destroy: function(client){
                client.quit();
            },
            min : 0,
            max : 200,
            log : function(msg, level){
                //don't log verbose, too much
                if(level !== 'verbose' && _.isFunction(logger[level])){
                    logger[level](msg);
                }
            }
        });

        self.client = {};

        //rewrap all the redis commands into the client in order to use a pooled connection.
        _(redis.RedisClient.prototype).functions().filter(function(method){
            return (/^[A-Z]+$/).test(method);   //get the functions in uppercase
        }).forEach(function(command){
            command = command.toLowerCase();
            self.client[command] = self.pool.pooled(function (client) {
                var args = Array.prototype.slice.call(arguments, 1, arguments.length);
                client[command].apply(client, args);
            });
        });

        return self.client;
    };

    /**
     * Helps you to drain pooled client while exiting
     */
    this.exit = function(){
        var self = this;
        if(typeof self.pool !== undefined){
            self.pool.drain(function() {
                self.pool.destroyAllNow();
            });
        }
    };

    return this;
}

/**
 * Export the result of the factory, it can be cached and retrieved everywhere once initialized
 */
module.exports = exports = redisClientFactory.apply(cache);
