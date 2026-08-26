(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('opbillinginfoFormController', opbillinginfoFormController);

function opbillinginfoFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    angular.extend(this, utl.Ctrl.getBaseCtrl({$scope: $scope}));

    $scope.item = {
        IsActive : true
    };

    $scope.currentcontext =  {};
    $scope.currentcontext.id = parseInt($stateParams.id);

    $scope.getItemCallback = function (scope, data, options, hasError) {
        $scope.item = data;
        $scope.refreshReactProps();
    };

    $scope.getItem = function (pageNo) {
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

            var options = {
                action: 'generalmaster/opbillinginfoMaster/GetopbillinginfoMasterById',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    $scope.backToList = function () {
       $state.go('app.opbilling');
    }

    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.backToList();
    };

    $scope.saveItem = function () {

        if(!utl.Validator.validate($scope)) {
            return;
        }

        var actionName = 'generalmaster/opbillinginfoMaster/AddopbillinginfoMaster';
        if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            actionName = 'generalmaster/opbillinginfoMaster/UpdateopbillinginfoMaster';
        }

        var options = {
            action: actionName,
            data: {Data : $scope.item },
            type: 'post',
            onComplete: $scope.saveItemCallback
        };
        utl.Http.doAction(options);
    };

    //React bridge: replaces the 5 structurally identical <ui-select>
    //fields (Priority, Guarantor Type, Doctor Name, Department, Order To
    //Location). None have ng-change/ng-disabled in the original.
    $scope.handleReactAction = function (actionType, payload) {
        if (actionType == 'priorityChange') {
            $scope.item.PriorityId = payload.id;
        } else if (actionType == 'guarantorTypeChange') {
            $scope.item.GuarantorTypeId = payload.id;
        } else if (actionType == 'doctorNameChange') {
            $scope.item.DoctorName = payload.id;
        } else if (actionType == 'departmentChange') {
            $scope.item.DepartmentId = payload.id;
        } else if (actionType == 'toLocationChange') {
            $scope.item.ToLocationId = payload.id;
        }
        $scope.refreshReactProps();
    };

    $scope.refreshReactProps = function () {
        $scope.reactPropsContainer = {
            reactProps: {
                priorityOptions: ($scope.lookup && $scope.lookup.Priority) || [],
                priorityId: $scope.item.PriorityId,
                guarantorTypeOptions: ($scope.lookup && $scope.lookup.GuarantorType) || [],
                guarantorTypeId: $scope.item.GuarantorTypeId,
                doctorNameOptions: ($scope.lookup && $scope.lookup.DoctorName) || [],
                doctorNameId: $scope.item.DoctorName,
                departmentOptions: ($scope.lookup && $scope.lookup.Department) || [],
                departmentId: $scope.item.DepartmentId,
                toLocationOptions: ($scope.lookup && $scope.lookup.ToLocation) || [],
                toLocationId: $scope.item.ToLocationId
            },
            onAction: $scope.handleReactAction
        };
    };

    $scope.refreshReactProps();

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getItem();
        $scope.refreshReactProps();
    }

    $scope.initLookup = function () {
        var inputData = [
                            {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
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

opbillinginfoFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();