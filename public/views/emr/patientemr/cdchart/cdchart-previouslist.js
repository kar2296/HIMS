(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CdChartProviousListController', CdChartProviousListController);

    function CdChartProviousListController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, ) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";

        var encounterinfo = utl.Session.getPatientEncounter();
        // var Admissiondate = utl.Formatter.getDate(encounterinfo.AdmissionDate) || null;

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.CdChart = [];
        $scope.currentfilter = {
            patientname: '',
            FromDate:  utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            currentdate: utl.Formatter.getCurrentDate(),
            // admsndate: Admissiondate
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());


        $scope.options = [
            {
                key: 'CdChart',
                name: $translate.instant('patientemr.criticalcharts.CdChart.lbl')
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
            $scope.CdChart = res.Data;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
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
                action: 'emr/CdChart/GetCdCharts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getBpChartListCallback
            };
            utl.Http.doAction(options);
        }


        $scope.addNew = function () {
            utl.Modal.openFixedDialog('patientemr.CdChartform', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.edit = function (item, idx) {
            utl.Modal.openFixedDialog('patientemr.CdChartform', {
                params: {
                    id: item.Id,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/CdChart/PrintCdChart',
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

    CdChartProviousListController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig',];

})();