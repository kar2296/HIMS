(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('TicketExecutionController', TicketExecutionController);

    function TicketExecutionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.item = {
            AssignedOn: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            AssignTypeId: 1
        }

        $scope.currentcontext = {};
        $scope.currentcontext.CanCancelTicket = utl.Privilege.hasPrivilege('CanCancelTicket')
        $scope.currentcontext.CanDeferred = utl.Privilege.hasPrivilege('CanDeferred')
        $scope.currentcontext.CanReopen = utl.Privilege.hasPrivilege('CanReopen')
        $scope.currentcontext.CanClosed = utl.Privilege.hasPrivilege('CanClosed')
        $scope.currentcontext.CanResolved = utl.Privilege.hasPrivilege('CanResolved')
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            // $scope.item.AssignedOn = utl.Formatter.getCurrentDate();
        }


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.AssignTypeId == 1) {
                $scope.item.AssignType = 'InHouse';
            }
            if (data.AssignTypeId == 2) {
                $scope.item.AssignType = 'ExternalVendor';
            }
            if (data.AssignTypeId == 3) {
                $scope.item.AssignType = 'Institution';
            }
            if (data.AssetTicketStatusId == 1) {
                $scope.item.AssetTicketStatus = "Draft";
            }
            if (data.AssetTicketStatusId == 2) {
                $scope.item.AssetTicketStatus = "Created";
            }
            if (data.AssetTicketStatusId == 3) {
                $scope.item.AssetTicketStatus = "Assigned to FieldAgent";
            }
            if (data.AssetTicketStatusId == 4) {
                $scope.item.AssetTicketStatus = "Assigned to ExternalStockHolder";
            }
            if (data.AssetTicketStatusId == 5) {
                $scope.item.AssetTicketStatus = "Assigned to Institution";
            }
            if (data.AssetTicketStatusId == 6) {
                $scope.item.AssetTicketStatus = "Deferred";
            }
            if (data.AssetTicketStatusId == 7) {
                $scope.item.AssetTicketStatus = "Resolved";
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.AssetTicketStatus = "Closed";
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.AssetTicketStatus = "Cancelled";
            }
            if (data.AssetTicketStatusId == 8) {
                $scope.item.AssetTicketStatus = "Reopened";
            }
            $scope.applyVisibilityRules();
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

        $scope.applyVisibilityRules = function () {
            if ($scope.item.AssetTicketStatusId == 3) {
                $scope.CanShowDeferred = true;
                $scope.CanShowReopen = false;
                $scope.CanShowFields = false;
                $scope.CanShowClosed = false;
                $scope.CanShowCancel = true;
                $scope.CanShowResolved = true;
            }
            if ($scope.item.AssetTicketStatusId == 4) {
                $scope.CanShowDeferred = true;
                $scope.CanShowReopen = false;
                $scope.CanShowFields = false;
                $scope.CanShowClosed = false;
                $scope.CanShowCancel = true;
                $scope.CanShowResolved = true;
            }
            if ($scope.item.AssetTicketStatusId == 5) {
                $scope.CanShowDeferred = true;
                $scope.CanShowReopen = false;
                $scope.CanShowFields = false;
                $scope.CanShowClosed = false;
                $scope.CanShowCancel = true;
                $scope.CanShowResolved = true;
            }
            if ($scope.item.AssetTicketStatusId == 6) {
                $scope.CanShowDeferred = false;
                $scope.CanShowReopen = false;
                $scope.CanShowFields = false;
                $scope.CanShowClosed = false;
                $scope.CanShowCancel = true;
                $scope.CanShowResolved = true;
            }
            if ($scope.item.AssetTicketStatusId == 7) {
                $scope.CanShowDeferred = false;
                $scope.CanShowReopen = true;
                $scope.CanShowFields = true;
                $scope.CanShowClosed = true;
                $scope.CanShowCancel = false;
                $scope.CanShowResolved = false;
            }
            if ($scope.item.AssetTicketStatusId == 8) {
                $scope.CanShowDeferred = false;
                $scope.CanShowReopen = false;
                $scope.CanShowFields = false;
                $scope.CanShowClosed = false;
                $scope.CanShowCancel = false;
                $scope.CanShowResolved = false;
            }
            if ($scope.item.AssetTicketStatusId == 10) {
                $scope.CanShowDeferred = true;
                $scope.CanShowReopen = false;
                $scope.CanShowFields = false;
                $scope.CanShowClosed = false;
                $scope.CanShowCancel = false;
                $scope.CanShowResolved = true;
            }
        }
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
        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };
        $scope.downloadFile = function (item) {
            var inputData = { FilePath: item.FilePath };
            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequestFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.download = function (item) {
            $scope.downloadFile(item);
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {

            if ($scope.item.AssetTicketStatusId == 10) {
                if (!$scope.item.ReopenComments) {
                    utl.Alert.showErrorMsg($translate.instant('assetmanagement.servicerequest.entercomment.lbl'));
                    return;
                }
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

        $scope.Resolved = function () {
            $scope.item.AssetTicketStatusId = 7;
            $scope.item.ResolvedBy = utl.Session.getCurrentUserId();
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.resolvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.Deferred = function () {
            $scope.item.AssetTicketStatusId = 6;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.defermsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.Closed = function () {
            $scope.item.AssetTicketStatusId = 8;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.closemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.Reopened = function () {
            $scope.item.AssetTicketStatusId = 10;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.reopenmsg.lbl',
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
                { "Key": "AssetAssignType", "Default": false },
                { "Key": "Priority" },
                { "Key": "AssetTicketStatus" },
                { "Key": "VendorMaster" },
                {"Key": "Company" },
                { "Key": "Rating", "Default": false },
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

    TicketExecutionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();