(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('nursingchartsController', nursingchartsController);

    function nursingchartsController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, ) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";

        var encounterinfo = utl.Session.getPatientEncounter();
        var Admissiondate = utl.Formatter.getDate(encounterinfo.AdmissionDate) || null;

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        $scope.ventilatorcharts = [];
        $scope.abgcharts = [];
        $scope.monitorcharts = [];
        $scope.intakeoutputs = [];
        $scope.bpcharts = [];
        $scope.diabetescharts = [];
        $scope.dialysischarts = [];
        $scope.vitalcharts = [];
        $scope.currentfilter = {
            patientname: '',
            // FromDate: Admissiondate,
            // ToDate: utl.Formatter.getCurrentDate(),
            currentdate: utl.Formatter.getCurrentDate(),
            admsndate: Admissiondate,
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -2),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {
            option: 'ventilator',
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());


        $scope.options = [{
                key: 'ventilator',
                name: $translate.instant('patientemr.criticalcharts.ventilator.lbl')
            },
            {
                key: 'abgchart',
                name: $translate.instant('patientemr.criticalcharts.abgchart.lbl')
            },
            {
                key: 'monitorchart',
                name: $translate.instant('patientemr.criticalcharts.monitorchart.lbl')
            },
            {
                key: 'intakeoutput',
                name: $translate.instant('patientemr.criticalcharts.intakeoutput.lbl')
            },
            {
                key: 'bpcharts',
                name: $translate.instant('patientemr.criticalcharts.bpcharts.lbl')
            },
            {
                key: 'diabetes',
                name: $translate.instant('patientemr.criticalcharts.diabetes.lbl')
            },
            {
                key: 'dialysis',
                name: $translate.instant('patientemr.criticalcharts.dialysis.lbl')
            },
            {
                key: 'vitalchart',
                name: $translate.instant('patientemr.criticalcharts.vitalchart.lbl')
            }
        ]

        $scope.backToList = function() {
            $state.go('app.doctordashboard');
        }
        $scope.doctor_dashboard = function() {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        }
        $scope.checkedinpatients = function() {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function() {
            $state.go('app.bedmanagementtab.inpatient');
        };

        $scope.DeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/PatientVentilatorChart/DeletePatientVentilatorChart',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.getList();
        };

        $scope.deletevaccination = function(item, idx) {
            utl.Dialog.confirmDelete($scope.DeleteConfirmed, item.Id);
        };

        $scope.DeleteABGConfirmed = function(deleteId) {
            var options = {
                action: 'emr/PatientABGChart/DeletePatientABGChart',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.getList();
        };

        $scope.deleteabg = function(item, idx) {
            utl.Dialog.confirmDelete($scope.DeleteABGConfirmed, item.Id);
        };

        $scope.DeleteMonitorConfirmed = function(deleteId) {
            var options = {
                action: 'emr/PatientMonitorChart/DeletePatientMonitorChart',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.getList();
        };

        $scope.deletemonitor = function(item, idx) {
            utl.Dialog.confirmDelete($scope.DeleteMonitorConfirmed, item.Id);
        };
        $scope.DeleteintakeConfirmed = function(deleteId) {
            var options = {
                action: 'emr/IntakeOutputChart/DeleteIntakeOutputChart',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.getList();
        };

        $scope.deleteintake = function(item, idx) {
            utl.Dialog.confirmDelete($scope.DeleteintakeConfirmed, item.Id);
        };

        //getList
        $scope.getVentilatorChartListCallback = function(scope, res, options, hasError) {
            $scope.ventilatorcharts = res.Data;
            $scope.populateDays();
        };

        $scope.populateDays = function() {
            var FromDate = new Date($scope.currentfilter.admsndate);
            var ToDate = new Date($scope.currentfilter.currentdate);
            var timeDiff = Math.abs(ToDate.getTime() - FromDate.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            $scope.currentcontext.diffdays = diffDays;
            return dateOut;

        }
        $scope.getAbgChartListCallback = function(scope, res, options, hasError) {
            var abgcharts = res.Data;

            var finalData = [];
            var headerData = _.uniqBy(abgcharts, 'ABGParameters');
            var groupedData = _.groupBy(abgcharts, 'ABGChartTime');
            for (var groupKey in groupedData) {
                var tr = [];
                tr.push({
                    ColVal: groupKey
                });
                for (var header in headerData) {
                    var td = _.find(groupedData[groupKey], {
                        ABGParameters: headerData[header].ABGParameters
                    });
                    var ParameterValues = '';
                    if (td) {
                        ParameterValues = td.ParameterValues;
                    }
                    if (td.QualifierId != 1) {
                        ParameterValues = '<font color="red">' + td.ParameterValues + '</font>';
                    }
                    tr.push({
                        ColVal: ParameterValues
                    });
                }
                finalData.push(tr);
            }
            $scope.currentcontext.groupedData = finalData;
            $scope.currentcontext.headerData = headerData;
            console.log(finalData);
        };
        $scope.getMonitorChartListCallback = function(scope, res, options, hasError) {
            $scope.monitorcharts = res.Data;
        };
        $scope.getInoutChartListCallback = function(scope, res, options, hasError) {
            var intakeoutputdata = res.Data;
            var TotalIntake = 0;
            var TotalOutput = 0;
            for (var idx in intakeoutputdata) {
                var inoutdatas = intakeoutputdata[idx];
                TotalIntake = TotalIntake + inoutdatas.IntakeTotal;
                TotalOutput = TotalOutput + inoutdatas.OutputTotal;
                $scope.intakeoutputs = intakeoutputdata;

                // inoutdatas.TotalIntake = TotalIntake;
                // inoutdatas.TotalOutput = TotalOutput;
            }

            $scope.NetTotalIntake = TotalIntake;
            $scope.NetTotalOutput = TotalOutput;
        };
        $scope.getBpChartListCallback = function(scope, res, options, hasError) {
            $scope.bpcharts = res.Data;
        };
        $scope.getdiabetesChartListCallback = function(scope, res, options, hasError) {
            $scope.diabetescharts = res.Data;
        };
        $scope.getdialysisChartListCallback = function(scope, res, options, hasError) {
            $scope.dialysischarts = res.Data;
        };
        $scope.getVitalChartListCallback = function(scope, res, options, hasError) {
            $scope.vitalcharts = res.Data;
            var vitals = res.Data;
            for (var idx in vitals) {
                var vital = vitals[idx];
                vitals[idx].PerformedDate = utl.Formatter.getDateTimeString(vitals[idx].PerformedDate);
                switch (vital.VitalId) {
                    case 1: //height
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "'" + vitalvalues[1] + "\"";
                        }
                        break;
                    case 8: //BP
                        if (vital.VitalValue.includes("~")) {
                            var vitalvalues = vital.VitalValue.split("~");
                            vitals[idx].VitalValue = vitalvalues[0] + "/" + vitalvalues[1];
                        }
                        break;
                    default:
                        break;
                }
            }
            var finalData = [];
            var headerData = _.uniqBy(vitals, 'VitalName');
            var groupedData = _.groupBy(vitals, 'PerformedDate');
            for (var groupKey in groupedData) {
                var tr = [];
                tr.push({
                    ColVal: groupKey
                });
                for (var header in headerData) {
                    var td = _.find(groupedData[groupKey], {
                        VitalName: headerData[header].VitalName
                    });
                    var vitalValue = '';
                    if (td) {
                        vitalValue = td.VitalValue + ' ' + td.UOM;
                    }
                    tr.push({
                        ColVal: vitalValue
                    });
                }
                finalData.push(tr);
            }
            $scope.currentcontext.groupedData = finalData;
            $scope.currentcontext.headerData = headerData;
            console.log(finalData);
        };
        $scope.getList = function(pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            if ($scope.currentcontext.option == 'ventilator') {
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 3,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],
                }
                var options = {
                    action: 'emr/PatientVentilatorChart/GetPatientVentilatorCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getVentilatorChartListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.option == 'abgchart') {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 3,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],

                };
                var options = {
                    action: 'emr/PatientABGChart/GetPatientABGCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAbgChartListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.option == 'monitorchart') {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 3,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],

                };
                var options = {
                    action: 'emr/PatientMonitorChart/GetPatientMonitorCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getMonitorChartListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.option == 'intakeoutput') {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 3,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],

                };
                var options = {
                    action: 'emr/IntakeOutputChart/GetIntakeOutputCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getInoutChartListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.option == 'bpcharts') {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 3,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],

                };
                var options = {
                    action: 'emr/PatientBPChart/GetPatientBPCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBpChartListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.option == 'diabetes') {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 3,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],

                };
                var options = {
                    action: 'emr/PatientDiabetesChart/GetPatientDiabetesCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getdiabetesChartListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.option == 'dialysis') {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 3,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],

                };
                var options = {
                    action: 'emr/PatientDialysisChart/GetPatientDialysisCharts',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getdialysisChartListCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.option == 'vitalchart') {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.pid
                        },
                        {
                            Key: 9,
                            Value: $scope.currentcontext.eid
                        },
                        {
                            Key: 5,
                            Value: From
                        },
                        {
                            Key: 6,
                            Value: To
                        },
                    ],

                };
                var options = {
                    action: 'emr/patientvital/GetPatientVitals',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getVitalChartListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.addNew = function() {
            if ($scope.currentcontext.option == 'ventilator') {
                utl.Modal.openFixedDialog('patientemr.ventilatorchartform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'abgchart') {
                utl.Modal.openFixedDialog('patientemr.abgchartform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'monitorchart') {
                utl.Modal.openFixedDialog('patientemr.monitorchartform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'intakeoutput') {
                utl.Modal.openFixedDialog('patientemr.inoutchartform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'bpcharts') {
                utl.Modal.openFixedDialog('patientemr.bpchartform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'diabetes') {
                utl.Modal.openFixedDialog('patientemr.diabeteschartform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'dialysis') {
                utl.Modal.openFixedDialog('patientemr.dialysischartform', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'vitalchart') {
                utl.Modal.openFixedDialog('patientemr.patientvital', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
        };
        $scope.edit = function(item, idx) {
            if ($scope.currentcontext.option == 'ventilator') {
                utl.Modal.openFixedDialog('patientemr.ventilatorchartform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'abgchart') {
                utl.Modal.openFixedDialog('patientemr.abgchartform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'monitorchart') {
                utl.Modal.openFixedDialog('patientemr.monitorchartform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'intakeoutput') {
                utl.Modal.openFixedDialog('patientemr.inoutchartform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'bpcharts') {
                utl.Modal.openFixedDialog('patientemr.bpchartform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'diabetes') {
                utl.Modal.openFixedDialog('patientemr.diabeteschartform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'dialysis') {
                utl.Modal.openFixedDialog('patientemr.dialysischartform', {
                    params: {
                        id: item.Id,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
            if ($scope.currentcontext.option == 'vitalchart') {
                for (var idx in $scope.vitalcharts) {
                    var date = $scope.vitalcharts[idx].PerformedDate;
                    if (item[0].ColVal == date) {
                        var groupid = $scope.vitalcharts[idx].GroupId;
                    }
                }
                utl.Modal.open('patientemr.patientvital', {
                    params: {
                        gid: groupid,
                        pid: $scope.currentcontext.pid,
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.initLookup
                });
            }
        }

        $scope.chartview = function() {
            utl.Modal.open('patientemr.vitalchartview', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    context: 'chart'
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.showGrowthChart = function() {
            var patientAge = utl.Formatter.getAgeFromDOB(utl.Session.getPatientDOB());
            if (patientAge >= 5) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'patientemr.patientvital-list.growthchart-confirmmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: openGrowthChart,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else {
                openGrowthChart();
            }
        }

        function openGrowthChart() {
            //$scope.currentcontext.view = "growthchart";
            utl.Modal.openFixedDialog('patientemr.growthchartmodal', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.printwithoutHeader = function() {
            if ($scope.currentcontext.option == 'ventilator') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientVentilatorChart/PrintPatientVentilatorChartWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);

            };
            if ($scope.currentcontext.option == 'dialysis') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientDialysisChart/PrintPatientDialysisChartWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);

            };
            if ($scope.currentcontext.option == 'intakeoutput') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/IntakeOutputChart/PrintIntakeOutputChartWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'monitorchart') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientMonitorChart/PrintPatientMonitorChartWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'bpcharts') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientBPChart/PrintPatientBPChartWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'diabetes') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientDiabetesChart/PrintPatientDiabetesChartWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'abgchart') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientABGChart/PrintPatientABGChartWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'vitalchart') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/patientvital/PrintPatientVitalWithoutHeader',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
        }

        $scope.print = function() {
            if ($scope.currentcontext.option == 'ventilator') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientVentilatorChart/PrintPatientVentilatorChart',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);

            };
            if ($scope.currentcontext.option == 'dialysis') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientDialysisChart/PrintPatientDialysisChart',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);

            };
            if ($scope.currentcontext.option == 'intakeoutput') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/IntakeOutputChart/PrintIntakeOutputChart',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'monitorchart') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientMonitorChart/PrintPatientMonitorChart',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'bpcharts') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientBPChart/PrintPatientBPChart',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'diabetes') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientDiabetesChart/PrintPatientDiabetesChart',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'abgchart') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/PatientABGChart/PrintPatientABGChart',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
            if ($scope.currentcontext.option == 'vitalchart') {
                var inputData = {
                    Id: $scope.currentcontext.eid
                };
                var options = {
                    action: 'emr/patientvital/PrintPatientVital',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            };
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "VentilatorMode"
            }]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();

    }

    nursingchartsController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', ];

})();