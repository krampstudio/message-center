/**
 * Helps you to setup a Caterpillar logger using a {@link LoggerFactory}
 * @exports logFactory
 * @version 0.1.0
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 */

var _           = require('lodash');
var fs          = require('fs');
var util        = require('util');
var caterpillar = require('caterpillar');


/**
  * SetUp the factory
  * @constructor LoggerFactory
  *
  * @returns {Object} that contains the logger
  */
function LoggerFactory(){

    var self = this;

	/**
     * Caterpillar Transform Filter to break lines in the raw logs
     * @class BreakLine
     * @private
     * @memberOf LoggerFactory
     * @extends caterpillar.Transform
     * @param {Object} config - see carterpillar.Transform
     */
	var BreakLine = function(config){
		caterpillar.Transform.call(this, config);
	};
	util.inherits(BreakLine, caterpillar.Transform);

	BreakLine.prototype._transform = function(chunk, encoding, next){
		return next(null, this.format(JSON.parse(chunk.toString())));
	};
	BreakLine.prototype.format = function(entry){
        return JSON.stringify(entry) + "\n";
	};

	/**
     * the list of logging levels
	 * @type {Object}
     * @memberOf LoggerFactory
     * @public
	 */
	this.levels = new caterpillar.Logger().config.levels;

    this.alias = {
        'fatal' : 'critical',
        'trace' : 'debug'
    };

	/**
     * initialize the logger
     * @memberOf LoggerFactory
     * @public
     * @param {Number} level - the logging level
     * @param {Boolean} [stdout] - the logger prints to the standard output
     * @param {String} [file] - a file path if present to write the logs into
	 */
	this.init = function(level, stdout, file){
		var config = {
				level : level,
				lineOffset : 2
		};
		var logger = new caterpillar.Logger(config);
		var filter = new (require('caterpillar-filter').Filter)(config);
		var human  = new (require('caterpillar-human').Human)(config);
		var br = new BreakLine(config);

        //enable formating in log messages, so we rewrap the function args to enable util.format way
        var originalLog = caterpillar.Logger.prototype.log;
        logger.log = function(){
           var type = arguments[0];
           if(arguments.length > 1){
                return originalLog.call(logger, type, util.format.apply(util, Array.prototype.slice.call(arguments, 1)));
           } else{
                return originalLog.call(logger,type, Array.prototype.slice.call(arguments, 0));
           }
        };

		// filter and format output
		var filtered = logger.pipe(filter);

		//to stdout
		if(stdout){
			filtered.pipe(human).pipe(process.stdout);
		}

		//append to file
		if(file && file.trim().length > 0){
			filtered.pipe(br).pipe(fs.createWriteStream(file, {flag : 'a'}));
		}

		_.keys(self.levels).map(function mapLevel(levelName){
			//map  each level to a method
			logger[levelName] = _.partial(logger.log, levelName);
		});
        _.each(self.alias, function(levelName, alias){
            logger[alias] = _.partial(logger.log, levelName);
        });

		self.logger = logger;
        return self.logger;
	};
}

/**
 * Export the result of the factory, it can be cached and retrieved everywhere once initialized
 */
module.exports = exports = new LoggerFactory();
