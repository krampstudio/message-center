/**
 * Integration test of the {@link module:clientFactory} module
 * @author Bertrand Chevrier <chevrier.bertrand@gmail.com>
 *
 * @module test/integratinon/clientFactory
 */

var _ = require('lodash');
var lf = require('../../lib/logFactory');
lf.init(lf.levels.error, true);

/**
 * Test
 */
exports.ClientFactoryIntegrationTest = {

    /**
     * Set up by loading the module and options
     * @param {Function} done - to call once the setup is done.
     */
    setUp: function(done) {
        'use strict';
        
        this.endpoint = 'http://127.0.0.1:9999';
        
        this.factory = require('../../lib/clientFactory');
        done();
    },
    
    /**
     * 
     * @param {Object} test - the test context
     */
    'testClient': function(test) {
        'use strict';
    
        test.ok(require('url').parse(this.endpoint));
        var client = this.factory.getClient(this.endpoint);
        test.ok(typeof client === 'object');
        
        test.done();
    },
    
    /**
     * 
     * @param {Object} test - the test context
     */
    'testStub': function(test) {
        'use strict';
        test.expect(1);
        require('http').request({host : 'localhost', port: 9999, path : '/'}, function(res){
            test.ok(res.statusCode !== 404);
            test.done(); 
        }).end();
    },
    
     /**
     * 
     * @param {Object} test - the test context
     */
    'testClientGetJob': function(test) {
        'use strict';
        test.expect(6);
        
        var client = this.factory.getClient(this.endpoint);
        var resource = client.rootResource + '/job';
        client.get(resource, function(err, req, res, data){
            
            test.ok(err === null);
            test.ok(_.isArray(data));
            test.ok(data.length > 0);
            test.ok(parseInt(data[0].ts, 10) > 0);
            test.equal(data[0].type, 'job');
            test.deepEqual(data[0].content, {name: 'php-unit-worker', status: 'waiting'});
            
            test.done();
        });
    }
   
};
