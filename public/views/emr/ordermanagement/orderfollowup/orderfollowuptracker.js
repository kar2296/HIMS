(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderFollowupTrackerController', OrderFollowupTrackerController);

    function OrderFollowupTrackerController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
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

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function() {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/OrderFollowup/GetOrderFollowupById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.complete = function() {
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

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();

        };


        $scope.saveItem = function() {

            // if (status == 2) {
            //     $scope.item.FollowupTrackerStatusId = 2;
            // }

            // if (status == 3) {
            //     $scope.item.FollowupTrackerStatusId = 3;
            // }

            // if (status == 4) {
            //     $scope.item.FollowupTrackerStatusId = 4;
            // }

            var actionName = 'emr/OrderFollowup/UpdateOrderFollowup';
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function() {
            var inputData = [{
                "Key": "User",
                Request: {
                    Params: [{
                            Key: 3,
                            Value: 1
                        },
                        {
                            Key: 33,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }
                    ]
                }
            }, ];

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


    OrderFollowupTrackerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();