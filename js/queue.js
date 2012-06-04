var Queue = function(){

    var theQueue = new Array();

    /**
     * The clean up, always add this as the last step. It just adds the queue again.
     */
    function addCleanUp(){
        theQueue[0].push(Queue.removeQueue);
    }

    /**
     * Slices current queue
     */
    function removeQueueItem(){
        theQueue[0].shift();
    }

    return {

        /***
         * Add an item to the queue.
         *
         * @param       {array}      cba
         */
        addQueue: function(ca){
            theQueue.push(ca);
        },

        /**
         * Is this even used?
         */
        removeQueue: function(){
            INTERVIEWIFY.loading("stop");
        },

        /**
         * Clear the Queue
         */
        clear: function(){
            theQueue = new Array();
        },

        /**
         * Start the Queue
         */
        start: function(){
            INTERVIEWIFY.loading("start");
            addCleanUp();
            Queue.next();
        },

        /**
         * Start Next...
         */
        next: function(){
            theQueue[0][0]();
            removeQueueItem();
        }
    }

}();