var restify = require("restify");
var server = restify.createServer();

var mock = {
    mockedResponse : {
        ts : '',
        type : 'job',
        user : 'jcash',
        content : {
            name : 'php-unit-worker',
            status: 'waiting'
        }
    },
    calls : 0,
    getResponse : function (){
        this.mockedResponse.ts = new Date().getTime() + '';
        if(this.calls > 0){
            
            switch(this.mockedResponse.content.status){
                case 'waiting':  
                    this.mockedResponse.content.status = 'wip'; 
                    this.mockedResponse.content.wip = 0; 
                    break;
                case 'wip':  
                    if(this.calls > 10){
                        this.mockedResponse.content.status = 'success';
                    } else {
                        this.mockedResponse.content.wip = this.calls * 10; 
                    }
                    break;
                case 'success':
                    this.mockedResponse.content.status = 'waiting';
                    break;
            }
        }
        if(this.calls > 10){
            this.calls = 0;
        }
        this.calls++;
        return this.mockedResponse;
    }
};

server.use(restify.queryParser());

server.get('/', function serveAll(req, res, next){
    res.json('ok');
    return next();
});
    

server.get('/messages', function serveMessages(req, res, next){
    if(req.accepts('application/json')){
        res.json([mock.getResponse()]);        
    } 
    return next();
});

server.get('/messages/job', function serveJobMessages(req, res, next){
    if(req.accepts('application/json')){
        res.json([mock.getResponse()]);        
    } 
    return next();
});

module.exports = exports = server;
