/**
 * Unit test of the {@link module:messagePoller} module
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 *
 * @module test/unit/messagePoller
 */

var lf = require('../../lib/logFactory');
lf.init(lf.levels.error, true);
var MessagePoller = require('../../lib/messagePoller');

/**
 * Test
 */
exports.MessagePollerTest = {

    /**
     * Set up by loading the module
     * @param {Function} done - to call once the setup is done.
     */
    setUp: function(done) {
        'use strict';
        
        //the test MessagePoller options
        this.opts = {
            endpoint: 'http://localhost:4000'
        };
        done();
    },
    
    /**
     * Check the MessagePoller Instantiaion
     * @param {Object} test - the test context
     */
    'testOptions': function(test) {
        'use strict';
    
        //no options, throws error for Endpoint
        test.throws(function(){ 
            new MessagePoller();
        });

        //wrong endpoint
        test.throws(function(){ 
            new MessagePoller({
                endpoint: 'ziggyzag'
            });
        });

        //valid endpoint, default options
        var msgPoller = new MessagePoller({
            endpoint: 'http://localhost:4000'
        }); 
        test.equal(msgPoller.options.endpoint, 'http://localhost:4000');
        test.equal(msgPoller.options.delay, 1000, "The default delay should be 1000 ms");
        test.equal(msgPoller.options.timeout, 60, "The default timeout should be 60");
        
        //valid endpoint, new options
        var otherMsgPoller = new MessagePoller({
            endpoint: 'http://localhost:4040',
            delay: 1250,
            timeout: -1
        }); 
        test.equal(otherMsgPoller.options.endpoint, 'http://localhost:4040');
        test.equal(otherMsgPoller.options.delay, 1250, "The current delay should be 1000 ms");
        test.equal(otherMsgPoller.options.timeout, -1, "The current timeout should be 60");

        test.done();
    },

    'testErrorEvent': function(test){
        test.expect(1);
        try{
            var msgPoller = new MessagePoller();
        } catch(err){
            test.ok(true);
        }
        test.done();
    },

    'testStart': function(test) {
        'use strict';
        
        test.expect(2);
        
        var aPoller = new MessagePoller(this.opts);
        aPoller.on('start', function(){
            test.ok(true, 'the poller start event is triggered');
            test.ok(aPoller.isStarted(), 'the poller is running');
            test.done();
        });
        aPoller.start();
        aPoller.stop();
    },
    
   'testStop': function(test) {
        'use strict';
        
        test.expect(2);
        
        var aPoller = new MessagePoller(this.opts);
        aPoller.on('stop', function(){
            test.ok(true, 'the poller is stopped');
            test.ok(aPoller.isStarted() === false, "the poller isn't started anymore");
            test.done();
        });
        aPoller.start();
        aPoller.stop();
    }
};
