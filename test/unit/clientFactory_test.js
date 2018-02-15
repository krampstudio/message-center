/**
 * Unit test of the {@link module:clientFactory} module
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 *
 * @module test/unit/clientFactory
 */

var lf = require('../../lib/logFactory');
lf.init(lf.levels.error, true);

/**
 * Test
 */
exports.ClientFactoryTest = {

    /**
     * Set up by loading the module
     * @param {Function} done - to call once the setup is done.
     */
    setUp: function(done) {
        'use strict';
        
        this.endpoints = ['http://localhost:4000', 'https://localhost:3030'];
        
        this.factory = require('../../lib/clientFactory');
        done();
    },
    
    /**
     * Check the module api
     */
    'testModule' : function(test){
        'use strict';
        
        test.ok(typeof this.factory === 'object');
        test.ok(typeof this.factory.getClient === 'function');
        
        test.done();
    },
    
    /**
     * Check the creation of a rest client
     * @param {Object} test - the test context
     */
    'testClient': function(test) {
        'use strict';
    
        var client = this.factory.getClient(this.endpoints[0]);
        test.ok(typeof client === 'object');
        test.equal(client.name, 'restify');
        test.equal(client.url.href, require('url').format(this.endpoints[0]));
        test.equal(client.rootResource, '/messages');
        test.done();
    },
    
    /**
     * Check the client caching
     * @param {Object} test - the test context
     */
    'testClientsCache': function(test) {
        'use strict';
    
        var client1 = this.factory.getClient(this.endpoints[0]);
        var client2 = this.factory.getClient(this.endpoints[0]);
        test.deepEqual(client1, client2);
        
        var client3 = require('../../lib/clientFactory').getClient(this.endpoints[0]);
        test.deepEqual(client1, client3);

        test.done();
    },
};
