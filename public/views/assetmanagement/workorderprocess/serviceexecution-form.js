(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceExecutionFormController', serviceExecutionFormController);

    function serviceExecutionFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        $scope.item = {
            PriorityId: -1,
            ClosedOn: utl.Formatter.getCurrentDate(),
            WorkCompletedOn: utl.Formatter.getCurrentDate(),
            ServiceTypeId: -1,
            WOStatusId: -1,
            AssetAssignType: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            ClosedById: utl.Session.getCurrentUserId(),
        };

        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.assetid = parseInt($stateParams.id);

        //Sign related code starts
        $scope.openSignModal = function () {
            utl.Modal.open('sign-modal', {
                params: {},
                confirmCallback: refreshSign
            }
            );
        }

        function refreshSign(signatureData) {
            $scope.item.signimagedata = signatureData;
            if (signatureData) {
                $scope.item.signdata = signatureData.split(',')[1];
            }
        }
        //Sign related code ends
        $scope.visiblityRule = function () {
            if ($scope.item.AssetTicketStatusId == 1 || $scope.currentcontext.assetid == 0) {
                $scope.backBtn = true;
                $scope.cancelBtn = true;
                $scope.assignBtn = true;
                $scope.saveBtn = true;
                $scope.approveBtn = true;
                $scope.clearBtn = true;
                $scope.completedBtn = true;
            } else if ($scope.item.AssetTicketStatusId == 2) {
                $scope.backBtn = false;
                $scope.cancelBtn = false;
                $scope.assignBtn = false;
                $scope.saveBtn = false;
                $scope.approveBtn = false;
                $scope.clearBtn = false;
                $scope.completedBtn = false;
                $scope.assigned = false;
            } else if ($scope.item.AssetTicketStatusId == 3) {
                $scope.backBtn = true;
                $scope.cancelBtn = true;
                $scope.printBtn = true;
                $scope.assignBtn = false;
                $scope.saveBtn = true;
                $scope.approveBtn = false;
                $scope.clearBtn = false;
                $scope.completedBtn = true;
                $scope.assigned = true;
            } else if ($scope.item.AssetTicketStatusId == 4 || $scope.item.AssetTicketStatusId == 5) {
                $scope.backBtn = true;
                $scope.cancelBtn = false;
                $scope.printBtn = true;
                $scope.assignBtn = false;
                $scope.saveBtn = false;
                $scope.approveBtn = false;
                $scope.clearBtn = false;
                $scope.completedBtn = false;

            }
        }
        $scope.getCreatedUserCallback = function (scope, res, options, hasError) {
            $scope.CreatedUser = res.Data[0];
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getCreatedUser = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.id }
                ]
            };

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCreatedUserCallback
            };

            utl.Http.doAction(options);
        };
        //GetUserSignPic
        $scope.getEndUserSignPicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.SignPhoto = data;
        };

        $scope.getEndUserSignPic = function () {
            if ($scope.item.SignPath) {
                var inputData = { SignPath: $scope.item.SignPath };
                var options = {
                    action: 'AssetManagement/ServiceRequest/GetEndUserSignPic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getEndUserSignPicCallback
                };
                utl.Http.doAction(options);
            }
        };
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
            $scope.getEndUserSignPic();
            $scope.getCreatedUser();
            $scope.applyVisibilityRules();

        };

        $scope.getItem = function (pageNo) {

            if ($scope.currentcontext.assetid && $scope.currentcontext.assetid > 0) {
                $scope.IsDisbled = false;
                var options = {
                    action: 'AssetManagement/ServiceRequest/GetServiceRequestById',
                    data: { Id: $scope.currentcontext.assetid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            $scope.visiblityRule();
        };

        $scope.backToList = function () {
            $state.go('app.workorderprocesstab.processmyorders');
        }
        //  $scope.populateEstimateDisDate = function () {
        //     if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.WorkCompletedOn && $scope.item.WorkCompletedOn != '') {
        //         var WorkCompletedOn = new Date($scope.item.WorkCompletedOn);
        //         $scope.item.ExceptedDisDate = new Date(WorkCompletedOn.getFullYear(),
        //             WorkCompletedOn.getMonth(),
        //             WorkCompletedOn.getDate() + parseInt($scope.item.ALOS));
        //     }
        // }


        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {

                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowApproveBtn = true;


            } else {
                $scope.canShowCancelRequestBtn = false;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowApproveBtn = true;

                if ($scope.item.AssetTicketStatusId == 1) { //draft
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = true;

                }

                if ($scope.item.AssetTicketStatusId == 2) { //created
                    $scope.canShowCancelRequestBtn = true;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;


                }

                if ($scope.item.AssetTicketStatusId == 3) { //assigned
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowCompleteBtn = true;
                    $scope.canShowHoldBtn = true;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 4) { //processed
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 5) { //Deferred
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 6) { //solved
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                    $scope.canShowCloseBtn = true;
                }
                if ($scope.item.AssetTicketStatusId == 7) { //resolved
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
                if ($scope.item.AssetTicketStatusId == 8) { //closed
                    $scope.canShowCancelRequestBtn = false;
                    $scope.canShowBackBtn = true;
                    $scope.canShowPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowApproveBtn = false;
                }
            }
        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

        $scope.save = function () {
            if ($scope.currentcontext.assetid == 0) { $scope.item.AssetTicketStatusId = 1; }

            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AssetTicketStatusId = 2;
            $scope.saveItem();


        };
        $scope.saveAndAssign = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AssetTicketStatusId = 3;
            $scope.saveItem();
        }
        $scope.saveAndComplete = function () {
            $scope.item.AssetTicketStatusId = 6;

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.completemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveAndHold = function () {
            $scope.item.AssetTicketStatusId = 7;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'assetmanagement.servicerequest.onholdmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveAndClose = function () {
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
        $scope.onCancelConfirmed = function () {
            $scope.item.AssetTicketStatusId = 5;
            var actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.CancelRequest = function () {
            utl.Dialog.confirmCancel($scope.onCancelConfirmed, $scope.currentcontext.id, $scope.item.TicketNumberIdentifier);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };


        // $scope.changeServiceRateCategory = function (selectedItem) {
        //     $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategory.Id;
        // }
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'AssetManagement/ServiceRequest/AddServiceRequest';
            if ($scope.currentcontext.assetid && $scope.currentcontext.assetid > 0) {
                actionName = 'AssetManagement/ServiceRequest/UpdateServiceRequest';
                if ($scope.item.AssetTicketStatusId == 1) {
                    $scope.item.AssetTicketStatusId = 2;
                }
            }

            // var options = {
            //     action: actionName,
            //     data: { Data: $scope.item },
            //     type: 'post',
            //     onComplete: $scope.saveItemCallback
            // };
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.currentcontext.file = null;
                    $scope.backToList();
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };



        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }

        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initAllLookup = function () {
            var inputData = [
                { "Key": "Severity" },
                { "Key": "AssetTicketStatus" },
                { "Key": "PRIORITY" },
                { "Key": "ServiceType" },
                { "Key": "AssetType" },
                { "Key": "AssetAssignType" },
                { "Key": "User" },
                { "Key": "Department" },
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
                {
                    "Key": "CreatedUser",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    },
                    Default: false
                },



            ]
            $scope.lookupCall(inputData);
            $scope.getItem();
        }

        $scope.initAllLookup();
    }
    serviceExecutionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();