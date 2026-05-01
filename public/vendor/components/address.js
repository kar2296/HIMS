(function () {
    'use strict';

    angular
	.module('common.utils')
	.controller('addressCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
		var cvm = this;

		cvm.googleoption = 0;
		console.log(cvm);
	    cvm.init = function () {
			//Init logic
		}

		cvm.opengoogleaddressform = function() {

		}

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('address', {
        bindings: {
			addressline1 : "=",
			addressline2 : "=",
			pincode: "=",
			pintext: "=",
			pincodeid: "=",
            city: "=",
			cityid: "=",
			state: "=",
			stateid: "=",
			district: "=",
			districtid: "=",
			country: "=",
			countryid: "=",
			area: "=",
			areaid: "=",
			candisable: "<",
        },
        controller: 'addressCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/address.html'
    })

})();