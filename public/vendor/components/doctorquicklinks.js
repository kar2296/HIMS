(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('doctorquicklinksCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;

	    cvm.init = function () {
			//Init logic
	    }

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('doctorquicklinks', {
        bindings: {
			config: "=",
        },
        controller: 'doctorquicklinksCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/doctorquicklinks.html'
    })

})();