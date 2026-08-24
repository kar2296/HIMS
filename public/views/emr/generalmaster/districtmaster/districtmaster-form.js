(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('districtMasterFormController', districtMasterFormController);

    function districtMasterFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            isDisabled: false,
        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.ActiveStatusId == 2)
                $scope.item.isRequested = true;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/DistrictMaster/GetDistrictMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/DistrictMaster/AddDistrictMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/DistrictMaster/UpdateDistrictMaster';
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Country" },
                { "Key": "State" },
                { "Key": "District" },
                { "Key": "City" },
                { "Key": "ActiveStatus" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // REACT BRIDGE (GeneralMaster / District Master add-edit modal):
        // hollow-controller pattern -- real logic above (getItem/getItemCallback's
        // real GetDistrictMasterById call, save()/saveandApprove()/saveItem()'s real
        // utl.Validator.validate + AddDistrictMaster/UpdateDistrictMaster calls,
        // backToList's real $uibModalInstance.close via confirmCallback, and
        // $scope.cancelCallback = $uibModalInstance.dismiss set above) is completely
        // untouched. This form needs both getItemCallback AND lookupCallback wrapped
        // since lookupCallback populates lookup.State/lookup.Country before getItem()
        // runs.
        //
        // NOTE (pre-existing bug, not introduced or fixed here): same as City/State/
        // Country Master, the live template's "Save & Approve" button calls
        // ng-click="saveAndApprove()", but this controller only ever defined
        // $scope.saveandApprove (lowercase 'and') -- so that button has always
        // silently no-op'd in production. Preserved exactly as-is.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: $scope.item,
                lookup: {
                    State: ($scope.lookup && $scope.lookup.State) || [],
                    Country: ($scope.lookup && $scope.lookup.Country) || []
                }
            };
        };

        var _origGetItemCallback = $scope.getItemCallback;
        $scope.getItemCallback = function (scope, data, options, hasError) {
            _origGetItemCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'fieldChange') {
                angular.extend($scope.item, payload);
                $scope.refreshReactProps();
                $scope.$applyAsync();
                return;
            }
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    districtMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();