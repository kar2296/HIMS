(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('linkcheckerCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;

		cvm.checkLink = function() {
			window.open(cvm.url);
		}

	    cvm.init = function () {
			//Init logic
	    }

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('linkchecker', {
        bindings: {
			url: "=",
        },
        controller: 'linkcheckerCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/linkchecker.html'
    })

})();