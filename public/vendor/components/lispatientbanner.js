(function () {
    'use strict';

    angular
        .module('common.utils')
	.controller('lispatientbannerCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
	    var cvm = this;
		cvm.patientinfo = {};
		cvm.currentcontext = {};
		
		$scope.$watch('cvm.patientid',
			function(newValue) {
				cvm.getPatientById();
				cvm.getPatientAlertsCount();
		});

		cvm.patientprofile = function() {
			utl.Modal.open('registration.patientprofile', {
					params: { pid: cvm.patientid },
				}
			);
		};
		
		//Code to reload the banner starts
		var cmpObj = {
          refresh: function(){
            cvm.getPatientById();
          }
        }
        
        cvm.delegatefn({cmp : cmpObj});
		//Code to reload the banner ends

		//getitem
		cvm.getItemCallback = function (scope, res, options, hasError) {
        	cvm.patientInfo = res.Data[0];
			cvm.getPatientProfilePic();
		};
		
		cvm.getPatientById = function() {
			if(cvm.patientid > 0) {
				  var inputData = { 
						Params :[
						{ Key: 0 , Value: cvm.patientid }
						],
						PageContext:{
							PageSize: 1,
							PageNumber: 1
						}
					};

					var options = {
						action: 'registration/patient/GetPatients',
						data: inputData,
						type: 'post',
						onComplete: cvm.getItemCallback
					};
					utl.Http.doAction(options);
			}
		}
		
		//get patient profile
		cvm.getPatientProfilePicCallback = function (scope, data, options, hasError) {
			cvm.currentcontext.Photo = data.Photo;
		};

		cvm.getPatientProfilePic = function () {
			if(cvm.patientInfo.PhotoPath) {
				var inputData = { Id : cvm.patientInfo.Id, PhotoPath : cvm.patientInfo.PhotoPath };
				var options = {
					action: 'registration/Patient/GetPatientProfilePic',
					data: { Data : inputData },
					type: 'post',
					onComplete: cvm.getPatientProfilePicCallback
				};
				utl.Http.doAction(options);
			}
		};
		
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
					{ Key: 6, Value: utl.Session.getCurrentUserId() }
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

		cvm.patientprofile = function() {
			utl.Modal.open('registration.patientprofile', {
                    params: { pid: cvm.patientid }
                }
            );
		}

	    //caution : base method, please don't modifiy
	    cvm.$onInit = function () {
	        $timeout(cvm.init, 100);
	    }
	}])
    .component('lispatientbanner', {
        bindings: {
			patientid: "=",
			delegatefn : "&"
        },
        controller: 'lispatientbannerCtrl',
        controllerAs: 'cvm',
        templateUrl: 'vendor/components/lispatientbanner.html'
    })

})();