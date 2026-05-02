(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderstatuschangeFormController', orderstatuschangeFormController);

    function orderstatuschangeFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.OrderList = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            canDisableAcceptCancel: false,
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
        };
        $scope.items = {};
        $scope.lookup = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.orderid = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        if ($state.params.id) {
            $scope.currentcontext.orderid = parseInt($state.params.id);
        }
        if ($state.params.pid) {
            $scope.currentcontext.pid = parseInt($state.params.pid);
        }
        $scope.currentcontext.filter_fromdate = $stateParams.filter_fromdate;
        $scope.currentcontext.filter_billordernum = $stateParams.filter_billordernum;
        $scope.currentcontext.filter_todate = $stateParams.filter_todate;
        $scope.currentcontext.filter_encType = $stateParams.filter_encType;
        $scope.currentcontext.filter_OrdStatus = $stateParams.filter_OrdStatus;

        $scope.enablesamplecollect = 0;
        $scope.enablesamplecollect =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'samplecollectafterapprove');
        $scope.externalProviderChanged = function (orderDetail, externalProviderPriceMap) {
            orderDetail.ExternalProviderCost = externalProviderPriceMap.Price;
        }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.OrderList = [];
            var result = res.Data;
            var acceptCancelCount = 0;
            for (var idx in result) {
                var item = result[idx];
                if (item.OrderStatusId == 10 || item.OrderStatusId == 2) {
                    acceptCancelCount++;
                    item.IsAllOrderSelected = true;
                    item.IsAllOrderReadOnly = true;
                    item.IsSelected = (item.OrderStatusId == 10 || item.OrderStatusId == 2) ? true : false;
                    item.IsReadOnly = (item.OrderStatusId == 10 || item.OrderStatusId == 2) ? true : false;
                }
                if (item.OrderStatusId == 1) {
                    item.IsAllOrderSelected = false;
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
                item.IsCulture = false;
                item.IsCytology = false;
                if (item.Testmaster) {
                    if (item.Testmaster.IsCulture) {
                        item.IsCulture = item.Testmaster.IsCulture;
                    }
                }
                if (item.Testmaster) {
                    if (item.Testmaster.IsCytology) {
                        item.IsCytology = item.Testmaster.IsCytology;
                    }
                }
                //item.ExternalProviderId = item.ExternalProviderId || null;
                $scope.OrderList.push(item)
            }
            if (acceptCancelCount == result.length) {
                $scope.currentcontext.canDisableAcceptCancel = true;
            }

            // vm.gridConfig.data = result;
            // $scope.OrderList = vm.gridConfig.data;
            //vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.orderid
                    },
                    {
                        Key: 5,
                        Value: true
                    },
                    //                     {
                    //                         Key: 9,
                    //                         Value: 3
                    //                     }
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


        $scope.getBillPayDetailsCallback = function (scope, data, options, hasError) {
            var billInfo = data;
            $scope.CanShowAccept = true;
            $scope.CanShowCancel = true;
            if (billInfo.IsPaidFully == false) {
                $scope.CanShowAccept = false;
                $scope.CanShowCancel = false;
                utl.Alert.showErrorMsg($translate.instant('Payment has not done....'));
                return false;

            }
        };

        $scope.getBillPayDetails = function (pageNo) {
            if ($scope.item.BillingId && $scope.item.BillingId > 0) {
                var options = {
                    action: 'billing/patientbills/GetPatientBillsById',
                    data: {
                        Id: $scope.item.BillingId
                    },
                    type: 'post',
                    onComplete: $scope.getBillPayDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.CanShowAccept = true;
            $scope.CanShowCancel = true;
            if (data.EncounterTypeId == 1) {
                if (data.BillingId && data.BillingId > 0) {
                    $scope.CanShowAccept = true;
                    $scope.CanShowCancel = true;
                } else {
                    $scope.CanShowAccept = false;
                    $scope.CanShowCancel = false;
                    utl.Alert.showErrorMsg($translate.instant('Payment has not done....'));
                    return false;
                }
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.orderid && $scope.currentcontext.orderid > 0) {

                var options = {
                    action: 'emr/patientorder/GetPatientOrderByIdWithoutDetails',
                    data: {
                        Id: $scope.currentcontext.orderid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.handleEvents = function (actionType, row) {

        //     if (actionType == 'edit') {
        //         //$state.go('ordermanagement.orderacknowledgement', { id:entity.Id });
        //     } else if (actionType == 'testinfo') {
        //         $scope.testprofiledetails(entity.TestId);
        //     }
        // };

        $scope.selectAllItems = function () {
            for (var idx in $scope.OrderList) {
                var item = $scope.OrderList[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllOrderSelected = $scope.currentcontext.selectall;
                }
            }
        }
        $scope.IsAllOrderSelectedChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllOrderSelected && !detail.IsReadOnly) {
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

            //var groupedData = _.groupBy(selectedRows, 'ExternalProviderId');
            return selectedRows;
        }
        $scope.backToList = function () {
            $state.go('app.orderstatuschange', {
                tp: $scope.currentcontext.TestTypeId,
                filter_id: $scope.currentcontext.orderid,
                filter_fromdate: $scope.currentcontext.filter_fromdate,
                filter_billordernum: $scope.currentcontext.filter_billordernum,
                filter_todate: $scope.currentcontext.filter_todate,
                filter_encType: $scope.currentcontext.filter_encType,
                filter_OrdStatus: $scope.currentcontext.filter_OrdStatus,
            })
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.Accept = function () {
            var selectedRows = $scope.OrderList;
            var seletedRecords = [];
            for (var idx in selectedRows) {
                var selectedorder = selectedRows[idx];
                // if (selectedorder.OrderStatusId == 1) {
                selectedorder.OrderStatusId = selectedorder.OrderStatusId;
                seletedRecords.push(selectedorder);
                if (seletedRecords.length == selectedRows.length) {
                    $scope.items.OrderStatusId = selectedorder.OrderStatusId;
                }
                // }
            }
            // $scope.item.OrderStatusId = $scope.items.OrderStatusId;
            var actionName = 'emr/PatientOrderDetail/UpdatePatientOrderDetailStatus';

            var inputData = {
                Header: $scope.item,
                Details: seletedRecords
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        //Cancel Order
        $scope.cancelOrderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };
        $scope.cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.cancelOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.cancelOrder = function () {
            var inputArr = getDetailsForCancel(true);
            var selectedRows = $scope.OrderList;
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl'));
                return;
            }
            for (var idx in selectedRows) {
                var seletedRecords = [];
                if (selectedRows[idx].IsSelected == true) {
                    var selectedorder = selectedRows[idx];
                    seletedRecords.push(selectedorder);
                    $scope.currentcontext.canDisableAcceptCancel = true;
                    // if (typeof seletedRecords != 'boolean') {

                    if ($scope.item.BillingId) {
                        var options = {
                            action: 'lis/patientworkorder/CancelOrder',
                            data: {
                                Id: $scope.currentcontext.orderid,
                                Data: {
                                    selectedlist: seletedRecords,
                                    orderstatusid: 2,
                                    detailids: inputArr
                                }
                            },
                            type: 'post',
                            onComplete: $scope.updateBillStatus
                        };
                    } else {
                        var options = {
                            action: 'lis/patientworkorder/CancelOrder',
                            data: {
                                Id: $scope.currentcontext.orderid,
                                Data: {
                                    selectedlist: seletedRecords,
                                    orderstatusid: 2,
                                    detailids: inputArr
                                }
                            },
                            type: 'post',
                            onComplete: $scope.cancelOrderCallback
                        };
                    }
                    utl.Http.doAction(options);
                }
            }
        };
        $scope.statuschange = function (selectedItem) {
            var OStatus = '';
            OStatus = selectedItem.OrderStatusId;
            $scope.item.OrderStatusId = OStatus;

        }
        $scope.updateBillStatus = function () {
            var options = {
                action: 'lis/patientworkorder/CancelBillOrder',
                data: {
                    BillId: $scope.item.BillingId,
                },
                type: 'post',
                onComplete: $scope.cancelOrderCallback
            };
            utl.Http.doAction(options);
        }
        //Compute details for cancel
        function getDetailsForCancel() {
            var inputArr = [];

            var selectedRows = $scope.OrderList;
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
        $scope.testprofiledetails = function (TestId) {
            utl.Modal.open('app.testprofile', {
                params: {
                    tid: TestId
                },
                confirmCallback: $scope.getList
            });
        }

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            var IsSeparateWorkOrderIndex = 0;
            var Iscultureindex = 0;
            for (var idx in currentSelection) {
                if (currentSelection[idx].Testmaster &&
                    currentSelection[idx].Testmaster.IsSeparateWorkOrder) {
                    currentSelection[idx].IsSeparateWorkOrder = ++IsSeparateWorkOrderIndex;
                } else {
                    currentSelection[idx].IsSeparateWorkOrder = 0;
                }
                if (currentSelection[idx].Testmaster &&
                    currentSelection[idx].Testmaster.IsCulture) {
                    currentSelection[idx].IsCulture = ++Iscultureindex;
                } else {
                    currentSelection[idx].IsCulture = 0;
                }
            }
            return currentSelection;
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "OrderStatus"
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

        function loadData() {
            $scope.getItem();
            $scope.getList();
        }

        loadData();
    }

    orderstatuschangeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();