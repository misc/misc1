var gadgetName = "Spotify-Interviewify";
var calendarService;

// If no console, just don't do anything
function noop() {}
if (!console) {
    var console = {
        log: noop
    }
}

// The order of functions to call to boot the gadget
var booty = new Array(INTERVIEWIFY.bootstrap, DB.init_tables, DB.checkDataIntegrety, INTERVIEWIFY.loadTechniques, INTERVIEWIFY.loadSteps, INTERVIEWIFY.initSettings ,INTERVIEWIFY.showSearch);

Queue.addQueue(booty);

gadgets.util.registerOnLoadHandler(Queue.start);

$(function(){

    $("#db-refresh").click(function(){
    	DB.setDataLoadQueueCallback(INTERVIEWIFY.loading);	
       	GOOGLE.startRevisionCheck();
        INTERVIEWIFY.loading();
    });

    $("#add-interview-cal").click(function(){
        GOOGLE.addCalendar("spotify.com_o86kgepkpmo3q81ffd8pf7ei3c@group.calendar.google.com","Interview Calendar");
    });

    $("#save-pref-btn").click(function(){
        INTERVIEWIFY.saveSettings();
    });

    $("#search-btn").click(function(){
        var valid = validate.form('#search');
        if (valid){
            INTERVIEWIFY.loading("start");
            $('#search-btn').attr("disabled", "true");
            $('#submit-btn').attr("disabled", "true");
            INTERVIEWIFY.SearchQueue();
        }
    });

    $("#submit-btn").click(function(){
        var valid = validate.form('#results');
        if (valid){
            GOOGLE.createEvent();
        }
    });

    $("#tabs").tabs();
    $( ".tab-switch" ).bind( "click", function(e) {
        gadgets.window.adjustHeight();
    });
	
	
    $("#tabs").bind('tabsselect', function(event, ui) {
        switch($(ui.panel).attr('id'))
        {
            case 'tabs-1': // Prefs Tab
                INTERVIEWIFY.initLocationPrefs();
                break;
            case 'tabs-2': // Search Tab
                break;
        }
    });

    $('.ui-tabs').css('padding', '10px 5px 5px');
    $('.ui-tabs-panel').css('padding','10px 5px 5px');

    $('#add-shadow').click(function(){
       $('.interview-shadow').clone().appendTo('#shadow-box');
       INTERVIEWIFY.showElement('.interview-shadow:last', 'fast');

    });

});

