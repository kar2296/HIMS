(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDeathRecordFormController', patientDeathRecordFormController);

    function patientDeathRecordFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {};

        $scope.currentcontext = {};
        $scope.currentcontext.isNotReverse = true;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback($scope.item);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback($scope.item);
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!utl.Validator.validate($scope) && $scope.currentcontext.isNotReverse) {
                return;
            }
            if (utl.Formatter.isFutureDate($scope.item.DeathDate)) {
                utl.Alert.showErrorMsg($translate.instant('registration.patientdeathrecord-form.death-cant-future-msg.lbl'));
                return;
            }
            $scope.item.DeathUpdatedBy = utl.Session.getCurrentUserId();
            $scope.item.DeathUpdatedDate = utl.Formatter.getCurrentDate();

            var actionName = 'registration/patient/UpdatePatient';

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.approveItem = function () {
            $scope.item.PatientStatus = "Deceased";
            if ($scope.item.DeathConfirmedBy) {
                $scope.item.DeathApprovedBy = $scope.item.DeathConfirmedBy;
            } else {
                $scope.item.DeathApprovedBy = utl.Session.getCurrentUserId();
            }
            $scope.saveItem();
        }

        $scope.reverseItem = function () {
            $scope.item.DeathDate = null;
            $scope.item.DeathTypeId = -1;
            $scope.item.DeathPlaceId = -1;
            $scope.item.IsDeathConfirmed = 0;
            $scope.item.DeathConfirmedBy = -1;
            $scope.item.DeathComents = '';
            $scope.item.PatientStatus = "Active";
            $scope.currentcontext.isNotReverse = false;
            $scope.saveItem();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DeathType" },
                { "Key": "DeathPlace" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
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

    patientDeathRecordFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();