(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('IppatientSearchCtrl', ['utl', '$scope', '$timeout', '$http', function (utl, $scope, $timeout, $http) {
			var cvm = this;
			$scope.patients = [];
			$scope.patients = [];
			cvm.patientdisplay = {};
			cvm.searchByPatientId = false;
			cvm.IsMRN = false;
			$scope.KeyValue = '';

			cvm.mrnshortcode =
				utl.FacilitySetting.getFacilitySettingValue('billing', 'mrnshortcode');
			cvm.patientsearchbyenter = utl.FacilitySetting.getFacilitySettingValue('billing', 'patientsearchbyenter');

			$('input[name="searchSubs"]').on('keypress', function(e) {
				if (e.which !== 13) return;

				var $this = $(this),
					val = $this.val();

				$this.typeahead('val', '').focus().typeahead('val', val).focus();
			});

			$scope.$watch('cvm.patientid',
				function (newValue, oldValue) {
					if (!cvm.patientchangebyuser) {
						cvm.searchPatient(newValue, true);
					}
					// if($scope.KeyValue == 13)
					// {
					// 	cvm.searchPatient(newValue, true);
					// }
				});

				$scope.myKeyDown = function(event) {
					console.log(event);
					// event.preventDefault();
					console.log(cvm.patientdisplay);
					$scope.KeyValue = event.keyCode;
					if(event.keyCode == 13)
					{
						event.preventDefault();
						cvm.searchPatient(cvm.patientdisplay, false);
					}
				}

			cvm.OnSelectPatient = function ($item, $model, $label, event) {
				// event.stopPropagation();
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
				$scope.patients = result;
				cvm.setPatientInfo(utl.Common.getItemByProp(result, 'Id', cvm.patientid));
				// const event = new KeyboardEvent('keydown', { key });
				// pidreg.dispatchEvent(event);
				$("input[name='autosearch']").trigger('click');
				// $("#pidreg", this).trigger('click');
				//return result;
				// $scope.patients = result;
			};

			cvm.MRNSearch = function () {
				var PID = cvm.controlid;
				cvm.patientdisplay = '';
				$('#' + PID).focus();
			}

			cvm.searchPatient = function (query, searchByPatientId) {

				//Search only active patients
				console.log(query);
				console.log($scope.KeyValue);

				var canSearch = false;
				var inputData = {
					Params: [{
						Key: 7,
						Value: 2
					}, {
						Key: 37,
						Value: 2
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
					// if(cvm.patientsearchbyenter == 1)
					// {
					// 	if($scope.KeyValue != 13) canSearch = false;
					// }
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
									Key: 2,
									Value: query
								});
							} else {
								inputData.Params.push({
									Key: 32,
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
					// if(cvm.patientsearchbyenter == 1)
					// {
					// 	if($scope.KeyValue != 13) canSearch = false;
					// }

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
					// if(cvm.patientsearchbyenter == 1)
					// {
					// 	if($scope.KeyValue != 13) canSearch = false;
					// }
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
					if(cvm.patientsearchbyenter == 1)
					{
						console.log($scope.KeyValue);
						if($scope.KeyValue == 13) {
							return $http.post(window.appPath.apiroot + 'registration/Patient/GetPatients', inputData)
							.then(searchPatientCallback);
						}
					} else {
						//inputData.Params.push({ Key: 28, Value: utl.Session.getCurrentFacilityId() });
						return $http.post(window.appPath.apiroot + 'registration/Patient/GetPatients', inputData)
						.then(searchPatientCallback);
					}

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
				eventinfo: '=',
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