(function() {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngFormatHelper', ['moment', function(moment) {

            var Trim = function(inputData) {
                var result = inputData.replace(/\s+/g, '');
                return result;
            }

            var getDateString = function(inputDate) {
                var result = moment(inputDate).format("DD/MM/YYYY");
                return result;
            }
            var getExpDateString = function(inputDate) {
                var result = moment(inputDate).format("MM/YYYY");
                return result;
            }
            var getDateTimeString = function(inputDate) {
                var result = moment(inputDate).format("DD-MMM-YYYY HH:mm");
                return result;
            }

            var getDateStringForAppointment = function(inputDate) {
                var result = moment(inputDate).format("MM/DD/YYYY");
                return result;
            }
            var getDateTimeStringForAppointment = function(inputDate) {
                var result = new moment(inputDate).format('MM/DD/YYYY hh:mm')
                return result;
            }

            var getTimeString24Hour = function(inputDate) {
                var result = new moment(inputDate).format("HH:mm");
                return result;
            }

            var getDate = function(inputDateString) {
                var result = moment(inputDateString).toDate();
                return result;
            }

            var getCurrentDate = function() {
                var result = new Date();
                return result;
            }

            var getThirtyDaysBackDate = function() {
                var curdate = new Date();
                var result = curdate.setDate(curdate.getDate() - 30);
                return result;
            }

            var getCurrentDateWithoutTime = function() {
                var datePart = moment(new Date()).format("MM/DD/YYYY");
                var result = moment(datePart).toDate();
                return result;
            }

            var isPastDate = function(inputDate) {
                inputDate = moment(inputDate).format("YYYY-MM-DD");
                var currentDate = moment().format("YYYY-MM-DD");

                var result = moment(inputDate).isBefore(currentDate);
                return result;
            }

            var isPastDateTime = function(inputDate, inputTime) {
                inputDate = moment(inputDate).format("YYYY-MM-DD");
                inputDate = moment(inputDate + " " + inputTime).format("YYYY-MM-DD H:mm");
                var currentDate = moment().format("YYYY-MM-DD H:mm");

                var result = moment(inputDate).isBefore(currentDate);
                return result;
            }

            var isFutureDate = function(inputDate) {
                inputDate = moment(inputDate).format("YYYY-MM-DD");
                var currentDate = moment().format("YYYY-MM-DD");

                var result = moment(inputDate).isAfter(currentDate);
                return result;
            }

            var getFilterDate = function(inputDate) {
                var result = "";
                if (inputDate) {
                    result = moment(inputDate).format("YYYY-MM-DD");
                }
                return result;
            }

            var getAgeFromDOB = function(inputDate) {
                var result = moment().diff(inputDate, 'years', false);
                return result;
            }

            var getAgeInDaysFromDOB = function(inputDate) {
                var result = moment().diff(inputDate, 'days', false);
                return result;
            }

            var getDateStringForRegistration = function(inputDate) {
                var result = moment(inputDate).format("DD-MM-YYYY");
                return result;
            }

            var getDOBFromAge = function(inputAge, substractPart) {
                var result = moment().format('LL');
                substractPart = substractPart || 'years';

                if (inputAge > 0) {
                    result = moment(result).subtract(inputAge, substractPart).toDate();
                }
                return result;
            }

            var getDOBFromAgeConfig = function(options) {
                var result = moment().format('LL');
                if (options.y) {
                    result = moment(result).subtract(options.y, 'years').toDate();
                }
                if (options.m) {
                    result = moment(result).subtract(options.m, 'months').toDate();
                }
                if (options.d) {
                    result = moment(result).subtract(options.d, 'days').toDate();
                }

                return result;
            }


            var getDateStringForVitalChart = function(inputDate) {
                var result = moment(inputDate).format("DD-MMM");
                return result;
            }

            var computeDateBasedOnPeriod = function(inputNumber, durationperiod) {
                var duration = durationperiod.toLowerCase();
                var result = null;
                if (duration == "days") {
                    result = new moment().add(inputNumber, 'days');
                } else if (duration == "weeks") {
                    result = new moment().add(inputNumber, 'weeks');
                } else if (duration == "months") {
                    result = new moment().add(inputNumber, 'months');
                }
                return result;
            }

            var isGreaterDate = function(inputDate1, inputDate2) {
                //if(!inputDate1) {
                //    return true;
                // }
                inputDate1 = moment(inputDate1).format("YYYY-MM-DD");
                inputDate2 = moment(inputDate2).format("YYYY-MM-DD");
                var result = moment(inputDate1).isAfter(inputDate2);
                return result;
            }

            var isDateCrossed24hours = function(inputDate) {
                inputDate = new moment(inputDate).format('MM/DD/YYYY hh:mm')
                var cutOffTime = new moment(inputDate).add(24, 'h');
                var currentTime = new moment().format('MM/DD/YYYY hh:mm');
                var result = moment(currentTime).isAfter(cutOffTime, 'minute');
                return result;
            }

            var isDateEquals = function(inputDate1, inputDate2) {
                inputDate1 = moment(inputDate1).format("YYYY-MM-DD");
                inputDate2 = moment(inputDate2).format("YYYY-MM-DD");
                var result = moment(inputDate1).diff(moment(inputDate2));
                return result == 0;
            }

            var formatDate = function(inputDate, formatStr) {
                var result = new moment(inputDate).format(formatStr);
                return result;
            }

            var addMonths = function(inputDate, noOfMonths) {
                var result = moment(inputDate).add(noOfMonths, 'months');
                return result;
            }
            var addDays = function(inputDate, noOfDays) {
                var result = moment(inputDate).add(noOfDays, 'days');
                return result;
            }
            var addWeeks = function(inputDate, noOfWeeks) {
                var result = moment(inputDate).add(noOfWeeks, 'weeks');
                return result;
            }

            var getDetailedAgeFromDOB = function(inputDate) {
                var diffDuration = moment.duration(moment().diff(inputDate));
                var result = {};
                if (diffDuration.years()) {
                    //result.y = diffDuration.years();
                    result.y = moment().diff(inputDate, 'years');
                }
                if (diffDuration.months()) {
                    result.m = diffDuration.months()
                }
                if (diffDuration.days()) {
                    result.d = diffDuration.days()
                }
                return result;
            }

            var getNumbertoWord = function numberToEnglish(inputData) {

                var string = inputData.toString(), units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words, and = 'and';

                /* Remove spaces and commas */
                string = string.replace(/[, ]/g,"");

                /* Is number zero? */
                if( parseInt( string ) === 0 ) {
                    return 'zero';
                }

                /* Array of units as words */
                units = [ '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen' ];

                /* Array of tens as words */
                tens = [ '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety' ];

                /* Array of scales as words */
                scales = [ '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion' ];

                /* Split user argument into 3 digit chunks from right to left */
                start = string.length;
                chunks = [];
                while( start > 0 ) {
                    end = start;
                    chunks.push( string.slice( ( start = Math.max( 0, start - 3 ) ), end ) );
                }

                /* Check if function has enough scale words to be able to stringify the user argument */
                chunksLen = chunks.length;
                if( chunksLen > scales.length ) {
                    return '';
                }

                /* Stringify each integer in each chunk */
                words = [];
                for( i = 0; i < chunksLen; i++ ) {

                    chunk = parseInt( chunks[i] );

                    if( chunk ) {

                        /* Split chunk into array of individual integers */
                        ints = chunks[i].split( '' ).reverse().map( parseFloat );

                        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
                        if( ints[1] === 1 ) {
                            ints[0] += 10;
                        }

                        /* Add scale word if chunk is not zero and array item exists */
                        if( ( word = scales[i] ) ) {
                            words.push( word );
                        }

                        /* Add unit word if array item exists */
                        if( ( word = units[ ints[0] ] ) ) {
                            words.push( word );
                        }

                        /* Add tens word if array item exists */
                        if( ( word = tens[ ints[1] ] ) ) {
                            words.push( word );
                        }

                        /* Add 'and' string after units or tens integer if: */
                        if( ints[0] || ints[1] ) {

                            /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                            if( ints[2] || ! i && chunksLen ) {
                                words.push( and );
                            }

                        }

                        /* Add hundreds word if array item exists */
                        if( ( word = units[ ints[2] ] ) ) {
                            words.push( word + ' hundred' );
                        }

                    }

                }

                return words.reverse().join( ' ' );

            }

            return {
                getDateString: getDateString,
                getExpDateString: getExpDateString,
                getDateTimeString: getDateTimeString,
                getDateStringForAppointment: getDateStringForAppointment,
                getDateTimeStringForAppointment: getDateTimeStringForAppointment,
                getTimeString24Hour: getTimeString24Hour,
                getDate: getDate,
                getCurrentDate: getCurrentDate,
                getThirtyDaysBackDate: getThirtyDaysBackDate,
                isPastDate: isPastDate,
                isFutureDate: isFutureDate,
                getFilterDate: getFilterDate,
                getAgeFromDOB: getAgeFromDOB,
                getAgeInDaysFromDOB: getAgeInDaysFromDOB,
                getDateStringForRegistration: getDateStringForRegistration,
                getDOBFromAge: getDOBFromAge,
                getCurrentDateWithoutTime: getCurrentDateWithoutTime,
                getDateStringForVitalChart: getDateStringForVitalChart,
                computeDateBasedOnPeriod: computeDateBasedOnPeriod,
                isGreaterDate: isGreaterDate,
                isDateCrossed24hours: isDateCrossed24hours,
                isDateEquals: isDateEquals,
                formatDate: formatDate,
                addMonths: addMonths,
                addDays: addDays,
                addWeeks: addWeeks,
                isPastDateTime: isPastDateTime,
                getDOBFromAgeConfig: getDOBFromAgeConfig,
                getDetailedAgeFromDOB: getDetailedAgeFromDOB,
                Trim: Trim,
                getNumbertoWord: getNumbertoWord
            };
        }]);

})();