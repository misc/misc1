var GOOGLE = function(){

    var spreadSheetUrl = "https://docs.google.com/spreadsheet/ccc?key=0AolgRCI47-yDdGhsdG9IaGtyRmNicklJSUxlVTg5MlE&hl=sv&headers=1";
	
	var interviewersSheetUrl = spreadSheetUrl + "&gid=4";
	var stepsSheetUrl = spreadSheetUrl + "&gid=5";
	var languagesSheetUrl = spreadSheetUrl + "&gid=2";
	var resourcesSheetUrl = spreadSheetUrl + "&gid=1";
	
	
	var revisionString = '';
	var sheetPages = new Array(1,2,4,5);
	var checkRevisionArray = new Array();
	
    return {
        /**
         * Get the interview types, and techniques from the google spreadsheet used as storage.
         *
         * @todo    Merge this and getSteps to a "get header of sheet method"
         **/
        getTechniques: function(callback){
            var returnArray = new Array();
            var query = new google.visualization.Query(languagesSheetUrl);
            query.setQuery("SELECT * LIMIT 1");
            query.send(function setReturn(response) {
                
                var dt = response.getDataTable();
                var numResources = dt.getNumberOfColumns();

                var resources = JSON.parse(dt.toJSON());
                
                var id = 1;
                for (var i=1;i<numResources;i++){
                    var tmp = new Array();
                    tmp['id'] = id;
                    tmp['value'] = resources.cols[i].label;
                    id = id*2;
                    returnArray.push(tmp);
                }
                
                if (typeof callback == "function"){
                    callback(returnArray);
                } else {
                    return returnArray;
                }

            });
        },

        /**
         * Get all the interview steps
         *
         * @param   {function}  the callback yao
         * @return  {array}     if no callback, return array
         **/
        getSteps: function(callback){
            var returnArray = new Array();
            var query = new google.visualization.Query(stepsSheetUrl);
            query.setQuery("SELECT * LIMIT 1");
            query.send(function setReturn(response) {

                var dt = response.getDataTable();
                var numResources = dt.getNumberOfColumns();

                var resources = JSON.parse(dt.toJSON());
                var id = 1;
                for (var i=1;i<numResources;i++){
                    var tmp = new Array();
                    tmp['id'] = id;
                    tmp['value'] = resources.cols[i].label;
                    id = id*2;
                    returnArray.push(tmp);
                }

                if (typeof callback == "function"){
                    callback(returnArray);
                } else {
                    return returnArray;
                }

            });
        },

        /**
         * Get the Resources from the spreadsheet
         *
         * @param   {function}  the callback
         */
        getResources: function(callback){
            var query = new google.visualization.Query(resourcesSheetUrl);
            query.setQuery("SELECT *");
            query.send(function setReturn(response) {
                if (response.isError()) {
                    console.error("GOOGLE.getResources query error!",
                        response.getMessage(),
                        response.getDetailedMessage());
                    return;
		}
                var dt = response.getDataTable();
                var numResources = dt.getNumberOfRows();

                var resources = JSON.parse(dt.toJSON());
                var returnArray = new Array();

                for (var i=1;i<numResources;i++){
                    var tmp = new Array();
                    tmp['id'] = resources.rows[i].c[0].v;
                    tmp['type'] = resources.rows[i].c[1].v;
                    tmp['name'] = resources.rows[i].c[2].v;
                    tmp['description'] = resources.rows[i].c[3].v;
                    tmp['floor'] = resources.rows[i].c[4].v;
                    tmp['street'] = resources.rows[i].c[5].v;
                    tmp['city'] = resources.rows[i].c[6].v;
                    tmp['country'] = resources.rows[i].c[7].v;
                    tmp['building'] = resources.rows[i].c[8].v;
                    tmp['extra'] = "0";
                    tmp['size'] = resources.rows[i].c[9].v;
                    tmp['email'] = resources.rows[i].c[10].v;
                    tmp['auto_mail'] = resources.rows[i].c[11].v;
                    
                    returnArray.push(tmp);
                }

                if (typeof callback == "function"){
                    callback(returnArray);
                } else {
                    return returnArray;
                }
            });
        },

        /**
         * Get the developers from the spreadsheet
         *
         * @param   {function}  the callback function
         */
        getDevelopers: function(callback){
            
            var returnArray = new Array();
            var query = new google.visualization.Query(interviewersSheetUrl);
            query.setQuery("SELECT * OFFSET 1");
            query.send(function setReturn(response) {
                if (response.isError()) {
                    console.error("getDevelopers query error!",
                        response.getMessage(),
                        response.getDetailedMessage());
                    return;
		}
                var dt = response.getDataTable();
                var numDevelopers = dt.getNumberOfRows();
                
                var developers = JSON.parse(dt.toJSON());
                var i = 0;
                for (i=0;i<numDevelopers;i++){

                    var tmpName = "";
                    var tmpEmail = "";
                    var tmpTeam = "";
                    var tmpLocation = "";
                    
                    tmpName = developers.rows[i].c[0].v;
                    tmpEmail = developers.rows[i].c[1].v;
                    tmpTeam = developers.rows[i].c[2].v;
                    tmpLocation = developers.rows[i].c[3].v;
                    
                    var tmpDev = new Array();
                    tmpDev['id'] = i;
                    tmpDev['name'] = tmpName;
                    tmpDev['email'] = tmpEmail;
                    tmpDev['team'] = tmpTeam;
                    tmpDev['location'] = tmpLocation;
                    
                    // Eh, not the beutifulest, but without it we get extra rows
                    if (tmpName != ""){
                        returnArray.push(tmpDev);
                    }

                };
                if (typeof callback == "function"){
                    callback(returnArray);
                } else {
                    return returnArray;
                }
            });
            
        },

        /**
         * Query the spreadsheet for the developers skills with interview steps
         *
         * @todo    merge with the other method for getting data below
         *          all we have to do is add the sheet page to params.
         * @param   {function}  the callback method
         * @param   {string}    the page id of steps or languages
         */
        getDevelopersSkills: function(callback, page){
            var returnArray = new Array();
            var query = new google.visualization.Query(spreadSheetUrl + "&gid=" + page);
            query.setQuery("SELECT * OFFSET 1");
            query.send(function setReturn(response) {
                if (response.isError()) {
                    console.error("getDevelopers query error!",
                        response.getMessage(),
                        response.getDetailedMessage());
                    return;
		}
                var dt = response.getDataTable();
                var numDevelopers = dt.getNumberOfRows();

                var developers = JSON.parse(dt.toJSON());
                var i = 0;
                for (i=0;i<numDevelopers;i++){

                    var tmpName = developers.rows[i].c[0].v;
                    var tmpMaster = 0;
                    var tmpTeacher = 0;
                    var tmpShadow = 0;

                    //Count: master, teacher, shadow
                    var cols = developers.cols.length;
                    var c = 0;
                    var cid = 1;
                    for (c=1;c<cols;c++){

                        switch(developers.rows[i].c[c].v)
                        {
                            case "y": // Yes, can do
                                tmpMaster+=cid;
                                break;
                            case "yt": // Yes, can do and also teach
                                tmpMaster+=cid;
                                tmpTeacher+=cid;
                                break;
                            case "h": // Not quite there yet, do shadow
                                tmpShadow+=cid;
                                break;
                            case "l": // Not quite there yet, do shadow
                                tmpShadow+=cid;
                                break;
                        }

                        cid*=2;
                    }

                    var tmpDev = new Array();
                    tmpDev['id'] = i;
                    tmpDev['master'] = tmpMaster;
                    tmpDev['teacher'] = tmpTeacher;
                    tmpDev['shadow'] = tmpShadow;

                    // Eh, not the beutifulest, but without it we get extra rows
                    if (tmpName != ""){
                        returnArray.push(tmpDev);
                    }

                };
                callback(returnArray);
            });

        },

        // Change this to just check for resources
        getAvailableResources: function(resources){

            var cbr = function(response) {

                console.log("is resources in this scope? : " + typeof resources);

                if (response.length <= 0) {
                    $('#interview-room').html('<option disabled="disabled" value="">Non Available</option>');
                    INTERVIEWIFY.SearchQueue();
                    return;
                }

                var available = new Array();
                var i=0;
                response.forEach(function(u) {
                    // Some users have "no permissions" to read their calendar...
                    if ("error" in u){
                        console.error("Something is up (resources): " + u.error + " - " . u);
                    } else {
                        if (typeof u.events != "undefined" && u.events.length == 0) {
                            //available.push(u);
                            available.push(resources[i]);
                        }
                    }
                    i++;
                });
                INTERVIEWIFY.insertResources(available);
            };
            
            var gDate = GOOGLE.getTR();
            var startDate = gDate.start;
            var endDate = gDate.end;
            
            google.calendar.read.getEvents(cbr,
                    resources.map(function(d) {return d['email'];}),
                    startDate, endDate,
                    {requestedFields: ["owner", "status", "attendeeCount",
                    "attendees", "details"]});

        },

        
        getAvailableDevelopers: function(developers){
        	console.log("developer: " + developers);
            var cbd = function(response) {
                if (response.length <= 0) {
                    $('#interview-shadow').html('<option disabled="disabled" value="">Non Available</option>');
                    INTERVIEWIFY.SearchQueue();
                    return;
                }
                
                var available = new Array();
                var i = 0;
                response.forEach(function(u) {
                    // Some users have "no permissions" to read their calendar...
                    if ("error" in u){
                        console.error("Something is up (developer): " + u.error + " - " + u.email);
                    } else {
                        if (typeof u.events != "undefined" && u.events.length == 0) {
                        	console.log("Im Free! " + developers[i].name);
                            available[u.email] = developers[i];
                        }
                    }
                    i++
                });
                console.log("available: " + available);
                GOOGLE.getDeveloperByInterviewFreq(available);
            };
            
            if (developers.length > 0){
                var gDate = GOOGLE.getTR();
                var startDate = gDate.start;
                var endDate = gDate.end;

                google.calendar.read.getEvents(cbd,
                        developers.map(function(d) {return d['email'];}),
                        startDate, endDate,
                        {requestedFields: ["owner", "status", "attendeeCount",
                        "attendees", "details"]});
            } else {
            	INTERVIEWIFY.insertDevelopers();
            }
        },

        // Change this to just check for resources
        getAvailableShadows: function(developers){
        	console.log("shadow: " + developers);
            var cbd = function(response) {
                if (response.length <= 0){
                    $('#interview-shadow').html('<option value="">Non Available</option>');
                    INTERVIEWIFY.SearchQueue();
                    return;
                }
                if ("error" in response[0]){
                    console.log("Something went wrong!", response);
                    INTERVIEWIFY.SearchQueue();
                    return;
                }

                var available = new Array();
                var i = 0;
                response.forEach(function(u) {
                    // Some users have set "no permissions" for us to read their calendar...
                    if ("error" in u){
                        console.error("Something is up (shadow): " + u.error + " - " + u.email);
                    } else {
                        if (typeof u.events != "undefined" && u.events.length == 0) {
                            available[developers[i].email] = developers[i];
                        }
                    }
                    i++
                });

                GOOGLE.getShadowByInterviewFreq(available);
            };

            if (developers.length > 0){
                var gDate = GOOGLE.getTR();
                var startDate = gDate.start;
                var endDate = gDate.end;

                google.calendar.read.getEvents(cbd,
                        developers.map(function(d) {return d['email'];}),
                        startDate, endDate,
                        {requestedFields: ["owner", "status", "attendeeCount",
                        "attendees", "details"]});
            } else {
            	INTERVIEWIFY.insertDevelopers();
            }
        },

        /**
         * Check how meny interviews a developer have had the week of the interview
         *
         * @todo    Fix the error handling!
         * @param   {array}     array of available developers
         * @return  {array}     return array of available developers
         */
        getDeveloperByInterviewFreq: function(available){
            function countAttendees(response) {
                if (response.length == 0) {
                    if ("error" in response[0]){
                        console.error("Something went wrong!", response);
                        return;
                    }
                }
                
                var developers = new Array();
                var i = 0;
                response[0].events.forEach(function(u) {

                    for (i=0; i < u.attendeeCount; i++){
                        if (u.attendees[i].status == "accepted"){
                            var tmp = u.attendees[i].email;
                            
                            if (typeof developers[tmp] == "undefined"){
                                developers[tmp] = 1;
                            } else {
                                developers[tmp] = developers[tmp]+1;
                            }
                        }
                    }
                });

                for (i in developers){
                    if (developers[i] > 0){
                        var iIn = available.indexOf(i);
                        if (iIn != -1){
                            available.splice(iIn, 1)
                        }
                    }
                }
                
                var returnArray = new Array();
                for (i in available){
                    returnArray.push(available[i]);
                }
                INTERVIEWIFY.insertDevelopers(returnArray);
            }

            var gDate = GOOGLE.get7DayTR();
            var startDate = gDate.start;
            var endDate = gDate.end;

            // The interviews calendar, it holds all the interviews
            var calendars = ['spotify.com_o86kgepkpmo3q81ffd8pf7ei3c@group.calendar.google.com'];

            google.calendar.read.getEvents(countAttendees,
                    calendars,
                    startDate, endDate,
                    {requestedFields: ["owner", "status", "attendeeCount",
                    "attendees", "details"]});
        },

        /**
         * Check how meny interviews a shadower have had the week of the interview
         *
         * @todo    Merge this and the developer check...
         * @todo    Fix the error handling!
         * @param   {array}     array of available developers
         * @param   {function}  the callback yao!
         * @return  {array}     return array of available developers
         */
        getShadowByInterviewFreq: function(available, callback){
            function countAttendees(response) {
                // Will never be undefined, response is a object
                if (response === undefined && response[0].length > 0) {
                    if ("error" in response[0]){
                        console.error("Something went wrong!", response);
                        return;
                    }
                }

                var developers = new Array();
                var i = 0;
                response[0].events.forEach(function(u) {

                    for (i=0; i < u.attendeeCount; i++){
                        if (u.attendees[i].status == "accepted"){
                            var tmp = u.attendees[i].email;

                            if (typeof developers[tmp] == "undefined"){
                                developers[tmp] = 1;
                            } else {
                                developers[tmp] = developers[tmp]+1;
                            }
                        }
                    }
                });

                for (i in developers){
                    if (developers[i] > 0){
                        var iIn = available.indexOf(i);
                        if (iIn != -1){
                            available.splice(iIn, 1)
                        }
                    }
                }

                var returnArray = new Array();
                for (i in available){
                    returnArray.push(available[i]);
                }
                INTERVIEWIFY.insertShadows(returnArray);
            }

            var gDate = GOOGLE.get7DayTR();
            var startDate = gDate.start;
            var endDate = gDate.end;

            // The interviews calendar, it holds all the interviews
            var calendars = ['spotify.com_o86kgepkpmo3q81ffd8pf7ei3c@group.calendar.google.com'];

            google.calendar.read.getEvents(countAttendees,
                    calendars,
                    startDate, endDate,
                    {requestedFields: ["owner", "status", "attendeeCount",
                    "attendees", "details"]});
        },

        /**
         * Show the "popup" with developer, shadow, room and some default interview text pre... entered.
         */
        createEvent: function() {
            
            var it = $("#interview-type option:selected").text();

            var gDate = GOOGLE.getTR();
            var startDate = gDate.start;
            var endDate = gDate.end;

            var attendees = new Array();

            var developer = { email: $('#interview-developer option:selected').val(), name: $('#interview-developer option:selected').text() };
            attendees.push(developer);
            var shadow = { email: $('#interview-shadow option:selected').val(), name: $('#interview-shadow option:selected').text() };
            if (shadow.email != ""){
                attendees.push(shadow);
            }

            var room = { email: $('#interview-room option:selected').val(), name: $('#interview-room option:selected').text() };
            attendees.push(room);

            var interviewCal = { email: "spotify.com_o86kgepkpmo3q81ffd8pf7ei3c@group.calendar.google.com", name: "Interview Calendar" }; // Move this l8ter
            attendees.push(interviewCal);
            
            var description = it + ' interview with interviewer ' + developer.name;
            if (shadow.name != ""){
                description += ' and shadower ' + shadow.name;
            };

            var eventData = {
                title: "Interview: " + it,
                details: description,
                location: room.name,
                allDay: false,
                startTime: startDate,
                endTime: endDate,
                attendees: attendees
                // For more RRULE examples, please see http://www.ietf.org/rfc/rfc2445.txt
                //rrule: "RRULE:FREQ=YEARLY"
            };
            google.calendar.composeEvent(eventData);
            
        },

        /**
         * Ask user to add calendar
         *
         * @param   {string}    email of calendar
         * @param   {string}    title of calendar
         */
        addCalendar: function(calendar, title){
            google.calendar.addCalendar(calendar, title);
        },

        /**
         * Get a Time Range from 7 days previous from the interview date set in the form
         *
         * @return {obj}
         */
        get7DayTR: function(){
            var inputDate = $("#interview-date").val();
            var to = Date.parse(inputDate);
            var from = Date.parse(inputDate);
            from.add(-7).days();

            return GOOGLE.getTRFromDatejsObj(from, to);
        },

        /**
         * Returnes a time range that google understands
         *
         * @param   {Datejs}    d1  The start date
         * @param   {Datejs}    d2  The end date
         * @return  {obj}       object with the start and end datetimes
         */
        getTRFromDatejsObj: function(d1, d2){
            var gStart = new Object();
            gStart.year = Number(d1.toString("yyyy"));
            gStart.month = Number(d1.toString("MM"));
            gStart.date = Number(d1.toString("dd"));
            gStart.hour = Number(d1.toString("HH"));
            gStart.minute = Number(d1.toString("mm"));
            gStart.second = Number(d1.toString("ss"));

            var gTo = new Object();
            gTo.year = Number(d2.toString("yyyy"));
            gTo.month = Number(d2.toString("MM"));
            gTo.date = Number(d2.toString("dd"));
            gTo.hour = Number(d2.toString("HH"));
            gTo.minute = Number(d2.toString("mm"));
            gTo.second = Number(d2.toString("ss"));

            var retObj = {start:gStart, end:gTo};

            return retObj;
        },

        /**
         * Get the Time Range from the interview input
         *
         * @return  {obj}
         */
        getTR: function(){
            var inputDate = $("#interview-date").val();

            var inputFrom = $("#interview-from").val();
            var inputTo = $("#interview-to").val();
            
            var theFromDate = new Date.parse(inputDate);
            var theToDate = new Date.parse(inputDate);
            var timeFrom = new Date.parse(inputFrom);
            var timeTo = new Date.parse(inputFrom);
            timeTo.add(1).hours();

            var from = theFromDate.set({ hour: timeFrom.getHours(), minute: timeFrom.getMinutes(), secound: 00 });
            var to = theToDate.set({ hour: timeTo.getHours(), minute: timeTo.getMinutes(), secound: 00 });
            
            return GOOGLE.getTRFromDatejsObj(from, to);
        },
		
		/**
		 * Just use this to start checking the revision
		 */
		startRevisionCheck: function(){
			GOOGLE.setRevisionArray();
			GOOGLE.getCurrentRevision();
		},
		
		/**
		 * The check revisions queue
		 */
		setRevisionArray: function(){
			checkRevisionArray = new Array(GOOGLE.sha1Sheet,GOOGLE.sha1Sheet,GOOGLE.sha1Sheet, GOOGLE.sha1Sheet);
			sheetPages = new Array("1","2","4","5");
		},
		
        /**
         * Get the current live revision of the spreadsheet
         *
         * @param	{string}	will be populated by itself.
         */
        getCurrentRevision: function(result){
        	
        	// This will come fom the sha1 function
        	if (typeof result != "undefined"){
        		revisionString += result;
        	} else {
        		revisionString = '';
        	}
        	
        	// Check the resources
        	if (checkRevisionArray.length > 0){
        		checkRevisionArray[0](sheetPages[0]);
	        		
	        	checkRevisionArray.shift();
	        	sheetPages.shift();
       		} else {
       			GOOGLE.revisionCompare();
       		}
	            
        },
        
        /**
         * Check with the database if this is the same as the lastest hash
         * 
         * @todo	We could do some fancy checking so we only have to update a specific part of the content.
         */
        revisionCompare: function(){
        	console.log('GOOGLE.revisionCompare()');
        	console.log('the revisionString: ' + revisionString);
        	DB.revisionCompare(revisionString);
        },
        
        /**
         * Get all the content from a sheet as sha1
         * 
         * @param	{string}	the id of the sheet, found in the url
         */
        sha1Sheet: function(page){
        	console.log("GOOGLE.sha1sheet(" + page + ")");
        	var query = new google.visualization.Query(spreadSheetUrl + "&gid=" + page);
            query.setQuery("SELECT *");
            query.send(function setReturn(response) {
                if (response.isError()) {
                    console.error("sha1Sheet query error!",
                        response.getMessage(),
                        response.getDetailedMessage());
                    return;
				}
                var dt = response.getDataTable();
                var num = dt.getNumberOfRows();
				
                var result = (dt.toJSON());
                //console.log(result);
                // Go make it a sha1
				hashit.sha1(result, GOOGLE.getCurrentRevision);
            });
        	
        }
    }
}();
