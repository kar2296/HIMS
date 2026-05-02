(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderTrackerController', OrderTrackerController);

    function OrderTrackerController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        var ordertat = [];
        $scope.ordertracker = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.getListCallback = function (scope, res, options, hasError) {
            var ordertat = res.Data;
            var groupedData = _.groupBy(ordertat, 'PatientOrder.TestTypeId');
            for (var idx in groupedData) {
                var grouped = groupedData[idx];
                console.log(grouped);
                for (var jdx in grouped) {
                    var data = grouped[jdx];

                    if (data.ReleasedOn) {
                        var startTime = moment(data.OrderedOn, 'hh:mm:ss a');
                        var endTime = moment(data.ReleasedOn, 'hh:mm:ss a');
                        var totalHours = (endTime.diff(startTime, 'hours'));
                        var totalMinutes = endTime.diff(startTime, 'minutes');
                        var totalseconds = endTime.diff(startTime, 'minutes');
                        var clearMinutes = totalMinutes % 60;
                        var clearseconds = totalseconds % 60;
                        console.log(totalHours + " hours and " + clearMinutes + " minutes" + clearseconds + "seconds");
                        $scope.currentcontext.totaltat = totalHours + ":" + clearMinutes + ":" + clearseconds;
                        data.TAT = $scope.currentcontext.totaltat;
                    }
                    $scope.ordertracker.push(data);
                }
            }
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
                    // { Key: 5, Value: $scope.currentcontext.oid },
                    // { Key: 6, Value: $scope.currentcontext.odid },
                    // { Key: 7, Value: $scope.currentcontext.TestId }
                ],
            };

            var options = {
                action: 'lis/ordertat/GetOrderTATs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        // function loadData() {
        //     $scope.getList();
        // }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "OrderStatus" }
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
        // loadData();
    }

    OrderTrackerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();