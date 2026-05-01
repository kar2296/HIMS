(function() {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngAlertHelper', ['toastr', function (toastr) {
        
        var showSuccessMsg = function (msg) {
            //toastr.success(msg);
                toastr.success(msg, { timeOut: 600 });
        }
        var showErrorMsg = function (msg) {
            //toastr.error(msg);
                toastr.error(msg, { timeOut: 800 });
        }
         var showInfoMsg = function (msg) {
            //toastr.info(msg);
                toastr.info(msg, { timeOut: 700 });
        }

        return {
            showSuccessMsg : showSuccessMsg,
            showErrorMsg: showErrorMsg,
            showInfoMsg : showInfoMsg
        };
    }]);

})();