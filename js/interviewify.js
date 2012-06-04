var INTERVIEWIFY = function(){
	
	var timeoutTime = (1000*60*5);
	var t;
		
    // The queue for loading data
    var dataSearchQueue = new Array("Developers","Shadows", "Resources", "CleanUp");

    // Settings object, will only contain location right now
    var settings = new Object();

    /**
     * Set up the stuff we need access to from the gadget
     */
    function initGadget() {
        gadgets.window.adjustHeight();
        google.load("gdata", "1.x");
        google.load("visualization", "1.x");
        //google.load("feeds", "1"); // Doesnt seem to work with private spreadsheet feeds
        google.setOnLoadCallback(setupServices);
    }

    /**
     * Set up what google services we will need, maybe this should be in the google class
     */
    function setupServices() {
        calendarService = new google.gdata.calendar.CalendarService(gadgetName);
        calendarService.useOAuth("google");

        Queue.next();
    }

    return {

        /**
         * The first this we got to do to initialize the interviewify gadget
         */
        bootstrap: function(){
            INTERVIEWIFY.setDateTime();
            DB.init_db();
            initGadget();
            DB.setDataLoadQueueCallback(Queue.next);
        },

        /**
         * This runs when the gadget has finished loading to show the search form
         */
        showSearch: function(){
            INTERVIEWIFY.showElement("#search", "fast", INTERVIEWIFY.firstAdjust);
        },

        /**
         * Start loading the languages/techniques.
         */
        loadTechniques: function(){
            DB.getTechniques(INTERVIEWIFY.insertTechniques);
        },

        /**
         * Insert the techniques in the form
         */
        insertTechniques: function(theTechs){
            var output = [];
            output.push('<option value="">Language</option>');
            var i=0;
            for (i=0;i<theTechs.length;i++){
                output.push('<option value="'+ theTechs[i]['id'] +'">'+ theTechs[i]['technique'] +'</option>');
            }

            $('#interview-language').html(output.join(''));

            Queue.next();

        },

        /**
         * Load the interview steps and put them in the form
         */
        loadSteps: function(){
            console.log("loadSteps");
            DB.getSteps(INTERVIEWIFY.insertSteps);
        },

        /**
         * Insert the inteview steps in the form
         *
         * @param   {array}  the interview steps
         */
        insertSteps: function(theSteps){
            var output = [];
            output.push('<option value="">Interview Step</option>');
            var i=0;
            for (i=0;i<theSteps.length;i++){
                output.push('<option value="'+ theSteps[i]['id'] +'">'+ theSteps[i]['step'] +'</option>');
            }

            $('#interview-type').html(output.join(''));

            Queue.next();

        },

        /**
         * Load developers that should learn to do this interview step or language
         */
        loadDevelopersByInterview: function(){
            var sid = Number($("#interview-type").val());
            var tid = Number($('#interview-language').val());
            DB.getDevelopersByInterview(sid, tid, false, GOOGLE.getAvailableDevelopers);
            $('#interview-developer').html('<option value="">Loading...</option>');
        },

        /**
         * Load shadows that should learn to do this interview step or language
         */
        loadShadowsByInterview: function(){
            var sid = Number($("#interview-type").val());
            var tid = Number($('#interview-language').val());
            DB.getDevelopersByInterview(sid, tid, true, GOOGLE.getAvailableShadows);
            $('#interview-shadow').html('<option value="">Loading...</option>');
        },

        /**
         * Load resources and check if they are available
         */
        loadResources: function(){
            DB.getResources(GOOGLE.getAvailableResources);
            $('#interview-room').html('<option value="">Loading...</option>');
        },

        /**
         * Insert the resources
         *
         * @param   {array}     an array with rooms
         */
        insertResources: function(resources){
            var output = [];
            var i=0;
            var num = resources.length;
            var d = Math.floor(Math.random()*num);
            for (i=0;i<num;i++){
                output.push('<option value="'+ resources[i]['email'] +'" '+(i == d ? 'selected="selected"' : '')+'>'+ resources[i]['name'] +'</option>');
            }

            $('#interview-room').html(output.join(''));
            INTERVIEWIFY.SearchQueue();
        },

        /**
         * Load developers, shadows, resources and put them in the results form
         */
        SearchQueue: function(){
            if (dataSearchQueue.length != 0){
                switch (dataSearchQueue[0])
                {
                    case "Developers":
                        INTERVIEWIFY.loadDevelopersByInterview();
                        break;
                    case "Shadows":
                        INTERVIEWIFY.loadShadowsByInterview();
                        break;
                    case "Resources":
                        INTERVIEWIFY.loadResources();
                        break;
                    case "CleanUp":
                        dataSearchQueue = new Array("This Will be shifted", "Developers", "Shadows", "Resources", "CleanUp");
                        INTERVIEWIFY.loading("stop");
                        $('#search-btn').removeAttr('disabled');
                        $('#submit-btn').removeAttr('disabled');
                        INTERVIEWIFY.showElement("#results",'slow');
                        break;
                }
                dataSearchQueue.shift();
            }
        },

        /**
         * Gets all the locations based on what resources there are
         *
         * Maybe this should be changed to be based on the location of the developers,
         * or just a list of locations.
         */
        initLocationPrefs: function(){
            DB.getLocations(INTERVIEWIFY.insertLocationsPref);
        },

        /**
         * Change to genereal insert into dropdown method
         *
         * @param   {array}     array with locations for the settings form
         */
        insertLocationsPref: function(locations){
            var output = [];
            var i=0;
            var num = locations.length;

            output.push('<option value="">Your location!</option>');
            for (i=0;i<num;i++){
                output.push('<option value="' + locations[i]['city'] + '" ' + (locations[i]['city'] == settings.location ? 'selected="selected"' : '') + '>' + locations[i]['city'] + '</option>');
            }

            $('#pref-location').html(output.join(''));
        },

        /**
         * Load this users settings, if any, otherwise show them the pref tab.
         *
         * @param   {array}     if there is settings, this will be populated, if not, populate it and try again
         */
        initSettings: function(_settings){
            if (typeof _settings == "undefined"){
                DB.getSettings(INTERVIEWIFY.initSettings);
            } else {
                if (_settings.length != 0){
                    for (var i=0;i<_settings.length;i++){
                        var tmp = _settings[i]['key'];
                        settings[tmp] = _settings[i]['val'];
                    }
                } else {
                    $("#tabs").tabs('option', 'selected', 1);
                }
                Queue.next();
            }
        },

        /**
         * Get a setting
         *
         * @todo    Add some validation...
         * @param   {string}    the key of the setting you want
         * @return  {string}    the value of the setting you requested
         */
        getSetting: function(key){
            return settings[key];
        },

        /**
         * Save settings
         */
        saveSettings: function(){
            var loc = $('#pref-location').val();
            DB.setSetting('location', loc);
        },

        /**
         * Insert developers into the results form
         *
         * @param   {array}     array of available developers
         */
        insertDevelopers: function(developers){
        	console.log("insertDevelopers: " + typeof developers);
        	var output = [];
            var i=0;
            var num = (typeof developers != "undefined" ? developers.length : 0);
            var d = Math.floor(Math.random()*num);
            for (i=0;i<num;i++){
            	output.push('<option value="'+ developers[i]['email'] +'" '+(i == d ? 'selected="selected"' : '')+'>' + developers[i]['name'] + " - " + developers[i]['team'] +'</option>');
            }
			
			if (num == 0){
				output.push('<option value="">None Available</option>');
			}
			
            $('#interview-developer').html(output.join(''));
            INTERVIEWIFY.SearchQueue();
        },

        /**
         * Insert Shadowers into the results form
         *
         * @param   {array}     array of available shadowers
         */
        insertShadows: function(developers){
            var output = [];
            var i=0;
            var num = (typeof developers != "undefined" ? developers.length : 0);
            var d = Math.floor(Math.random()*num);
            output.push('<option value="">None</option>');
            for (i=0;i<num;i++){
                output.push('<option value="'+ developers[i]['email'] +'" '+(i == d ? 'selected="selected"' : '')+'>' + developers[i]['name'] + " - "+ developers[i]['team'] +'</option>');
            }

            $('#interview-shadow').html(output.join(''));
            INTERVIEWIFY.SearchQueue();
        },

        /**
         * Show a element then adjust the height, or run the callback supplied
         *
         * @param   {string}    the dom element
         * @param   {string}    show the element 'fast' or 'slow'
         * @param   {callback}  optional callback
         */
        showElement: function(el, speed, callback){
            if (typeof callback == "undefined"){
                var callback = INTERVIEWIFY.adjustHeight;
            }

            $(el).show(speed, callback);
        },

        /**
         * Hide a element and then adjust the height
         *
         * @param   {string}    the dom element
         */
        hideElement: function(el){
            $(el).hide('fast', INTERVIEWIFY.adjustHeight);
        },

        /**
         * This will run the first time we need to show the search form.
         */
        firstAdjust: function(){
            INTERVIEWIFY.adjustHeight();
            Queue.next();
        },

        /**
         * If we show/hide or change content i the gadget, it needs to redraw the hight of the gadget.
         */
        adjustHeight: function(){
            gadgets.window.adjustHeight();
        },
		
		/**
		 * Sets the number of millisecounds till we run the timed method
		 *
		 * @param	{int}	secounds
		 */
		setTimerTime: function(s){
			INTERVIEWIFY.timeoutTime = s*1000;
		},
		
		/**
		 * Get the timer from
		 *
		 * @param	{int}	secounds
		 */
		getTimerTime: function(){
			return timeoutTime;
		},
		
		/**
		 * Sets the db check timer.
		 *
		 * @param	{function}	the method to call on timeout
		 */
		setTimer: function(callback){
			INTERVIEWIFY.clearTimer();
			t = setTimeout(callback, (1000*60*5));
		},
		
		/**
		 * Kills the timer
		 */
		clearTimer: function(){
			clearTimeout(t);
		},
		
        /**
         * Use Datejs to find a date in the future as default date and pre fill the date and time in the form
         *
         * @param   {int}   not used... don't know why its there, think I wanted to be albe to not juse "now" at some point.
         */
        setDateTime: function(h){
            var h = 1;
            var today = Date.today();
            var now = new Date();
            now.set({minute: 00});
            var soon = new Date();
            soon.set({minute: 00});
            soon.add({hours: h}).toString("HH:mm");

            $("#interview-date").val( Date.today().add(1).weeks().toString("yyyy-MM-dd") );
            $("#interview-from").val( now.toString("HH:mm") );
            $("#interview-to").val( soon.toString("HH:mm") );
        },
		
		/**
		 * 
		 */		
		refreshBtnToggle: function(){
			if ($("#refresh-box").css('display', 'none')){
				INTERVIEWIFY.showElement("#refresh-box", 'slow');
			} else {
				INTERVIEWIFY.hideElement("#refresh-box");
			}
		},
		
        loading: function(action){
            $("#loading").toggle();
        }

    }

}();
