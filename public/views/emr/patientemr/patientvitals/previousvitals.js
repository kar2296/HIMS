(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousvitalsController', previousvitalsController);

    function previousvitalsController($scope, $stateParams, $state, $translate, $filter, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.VitalDatas = [];
        $scope.currentfilter = {};
        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.pid = modalConfig.params.pid;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.selectedMenu = 'list';

        $scope.currentcontext.id = modalConfig.params.id;

        $scope.canShowChartArea = function () {
            $scope.currentcontext.selectedMenu = 'chart';
        }

        $scope.canShowGridArea = function () {
            return $scope.currentcontext.selectedMenu == 'list';
        }

        $scope.toggleView = function () {
            $scope.currentcontext.selectedMenu = $scope.canShowGridArea() ? 'chart' : 'list';
        }

        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.FinalList) {
                var item = $scope.FinalList[idx];
                if (item.PerformedDate == clickedItem.PerformedDate) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

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
            $scope.Vitals = vitals;
            $scope.FinalList = [];
            var groupedData = _.groupBy(vitals, 'PerformedDate');
            for (var grpkey in groupedData) {
                var Vdata = groupedData[grpkey];
                var headerData = Vdata[0];
                var item = {
                    PerformedDate: headerData.PerformedDate,
                    PerformedUser: headerData.PerformedUser.FirstName,
                    VitalListDatas: Vdata
                }
                $scope.FinalList.push(item);
                $scope.VitalDatas = Vdata;
                console.log($scope.FinalList);
            };

            for (var idx in $scope.FinalList) {
                var item = $scope.FinalList[idx];
                if (parseInt(idx) === 0) {
                    item.CanShowDetails = true;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
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
                        Key: 3,
                        Value: $scope.currentfilter.VitalId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.PerformedBy
                    },
                    {
                        Key: 5,
                        Value: utl.Formatter.getFilterDate(FromDate)
                    },
                    {
                        Key: 6,
                        Value: utl.Formatter.getFilterDate(ToDate)
                    },
                ],

            };

            var options = {
                action: 'emr/patientvital/GetPatientVitals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.loadOrderDetail = function (item) {
            $scope.confirmCallback({
                id: item.Id
            });
        };

        $scope.handleEvents = function (actionType, row) {};

        $scope.getList();
    }

    previousvitalsController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$uibModalInstance', 'modalConfig'];

})();