require(['config/config'], function(){
    'use strict';
    
    require(['jquery', 'src/messageChannel'], function($, msgChanFactory){
    
        $(document).ready(function(){
            
            var $result = $('#result');
            var $resultLoader = $('.loader', $result);
            var $resultConsole = $('.console', $result);
            var $resultJobs = $('.jobs', $result);
            var $startButton = $('#start');
            var $stopButton = $('#stop');    
            var $tokenField = $('#token');
           
            var chan = msgChanFactory('job'); 
            chan.on('error', function(event, error){
                $resultLoader.hide();
                $resultConsole.append("<p class='error'><span class='label label-danger'>Error</span> " + error + '</p>');
            });
            chan.on('message', function(event, message){
                $resultLoader.hide();
                $resultConsole.append(message.user + ' [' + message.ts + '] ' + message.content.name + ' : ' + message.content.status + ' ' +  message.content.wip + '<br />');
                updateJob(message);
            });            

            $startButton.click(function(e){
                e.preventDefault();
                state();
                chan.start($tokenField.val());

                return false;
            });
            
            $stopButton.click(function(e){
                e.preventDefault();
                state();
                chan.stop();

                return false;
            });

            function state(){
                if($stopButton.hasClass('disabled')){
                    //start
                    $resultLoader.show();
                    $resultConsole.empty();
                } else {
                    $resultLoader.hide();
                }
                $startButton.toggleClass('disabled');
                $stopButton.toggleClass('disabled');
            }

            function updateJob(message){
                var jobType = message.content.name;
                var $jobBar = $resultJobs.find('.progress[data-job="' + jobType + '"] .progress-bar');
                if($jobBar.length === 0){
                    $resultJobs.append(jobType + ' <div class="progress" data-job="' + jobType + '"> ' +
 ' <div class="progress-bar" role="progressbar" aria-valuenow="'+message.content.wip+'" aria-valuemin="0" aria-valuemax="100" style="width:' + message.content.wip + '%"></div> ' +
'</div>');
                } else {
                    var wip = message.content.wip || 0;
                     
                    if(message.content.status === 'success'){
                        $jobBar.addClass('progress-bar-success');
                        wip = 100;
                    }
                    if(message.content.status === 'error'){
                        $jobBar.addClass('progress-bar-danger');
                        wip = 100;
                    }
                    
                    $jobBar.attr('aria-valuenow', wip).width(wip + '%');
                }
            }
        });
    });
});
