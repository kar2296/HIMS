(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('commentscontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;

	    cvm.init = function () {
			//Init logic
	    }

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('commentscontrol', {
        bindings: {
			comments: "=",
			candisable:"="
        },
        controller: 'commentscontrolCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/commentscontrol.html'
    })

})();