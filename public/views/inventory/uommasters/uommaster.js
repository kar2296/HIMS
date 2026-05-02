(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('uomMasterFormController', uomMasterFormController);

    function uomMasterFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
            IsAllFacility: false

        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            //   if ($scope.item.ActiveStatusId == 2) {
            //                 $scope.item.isDisabled = true;
            //             }
            //              if
            //       ($scope.item.ActiveStatusId == 3) {
            //                 $scope.item.isDisabled =true;
            //             }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/uommaster/GetUomMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.uommasters');
        }
        $scope.addNew = function () {
            $state.go('app.uommaster', { id: 0 });
        }
        $scope.clear = function () {
            $scope.item = {};
        }
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
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsAllFacility == true) {
                $scope.item.FacilityId = -1;
            }
            if ($scope.item.IsAllFacility == false) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            var actionName = 'Pharmacy/uommaster/AddUomMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Pharmacy/uommaster/UpdateUomMaster';
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
                { "Key": "UomType" },
                { "Key": "Facility" }

            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        }

        $scope.initLookup();
    }

    uomMasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();