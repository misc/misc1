var DB = function() {

    var db_name = 'interviewify';
    var db_version = '1.0';
    var db;
    var revision;

    /**
     * The queue for loading data
     * 
     * @todo    move this to the queue class
     */
    var dataLoadQueue = new Array("Technique", "InterviewStep", "Developer", "DeveloperSteps", "DeveloperTechs", "Resource");
	
	var dataLoadQueueCallback = Queue.next;
    /**
     * Check if this browser is supported
     *
     * @return  {boolean}
     **/
    check_db_support = function(){
        if (typeof openDatabase != "function"){
            alert("This gadget will only work with webKit browsers! Chrome and Safari should work.");
            console.warn("wrong browser, this is webkit only.");
            return false;
        }
        return true;
    }

    return {

        /**
         * Starts/Opens the connection to the database
         */
        init_db: function(){
            if (check_db_support()){
                db = openDatabase(db_name, db_version, 'Local version of the spreadsheet', 2 * 1024 * 1024);
            }
            if (db === false || db == "undefined"){
                alert("db init fail :/");
                console.error("db init fail");
            } else {
            	//console.log('db OK!');
            	//Queue.next();
            }
        },

        /**
         * If the db is new, we have to create the tables
         */
        init_tables: function(){
            db.transaction(function (tx){

                tx.executeSql("CREATE TABLE IF NOT EXISTS Revision (id UNIQUE, revision TEXT, checkdate INTEGER)");
                tx.executeSql('CREATE TABLE IF NOT EXISTS Developer (id UNIQUE, name TEXT, email TEXT, team TEXT, location TEXT, sm INTERGER, st INTEGER, ss INTEGER, tm INTERGER, tt INTEGER, ts INTEGER)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Technique (id UNIQUE, technique TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS InterviewStep (id UNIQUE, step TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Resource (id TEXT UNIQUE, type TEXT, name TEXT, description TEXT, floor TEXT, street TEXT, city TEXT, country TEXT, building INTEGER, extra INTEGER, size INTEGER, email TEXT, auto_email TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS ResourceType (id UNIQUE, type TEXT)');
                tx.executeSql('CREATE TABLE IF NOT EXISTS Settings (key UNIQUE, val TEXT)');

                Queue.next();
            });
        },
		
		setDataLoadQueueCallback: function(callback){
			dataLoadQueueCallback = callback;
		},
		
        /**
         * Load the data from google and save it in our database, but only if we
         * have old data, or we have a new and empty db with tables.
         */
        init_data: function(){
        	console.log('init_data()');
        	
            if (dataLoadQueue.length != 0){
                switch (dataLoadQueue[0])
                {
                    //case "checkDataIntegrety":
                    //    DB.checkDataIntegrety(dataLoadQueueCallback);
                    //    break;
                    case "Technique":
                        GOOGLE.getTechniques(DB.setTechniques);
                        break;
                    case "InterviewStep":
                        GOOGLE.getSteps(DB.setSteps);
                        break;
                    case "Developer":
                        GOOGLE.getDevelopers(DB.setDevelopers);
                        break;
                    case "DeveloperSteps":
                        GOOGLE.getDevelopersSkills(DB.setDevelopersSteps, "5");
                        break;
                    case "DeveloperTechs":
                        GOOGLE.getDevelopersSkills(DB.setDevelopersTechs, "2");
                        break;
                    case "ResourceType":
                        DB.setResourceTypes();
                        break;
                    case "Resource":
                        GOOGLE.getResources(DB.setResources);
                        break;
                }
                dataLoadQueue.shift();
            } else {
            	console.log("ELSE!!!!!");
                dataLoadQueue = new Array("Technique", "InterviewStep", "Developer", "DeveloperSteps", "DeveloperTechs", "Resource");
            	if (typeof dataLoadQueueCallback == "function"){
            		dataLoadQueueCallback();
            	}
                INTERVIEWIFY.setTimer(DB.startAutoIntegretyCheck);
            }
        },

        /**
         * Look when we last did a check on the database for integrety
         */
        checkDataIntegrety: function(callback){
    		
    		var tmpCheck = false;        
            db.transaction(function (tx){
            	
            	var sql = 'SELECT checkdate, (((strftime("%s", "now"))-checkdate)/60) AS ago FROM Revision WHERE ago < 10 LIMIT 1';
	
                tx.executeSql(sql, [], function (tx, results) {
                    var len = results.rows.length, i;
					
                    if (len > 0){
                    	
                    	console.log('No need to update, lastest check was '+results.rows.item(0).ago+' minutes ago.');
                 		INTERVIEWIFY.setTimer(DB.startAutoIntegretyCheck);
        				  	
                        if (typeof callback != "undefined"){
	                        callback();
                        } else {
                        	if (typeof dataLoadQueueCallback == "function"){
                        		dataLoadQueueCallback();
                        	}
                        }                        
                   } else {
                        GOOGLE.startRevisionCheck();
                    }

                });
                
            });
           
        },

        /**
         * Save the techniques and languages in the database
         *
         * @param   {array}     the techs/languages
         */
        setTechniques: function(response){
            db.transaction(function (tx){
                tx.executeSql('DELETE FROM Technique');
            });

            db.transaction(function (tx){
                var sql = 'INSERT INTO Technique\n\
                            SELECT ' + response[0]['id'] + ' AS id, "' + response[0]['value'] + '" AS technique';

                var c = response.length;
                var i=0;
                for( i=1 ; i < c ; i++ ){
                    sql += '\n\
                            UNION SELECT ' + response[i]['id'] + ', "' + response[i]['value'] + '"';
                }
                tx.executeSql(sql);

                DB.init_data();
            });

        },

        /**
         * Save the steps that we got from the spreadsheet
         *
         * @param   {array}     the steps
         */
        setSteps: function(response){
            db.transaction(function (tx){
                tx.executeSql('DELETE FROM InterviewStep');
            });

            db.transaction(function (tx){
                var sql = 'INSERT INTO InterviewStep\n\
                            SELECT ' + response[0]['id'] + ' AS id, "' + response[0]['value'] + '" AS step';

                var c = response.length;
                var i=0;
                for( i=1 ; i < c ; i++ ){
                    sql += '\n\
                            UNION SELECT ' + response[i]['id'] + ', "' + response[i]['value'] + '"';
                }
                tx.executeSql(sql);

                DB.init_data();
            });

        },

        /**
         * Get the interview steps
         *
         * @param   {function}  optional callback
         * @return  {array}     if no callback, return steps
         */
        getSteps: function(callback){
            db.transaction(function (tx){
                var itemArray=[];

                tx.executeSql('SELECT * FROM InterviewStep', [], function (tx, results) {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var tmpArray = new Array();
                        tmpArray['id'] = results.rows.item(i).id;
                        tmpArray['step'] = results.rows.item(i).step;
                        itemArray.push(tmpArray);
                    }

                    if (typeof callback == "function"){
                        callback(itemArray);
                    } else {
                        return returnArray;
                    }
                });
            });
        },

        /**
         * Get all the locations based on our resources
         *
         * @param   {function}  optional callback
         * @return  {array}     if no callback, return locations
         */
        getLocations: function(callback){
            db.transaction(function (tx){
                var returnArray = new Array();
                tx.executeSql('SELECT DISTINCT(city) FROM Resource', [], function (tx, results) {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var itemArray=[];
                        itemArray['city'] = results.rows.item(i).city;
                        returnArray.push(itemArray);
                    }

                    if (typeof callback == "function"){
                        callback(returnArray);
                    } else {
                        return returnArray;
                    }

                });
            });
        },

        /**
         * get all the settings for the user
         *
         * @param   {function}  optional callback
         * @return  {array}     if no callback, return the settings
         */
        getSettings: function(callback){
            db.transaction(function (tx){
                var itemArray=[];

                tx.executeSql('SELECT * FROM Settings', [], function (tx, results) {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var tmpArray = new Array();
                        tmpArray['key'] = results.rows.item(i).key;
                        tmpArray['val'] = results.rows.item(i).val;
                        itemArray.push(tmpArray);
                    }

                    if (typeof callback == "function"){
                        callback(itemArray);
                    } else {
                        return returnArray;
                    }

                });
            });
        },

        /**
         * Save a setting
         *
         * @param   {string}    key, the setting name
         * @param   {string}    val, the value of the setting
         */
        setSetting: function(key, val){
            var isSet=false;
            db.transaction(function (tx){
                isSet = (typeof INTERVIEWIFY.getSetting('location') == "undefined" ? false : true);

                if (!isSet){
                    var sql = 'INSERT INTO Settings (val, key) VALUES (?,?)';
                } else {
                    var sql = 'UPDATE Settings SET val = ? WHERE key = ?';
                }
                tx.executeSql(sql, [val, key], function (tx, results) {
                    //console.log(tx,results);
                });

                $("#tabs").tabs('option', 'selected', 0);
            });

        },

        /**
         * Get the Techniques/languages from the database
         *
         * @param   {function}  the callback...
         */
        getTechniques: function(callback){
            db.transaction(function (tx){
                var itemArray=[];

                tx.executeSql('SELECT * FROM Technique', [], function (tx, results) {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var tmpArray = new Array();
                        tmpArray['id'] = results.rows.item(i).id;
                        tmpArray['technique'] = results.rows.item(i).technique;
                        itemArray.push(tmpArray);
                    }

                    callback(itemArray);
                });
            });
        },

        /**
         * Save the resources we got from the spreadsheet into the database
         *
         * @param   {array}     the resources
         */
        setResources: function(response){
            db.transaction(function (tx){
                tx.executeSql('DELETE FROM Resource');
            });

            db.transaction(function (tx){
                var sql = 'INSERT INTO Resource\n\
                            SELECT "' + response[0]['id'] + '" AS id, "' + response[0]['type'] + '" AS type, "'+ response[0]['name'] + '" AS name, "' + response[0]['description'] + '" AS description, "' + response[0]['floor'] + '" AS floor, "' + response[0]['street'] + '" AS street, "' + response[0]['city'] + '" AS city, "' + response[0]['country'] + '" AS country, ' + response[0]['building'] + ' AS building, ' + response[0]['extra'] + ' AS extra, ' + response[0]['size'] + ' AS size, "' + response[0]['email'] + '" AS email, "' + response[0]['auto_mail'] + '" AS auto_email';

                var c = response.length;
                var i=0;
                for( i=1 ; i < c ; i++ ){
                    sql += '\n\
                            UNION SELECT "' + response[i]['id'] + '" AS id, "' + response[i]['type'] + '" AS type, "' + response[i]['name'] + '" AS name, "' + response[i]['description'] + '" AS description, "' + response[i]['floor'] + '" AS floor, "' + response[i]['street'] + '" AS street, "' + response[i]['city'] + '" AS city, "' + response[i]['country'] + '" AS country, ' + response[i]['building'] + ' AS building, ' + response[i]['extra'] + ' AS extra, ' + response[i]['size'] + ' AS size, "' + response[i]['email'] + '" AS email, "' + response[i]['auto_mail'] + '" AS auto_email';
                }
                tx.executeSql(sql);

                DB.init_data();

            });
        },

        /**
         * Get the resources from the database
         *
         * @todo    Alter this to accept arguments, where you can set it to only
         *          get CR or CAM or what ever, but right now we don't show any
         *          other kind of resource.
         * @param   {function}      the callback
         */
        getResources: function(callback){
            db.transaction(function (tx){
                var itemArray=[];

                var sql = "SELECT r.id, r.name, r.auto_email FROM Resource AS r CROSS JOIN Settings AS s ON s.key = 'location' AND s.val = r.city AND r.type = 'CR' ORDER BY r.name";
                tx.executeSql(sql, [], function (tx, results) {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var tmpArray = new Array();
                        tmpArray['id'] = results.rows.item(i).id;
                        tmpArray['name'] = results.rows.item(i).name;
                        tmpArray['email'] = results.rows.item(i).auto_email;
                        itemArray.push(tmpArray);
                    }

                    callback(itemArray);
                });
            });
        },

        /**
         * Save the Developers
         *
         * @param   {array}     the developers from the spreadsheet
         */
        setDevelopers: function(response){

            db.transaction(function (tx){
                tx.executeSql('DELETE FROM Developer');
            });

            db.transaction(function (tx){
                var sql = 'INSERT INTO Developer\n\
                            SELECT ' + response[0]['id'] + ' AS id, "' + response[0]['name'] + '" AS name, "' + response[0]['email'] + '" AS email, "' + response[0]['team'] + '" AS team, "' + response[0]['location'] + '" AS location, 0 AS sm, 0 AS st, 0 AS ss, 0 AS tm, 0 AS tt, 0 AS ts';
                var c = response.length;
                var i=0;
                for( i=1 ; i < c ; i++ ){
                    sql += '\n\
                            UNION SELECT ' + response[i]['id'] + ', "' + response[i]['name'] + '", "' + response[i]['email'] + '", "' + response[i]['team'] + '", "' + response[i]['location'] + '", 0 AS sm, 0 AS st, 0 AS ss, 0 AS tm, 0 AS tt, 0 AS ts';
                }
                tx.executeSql(sql);

                DB.init_data();
            });
        },

        /**
         * Save the interview steps the for the developers
         *
         * @param   {array}
         */
        setDevelopersSteps: function(response){
            var c = response.length;
            if (c != 0){
                DB.setDeveloperStep(response);
            } else {
                DB.init_data();
            }
        },

        /**
         * Update the developers one by one until they are all gone!
         *
         * @param   {array} array with the developers knowledge
         */
        setDeveloperStep: function(response){
            db.transaction(function (tx){
                var sql = 'UPDATE Developer\n\
                            SET sm = ' + response[0]['master'] + ', st = ' + response[0]['teacher'] + ', ss = ' + response[0]['shadow'] + ' WHERE id = ' + response[0]['id'];
                tx.executeSql(sql);

                response.shift();
                DB.setDevelopersSteps(response);                
            });
        },

        // These functions could be the same...

        /**
         * Save the interview steps the for the developers
         *
         * @param   {array}
         */
        setDevelopersTechs: function(response){
            var c = response.length;
            if (c != 0){
                DB.setDeveloperTech(response);
            } else {
                DB.init_data();
            }


        },

        /**
         * Update the developers one by one until they are all gone!
         *
         * @param   {array} array with the developers knowledge
         */
        setDeveloperTech: function(response){
            db.transaction(function (tx){
                var sql = 'UPDATE Developer\n\
                            SET tm = ' + response[0]['master'] + ', tt = ' + response[0]['teacher'] + ', ts = ' + response[0]['shadow'] + ' WHERE id = ' + response[0]['id'];
                tx.executeSql(sql);

                response.shift();
                DB.setDevelopersTechs(response);
            });
        },

        /**
         * Get developers and shadowers from the database by their skills
         *
         * @param   {int}       the id of the step
         * @param   {int}       optional id of a tech/language
         * @param   {function}  optional callback
         * @return  {array}     will return if no callback
         */
        getDevelopersByInterview: function(sid, tid, shadow, callback){
			
            var developerType = "m"; // Master as default
            if(shadow){
                developerType = "s";
            }

            db.transaction(function (tx){
                var itemArray=[];
                
                var attr = new Array();
                attr.push(Number(sid));
                var sql = "SELECT d.id, d.name, d.email, d.team FROM Developer AS d CROSS JOIN Settings AS s ON s.key = 'location' AND s.val = d.location AND d.s"+developerType+" & ?";
                if (tid > 0){
                	if (shadow){
                        sql += " OR s.key = 'location' AND s.val = d.location AND d.t"+developerType+" & ?";
                	} else {
                		sql += " AND d.t"+developerType+" & ?";
                	}
                    attr.push(Number(tid));
                }
                sql += ' ORDER BY d.name';
                //sql += ' ORDER BY RANDOM() LIMIT 5'; // Random is not autorized by default in some browsers.... stupid but 
                
				console.log(sql);
                tx.executeSql(sql, attr, function (tx, results) {
                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        var tmpArray = new Array();
                        tmpArray['id'] = results.rows.item(i).id;
                        tmpArray['name'] = results.rows.item(i).name;
                        tmpArray['email'] = results.rows.item(i).email;
                        tmpArray['team'] = results.rows.item(i).team;

                        itemArray.push(tmpArray);
                    }
					console.log(itemArray);
                    if (typeof callback == "function"){
                        callback(itemArray);
                    } else {
                        return itemArray;
                    }
                });
            });
        },       
        
        /**
         * Save the current revision
         */
        setRevision: function(revision, callback){
        	
        	db.transaction(function (tx){
        		var sql = 'DELETE FROM Revision';
        		tx.executeSql(sql, [], function(tx, results){
        			
        			var sql = 'INSERT INTO Revision (id, revision, checkdate) VALUES (0, "'+revision+'", strftime("%s","now"))';
	                
	                tx.executeSql(sql, [], function(tx, results){
	                	if (typeof callback == "function"){
		                	callback();
	                	}
	                });
        		});
                
            });
            
        },
        
        startAutoIntegretyCheck: function(){
        	DB.setDataLoadQueueCallback(null);
        	DB.checkDataIntegrety();
        },
        
        /**
         * Compare currect local revision with live revision 
         */
        revisionCompare	: function(revision){
        	
        	db.transaction(function (tx){
	        	var sql = 'SELECT revision FROM Revision';
	        	var len = '';
	        	
	        	tx.executeSql(sql, [], function (tx, results) {
	            	len = results.rows.length;
	            	if (len == 0){
		            	console.log('no current revision, save this one');
		            	DB.setRevision(revision, null);
		            	DB.setDataLoadQueueCallback(Queue.next);
		            	DB.init_data();
		            } else {
		            	if (results.rows.item(0).revision == revision){
		            		console.log("Yes!! No updates, set latest ceckdate");
		            		DB.setRevision(revision, dataLoadQueueCallback);
		            		
		            		INTERVIEWIFY.setTimer(DB.startAutoIntegretyCheck);
		            	} else {
		            		console.log("Refresh local db!");
		            		DB.setRevision(revision, DB.init_data);
		            	}
		            }
		            
	            });
	            
        	});
        }
        
    }
}();
