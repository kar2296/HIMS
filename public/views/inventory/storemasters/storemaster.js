(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('storeMasterFormController', storeMasterFormController);

    function storeMasterFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.item = {
            IsActive: true,
            IsWhatsapp: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            isDisabled: false
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.file = null;
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();
        $scope.pharseqbasedonstore = 0;
        $scope.pharseqbasedonstore = utl.FacilitySetting.getFacilitySettingValue('general', 'pharseqbasedonstore');

        $scope.getStoreLogoCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Logo = data.Logo;
        };

        $scope.getStoreLogo = function() {
            if ($scope.item.LogoPath) {
                var inputData = { Id: $scope.item.Id, LogoPath: $scope.item.LogoPath };
                var options = {
                    action: 'pharmacy/storemaster/GetStoreMasterLogo',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getStoreLogoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.OldActive = $scope.item.IsActive;
            $scope.getStoreLogo();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/storemaster/GetStoreMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.storemasters');
        };

        $scope.clear = function() {
            $scope.item = {};
        };

        $scope.addNew = function() {
            $state.go('app.storemaster', { id: 0 });
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof(data) == "boolean") {
                if (options && options.data !== null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof(data) == "number") {
                $state.go('app.storemastertab.storemaster', { id: data, IsProfile: null, StoreCode: options.data.Data.StoreCode, StoreName: options.data.Data.StoreName, StoreTypeId: options.data.Data.StoreTypeId });
            } else {
                $scope.backToList();
            }
        };

        $scope.save = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.storemaster.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.storemaster.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.isactivechange = function() {
            if ($scope.item.OldActive == item.IsActive) {
                $scope.item.IsActivechanged = false;
            }
            if ($scope.item.OldActive != item.IsActive) {
                $scope.item.IsActivechanged = true;
            }
        }

        $scope.onSaveandApproveConfirmed = function() {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            if ($scope.item.CanSeeToStoreQty) {
                $scope.item.AllowOpenRequest = $scope.item.AllowOpenRequest;
            } else {
                $scope.item.AllowOpenRequest = 0;
            }
            $scope.saveItem();
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'pharmacy/storemaster/AddStoreMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/storemaster/UpdateStoreMaster';
            }
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function(resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        $scope.currentcontext.file = null;
                        $scope.backToList();
                    },
                    function(resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function(evt) {
                        console.log(evt);
                    });
                return false;
            } else
                var options = {
                    action: actionName,
                    data: { Data: $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Organization" },
                { "Key": "Location" },
                { "Key": "Department" },
                { "Key": "StoreType" },
                { "Key": "StoreSubType" },
                { "Key": "StorePolicy" },
                { "Key": "StorePrivillages" },
                { "Key": "PrinterOption" },
                { "Key": "SequenceOption", Default: false }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        };

        $scope.initLookup();
    }

    storeMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();