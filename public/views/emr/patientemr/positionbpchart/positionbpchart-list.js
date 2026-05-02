(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PositionBpChartController', PositionBpChartController);

    function PositionBpChartController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, ) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";

        var encounterinfo = utl.Session.getPatientEncounter();
        var Admissiondate = utl.Formatter.getDate(encounterinfo.AdmissionDate) || null;

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.bpcharts = [];
        $scope.currentfilter = {
            patientname: '',
            FromDate: Admissiondate,
            ToDate: utl.Formatter.getCurrentDate(),
            currentdate: utl.Formatter.getCurrentDate(),
            admsndate: Admissiondate
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());


        $scope.options = [
            {
                key: 'bpcharts',
                name: $translate.instant('patientemr.criticalcharts.bpcharts.lbl')
            }
        ]

        $scope.backToList = function () {
            $state.go('app.doctordashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };
        //getList
        $scope.getVentilatorChartListCallback = function (scope, res, options, hasError) {
            $scope.ventilatorcharts = res.Data;
            $scope.populateDays();
        };

        $scope.populateDays = function () {
            var FromDate = new Date($scope.currentfilter.admsndate);
            var ToDate = new Date($scope.currentfilter.currentdate);
            var timeDiff = Math.abs(ToDate.getTime() - FromDate.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            $scope.currentcontext.diffdays = diffDays;
            return dateOut;

        }

        $scope.getBpChartListCallback = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ((item.RightSittingSys >= 80 && item.RightSittingSys <= 120) && (item.RightSittingDia >= 80 && item.RightSittingDia <= 120)) {
                    item.RightSittingSys_Clr = '<font color="blue">' + item.RightSittingSys + '</font> ';
                    item.RightSittingDia_Clr = '<font color="blue">' + item.RightSittingDia + '</font> ';
                }
                if ((item.RightSittingSys > 120) || (item.RightSittingDia > 80)) {
                    item.RightSittingSys_Clr = '<font color="red">' + item.RightSittingSys + '</font> ';
                    item.RightSittingDia_Clr = '<font color="red">' + item.RightSittingDia + '</font> ';
                }
                if ((item.RightSittingSys < 120) || (item.RightSittingDia < 80)) {
                    item.RightSittingSys_Clr = '<font color="red">' + item.RightSittingSys + '</font> ';
                    item.RightSittingDia_Clr = '<font color="red">' + item.RightSittingDia + '</font> ';
                }
                if ((item.RightStandingSys >= 80 && item.RightStandingSys <= 120) && (item.RightStandingDia >= 80 && item.RightStandingDia <= 120)) {
                    item.RightStandingSys_Clr = '<font color="blue">' + item.RightStandingSys + '</font> ';
                    item.RightStandingDia_Clr = '<font color="blue">' + item.RightStandingDia + '</font> ';
                }
                if ((item.RightStandingSys > 120) || (item.RightStandingDia > 80)) {
                    item.RightStandingSys_Clr = '<font color="red">' + item.RightStandingSys + '</font> ';
                    item.RightStandingDia_Clr = '<font color="red">' + item.RightStandingDia + '</font> ';
                }
                if ((item.RightStandingSys < 120) || (item.RightStandingDia < 80)) {
                    item.RightStandingSys_Clr = '<font color="red">' + item.RightStandingSys + '</font> ';
                    item.RightStandingDia_Clr = '<font color="red">' + item.RightStandingDia + '</font> ';
                }
                if ((item.RightLyingSys >= 80 && item.RightLyingSys <= 120) && (item.RightLyingDia >= 80 && item.RightLyingDia <= 120)) {
                    item.RightLyingSys_Clr = '<font color="blue">' + item.RightLyingSys + '</font> ';
                    item.RightLyingDia_Clr = '<font color="blue">' + item.RightLyingDia + '</font> ';
                }
                if ((item.RightLyingSys > 120) || (item.RightLyingDia > 80)) {
                    item.RightLyingSys_Clr = '<font color="red">' + item.RightLyingSys + '</font> ';
                    item.RightLyingDia_Clr = '<font color="red">' + item.RightLyingDia + '</font> ';
                }
                if ((item.RightLyingSys < 120) || (item.RightLyingDia < 80)) {
                    item.RightLyingSys_Clr = '<font color="red">' + item.RightStandingSys + '</font> ';
                    item.RightLyingDia_Clr = '<font color="red">' + item.RightLyingDia + '</font> ';
                }
                if ((item.LeftSittingSys >= 80 && item.LeftSittingSys <= 120) && (item.LeftSittingDia >= 80 && item.LeftSittingDia <= 120)) {
                    item.LeftSittingSys_Clr = '<font color="blue">' + item.LeftSittingSys + '</font> ';
                    item.LeftSittingDia_Clr = '<font color="blue">' + item.LeftSittingDia + '</font> ';
                }
                if ((item.LeftSittingSys > 120) || (item.LeftSittingDia > 80)) {
                    item.LeftSittingSys_Clr = '<font color="red">' + item.LeftSittingSys + '</font> ';
                    item.LeftSittingDia_Clr = '<font color="red">' + item.LeftSittingDia + '</font> ';
                }
                if ((item.LeftSittingSys < 120) || (item.LeftSittingDia < 80)) {
                    item.LeftSittingSys_Clr = '<font color="red">' + item.RightStandingSys + '</font> ';
                    item.LeftSittingDia_Clr = '<font color="red">' + item.LeftSittingDia + '</font> ';
                }
                if ((item.LeftStandingSys >= 80 && item.LeftStandingSys <= 120) && (item.LeftStandingDia >= 80 && item.LeftStandingDia <= 120)) {
                    item.LeftStandingSys_Clr = '<font color="blue">' + item.LeftStandingSys + '</font> ';
                    item.LeftStandingDia_Clr = '<font color="blue">' + item.LeftStandingDia + '</font> ';
                }
                if ((item.LeftStandingSys > 120) || (item.LeftStandingDia > 80)) {
                    item.LeftStandingSys_Clr = '<font color="red">' + item.LeftStandingSys + '</font> ';
                    item.LeftStandingDia_Clr = '<font color="red">' + item.LeftStandingDia + '</font> ';
                }
                if ((item.LeftStandingSys < 120) || (item.LeftStandingDia < 80)) {
                    item.LeftStandingSys_Clr = '<font color="red">' + item.RightStandingSys + '</font> ';
                    item.LeftStandingDia_Clr = '<font color="red">' + item.LeftStandingDia + '</font> ';
                }
                if ((item.LeftLyingSys >= 80 && item.LeftLyingSys <= 120) && (item.LeftLyingDia >= 80 && item.LeftLyingDia <= 120)) {
                    item.LeftLyingSys_Clr = '<font color="blue">' + item.LeftLyingSys + '</font> ';
                    item.LeftLyingDia_Clr = '<font color="blue">' + item.LeftLyingDia + '</font> ';
                }
                if ((item.LeftLyingSys > 120) || (item.LeftLyingDia > 80)) {
                    item.LeftLyingSys_Clr = '<font color="red">' + item.LeftLyingSys + '</font> ';
                    item.LeftLyingDia_Clr = '<font color="red">' + item.LeftLyingDia + '</font> ';
                }
                if ((item.LeftLyingSys < 120) || (item.LeftLyingDia < 80)) {
                    item.LeftLyingSys_Clr = '<font color="red">' + item.RightStandingSys + '</font> ';
                    item.LeftLyingDia_Clr = '<font color="red">' + item.LeftLyingDia + '</font> ';
                }
                $scope.bpcharts.push(item);
            }
            $scope.bpcharts = res.Data;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentcontext.eid },
                    {
                        Key: 5,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 6,
                        Value: utl.Formatter.getFilterDate(To)
                    }
                ]
            };
            var options = {
                action: 'emr/PositionBpChart/GetPositionBpCharts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getBpChartListCallback
            };
            utl.Http.doAction(options);
        }


        $scope.addNew = function () {
            utl.Modal.openFixedDialog('patientemr.positionbpcharttab.positionbpchartform', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.edit = function (item, idx) {
            utl.Modal.openFixedDialog('patientemr.positionbpcharttab.positionbpchartform', {
                params: {
                    id: item.Id,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.printwithoutHeader = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/PositionBpChart/PrintPositionBpChartWithoutHeader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/PositionBpChart/PrintPositionBpChart',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
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

    PositionBpChartController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig',];

})();