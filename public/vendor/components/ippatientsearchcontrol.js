(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('IppatientSearchCtrl', ['utl', '$scope', '$timeout', '$http', function (utl, $scope, $timeout, $http) {
			var cvm = this;
			cvm.patients = [];

			cvm.patientdisplay = {};
			cvm.searchByPatientId = false;
			cvm.IsMRN = false;

			cvm.mrnshortcode =
				utl.FacilitySetting.getFacilitySettingValue('billing', 'mrnshortcode');


			$scope.$watch('cvm.patientid',
				function (newValue, oldValue) {
					if (!cvm.patientchangebyuser) {
						cvm.searchPatient(newValue, true);
					}
				});

			cvm.OnSelectPatient = function ($item, $model, $label, $event) {
				cvm.patientchangebyuser = true;
				cvm.patientid = $item.Id;
				cvm.patientinfo = $item;

				$timeout(function () {
					if (cvm.patientchange) {
						cvm.patientchange();
					}
				}, 100);
			}

			cvm.setPatientInfo = function (patient) {
				if (patient) {
					cvm.patientdisplay = patient;
					cvm.patientinfo = patient;
				}
			}

			cvm.formatPatient = function ($model) {
				return $model.FirstName;
			}

			function searchPatientCallback(res) {
				var result = res.data.Data;

				for (var idx in result) {
					var item = result[idx];
					item.PatientName = "";
					if (item.Title && item.Title.Description) {
						item.TitleDesc = item.Title.Description;
					}
					if (item.FirstName) {
						item.PatientName = item.PatientName + item.FirstName;
					}
					if (item.LastName) {
						item.PatientName = item.PatientName + ' ' + item.LastName;
					}

					if (item.Age) {
						item.Age = item.Age + 'Y';
					}

					if (item.GenderId == 1) {
						item.GenderCode = 'M';
					} else if (item.GenderId == 2) {
						item.GenderCode = 'F';
					} else if (item.GenderId == 3) {
						item.GenderCode = 'U';
					}

					if (item.Encounters && item.Encounters.length > 0) {
						var encounter = item.Encounters[0];
						if (encounter.EncounterStatusId != 2) {
							item.VisitIdentifier = encounter.VisitIdentifier;
							item.EncounterId = encounter.EncounterId;
						}
					}
					if (item.OutStandingAmount)
						item.OutStandingAmount = item.OutStandingAmount
				}
				cvm.setPatientInfo(utl.Common.getItemByProp(result, 'Id', cvm.patientid));
				return result;
			};

			cvm.MRNSearch = function () {
				var PID = cvm.controlid;
				cvm.patientdisplay = '';
				$('#' + PID).focus();
			}

			cvm.searchPatient = function (query, searchByPatientId) {

				//Search only active patients
				var canSearch = false;
				var inputData = {
					Params: [{
						Key: 7,//PatientStatus
						Value: 2
					}, {
						Key: 37,
						Value: 2//MRNTypeId
					},
					{
						Key: 29,
						Value: utl.Session.getCurrentFacilityId()
					}
				],
					PageContext: {
						PageSize: 20,
						PageNumber: 1
					}
				};

				if (searchByPatientId == true && query != -1 && query != undefined) {
					inputData.Params.push({
						Key: 0,
						Value: query
					});
					canSearch = true;
				} else if (query && query.length > 2) {
					if (cvm.mrnshortcode) {
						if (!cvm.IsMRN) {
							inputData.Params.push({
								Key: 1,
								Value: query
							});
						} else {
							if (isNaN(query)) {
								inputData.Params.push({
									Key: 2,//MRN
									Value: query
								});
							} else {
								inputData.Params.push({
									Key: 32,//MRNShortCode
									Value: query
								});
							}
						}
					} else {
						inputData.Params.push({
							Key: 1,
							Value: query
						});
					}

					canSearch = true;

					if (cvm.filterconfig) {
						if (cvm.filterconfig.isvisitinprogress) {
							inputData.Params.push({
								Key: 24,
								Value: cvm.filterconfig.isvisitinprogress
							});
						}
						if (cvm.filterconfig.isbilloutstanding) {
							inputData.Params.push({
								Key: 25,
								Value: 1
							});
						}
					}

					cvm.patientid = null;
				} else if (query && query.length > 0 && cvm.IsMRN && cvm.mrnshortcode) {

					if (isNaN(query)) {
						inputData.Params.push({
							Key: 2,
							Value: query
						});
					} else {
						inputData.Params.push({
							Key: 32,
							Value: query
						});
					}

					canSearch = true;

					if (cvm.filterconfig) {
						if (cvm.filterconfig.isvisitinprogress) {
							inputData.Params.push({
								Key: 24,
								Value: cvm.filterconfig.isvisitinprogress
							});
						}
						if (cvm.filterconfig.isbilloutstanding) {
							inputData.Params.push({
								Key: 25,
								Value: 1
							});
						}
					}

					cvm.patientid = null;
				}


				if (canSearch == true) {
					//inputData.Params.push({ Key: 28, Value: utl.Session.getCurrentFacilityId() });
					// return $http.post(window.appPath.apiroot + 'registration/Patient/GetPatients', inputData)
					// 	.then(searchPatientCallback);
					return $http.post(window.appPath.apiroot + 'registration/Patient/GetMinPatientSearch', inputData)
						.then(searchPatientCallback);
				}
				return null;
			}

			cvm.init = function () {
				//Init logic
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}
		}])
		.component('ippatientsearch', {
			bindings: {
				patientid: '=',
				patientinfo: '=',
				patientchange: '&',
				candisable: "<",
				filterconfig: "=",
				tabindex: "<",
				controlid: '='
			},
			controller: 'IppatientSearchCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/ippatientsearchcontrol.html'
		})
})();