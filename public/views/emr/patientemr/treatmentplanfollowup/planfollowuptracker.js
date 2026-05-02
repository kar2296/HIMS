(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PlanFollowupTrackerController', PlanFollowupTrackerController);

    function PlanFollowupTrackerController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            FollowupBy: utl.Session.getCurrentUserId(),
            FollowupByName: utl.Session.getCurrentUserName()
        };
        $scope.lookup = {};

        $scope.currentcontext = {
            id: -1,
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (!$scope.item.FollowupBy) {
                $scope.item.FollowupBy = utl.Session.getCurrentUserId();
                $scope.item.FollowupByName = utl.Session.getCurrentUserName();
            }
            if ($scope.item.FollowupUser) {
                if ($scope.item.FollowupUser.Title) {
                    $scope.item.FollowupByName = $scope.item.FollowupUser.Title.Description;
                }
                if ($scope.item.FollowupUser.FirstName) {
                    $scope.item.FollowupByName += ' ' + $scope.item.FollowupUser.FirstName;
                }
                if ($scope.item.FollowupUser.LastName) {
                    $scope.item.FollowupByName += ' ' + $scope.item.FollowupUser.LastName;
                }
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/TreatmentPlanFollowup/GetTreatmentPlanFollowupById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.complete = function () {
            $scope.item.FollowupStatusId = 2;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();

        };


        $scope.saveItem = function () {

            // if (status == 2) {
            //     $scope.item.FollowupTrackerStatusId = 2;
            // }

            // if (status == 3) {
            //     $scope.item.FollowupTrackerStatusId = 3;
            // }

            // if (status == 4) {
            //     $scope.item.FollowupTrackerStatusId = 4;
            // }

            var actionName = 'emr/TreatmentPlanFollowup/UpdateTreatmentPlanFollowup';
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
        };

        $scope.initLookup = function () {
            var inputData = [
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


    PlanFollowupTrackerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();