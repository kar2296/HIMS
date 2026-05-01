(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('patientbannerCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.patientinfo = {};
			cvm.agedata = {};
			cvm.encounterinfo = {};

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
				cvm.patientinfo.FamilyUniqueId = data.FamilyUniqueId;
				cvm.patientinfo.Gender = data.Gender ? data.Gender.Description : null;
				cvm.patientinfo.PatientName = '';

				if (cvm.patientinfo.Title) {
					cvm.patientinfo.PatientName = cvm.patientinfo.Title + ' ';
				}
				cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + cvm.patientinfo.FirstName;
				if (cvm.patientinfo.LastName) {
					cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + ' ' + cvm.patientinfo.LastName;
				}
				var ageObj = utl.Formatter.getDetailedAgeFromDOB(cvm.patientinfo.DOB);
				cvm.patientinfo.ApproxAgeDays = ageObj.d;
				cvm.patientinfo.ApproxAgeMonths = ageObj.m || 0;
				cvm.patientinfo.Age = ageObj.y;
				if (cvm.patientinfo.Age == null) {
					cvm.patientinfo.Age = 0;
				}
				if (cvm.patientinfo.Age == 0 || !cvm.patientinfo.Age) {
					cvm.agedata.Age = cvm.patientinfo.ApproxAgeDays + ' ' +
						'D' + '/' + cvm.patientinfo.ApproxAgeMonths + 'M';
				} else {
					cvm.agedata.Age = cvm.patientinfo.Age;
				}

				// if (data.Age && data.Age != null) {
				// 	cvm.patientinfo.Age = (data.Age > 1) ? data.Age + " Y" : data.Age + " M";
				// }

				cvm.patientinfo.PatientStatus = data.PatientStatus.Description;
				cvm.patientinfo.FacilityId = data.FacilityId;
				cvm.patientinfo.FacilityName = data.Facility.FacilityName;
				cvm.patientinfo.GuarantorType = data.Encounters[0].EncounterGuarantors[0].GuarantorType.Description;
				cvm.patientinfo.GuarantorName = data.Encounters[0].EncounterGuarantors[0].Guarantor.GuarantorName;
				cvm.encounterinfo.Title = data.Encounters[0].Doctor.Title ? data.Encounters[0].Doctor.Title.Description : null;
				cvm.encounterinfo.FirstName = data.Encounters[0].Doctor.FirstName;
				cvm.encounterinfo.MiddleName = data.Encounters[0].Doctor.MiddleName;
				cvm.encounterinfo.LastName = data.Encounters[0].Doctor.LastName;
				cvm.encounterinfo.DoctorName = '';

				if (cvm.encounterinfo.Title) {
					cvm.encounterinfo.DoctorName = cvm.encounterinfo.Title + ' ';
				}
				cvm.encounterinfo.DoctorName = cvm.encounterinfo.DoctorName + cvm.encounterinfo.FirstName;
				if (cvm.encounterinfo.LastName) {
					cvm.encounterinfo.DoctorName = cvm.encounterinfo.DoctorName + ' ' + cvm.encounterinfo.LastName;
				}
				if (data.Encounters.length > 0) {
					cvm.encounterinfo.Id = data.Encounters[0].Id;
					cvm.encounterinfo.IsMLC = data.Encounters[0].IsMLC;	
					if (cvm.encounterinfo.IsMLC == true) {
						cvm.encounterinfo.IsMLC = "MLC";
					} else {
						cvm.encounterinfo.IsMLC = "";
					}
				}
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

			cvm.init = function () { }

			cvm.patientprofile = function () {
				utl.Modal.open('registration.patientprofile', {
					params: {
						pid: cvm.patientid
					}
				});
			}

			cvm.patcmnts = function () {
				utl.Modal.open('app.patcomments', {
					params: {
						pid: cvm.patientid
					},
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
			controller: 'patientbannerCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/patientbanner.html'
		})

})();