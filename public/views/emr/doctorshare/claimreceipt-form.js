(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimReceiptFormController', claimReceiptFormController);

    function claimReceiptFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.Id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            TaskStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.Canshowassignbtn = true;
        $scope.Canshowcancelbtn = false;
        $scope.Canshowcompletebtn = false;
        $scope.backToList = function () {
            $state.go('app.mytaskform');
        };
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        $scope.getItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            if ($scope.item.TaskStatusId == 1) {
                $scope.Canshowassignbtn = true;
                $scope.Canshowcancelbtn = true;
                $scope.Canshowcompletebtn = true;
            }
            if ($scope.item.TaskStatusId == 2) {
                $scope.Canshowassignbtn = false;
                $scope.Canshowcancelbtn = false;
                $scope.Canshowcompletebtn = false;
            }
            if ($scope.item.TaskStatusId == 3) {
                $scope.Canshowassignbtn = false;
                $scope.Canshowcancelbtn = false;
                $scope.Canshowcompletebtn = false;
            }

        };

        $scope.getItem = function () {
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                var inputData = {
                    Params: [{
                        Key: 11,
                        Value: $scope.currentcontext.Id
                    }]
                };

                var options = {
                    action: 'billing/InsurancePaymentDetails/GetInsurancePaymentDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.saveandApprove = function () {
            $scope.item.TaskStatusId = 1;
            $scope.item.AssignedFrom = utl.Session.getCurrentUserId();
            $scope.item.AssignedFromDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };
        $scope.saveandcomplete = function () {
            $scope.item.TaskStatusId = 2;
            $scope.saveItem();
        };

        $scope.saveandcancel = function () {
            $scope.item.TaskStatusId = 3;
            $scope.saveItem();
        };



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "TaskType"
                },
                {
                    "Key": "Priority"
                },
                {
                    Key: 'User',
                    Request: {
                        Params: [{ Key: 5, Value: 2 },
                        { Key: 3, Value: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12] }]

                    }
                },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    claimReceiptFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();