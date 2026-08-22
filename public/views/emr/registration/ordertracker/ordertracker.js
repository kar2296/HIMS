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

        // ---------------------------------------------------------------------
        // React bridge (hollow-controller pattern). All real logic above is
        // UNCHANGED -- getList/getListCallback/initLookup/lookupCallback/
        // backToList still own every API call and business rule. This block
        // only wraps the existing callback (save original ref, call it, then
        // refresh reactProps) and dispatches React's one action back into the
        // SAME unchanged controller functions. Nothing here alters what the
        // real functions do.
        //
        // Real, disclosed pre-existing bugs/dead-code preserved as-is, NOT
        // fixed here -- see the top-of-file comment block in
        // OrderTrackerScreen.tsx for the full writeup:
        // - $scope.print is dispatched below exactly as the real
        //   ng-click="print()" called it -- $scope.print is NEVER DEFINED
        //   anywhere in this controller, so this throws
        //   "$scope.print is not a function" today, on purpose, not patched
        //   into a working print.
        // - $scope.backToList / $scope.cancelCallback have zero live call
        //   sites in the real template (the only button that could call
        //   cancelCallback is commented out) -- not wired to anything here
        //   either.
        // - The TAT string in each row (item.TAT) is computed entirely by the
        //   untouched getListCallback above, including its pre-existing
        //   totalseconds/totalMinutes copy-paste bug -- this bridge only
        //   forwards whatever string is already there.
        // ---------------------------------------------------------------------

        function updateReactProps() {
            $scope.reactProps = {
                ordertracker: $scope.ordertracker || []
            };
        }

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            updateReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'print':
                    $scope.print();
                    break;
            }
        };

        updateReactProps();
    }

    OrderTrackerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();