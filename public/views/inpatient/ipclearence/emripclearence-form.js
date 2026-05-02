(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('emripclearenceFormController', emripclearenceFormController);

    function emripclearenceFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.item = {};
        $scope.item = [];
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.currentcontext = {};
        if ($stateParams.id) {
            $scope.currentcontext.encounterid = parseInt($stateParams.id);
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.encounterid = parseInt(modalConfig.params.EncounterId);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data || [];
        };
        $scope.getItem = function () {
            var inputData = {
                Params: [
                    {
                        Key: 8,
                        Value: $scope.currentcontext.encounterid
                    },
                    // {
                    //     Key: 7,
                    //     Value: $scope.currentfilter.patientid
                    // },
                ],
            };

            var options = {
                action: 'IPManagement/IPClearence/GetIPClearences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };

            utl.Http.doAction(options);
        };
        // $scope.getItem = function (pageNo) {
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         var options = {
        //             action: 'IPManagement/IPClearence/GetIPClearenceById',
        //             data: {
        //                 Id: $scope.currentcontext.id
        //             },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };
        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to complete ipclearence?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.IPClearenceStatusId = 2;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.saveItem = function () {
            var actionName = 'IPManagement/IPClearence/AddIPClearence';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'IPManagement/IPClearence/UpdateIPClearence';
            }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getItem();
    }

    emripclearenceFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();