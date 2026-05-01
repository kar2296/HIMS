(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('consultationcontrolCtrl', ['utl', '$scope', '$timeout', '$translate', '$state',
			function (utl, $scope, $timeout, $translate, $state) {
				var cvm = this;

				cvm.currentcontext = {
					encounter: utl.Session.getPatientEncounter(),
					patientId: parseInt(utl.Session.getEMRPatientId()),
					userId: utl.Session.getCurrentUserId()
				};

				cvm.init = function () {
				}

				//Check in consultation table with EncounterId and patientId
				cvm.checkConsultationCallback = function (scope, res, options, hasError) {
					if (!res || !res.Data || res.Data.length == 0) {
						cvm.getProfileForUser();
					} else {
						cvm.openConsultation(res.Data[0].Id);
					}
				}

				cvm.checkConsultation = function () {
					var inputData = {
						Params: [
							{ Key: 2, Value: cvm.currentcontext.encounter.Id },
							{ Key: 3, Value: cvm.currentcontext.patientId }
						],
						PageContext: {
							PageSize: 5,
							PageNumber: 1
						}
					};

					var options = {
						action: 'emr/consultation/GetConsultations',
						data: inputData,
						type: 'post',
						onComplete: cvm.checkConsultationCallback
					};

					utl.Http.doAction(options);
				}

				//Open Consultation
				cvm.openConsultation = function (consultationId) {
					if(consultationId) {
						$state.go('patientemr.consultation', {id : consultationId});
					}
				}

				//Fetch Profile and create entry in consultation table
				cvm.getProfileForUserCallback = function (scope, res, options, hasError) {
					if (!res || !res.Data || res.Data.length == 0) {
						cvm.getDefaultProfile();
					} else {
						cvm.createConsultation(res);
					}
				}

				cvm.getProfileForUser = function () {
					var inputData = {
						Params: [
							{ Key: 3, Value: cvm.currentcontext.encounter.FacilityId },
							{ Key: 4, Value: cvm.currentcontext.encounter.DepartmentId },
							{ Key: 5, Value: cvm.currentcontext.userId },
							{ Key: 6, Value: cvm.currentcontext.encounter.VisitTypeId }
						],
						PageContext: {
							PageSize: 5,
							PageNumber: 1
						}
					};

					var options = {
						action: 'clinicalmaster/ProfileUser/GetProfileUsers',
						data: inputData,
						type: 'post',
						onComplete: cvm.getProfileForUserCallback
					};

					utl.Http.doAction(options);
				}

				cvm.getDefaultProfileCallback = function (scope, res, options, hasError) {
					if (!res || !res.Data || res.Data.length == 0) {
						cvm.openConsultationForm();
					} else {
						cvm.createConsultation(res);
					}
				}

				cvm.getDefaultProfile = function () {
					var inputData = {
						Params: [
							{ Key: 3, Value: cvm.currentcontext.encounter.FacilityId },
							{ Key: 4, Value: cvm.currentcontext.encounter.DepartmentId },
							{ Key: 6, Value: cvm.currentcontext.encounter.VisitTypeId },
							{ Key: 7, Value: true }
						],
						PageContext: {
							PageSize: 5,
							PageNumber: 1
						}
					};

					var options = {
						action: 'clinicalmaster/ProfileUser/GetProfileUsers',
						data: inputData,
						type: 'post',
						onComplete: cvm.getDefaultProfileCallback
					};

					utl.Http.doAction(options);
				}

				//Open Consultation Form 
				cvm.openConsultationForm = function () {
					utl.Modal.open('patientemr.consultationform', {
						params: { id: 0 },
						confirmCallback: cvm.openConsultation
					});
				}

				//Create Entry in consultation table
				cvm.createConsultationCallback = function (scope, res, options, hasError) {
					utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));

					cvm.openConsultation(res);
				}

				cvm.createConsultation = function (res) {
					var encounter = cvm.currentcontext.encounter;
					if (res.Data.length > 0) {
						var response = {
							PatientId: encounter.PatientId,
							EncounterId: encounter.Id,
							EncounterDoctorId: encounter.DoctorId,
							ProfileId: res.Data[0].ProfileId,
							ProgressNoteStatusId: 1
						};

						var actionName = 'emr/consultation/AddConsultation';

						var options = {
							action: actionName,
							data: { Data: response },
							type: 'post',
							onComplete: cvm.createConsultationCallback
						};
						utl.Http.doAction(options);
					}
				}

				//caution : base method, please don't modifiy
				cvm.$onInit = function () {
					$timeout(cvm.init, 100);
				}

			}])
		.component('consultationcontrol', {
			bindings: {
			},
			controller: 'consultationcontrolCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/consultationcontrol.html'
		})

})();