(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('vorderpatientbannerCtrl', ['utl', '$scope', '$timeout', '$filter', function (utl, $scope, $timeout, $filter) {
			var cvm = this;
			cvm.patientinfo = {};
			cvm.currentcontext = {};
			if ($scope.cvm.encounterid)
				cvm.currentcontext.encid = $scope.cvm.encounterid;
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
				cvm.patientinfo.Mobile = data.Mobile;
				cvm.patientinfo.Insurance = data.Guarantor.GuarantorName;
				cvm.patientinfo.Gender = data.Gender ? data.Gender.Description : null;
				cvm.patientinfo.PatientName = '';
				cvm.EncounterData = data.Encounters ? data.Encounters[0] : {};
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
				if (data.Encounters.length) {
					cvm.Encounter = $filter('filter')(data.Encounters, {
						EncounterTypeId: 1, Id: cvm.currentcontext.encid
					})[0];
					// cvm.Encounter = data.Encounters[0];
					cvm.appnmntId = cvm.Encounter.AppointmentId;
					cvm.visitno = cvm.Encounter.VisitIdentifier;
					cvm.encstatusId = cvm.Encounter.EncounterStatusId;
					if (cvm.encstatusId == 1) {
						cvm.encstatus = 'Checked In'
					}
					if (cvm.encstatusId == 2) {
						cvm.encstatus = 'Checked Out'
					}
				}
				cvm.patientinfo.PatientStatus = data.PatientStatus.Description;
				cvm.patientinfo.PhotoPath = data.PhotoPath;
				// cvm.getGeneralAlertsCount();
				// cvm.getPatientAlertsCount();
				cvm.getPatientProfilePic();
			}

			cvm.getPatientById = function () {
				if (cvm.patientid > 0) {
					var options = {
						action: 'registration/patient/GetPatientBannerInfoById',
						data: {
							Id: cvm.patientid
						},
						type: 'post',
						onComplete: cvm.getPatientByIdCallback
					};

					utl.Http.doAction(options);
				}
			}

			cvm.getPatientProfilePicCallback = function (scope, data, options, hasError) {
				cvm.currentcontext.Photo = data.Photo;
			};

			cvm.getPatientProfilePic = function () {
				if (cvm.patientinfo.PhotoPath) {
					var inputData = {
						Id: cvm.patientinfo.Id,
						PhotoPath: cvm.patientinfo.PhotoPath
					};
					var options = {
						action: 'registration/Patient/GetPatientProfilePic',
						data: {
							Data: inputData
						},
						type: 'post',
						onComplete: cvm.getPatientProfilePicCallback
					};
					utl.Http.doAction(options);
				}
			};


			// Patient Alert
			cvm.patientalerts = function () {
				utl.Modal.open('app.alertview', {
					params: {
						pid: cvm.patientid
					},
					cancelCallback: cvm.updateCount
				});
			}

			cvm.updateCount = function () {
				cvm.getGeneralAlertsCount();
				cvm.getPatientAlertsCount();
			}

			cvm.getPatientAlertsCallback = function (scope, res, options, hasError) {
				cvm.patientAlertsCount = res.Data.length;
			};

			cvm.getPatientAlertsCount = function () {
				var inputData = {
					Params: [{
						Key: 4,
						Value: cvm.patientid
					},
					{
						Key: 5,
						Value: utl.Session.getUserDepartments()
					},
					{
						Key: 6,
						Value: utl.Session.getCurrentUserId()
					},
					{
						Key: 8,
						Value: true
					}
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

			cvm.getGeneralAlertsCallback = function (scope, res, options, hasError) {
				cvm.generalAlertsCount = res.Data.length;
			};

			cvm.getGeneralAlertsCount = function () {
				var inputData = {
					Params: [{
						Key: 5,
						Value: utl.Session.getUserDepartments()
					},
					{
						Key: 6,
						Value: utl.Session.getCurrentUserId()
					},
					{
						Key: 7,
						Value: true
					},
					{
						Key: 8,
						Value: true
					}
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
					onComplete: cvm.getGeneralAlertsCallback
				};

				utl.Http.doAction(options);
			};

			cvm.init = function () { }

			cvm.checkout = function () {
				utl.Modal.open('app.patienttracker', {
					params: {
						pid: cvm.patientid,
						aid: cvm.appnmntId,
						context:'emr'
					},
				});
			}

			// cvm.checkout = function () {
			// 	utl.Modal.open('registration.patientprofile', {
			// 		params: { pid: cvm.patientid }
			// 	}
			// 	);
			// }

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('vorderpatientbanner', {
			bindings: {
				patientid: "=",
				encounterid: "=",
				delegatefn: "&"
			},
			controller: 'vorderpatientbannerCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/vorderpatientbanner.html'
		})

})();