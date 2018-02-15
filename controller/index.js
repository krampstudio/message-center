/**
  * Loads controllers.
  * @module controller
  * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
  */

var messageChannel = require('./messageChannel');
var _ = require('lodash');

/**
 * Expose the an instance of {@link module:controller/messageChannel} controller  for the 'job'
 */
exports.job = _.partial(messageChannel, 'job');
