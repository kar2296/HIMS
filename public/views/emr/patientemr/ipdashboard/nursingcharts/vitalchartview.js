(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VitalChartviewController', VitalChartviewController);

    function VitalChartviewController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        $scope.currentfilter = {
            PerformedBy: -1,
            VitalId: -1,
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter)
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;

        $scope.getListCallback = function (scope, res, options, hasError) {
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
            vm.gridConfig.data = vitals;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentfilter.VitalId
                    // },
                    // {
                    //     Key: 7,
                    //     Value: $scope.currentfilter.PerformedBy
                    // },
                    {
                        Key: 5,
                        Value: utl.Formatter.getFilterDate(FromDate)
                    },
                    {
                        Key: 6,
                        Value: utl.Formatter.getFilterDate(ToDate)
                    },
                    // {
                    //     Key: 9,
                    //     Value: $scope.currentcontext.eid
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientvital/DeletePatientVital',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Vital"
                },
                {
                    "Key": "User"
                }
            ];

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

    VitalChartviewController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();