(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DiabetesChartCurrentListController', DiabetesChartCurrentListController);

    function DiabetesChartCurrentListController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, ) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";

        var encounterinfo = utl.Session.getPatientEncounter();
        var Admissiondate = utl.Formatter.getDate(encounterinfo.AdmissionDate) || null;

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.diabetescharts = [];
        $scope.currentfilter = {
            patientname: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            currentdate: utl.Formatter.getCurrentDate(),
            admsndate: Admissiondate
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());


        $scope.options = [
            {
                key: 'diabetescharts',
                name: $translate.instant('patientemr.criticalcharts.diabetes.lbl')
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

        $scope.getChartListCallback = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                var item = res.Data[idx];
                // if (item.BloodSugarFasting > 70 && item.BloodSugarFasting < 100) {
                //     item.BloodSugarFasting_Clr = '<font color="#f05050">' + item.BloodSugarFasting + '</font> ';
                // }
                // if (item.BloodSugarFasting > 100) {
                //     item.BloodSugarFasting_Clr = '<font color="#f05050">' + item.BloodSugarFasting + '</font> ';
                // }
                // if (item.BloodSugarFasting < 70) {
                //     item.BloodSugarFasting_Clr = '<font color="#f05050">' + item.BloodSugarFasting + '</font> ';
                // }
                // if (item.HBA1C > 70 && item.HBA1C < 100) {
                //     item.HBA1C_Clr = '<font color="#f05050">' + item.HBA1C + '</font> ';
                // }
                // if (item.HBA1C > 100) {
                //     item.HBA1C_Clr = '<font color="#f05050">' + item.HBA1C + '</font> ';
                // }
                // if (item.HBA1C < 70) {
                //     item.HBA1C_Clr = '<font color="#f05050">' + item.HBA1C + '</font> ';
                // }
                if (item.EAG > 90 && item.EAG < 120) {
                    item.EAG_Clr = '<font color="blue">' + item.EAG + '</font> ';
                }
                if (item.EAG > 120) {
                    item.EAG_Clr = '<font color="red">' + item.EAG + '</font> ';
                }
                if (item.EAG < 90) {
                    item.EAG_Clr = '<font color="red">' + item.EAG + '</font> ';
                }
                if (item.MicroAlbumin > 1 && item.MicroAlbumin < 6) {
                    item.MicroAlbumin_Clr = '<font color="blue">' + item.MicroAlbumin + '</font> ';
                }
                if (item.MicroAlbumin > 6) {
                    item.MicroAlbumin_Clr = '<font color="red">' + item.MicroAlbumin + '</font> ';
                }
                if (item.MicroAlbumin > 6) {
                    item.MicroAlbumin_Clr = '<font color="red">' + item.MicroAlbumin + '</font> ';
                }
                $scope.diabetescharts.push(item);
            }
            // $scope.diabetescharts = res.Data;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.eid
                    },
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
                action: 'emr/PatientDiabetesChart/GetPatientDiabetesCharts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getChartListCallback
            };
            utl.Http.doAction(options);
        }


        $scope.addNew = function () {
            utl.Modal.openFixedDialog('patientemr.diabetescharttab.diabeteschartform', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                },
                confirmCallback: $scope.initLookup
            });
        };
        $scope.edit = function (item, idx) {
            utl.Modal.openFixedDialog('patientemr.diabetescharttab.diabeteschartform', {
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
                action: 'emr/PatientDiabetesChart/PrintPatientDiabetesChartWithoutHeader',
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
                action: 'emr/PatientDiabetesChart/PrintPatientDiabetesChart',
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

    DiabetesChartCurrentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig',];

})();