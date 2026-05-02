(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleFormController', roleFormController);

    function roleFormController($scope, $stateParams, $state, $translate, utl) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        var vm = this;

        $scope.item = {
            IsActive: true,
            IsAllFacility: false
        };
        $scope.item.ActiveFrom = new Date();

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'SystemSettings/role/GetRoleById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.backToList = function () {
            $state.go('app.roles');
        }
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.addNew = function () {
            $state.go('app.roletab.general', {
                id: 0
            });
        }
        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do you want to save role?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do yo want to approve role?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    // $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $state.go('app.roletab.general', {
                    id: data
                });
            } else {
                $scope.backToList(); // Safer side added
            }
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsAllFacility == true) {
                $scope.item.FacilityId = -1;
            }
            if ($scope.item.IsAllFacility == false) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            var actionName = 'SystemSettings/role/AddRole';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'SystemSettings/role/UpdateRole';
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                Key: "Control"
            }];

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


    roleFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();