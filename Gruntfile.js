module.exports = function(grunt) {
    'use strict';

    var sources = ['lib/**/*.js', 'controller/*.js', 'app.js'],
        buildDir = 'build/',
        logDir = 'logs/',
        distDir = buildDir + '/dist',
        volatile = [buildDir, logDir];  

    // Project configuration.
    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),        
        
        mkdir: {
            dist: {
                options: {
                    create: volatile.concat([distDir])
                }
            }
        },
        
        clean : volatile,
        
        jsdoc: {
            dist: {
                src: sources,
                options: {
                    destination: buildDir + 'doc'
                }
            }
        },
        
        nodeunit: {
            unit: {
                src: ['test/unit/**/*_test.js']
            },
            integration : {
                src: ['test/integration/**/*_test.js']
            }
        },
        
        jshint: {
            server : {
                src: sources.concat(['test/**/*_test.js']).concat(['Gruntfile.js']),
                options : {
                    node : true
                }
            },
            client : {
                src: ['public/js/src/*.js', 'public/js/config/*.js', 'public/js/app.js'],
                options : {
                    browser : true
                }

            },
            options: {
                camelcase: true,
                smarttabs: true,
                curly: true,
                multistr: true
            }
        },
        bower : {
            install :  {
                options : {
                    targetDir : buildDir + '/components'
                }
            }
        },

        uglify : {
            options: {
                mangle: {
                    report: 'gzip',
                    except: ['jQuery', 'io']
                }
            },
            client : {
               src : ['public/js/lib/socket.io-client/dist/socket.io.min.js', 'public/js/src/messageChannel.js'],
               dest : distDir + '/messageChannel-<%=pkg.version%>.min.js'
            }
        } 
    });
    
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-jsdoc');

    //Start the stub server and run the integration test
    grunt.registerTask('integrationtest', 'Full integration test suite', function integrationTest(){
        var stub = require('./test/stub/stub');
        var done = this.async();
        stub.listen(9999, function(){
            grunt.log.debug('Messages Stub listening on port 9999');
            grunt.task.run('nodeunit:integration');
            done();
        });
    });

    // Tasks flow.
    grunt.registerTask('install', ['clean', 'mkdir', 'bower']);
    grunt.registerTask('test', ['nodeunit:unit', 'integrationtest']);
    grunt.registerTask('build', ['jshint', 'test', 'jsdoc', 'uglify']);
};
