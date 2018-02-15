/**
 * Creates shared objects of Restify's JSON client
 * @module clientFactory
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 */

var logger  = require('./logFactory').logger;
var restify = require('restify');
var url     = require('url');

/**
 * Contains the clients instances
 * @type Array
 */
var clients = [];

/**
 * Create a restify JSON client for the endpoint
 * @memberOf module:clientFactory
 * @param {String} endpoint - protocol://host:port
 * @param {String} [token] - the user token
 * @returns {Object} a restify client
 */
function createClient(endpoint, token){

    //build api URL
    var apiUrl = url.parse(endpoint);

    var clientConfig = {
        'url' : url.format(apiUrl)
    };

    //add the token to the headers
    if(token){
        clientConfig.headers = {
            XToken : token
        };
    }

    //creates the REST client
    var client = restify.createJsonClient(clientConfig);
    client.rootResource = '/messages';

    logger.debug('creating client for %s using %j', endpoint, clientConfig);

    return client;
}

/**
 * Generates a key based on the caller function arguments
 * @returns {String} the key
 */
function generateKey(){
    var i = 0, key = '', caller = generateKey.caller;
    if(caller && caller.arguments.length > 0){
        for(i in  generateKey.caller.arguments){
            key +=  caller.arguments[i];
        }
    }
    return key;
}

/**
 * Get an instance of a restify client
 * @param {String} endpoint - protocol://host:port
 * @param {String} [token] - the user token
 * @returns {Object} a restify client
 */
exports.getClient = function(endpoint, token){
    var key = generateKey();
    if(clients[key] && typeof clients[key] === 'object'){
        return clients[key];
    }
    clients[key] = createClient(endpoint, token);
    return clients[key];
};

/**
 * Destroy an instance of a restify client
 * @param {String} endpoint - protocol://host:port
 * @param {String} [token] - the user token
 */
exports.destroy = function(endpoint, token){
    var key = generateKey();
    if(clients[key]){
        delete clients[key];
    }
};
