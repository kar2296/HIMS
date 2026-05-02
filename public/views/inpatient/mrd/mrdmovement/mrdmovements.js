(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MRDMovementController', MRDMovementController);

    function MRDMovementController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;


        $scope.currentcontext = {
            isModal: (modalConfig && modalConfig.params) ? true : false
        };

        $scope.currentfilter = {
            orderno: '',
            testname: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.MRDMovements = [];

        //getList
        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.MRDMovements = res.Data;
        };
        $scope.getList = function () {
            var fromdate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
                    { Key: 5, Value: $scope.currentcontext.eid },
                    { Key: 8, Value: fromdate },
                    { Key: 9, Value: todate },
                ]
            };

            var options = {
                action: 'IPManagement/MRDMovement/GetMRDMovements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
        }

        $scope.initLookup = function () {
            var inputData = [];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getList();
    }

    MRDMovementController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();