(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualAcceptanceFormController', VirtualAcceptanceFormController);

    function VirtualAcceptanceFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.OrderList = [];
        $scope.currentcontext = {};

        $scope.lookup = {};

        if ($state.params.id) {
            $scope.currentcontext.orderid = parseInt($state.params.id);
        }
        if ($state.params.pid) {
            $scope.currentcontext.pid = parseInt($state.params.pid);
        }

        //get list
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.OrderList = [];
            var result = res.Data;
            var acceptCancelCount = 0;
            for (var idx in result) {
                var item = result[idx];
                if (!item.PatientBillId) {
                    if (item.OrderStatusId == 10 || item.OrderStatusId == 2) {
                        acceptCancelCount++;
                        item.IsAllOrderSelected = true;
                        item.IsAllOrderReadOnly = true;
                        item.IsSelected = (item.OrderStatusId == 10 || item.OrderStatusId == 2) ? true : false;
                        item.IsReadOnly = (item.OrderStatusId == 10 || item.OrderStatusId == 2) ? true : false;
                    }
                    if (item.OrderStatusId == 1) {
                        item.IsSelected = (item.OrderStatusId == 10 || item.OrderStatusId == 2) ? true : false;
                        item.IsReadOnly = (item.OrderStatusId == 10 || item.OrderStatusId == 2) ? true : false;
                    }
                    if (item.PatientWorkorderdetails && item.PatientWorkorderdetails.length > 0) {
                        var workorderDetail = item.PatientWorkorderdetails[0];
                        item.AcceptedDate = workorderDetail.AcceptedDate;
                        item.WorkOrderDID = workorderDetail.PatientWorkorder ? workorderDetail.PatientWorkorder.WorkOrderdid : '';
                    }
                    item.ExternalProvider = item.Testmaster && item.Testmaster.ExternalProviderPriceMap ? item.Testmaster.ExternalProviderPriceMap : [];
                    if (item.ExternalProvider && item.ExternalProvider.length > 0) {
                        item.ExternalProvider.splice(0, 0, {
                            ExternalProviderId: -1,
                            ProviderName: 'Internal'
                        });
                        item.IsExternal = true;
                    }
                    $scope.OrderList.push(item)
                }
            }
            if (acceptCancelCount == result.length) {
                $scope.currentcontext.canDisableAcceptCancel = true;
            }

        };

        $scope.getList = function() {

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.orderid
                    },
                    {
                        Key: 13,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 20,
                        Value: 1
                    }
                ]
            };

            var options = {
                action: 'emr/patientorderdetail/GetPatientOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        //getItem
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.getList();
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.orderid && $scope.currentcontext.orderid > 0) {

                var options = {
                    action: 'emr/patientorder/GetPatientOrderById',
                    data: {
                        Id: $scope.currentcontext.orderid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.selectAllItems = function() {
            for (var idx in $scope.OrderList) {
                var item = $scope.OrderList[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllOrderSelected = $scope.currentcontext.selectall;
                }
            }
        }
        $scope.IsAllOrderSelectedChange = function(list, item) {
                for (var idx1 in list) {
                    var detail = list[idx1];
                    if (item.IsAllOrderSelected && !detail.IsReadOnly) {
                        detail.IsSelected = true;
                    } else if (!item.IsAllOrderSelected && !detail.IsReadOnly) {
                        detail.IsSelected = false;
                    }
                }
            }
            //Compute details for save
        function getDetailsForSave() {
            var selectedRows = getSelectionRows();

            for (var idx in selectedRows) {
                var item = selectedRows[idx];
                if (item.OrderStatusId == 10) {
                    utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.already-acceptedtest-msg.lbl'));
                    return false;
                }
                if (item.OrderStatusId == 2) {
                    utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.already-cancelled-msg.lbl'));
                    return false;
                }
                if (item.PatientBillStatusId == 2) {
                    utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.cancel-billstatus-msg.lbl'));
                    return false;
                }
            }
            return selectedRows;
        }
        $scope.backToList = function() {
                $state.go('app.virtualorderacceptance');
            }
            //Accept order
        $scope.acceptOrderCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // if (options.data.Data.selectedlist[0].TestTypeId == 1) {
            $state.go('app.samplecollect', {
                ordid: options.data.Id
            });
            $scope.cancelCallback();
            // } else {
            //     $scope.confirmCallback();
            // }
            // $scope.backToList();
        };
        $scope.Accept = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.acceptOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.acceptOrder = function() {
            var selectedRows = $scope.OrderList;
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl'));
                return;
            }
            var seletedRecords = [];
            for (var idx in selectedRows) {
                if (selectedRows[idx].IsSelected == true) {
                    var selectedorder = selectedRows[idx];
                    seletedRecords.push(selectedorder);
                    $scope.currentcontext.canDisableAcceptCancel = true;
                }
            }
            var actionName = 'lis/patientworkorder/AcceptVirtualOrder';
            if ($scope.item.ResultFormatTypeId == 2) {
                actionName = 'lis/patientworkorder/AcceptOrder';
            }

            var options = {
                action: actionName,
                data: {
                    Id: $scope.currentcontext.orderid,
                    Data: {
                        selectedlist: seletedRecords
                    }
                },
                type: 'post',
                onComplete: $scope.acceptOrderCallback
            };
            utl.Http.doAction(options);
        };

        $scope.cancelOrderCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.cancel = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.cancelOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.cancelOrder = function() {
            var selectedRows = $scope.OrderList;

            for (var idx in selectedRows) {
                var seletedRecords = [];
                if (selectedRows[idx].IsSelected == true) {
                    var selectedorder = selectedRows[idx];
                    seletedRecords.push(selectedorder.Id);
                    if (seletedRecords.length == 0) {
                        utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl'));
                        return;
                    }
                    $scope.currentcontext.canDisableAcceptCancel = true;
                    var options = {
                        action: 'lis/patientworkorder/CancelOrder',
                        data: {
                            Id: $scope.currentcontext.orderid,
                            PatientId: $scope.item.PatientId,
                            Data: {
                                cancelreason: $scope.item.CancelReason,
                                orderstatusid: 2,
                                selectedlist: seletedRecords,
                                Id: $scope.currentcontext.orderid,
                                PatientId: $scope.item.PatientId,
                                PatientOrder: $scope.item,
                                islab: true
                            }
                        },
                        type: 'post',
                        onComplete: $scope.cancelOrderCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        function getDetailsForCancel() {
            var inputArr = [];

            var selectedRows = getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl'));
                return;
            }

            for (var idx in selectedRows) {
                var item = selectedRows[idx];
                if (item.OrderStatusId == 10) {
                    utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.acceptedtest-notcancel-msg.lbl'));
                    return;
                }

            }

            for (var idx in selectedRows) {
                var item = selectedRows[idx];
                inputArr.push(item.Id);
            }
            return inputArr;
        }

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            var IsSeparateWorkOrderIndex = 0;
            for (var idx in currentSelection) {
                if (currentSelection[idx].Testmaster &&
                    currentSelection[idx].Testmaster.IsSeparateWorkOrder) {
                    currentSelection[idx].IsSeparateWorkOrder = ++IsSeparateWorkOrderIndex;
                } else {
                    currentSelection[idx].IsSeparateWorkOrder = 0;
                }
            }
            return currentSelection;
        };

        function loadData() {
            $scope.getItem();
            // $scope.getList();
        }

        loadData();
    }

    VirtualAcceptanceFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();