(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('clinicalordersCurrentListController', clinicalordersCurrentListController);

    function clinicalordersCurrentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
            $scope.item={};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.PatientId = $stateParams.pid;
        else
            $scope.currentcontext.PatientId = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.EncounterId = $stateParams.eid;
        else
            $scope.currentcontext.EncounterId = parseInt(utl.Session.getEncounterId());

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.IsBillLocked = $scope.currentcontext.encounter.IsBillLock;
        }
        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = res.Data;
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                    $scope.currentcontext.id=item.Id;
                if (item.BillingId) {
                    $scope.item.BillingId = item.BillingId;
                }
                    if(item.OrderStatusId){
                $scope.item.OrderStatusId = item.OrderStatusId;
                    }
                // $scope.item.BillingId = item.BillingId;
                if (idx === 0) {
                    item.CanShowDetails = true;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.PatientId
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.EncounterId
                },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        };
        $scope.clinicalordercancel = function (entity) {
            if (!$scope.IsDisabled) {
                utl.Modal.openFixedDialog('patientemr.clinicalordercancel', {
                    params: {
                        id: entity.Id,
                        pid: $scope.currentcontext.PatientId,
                        bid: entity.BillingId,
                        osid: entity.OrderStatusId,
                        eid: $scope.currentcontext.EncounterId,
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'repeat') {
                $state.go('patientemr.clinicalordertab.clinicalorders', {
                    cid: entity.Id,
                    pid: $scope.currentcontext.PatientId
                });
            } else if (actionType == 'print') {
                $scope.OrderPrint(entity);
            } else if (actionType == 'cancel') {
                if (!$scope.IsBillLocked) {
                    // $scope.clinicalordercancel(entity);
                    $scope.SaveCancelled(entity, 2);
                } else {
                    var msg = '';
                    msg = 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                }
            }
        };

        $scope.OrderPrint = function (entity) {
            var inputData = {
                Id: entity.Id
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.CancelCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.SaveCancelled = function (entity, StatusId) {
            var inputData = {
                Header: {
                    Id: entity.Id,
                    OrderStatusId: StatusId,
                    PatientBillStatusId: 2,
                    BillingId: entity.BillingId
                },
                Details: entity.PatientOrderDetails
            };
            var options = {
                action: 'emr/patientorder/UpdateCancelPatientOrder',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.CancelCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getList();
    }

    clinicalordersCurrentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();