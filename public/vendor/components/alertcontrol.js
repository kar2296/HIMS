(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('alertcontrolCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;
		
		$scope.$watch('cvm.patientid',
			function(newValue) {
				if(newValue) {
					cvm.getPatientAlertsCount();
				}
		});
		
		cvm.patientalerts = function () {
			utl.Modal.open('app.alertview', {
					params: { pid : cvm.patientid },
					cancelCallback: cvm.getPatientAlertsCount
				}
			);
		}

		//get patient alerts
		cvm.getPatientAlertsCallback = function (scope, res, options, hasError) {
        	cvm.patientAlertsCount = res.Data.length;
		};

		cvm.getPatientAlertsCount = function () {            
			var inputData = {
				Params: [
					{ Key: 4, Value: cvm.patientid },
					{ Key: 5, Value: utl.Session.getUserDepartments() },
					{ Key: 6, Value: utl.Session.getCurrentUserId() },
					{ Key: 8, Value: true }
				],
				PageContext: {
					PageSize: 100,
					PageNumber: 1
				}
			};

			var options = {
				action: 'generalmaster/PatientAlert/GetPatientAlerts',
				data: inputData,
				type: 'post',
				onComplete: cvm.getPatientAlertsCallback
			};

			utl.Http.doAction(options);
		};
		
	    cvm.init = function () {
			
	    }

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('alertcontrol', {
        bindings: {
			patientid: "="
        },
        controller: 'alertcontrolCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/alertcontrol.html'
    })

})();