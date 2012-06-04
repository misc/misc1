var validate = function(){

    /**
     * Is it a numeric
     *
     * @param   {val}
     * @return  {boolean}
     */
    function vNumber(val){
        return isNumeric(val);
    }

    /**
     * Is it a string?
     */
    function vString(val){
        
    }

    /**
     * Is this a valid email
     */
    function vEmail(val){

    }

    /**
     * Is this valid date
     */
    function vDate(val){
        return (Date.parse(val) !== null ? true : false);
    }

    /**
     * Is this valida time
     * 
     */
    function vTime(val){
        return (Date.parse(val) !== null ? true : false);
    }

    /**
     * is there something here
     */
    function hasValue(val){
        return (val != "" ? true : false);
    }

    
    return {

        /**
         *
         * @param   {element}   el  The dom element to check
         * @param   {string}    exptected   What we expect the elemt to be
         * @return  {boolean}   true if true :) false is false
         */
        element: function(el, expected){

            // This could to some checking...
            var val = $(el).val();
            var isitnow;

            switch (expected)
            {
                case "number":
                    isitnow = vNumber(el);
                    break;
                case "string":
                    isitnow = vString(el);
                    break;
            }
            
            return isitnow;
        },

        /**
         * Validate all the inputs in a element, like form or div.
         * Check the input type to detect what should be validated.
         * Check if they have the "required" attribute.
         */
        form: function(el){
            var $formitems = $('input, select'); // The elements we want to validate.
            var s = $(el); // Get the main element.
            var c = s.find( $formitems ); // Get all the child elements we want.
            var r = true;

            for (var i=0; i < c.length; i++){
                var val = $(c[i]).val();
                var type = $(c[i]).attr('type');
                var tmp = true;

                // If the field is requred, then, it must be populated...
                if ($(c[i]).attr('required')){
                    
                    if (!hasValue(val)){
                        tmp = false;
                    } else {

                        if ($(c[i]).is("input")){
                            switch(type)
                            {
                                case "date":
                                    tmp = vDate(val);
                                    break;
                                case "time":
                                    tmp = vTime(val);
                                    break
                            }
                        } else if ($(c[i]).is("select")){
                            tmp = hasValue(val);
                        }

                    }

                    console.log($(c[i]).attr('id') + ' is required and is ok: ' + tmp);

                } else {
                    if (hasValue( $(c[i]) )){
                        if ($(c[i]).is("input")){
                            switch(type)
                            {
                                case "date":
                                    tmp = vDate(val);
                                    break;
                                case "time":
                                    tmp = vTime(val);
                                    break
                            }
                        }/* else if ($(c[i]).is("select")){
                            tmp = hasValue(val);
                        }*/
                    }
                }

                // So the field was not corrent
                if (!tmp){
                    $(c[i]).addClass('not-valid');
                    r = false;
                } else {
                    $(c[i]).removeClass('not-valid');
                }

            }

            return r;
        }

    }

}();