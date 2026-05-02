(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssignmentFormController', AssignmentFormController);

    function AssignmentFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {
            AssignedOn: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            AssetAssignTypeId: 1
        }

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            // $scope.item.AssignedOn = utl.Formatter.getCurrentDate();

        }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

            if (data.AssetTicketStatusId == 1) {
                $scope.item.isRequested = false;
                $scope.item.AssetTicketStatus = "Draft";
            }
            if (data.AssetTicketStatusId == 2) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Created";
            }
            if (data.AssetTicketStatusId == 3) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Assigned";
            }
            if (data.AssetTicketStatusId == 4) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Processing/Pending";
            }
            if (data.AssetTicketStatusId == 5) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Deferred";
            }
            if (data.AssetTicketStatusId == 6) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Solved";
            }
            if (data.AssetTicketStatusId == 7) {
                $scope.item.isRequested = false;
                $scope.item.AssetTicketStatus = "Resolved";
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.isRequested = true;
                $scope.item.AssetTicketStatus = "Closed";
            }


            //   if (data.AssignTypeId == 1) {
            //     $scope.item.AssignType = "InHouse";
            // }
            $scope.getCreatedUser();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'AssetManagement/ServiceRequest/GetServiceRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.AssignedOn && $scope.item.AssignedOn != '') {
                var AssignedOn = new Date($scope.item.AssignedOn);
                $scope.item.ExpectedDate = new Date(AssignedOn.getFullYear(),
                    AssignedOn.getMonth(),
                    AssignedOn.getDate() + parseInt($scope.item.ALOS));
            }
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'AssetManagement/ServiceRequest/AddServiceRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
            }
            $scope.item.AssignedOn = utl.Formatter.getCurrentDate();

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };



        $scope.saveAndAssign = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AssetTicketStatusId = 3;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.assignmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.closePopUp = function () {
            $scope.confirmCallback();
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            if ($scope.item.AssignedOn == null)
                $scope.item.AssignedOn = new Date();

        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
                        }]
                    }
                },
                { "Key": "AssetAssignType" },
                { "Key": "Priority" },
                {
                    "Key": "AssignedUser",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    },
                    Default: false
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

    AssignmentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();