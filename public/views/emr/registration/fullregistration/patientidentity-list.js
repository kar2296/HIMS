(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientidentityListController', patientidentityListController);

    function patientidentityListController($scope, $stateParams, $state, $translate, utl, $filter, Upload) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));
        $scope.currentfilter = {
            name: ''
        };

        $scope.currentcontext = {};
        $scope.currentcontext.patientid = parseInt($stateParams.id);
        $scope.currentcontext.canShowUpload = false;

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                Status: 1,
                StatusId: true,
                ImagePath: '',
                canShowUpload: $scope.currentcontext.canShowUpload
            };
            vm.items.push(lineItem);
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.items = data;
            for (var idx in vm.items) {
                if (vm.items[idx].Id > 0)
                    $scope.currentcontext.canShowUpload = true;
            }
            $scope.addNewLineItem();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.patientid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientIdentity/GetPatientIdentitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            $scope.addNewLineItem();
        };

        $scope.upload = function (item) {
            utl.Modal.open('app.patientiddocs', {
                params: { id: item.Id, pid: $scope.currentcontext.patientid },
                confirmCallback: $scope.getList
            });
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        };

        $scope.deleteItem = function (idx, item) {
            var name = item.IDNumber || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    for (var idx in options.data.Data)
                        $scope.currentcontext.id = options.data.Data[idx].Id;
                }
            }
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();

                var options = {
                    action: 'registration/PatientIdentity/ManagePatientIdentities',
                    data: { Data: lines },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [
                { search: 1, fields: ['Status'] }
            ]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.IDNumber) {
                    continue;
                }
                else if (item.PatientIdentityTypeId == -1 || !item.IDNumber) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        };

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.IDNumber) {
                    item.PatientId = $scope.currentcontext.patientid;
                    result.push(item);
                }
            }
            return result;
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PatientIdentityType" }
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

    patientidentityListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'Upload'];

})();