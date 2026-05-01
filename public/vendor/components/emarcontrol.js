(function () {
	'use strict';

	angular
		.module('common.utils')
		.controller('emarCtrl', ['utl', '$scope', '$timeout', function (utl, $scope, $timeout) {
			var cvm = this;
			cvm.currentcontext = {};
			cvm.patientInfo = {};
			cvm.immItem = {};
			cvm.patientid = $scope.cvm.patientid;

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

			var getDateArray = function (startDate, endDate) {
				var arr = [];
				var dt = new Date(startDate);
				while (dt <= endDate) {
					var date = new Date(dt);
					arr.push(date);
					dt.setDate(dt.getDate() + 1);
				}
				return arr;
			}
			//Code to print immunization chart
			var cmpObj = {
				printchart: function () {
					cvm.exportChart();
				}
			}
			cvm.delegatefn({
				cmp: cmpObj
			});

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

			cvm.openadminister = function (item) {
				utl.Modal.open('patientemr.drugadminister', {
					params: {
						id: item,
						// pid: cvm.patientid
					},
					confirmCallback: cvm.getPatientEmarById
				});
			}

			cvm.getPatientEmarByIdCallback = function (scope, res, options, hasError) {
				cvm.response = res.Data;
				cvm.drugdetails = [];
				cvm.HeaderDrugInfo = [];
				var groupedData = _.groupBy(cvm.response, 'StartDate');
				for (var grpKey in groupedData) {
					var drugDose = groupedData[grpKey];
					var druginfo = {
						drgDate: grpKey,
					};
					cvm.HeaderDrugInfo.push(druginfo);
				}
				var drugData = _.groupBy(cvm.response, 'DrugName');
				for (var drgKey in drugData) {
					var drugDetail = drugData[drgKey];
					var drugDoseInfo = {
						drugName: drgKey,
					}
					cvm.drugdetails.push(drugDoseInfo);
				}

			};
			var statdata = {};
			cvm.CanShowStat = function (dgname, dgdate) {
				var imgsrc = '';
				for (var idx in cvm.response) {
					var dosageData = cvm.response[idx];
					if (dgname == dosageData.DrugName && dgdate == dosageData.StartDate &&
						(dosageData.STAT == true)) {
						if (dosageData.AdministerStatusId == 2) {
							imgsrc = 'app/img/doseimg/notadmin.png'
						} else if (dosageData.AdministerStatusId == 1) {
							imgsrc = 'app/img/doseimg/adm.png'
						} else if (dosageData.AdministerStatusId == 3) {
							imgsrc = 'app/img/doseimg/current.png'
						} else if (dosageData.AdministerStatusId == 4) {
							imgsrc = 'app/img/doseimg/future.png'
						} else if (dosageData.AdministerStatusId == 5) {
							imgsrc = 'app/img/doseimg/dc.png'
						} else if (dosageData.AdministerStatusId == 6) {
							imgsrc = 'app/img/doseimg/hold.png'
						} else if (dosageData.AdministerStatusId == 7) {
							imgsrc = 'app/img/doseimg/refuse.png'
						} else if (dosageData.AdministerStatusId == 8) {
							imgsrc = 'app/img/doseimg/cm.png'
						} else if (dosageData.AdministerStatusId == 6) {
							imgsrc = 'app/img/doseimg/hold.png'
						} else if (dosageData.AdministerStatusId == 7) {
							imgsrc = 'app/img/doseimg/cm.png'
						} else if (dosageData.AdministerStatusId == 8) {
							imgsrc = 'app/img/doseimg/refuse.png'
						}
						statdata = {
							Id: dosageData.Id,
							img: imgsrc
						}
						return statdata;
					}
				}
			}
			cvm.CanShowMorning = function (dgname, dgdate) {
				var imgsrc = '';
				for (var idx in cvm.response) {
					var dosageData = cvm.response[idx];
					if (dgname == dosageData.DrugName && dgdate == dosageData.StartDate &&
						(dosageData.Morning > 0)) {
						if (dosageData.AdministerStatusId == 2) {
							imgsrc = 'app/img/doseimg/notadmin.png'
						} else if (dosageData.AdministerStatusId == 1) {
							imgsrc = 'app/img/doseimg/adm.png'
						} else if (dosageData.AdministerStatusId == 3) {
							imgsrc = 'app/img/doseimg/current.png'
						} else if (dosageData.AdministerStatusId == 4) {
							imgsrc = 'app/img/doseimg/future.png'
						} else if (dosageData.AdministerStatusId == 5) {
							imgsrc = 'app/img/doseimg/dc.png'
						} else if (dosageData.AdministerStatusId == 6) {
							imgsrc = 'app/img/doseimg/hold.png'
						} else if (dosageData.AdministerStatusId == 7) {
							imgsrc = 'app/img/doseimg/cm.png'
						} else if (dosageData.AdministerStatusId == 8) {
							imgsrc = 'app/img/doseimg/refuse.png'
						}
						statdata = {
							Id: dosageData.Id,
							img: imgsrc
						}
						return statdata;
					}
				}
			}
			cvm.CanShowNoon = function (dgname, dgdate) {
				var imgsrc = '';
				for (var idx in cvm.response) {
					var dosageData = cvm.response[idx];
					if (dgname == dosageData.DrugName && dgdate == dosageData.StartDate &&
						(dosageData.Noon > 0)) {
						if (dosageData.AdministerStatusId == 2) {
							imgsrc = 'app/img/doseimg/notadmin.png'
						} else if (dosageData.AdministerStatusId == 1) {
							imgsrc = 'app/img/doseimg/adm.png'
						} else if (dosageData.AdministerStatusId == 3) {
							imgsrc = 'app/img/doseimg/current.png'
						} else if (dosageData.AdministerStatusId == 4) {
							imgsrc = 'app/img/doseimg/future.png'
						} else if (dosageData.AdministerStatusId == 5) {
							imgsrc = 'app/img/doseimg/dc.png'
						} else if (dosageData.AdministerStatusId == 6) {
							imgsrc = 'app/img/doseimg/hold.png'
						} else if (dosageData.AdministerStatusId == 7) {
							imgsrc = 'app/img/doseimg/cm.png'
						} else if (dosageData.AdministerStatusId == 8) {
							imgsrc = 'app/img/doseimg/refuse.png'
						}
						statdata = {
							Id: dosageData.Id,
							img: imgsrc
						}
						return statdata;
					}
				}
			}
			cvm.CanShowNight = function (dgname, dgdate) {
				var imgsrc = '';
				for (var idx in cvm.response) {
					var dosageData = cvm.response[idx];
					if (dgname == dosageData.DrugName && dgdate == dosageData.StartDate &&
						(dosageData.Night > 0)) {
						if (dosageData.AdministerStatusId == 2) {
							imgsrc = 'app/img/doseimg/notadmin.png'
						} else if (dosageData.AdministerStatusId == 1) {
							imgsrc = 'app/img/doseimg/adm.png'
						} else if (dosageData.AdministerStatusId == 3) {
							imgsrc = 'app/img/doseimg/current.png'
						} else if (dosageData.AdministerStatusId == 4) {
							imgsrc = 'app/img/doseimg/future.png'
						} else if (dosageData.AdministerStatusId == 5) {
							imgsrc = 'app/img/doseimg/dc.png'
						} else if (dosageData.AdministerStatusId == 6) {
							imgsrc = 'app/img/doseimg/hold.png'
						} else if (dosageData.AdministerStatusId == 7) {
							imgsrc = 'app/img/doseimg/cm.png'
						} else if (dosageData.AdministerStatusId == 8) {
							imgsrc = 'app/img/doseimg/refuse.png'
						}
						statdata = {
							Id: dosageData.Id,
							img: imgsrc
						}
						return statdata;
					}
				}
			}
			cvm.getPatientEmarById = function () {
				if (cvm.patientid > 0) {
					var inputData = {
						Params: [{
							Key: 3,
							Value: cvm.patientid
						},
						{
							Key: 1,
							Value: cvm.prescriptionid
						}
						],
						PageContext: {
							PageSize: 200,
							PageNumber: 1
						}
					};
					var options = {
						action: 'emr/Emar/GetEmars',
						data: inputData,
						type: 'post',
						onComplete: cvm.getPatientEmarByIdCallback
					};

					utl.Http.doAction(options);
				}
			}

			function loadData() {
				cvm.getPatientEmarById();
			}

			cvm.init = function () { }

			cvm.$onInit = function () {
				$timeout(cvm.init, 100);
			}

			cvm.lookupCallback = function (scope, data, options, hasError) {
				cvm.drugFlag = hasError ? {} : data['DrugFlag'];
			}

			cvm.initLookup = function () {
				var inputData = [{
					"Key": "DrugFlag",
					Default: false
				},];

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
		.component('emarcontrol', {
			bindings: {
				patientid: "=",
				prescriptionid: "=",
				delegatefn: "&"
			},
			controller: 'emarCtrl',
			controllerAs: 'cvm',
			templateUrl: 'vendor/components/emarcontrol.html'
		})

})();