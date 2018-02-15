requirejs.config({
//    urlArgs: 'bust=' + (new Date()).getTime(),  //only for dev  : no-cache for the laoded scripts 
    paths: {
        'jquery'        : ['lib/jquery/jquery'],
        'bootstrap'     : ['lib/bootstrap/dist/js/bootstrap.min'],
        'socket.io'     : ['lib/socket.io-client/dist/socket.io.min']
    },
    //dependencies
    shim: {
       'socket.io'  : {
            exports : 'io'
        },       
       'bootstrap'  : ['jquery']
    }
});

