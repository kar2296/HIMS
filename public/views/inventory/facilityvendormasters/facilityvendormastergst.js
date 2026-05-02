(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityvendorMasterGSTController', facilityvendorMasterGSTController);

    function facilityvendorMasterGSTController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.item = {
            ActiveFrom: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {};
        $scope.currentcontext.vendorfacilitymapid = parseInt($stateParams.id);
        $scope.currentcontext.vendormasterid = $stateParams.VendorMasterId;
        $scope.currentcontext.id = 0;
        $scope.fillDefaultValues = function () { };

        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.length > 0) {
                $scope.item = data[0];
                $scope.currentcontext.id = $scope.item.Id;
            }
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.vendorfacilitymapid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/vendormastergst/GetVendorMasterGSTs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.facilityvendormasters');
        };

        $scope.back = function () {
            $state.go('app.facilityvendormastertab.facilityvendormaster');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            var actionName = 'pharmacy/vendormastergst/AddVendorMasterGST';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/vendormastergst/UpdateVendorMasterGST';
            }

            $scope.item.VendorFacilityMapId = $scope.currentcontext.vendorfacilitymapid;
            $scope.item.VendorMasterId = $scope.currentcontext.vendormasterid;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            $scope.getItem();
        }
        $scope.initLookup();
    }

    facilityvendorMasterGSTController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();