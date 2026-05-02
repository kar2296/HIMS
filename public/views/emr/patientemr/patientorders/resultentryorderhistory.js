(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ResultEntryorderhistoryController', ResultEntryorderhistoryController);

    function ResultEntryorderhistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.history = []
        $scope.currentcontext = {};
        $scope.items = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.oid = parseInt(modalConfig.params.oid);
            $scope.currentcontext.odid = parseInt(modalConfig.params.odid);
            $scope.currentcontext.testtypeid = parseInt(modalConfig.params.testtypeid);
            // $scope.currentcontext.TestId = parseInt(modalConfig.params.tid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data;
            $scope.items.Ordereddate = $scope.item[0].PatientOrder.OrderRequestDate;
            $scope.items.BillDate = $scope.item[0].Ordereddate;
            $scope.items.BillNumber = $scope.item[0].PatientOrder.BillNumber;
            $scope.items.CFirstName = $scope.item[0].PatientOrder.CreatedUser.FirstName;
            $scope.items.CLastName = $scope.item[0].PatientOrder.CreatedUser.LastName;
            $scope.items.CTitle = $scope.item[0].PatientOrder.CreatedUser.Title.Description;
            // $scope.items.BillDate = $scope.item[0].PatientOrder.BillDate;
            if ($scope.item[0].CreatedUser) {
                $scope.items.AcceptedFirstName = $scope.item[0].CreatedUser.FirstName;
                $scope.items.AcceptedLastName = $scope.item[0].CreatedUser.LastName;
                $scope.items.AcceptedTitle = $scope.item[0].CreatedUser.Title.Description;
            }
            if ($scope.item[0].MedUser) {
                $scope.items.MedUserFirstName = $scope.item[0].MedUser.FirstName;
                $scope.items.MedUserLastName = $scope.item[0].MedUser.LastName;
                $scope.items.MedUserTitle = $scope.item[0].MedUser.Title.Description;
            }
            if ($scope.item[0].ResultEnteredUser) {
                $scope.items.ResultEnteredTitle = $scope.item[0].ResultEnteredUser.Title.Description;
                $scope.items.ResultEnteredFirstName = $scope.item[0].ResultEnteredUser.FirstName;
                $scope.items.ResultEnteredLastName = $scope.item[0].ResultEnteredUser.LastName;
            }
            if ($scope.item[0].ReleasedByUser) {
                $scope.items.ReleasedByUserTitle = $scope.item[0].ReleasedByUser.Title.Description;
                $scope.items.ReleasedByUserFirstName = $scope.item[0].ReleasedByUser.FirstName;
                $scope.items.ReleasedByUserLastName = $scope.item[0].ReleasedByUser.LastName;
            }
            if ($scope.item[0].ResultApprovedUser) {
                $scope.items.ResultApprovedUserTitle = $scope.item[0].ResultApprovedUser.Title.Description;
                $scope.items.ResultApprovedUserFirstName = $scope.item[0].ResultApprovedUser.FirstName;
                $scope.items.ResultApprovedUserLastName = $scope.item[0].ResultApprovedUser.LastName;
            }
            $scope.items.ReleasedDate = $scope.item[0].ReleasedDate;
            $scope.items.MedValidationdate = $scope.item[0].MedValidationdate;
            $scope.items.ApprovalSubmisdate = $scope.item[0].CreatedAt;
            $scope.items.ResultEnteredByDate = $scope.item[0].TechValidationdate;
            $scope.items.ResultEnteredByName = $scope.item[0].TechValidationById;
            $scope.items.ResultApprovedDate = $scope.item[0].MedValidationdate;
            $scope.items.ResultApprovedName = $scope.item[0].MedValidationById;
            $scope.items.DepartmentId = $scope.item[0].DepartmentId;
            $scope.items.DepartmentId = $scope.item[0].DepartmentId;
            $scope.items.DepartmentId = $scope.item[0].DepartmentId;
            $scope.items.DepartmentId = $scope.item[0].DepartmentId;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.oid
                }, ],
            };
            var options = {
                action: 'lis/patientworkorder/GetPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    ResultEntryorderhistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();