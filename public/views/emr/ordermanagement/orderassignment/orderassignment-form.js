(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderAssignmentFormController', orderAssignmentFormController);

    function orderAssignmentFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            LabAssignTypeId: 1,
            OtherFacility: [],
            AssignedById: utl.Session.getCurrentUserId(),
            Assigndate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.worderid = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.TestTypeId = parseInt(modalConfig.params.ttid);
            $scope.currentcontext.subdeptid = parseInt(modalConfig.params.subdeptid);

            if ($scope.currentcontext.TestTypeId == 1) { //lab
                $scope.currentcontext.deptcode = 8;
            } else if ($scope.currentcontext.TestTypeId == 2) { //radiology
                $scope.currentcontext.deptcode = 62;
            } else if ($scope.currentcontext.TestTypeId == 4) { //endoscopy
                $scope.currentcontext.deptcode = 60;
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.LabAssignTypeId = $scope.item.LabAssignTypeId == null ? 1 : $scope.item.LabAssignTypeId;
            $scope.item.AssignedById = $scope.item.AssignedById == null ? utl.Session.getCurrentUserId() : 1;
            $scope.item.Assigndate = $scope.item.Assigndate == null ? utl.Formatter.getCurrentDate() : $scope.item.Assigndate;
            $scope.changeAssignType($scope.item.LabAssignTypeId);
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.worderid && $scope.currentcontext.worderid > 0) {
                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorderById',
                    data: {
                        Id: $scope.currentcontext.worderid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.responseOrder = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.Accept = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.assignOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.assignOrder = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.LabAssignTypeId == 1) {
                $scope.item.FromFacilityId = utl.Session.getCurrentFacilityId();
                $scope.item.IsOtherFacility = true;
            }
            var options = {
                action: 'lis/patientworkorder/AssignOrder',
                data: {
                    Id: $scope.currentcontext.worderid,
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.responseOrder
            };
            utl.Http.doAction(options);
        };
        $scope.closePopUp = function () {
            $scope.confirmCallback();
        };
        $scope.changeAssignType = function (AssignTypeId) {
            $scope.item.OtherFacility = [];
            if (AssignTypeId == 1) {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id != utl.Session.getCurrentFacilityId()) {
                        $scope.item.OtherFacility.push($scope.lookup.Facility[idx]);
                        $scope.item.UserId = 0;
                    }
                }
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "LabAssignType"
                },
                {
                    "Key": "ExternalProvider"
                },
                {
                    "Key": "User"
                },
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
    orderAssignmentFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();