(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientFollowUpFormController', PatientFollowUpFormController);

    function PatientFollowUpFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FollowupStatusId:1
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.item.EncounterId = parseInt(modalConfig.params.eid);
            $scope.Encounter = (modalConfig.params.encounter);
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.DoctorId = $scope.Encounter.DoctorId;
            $scope.item.DoctorName = $scope.Encounter.DoctorName;
            if ($scope.Encounter.Procedure)
                $scope.item.RecomendedProcedure = $scope.Encounter.Procedure.ProcedureName;
            $scope.item.DepartmentId = $scope.Encounter.DepartmentId;
            $scope.item.UnitId = $scope.Encounter.TeamId;
            if ($scope.Encounter.UserTeam)
                $scope.item.UserTeam = $scope.Encounter.UserTeam.Team.Description;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.RecomendedProcedure = $scope.item.RecomendedProcedure;
            $scope.item.UserTeam = $scope.item.Team.Description;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'registration/patientfollowup/GetPatientFollowupById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        // };

        // $scope.getList = function (pageNo) {
        //     var inputData = {
        //         Params: [
        //             { Key: 9, Value: $scope.currentcontext.encounterid }
        //         ],
        //         PageContext: {
        //             // PageSize: vm.gridConfig.pagerObj.pageSize,
        //             PageNumber: vm.gridConfig.pagerObj.currentPage
        //         }
        //     };

        //     var options = {
        //         action: 'registration/patientfollowup/GetPatientFollowups',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getListCallback
        //     };

        //     utl.Http.doAction(options);
        // };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.save = function () {
            $scope.item.FollowupStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {

            if ($scope.item.IsActive) {
                $scope.item.FollowupStatusId = 2;
            }
            else {
                $scope.item.FollowupStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'registration/patientfollowup/Addpatientfollowup';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'registration/patientfollowup/Updatepatientfollowup';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            //$scope.getList();
            // if ($scope.item.Activefrom == null)
            //     $scope.item.Activefrom = new Date();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "FollowupStatus" },
                { "Key": "Facility" },
                { "Key": "FollowupType" },


            ]
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

    PatientFollowUpFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();