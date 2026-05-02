(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointementreqconfirmController', appointementreqconfirmController);

    function appointementreqconfirmController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.lookup = {};

        $scope.currentcontext = {
            FrmDeptId: -1,
            ToDeptId: -1,
            PriorityId: 3,
            RequestTypeId: 8,
            patientinfo: null,
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.patientinfo = modalConfig.params.patientinfo;
            $scope.currentcontext.FrmDeptId = modalConfig.params.FrmDeptId;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.save = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'worklists.requestmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.saveItem = function () {
            if(!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'IPManagement/filerequest/ManageFileRequestFromApptReq';
            var options = {
                action: actionName,
                data: { Data : $scope.currentcontext },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.getMRDDepartmentsCallback = function (scope, data, options, hasError) {
            $scope.department = data.Data[0];
            $scope.currentcontext.ToDeptId = $scope.department.Id;
        };
        $scope.getMRDDepartments = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 7, Value: true }
                ]
            };
            var options = {
                action: 'SystemSettings/department/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMRDDepartmentsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getMRDDepartments();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "Priority" },
                { "Key": "MRDRequestType" },
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

    appointementreqconfirmController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();
