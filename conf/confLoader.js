/**
 * ORIGINAL work: https://github.com/krampstudio/BabyWishList
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 * @license AGPLv3
 * Breaks the AGPL license with the authorization of the original author.
 *
 * Modified work:
 * @author Bertrand Chevrier <chevier.bertrand@gmail.com>
 */

var nconf = require('nconf');
var defaultConfig = 'conf/config.json';
var cache = {};

/**
 * The configuration holder.
 * @typedef nConf
 * @type {Object}
 * @property {Function} get - Getter to access a set of configuration by it's key: conf.get('store')
 */

/**
 * Helps you to initialize and load the configuration, once.
 * Init can be called once, then you can access the conf property from other modules.
 * @example //module a
 *          var conf = require(./conf/confLoader').init();
 *
 *          //module b after a
 *          var conf = require(./conf/confLoader').conf;
 *
 *
 * @exports config/confLoader
 */
function confLoader(){
    var self = this;

    /**
     * Initialize the config loading
     * @param {string} [file = 'config/config.json']
     * @returns {nConf}
     */
    this.init = function(file){
        self.conf =  nconf
                        .argv()
                        .env()
                        .file({ file : file || defaultConfig });
        return self.conf;
    };

    return this;
}

/**
 * Export the result of the factory, it can be cached and retrieved everywhere once initialized
 */
module.exports = exports = confLoader.apply(cache);
