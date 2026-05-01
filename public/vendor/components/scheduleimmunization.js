(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('scheduleimmunizationCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.currentcontext = {};
			cvm.patientInfo = {};
			cvm.immItem = {};

			$scope.$watch('cvm.patientid',
				function (newValue) {
					loadData();
				});

			function compareDates(immuDate) {
				var momentA = moment();
				var momentB = moment(immuDate);
				if (momentA > momentB) return 1;
				else if (momentA < momentB) return -1;
				else return 0;
			}

			//Code to print immunization chart
			var cmpObj = {
				printchart: function () {
					cvm.exportChart();
				}
			}
			cvm.delegatefn({ cmp: cmpObj });

			cvm.exportChart = function () {
				var offScreen = document.getElementById('chartroot');

				// Clone off-screen element
				var clone = hiddenClone(offScreen);

				// Use clone with htm2canvas and delete clone
				html2canvas(clone, {
					onrendered: function (canvas) {
						//document.body.appendChild(canvas);
						//document.body.removeChild(clone);

						var data = canvas.toDataURL();
						var docDefinition = {
							content: [{
								image: data,
								width: 500,
							}]
						};
						pdfMake.createPdf(docDefinition).download("Immuization_Chart.pdf");

						document.body.removeChild(clone);
						//document.body.removeChild(canvas);
					}
				});
			}

			function hiddenClone(element) {
				// Create clone of element
				var clone = element.cloneNode(true);

				// Position element relatively within the
				// body but still out of the viewport
				var style = clone.style;
				style.position = 'relative';
				style.top = window.innerHeight + 'px';
				style.left = 0;
				style.fontSize = "25px";
				style.fontWeight = "bold";
				style.fontColor = "black";

				// Append clone to body and return the clone
				document.body.appendChild(clone);
				return clone;
			}

			//get patient by id
			cvm.getPatientCallback = function (scope, res, options, hasError) {
				cvm.patientInfo = res.Data[0];
			};

			cvm.getPatient = function (pageNo) {
				if (cvm.patientid > 0) {
					var inputData = {
						Params: [
							{ Key: 0, Value: cvm.patientid }
						],
						PageContext: {
							PageSize: 1,
							PageNumber: 1
						}
					};

					var options = {
						action: 'registration/patient/GetPatients',
						data: inputData,
						type: 'post',
						onComplete: cvm.getPatientCallback
					};
					utl.Http.doAction(options);
				}
			};


			cvm.getImmunizationItemCallback = function (scope, res, options, hasError) {
				for (var imm in res.Data) {
					cvm.immItem[res.Data[imm].Id] = res.Data[imm].ReferrenceLink;
				}
			}

			cvm.getImmunizationItem = function () {
				var inputData = {
					Params: [],
					PageContext: {
						PageSize: 100000,
						PageNumber: 1
					}
				};
				var options = {
					action: 'clinicalmaster/Immunization/GetImmunizations',
					data: inputData,
					type: 'post',
					onComplete: cvm.getImmunizationItemCallback
				};

				utl.Http.doAction(options);
			};


			cvm.getPatientImmunizationScheduleByPIdCallback = function (scope, res, options, hasError) {
				var response = res.Data;
				var groupedData = _.groupBy(response, 'ImmunizationName');
				var scheduledFlag = cvm.scheduleflag;
				var patientimmunizations = cvm.patientimmunizations;
				//console.log(groupedData);
				var vaccines = [];
				for (var groupkey in groupedData) {
					var dosecount = 0;
					var vaccine = { Name: groupkey, Doses: [], Id: 0, url: '#' };
					var doses = groupedData[groupkey];
					for (var idx in scheduledFlag) {
						var item = { Key: scheduledFlag[idx].Text, bgclass: 'notadm', imgsrc: '', patientimmu: null, dose: {} };
						for (var jdx in doses) {
							var bgclass = 'notadm';
							if (scheduledFlag[idx].Id == doses[jdx].ScheduleFlagId) {
								var immuSch = doses[jdx];
								vaccine.Id = immuSch.ImmunizationId;
								vaccine.url = cvm.immItem[immuSch.ImmunizationId];
								var patientImmunization = getPatientImmunizationData(immuSch.ImmunizationId, immuSch.Id);
								if (patientImmunization) {
									bgclass = 'adm';
								} else {
									var isDue = compareDates(immuSch.ImmunizationDate);
									if (isDue >= 0) {
										bgclass = 'due';
									}
								}
								dosecount = dosecount + 1;
								switch (doses[jdx].RouteId) {
									case 1:
										item = { Key: scheduledFlag[idx].Text, bgclass: bgclass, imgsrc: 'app/img/doseimg/dn' + dosecount + '.png', patientimmu: patientImmunization, dose: doses[jdx] };
										break;
									case 2:
										item = { Key: scheduledFlag[idx].Text, bgclass: bgclass, imgsrc: 'app/img/doseimg/in' + dosecount + '.png', patientimmu: patientImmunization, dose: doses[jdx] };
										break;
									case 3:
										item = { Key: scheduledFlag[idx].Text, bgclass: bgclass, imgsrc: 'app/img/doseimg/inb' + dosecount + '.png', patientimmu: patientImmunization, dose: doses[jdx] };
										break;
									default:

								}
							}
						}
						vaccine.Doses.push(item);
					}
					console.log(vaccine);
					vaccines.push(vaccine);
				}
				console.log(vaccines);
				cvm.vaccines = vaccines;
			}

			//get patient immunization schedules
			function getPatientImmunizationData(immuId, patientImmunizationScheduleId) {
				var result;
				var patientImmunizations = cvm.patientimmunizations[immuId];
				for (var idx in patientImmunizations) {
					var item = patientImmunizations[idx];
					if (item.PatientImmunizationScheduleId == patientImmunizationScheduleId) {
						result = item;
						break;
					}
				}
				return result;
			}

			cvm.getPatientImmunizationScheduleByPatientId = function () {
				if (cvm.patientid > 0) {

					var inputData = {
						Params: [
							{ Key: 2, Value: cvm.patientid },
						],
						PageContext: {
							PageSize: 200,
							PageNumber: 1
						}
					};
					var options = {
						action: 'emr/PatientImmunizationSchedule/GetPatientImmunizationSchedules',
						data: inputData,
						type: 'post',
						onComplete: cvm.getPatientImmunizationScheduleByPIdCallback
					};

					utl.Http.doAction(options);
				}
			}

			cvm.init = function () {
			}

			//caution : base method, please don't modifiy
			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}

			function loadData() {
				cvm.getImmunizationItem();
				cvm.getPatientImmunizationList();
				cvm.getPatient();
			}

			//get patient immunziation list
			cvm.getPatientImmunizationListCallback = function (scope, res, options, hasError) {
				var response = res.Data;
				cvm.patientimmunizations = _.groupBy(response, 'ImmunizationId');
				cvm.getPatientImmunizationScheduleByPatientId();
			};

			cvm.getPatientImmunizationList = function () {
				var inputData = {
					Params: [
						{ Key: 2, Value: cvm.patientid },
					],
					PageContext: {
						PageSize: 100,
						PageNumber: 1
					}
				};

				var options = {
					action: 'emr/patientimmunization/GetPatientImmunizations',
					data: inputData,
					type: 'post',
					onComplete: cvm.getPatientImmunizationListCallback
				};

				utl.Http.doAction(options);
			}

			cvm.checkLink = function(url) {
				url = window.appPath.apiroot + "www/mock/"+ url;
				window.open(url);
			}

			cvm.openImmunizaation = function (item) {
				if (item.patientimmu) {
					utl.Modal.open('patientemr.patientimmunization', {
						params: { id: item.patientimmu.Id, pid: cvm.patientid },
						confirmCallback: loadData
					});
				} else {
					var doseData = item.dose;
					utl.Modal.open('patientemr.patientimmunization', {
						params: { id: 0, pid: cvm.patientid, source: 'immunizationschedule', dose: doseData },
						confirmCallback: loadData
					});
				}
			}

			cvm.lookupCallback = function (scope, data, options, hasError) {
				cvm.scheduleflag = hasError ? {} : data['ScheduleFlag'];
			}
			cvm.editpopup = function (ImmunizationId) {
				utl.Modal.open('app.immunizations', {
					params: { id: ImmunizationId, pid: cvm.patientid }, confirmCallback: loadData
				}
				);
			}

			cvm.initLookup = function () {
				var inputData = [
					{ "Key": "ScheduleFlag", Default: false },
				];

				var options = {
					action: 'General/Options/getoptions',
					data: inputData,
					type: 'post',
					onComplete: cvm.lookupCallback
				};
				utl.Http.doAction(options);
			}

			cvm.initLookup();
		}])
		.component('scheduleimmunization', {
			bindings: {
				patientid: "=",
				delegatefn: "&"
			},
			controller: 'scheduleimmunizationCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/scheduleimmunization.html'
		})

})();