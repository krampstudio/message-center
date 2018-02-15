var messageChannelModule = function($, io){

    var defaults = {
        container : $(document)
    };

    var availableEvents = ['start', 'stop', 'connect', 'reconnect', 'message', 'error'];

    function namespace(eventName, channel){
        return [eventName, channel, 'messagechannel'].join('.');
    }

    var messageChannelFactory = function(channel, options){

        options = $.extend({}, options, defaults);

        $.each(availableEvents, function(index, event){
            if(options[event] && typeof options[event] === 'function'){
                MessageChannel.on(event, options[event]);
            }
        });

        var MessageChannel = {
            messageSocket : null,
            channel : channel,   
            container : options.container,
        
            start : function (token){
                var self = this;
                if(this.messageSocket === null){
                    this.messageSocket = io.connect('/' + this.channel);
                    
                    this.messageSocket.on('connect', function sendToken(){
                        self.messageSocket.emit('token', token);
                        self._trigger('connect', token);
                    });      
                    this.messageSocket.on('message', function processMessage(messages){
                        $.each(messages, function(index, message){
                               self._trigger('message', message);
                        });
                    });
                    this.messageSocket.on('error', function processError(error){
                        self._trigger('error', error);
                        self.stop();
                    });

                } else {
                    this.messageSocket.socket.reconnect();
                    this._trigger('reconnect', token);
                }
                this._trigger('start');
            },

            stop : function (){
                if(this.messageSocket && this.messageSocket.socket){
                   this.messageSocket.socket.disconnect();
                }
                this._trigger('stop');
            },

            _trigger : function (eventName){
                this.container.trigger(namespace(eventName, this.channel), Array.prototype.slice.call(arguments, 1));
            },

            on: function(eventName, cb){
                if(typeof cb === 'function'){
                    this.container.on(namespace(eventName, this.channel), cb);
                }
            }
        };

        return MessageChannel;
    };

    return messageChannelFactory;
};

//module loading
if(define && typeof define === 'function'){
    //AMD compatible
    define(['jquery', 'socket.io'], messageChannelModule);
} else {
    //vanilla js way
    messageChannelModule(jQuery, io);
}
