(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorchecklistFormController', guarantorchecklistFormController);

    function guarantorchecklistFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;
        $scope.currentcontext = {
            guarantorid: parseInt($stateParams.gid)
        };
        $scope.Details = [];
        function getNewItem() {
            var detail = {
                GuarantorId: $scope.currentcontext.guarantorid,
                Id: 0,
                Status: 1,
            };
            return detail;
        }

        $scope.addNewLineItem = function () {
            var detail = getNewItem();
            $scope.Details.push(detail);
        }
        $scope.IsNewChecklist = true;

        $scope.$parent.addNew = $scope.addNewLineItem;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.IsNewChecklist = false;
                $scope.Details = data.Data;
                $scope.addNewLineItem();
            }
            else $scope.addNewLineItem();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.guarantorid && $scope.currentcontext.guarantorid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.guarantorid }
                    ]
                };
                var options = {
                    action: 'generalmaster/GuarantorChecklist/GetGuarantorChecklists',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.guarantortab.general');
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };
        function getLinesForSave() {
            var result = [];
            if ($scope.IsNewChecklist) {
                for (var idx in $scope.Details) {
                    var item = $scope.Details[idx];
                    if (item.Title.length > 0 && item.Status == 1) {
                        result.push(item);
                    }
                }
                return result;
            }
            else {
                for (var idx in $scope.Details) {
                    var item = $scope.Details[idx];
                    if (item.Title && item.Title.length > 0) {
                        result.push(item);
                    }
                }
                return result;
            }

        }
        $scope.saveItem = function () {
            var Details = getLinesForSave();
            var inputData = { Data: Details };
            var options = {
                action: 'generalmaster/GuarantorChecklist/ManageGuarantorChecklist',
                data: inputData,
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            var lastidx = $scope.Details.length - 1;
            if ($scope.Details.indexOf(item) === lastidx) {
                $scope.addNewLineItem();
            }
        }

        $scope.deleteDetail = function (item) {
            var lastidx = $scope.Details.length - 1;
            if ($scope.Details.indexOf(item) !== lastidx) {
                var name = item.Title || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        }
        $scope.clear = function () {
            $scope.Details = [];
            $scope.addNewLineItem();
        }
        $scope.getItem();
    }

    guarantorchecklistFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig'];
})();