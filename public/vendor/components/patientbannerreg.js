(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('patientbannerregCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.patientinfo = {};

			$scope.$watch('cvm.patientid',
				function (newValue) {
					cvm.getPatientById(); 
				});

			//Code to reload the banner starts
			var cmpObj = {
				refresh: function () {
					cvm.getPatientById();
				}
			}

			cvm.delegatefn({
				cmp: cmpObj
			});
			//Code to reload the banner ends

			cvm.getPatientByIdCallback = function (scope, data, options, hasError) {

				cvm.patientinfo.Id = data.Id;
				cvm.patientinfo.MRN = data.MRN;
				cvm.patientinfo.Title = data.Title ? data.Title.Description : null;
				cvm.patientinfo.FirstName = data.FirstName;
				cvm.patientinfo.MiddleName = data.MiddleName;
				cvm.patientinfo.LastName = data.LastName;
				cvm.patientinfo.Age = data.Age;
				cvm.patientinfo.DOB = data.DOB;
				cvm.patientinfo.Gender = data.Gender ? data.Gender.Description : null;
				cvm.patientinfo.PatientName = '';

				if (cvm.patientinfo.Title) {
					cvm.patientinfo.PatientName = cvm.patientinfo.Title + ' ';
				}
				cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + cvm.patientinfo.FirstName;
				if (cvm.patientinfo.LastName) {
					cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + ' ' + cvm.patientinfo.LastName;
				}

				if (data.Age && data.Age != null) {
					cvm.patientinfo.Age = (data.Age > 1) ? data.Age + " Years" : data.Age + " Year";
				}

				cvm.patientinfo.PatientStatus = data.PatientStatus.Description;
			}

			cvm.getPatientById = function () {
				if (cvm.patientid > 0) {
					var options = {
						action: 'registration/patient/GetPatientById',
						data: {
							Id: cvm.patientid
						},
						type: 'post',
						onComplete: cvm.getPatientByIdCallback
					};

					utl.Http.doAction(options);
				}
			}

			cvm.init = function () {}

			cvm.patientprofile = function () {
				utl.Modal.open('registration.patientprofile', {
					params: {
						pid: cvm.patientid
					}
				});
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('patientbanner', {
			bindings: {
				patientid: "=",
				delegatefn: "&"
			},
			controller: 'patientbannerregCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/patientbannerreg.html'
		})

})();