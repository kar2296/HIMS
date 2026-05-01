(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('displaycreatedbyCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;

	    cvm.init = function () {
			//Init logic
	    }

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('displaycreatedby', {
        bindings: {
			item: "=",
        },
        controller: 'displaycreatedbyCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/displaycreatedby.html'
    })

})();