(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderAcknowledgementFormController', orderAcknowledgementFormController);

    function orderAcknowledgementFormController($scope, $stateParams, $state, $translate, utl, $injector) {
        var vm = this;
        var $uibModalInstance = null;
        var modalConfig = null;
        if ($injector && $injector.has && $injector.has('$uibModalInstance')) {
            try { $uibModalInstance = $injector.get('$uibModalInstance'); } catch (e) {}
        }
        if ($injector && $injector.has && $injector.has('modalConfig')) {
            try { modalConfig = $injector.get('modalConfig'); } catch (e) {}
        }

        $scope.Items = [];
        $scope.OrderList = [];
        $scope.patientitem = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            canDisableAcceptCancel: false,
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            sampleTestTypeId: -1
        };

        $scope.lookup = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.orderid = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        var rawOrderId = $state.params.id || $stateParams.id;
        var rawPid = $state.params.pid || $stateParams.pid;

        // Fallback to URL search parameters if directly navigated or refreshed
        if ((!rawOrderId || !rawPid) && typeof window !== 'undefined' && window.location.hash && window.location.hash.indexOf('?') !== -1) {
            try {
                var searchPart = window.location.hash.split('?')[1];
                var urlParams = new URLSearchParams(searchPart);
                if (!rawOrderId && urlParams.get('id')) rawOrderId = urlParams.get('id');
                if (!rawPid && urlParams.get('pid')) rawPid = urlParams.get('pid');
            } catch (e) {}
        }

        if (rawOrderId) {
            $scope.currentcontext.orderid = parseInt(rawOrderId);
        }
        if (rawPid) {
            $scope.currentcontext.pid = parseInt(rawPid);
        }

        // Fallback to sessionStorage if page was directly refreshed
        if (!$scope.currentcontext.orderid || !$scope.currentcontext.pid) {
            try {
                var stored = sessionStorage.getItem('last_order_ack_context');
                if (stored) {
                    var parsed = JSON.parse(stored);
                    if (parsed.id && !$scope.currentcontext.orderid) $scope.currentcontext.orderid = parseInt(parsed.id);
                    if (parsed.pid && !$scope.currentcontext.pid) $scope.currentcontext.pid = parseInt(parsed.pid);
                }
            } catch (e) {}
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


        $scope.patientBannerData = {};
        $scope.encounterBannerData = {};

        $scope.getPatientDetails = function (pid) {
            if (!pid) return;
            utl.Http.doAction({
                action: 'registration/patient/GetPatientById',
                data: { Id: pid },
                type: 'post',
                onComplete: function (scope, data) {
                    if (data) {
                        var rawTitle = data.Title ? data.Title.Description : '';
                        var title = rawTitle ? (rawTitle.endsWith('.') ? rawTitle + ' ' : rawTitle + '. ') : '';
                        $scope.patientBannerData = {
                            Id: data.Id,
                            MRN: data.MRN,
                            Title: rawTitle,
                            FirstName: data.FirstName,
                            LastName: data.LastName,
                            PatientName: (title || '') + (data.FirstName || '') + (data.LastName ? ' ' + data.LastName : ''),
                            Age: data.Age,
                            Gender: data.Gender ? data.Gender.Description : '',
                            PatientStatus: 'Active',
                            FacilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL',
                            GuarantorType: data.GuarantorType || 'SELF',
                            GuarantorName: data.GuarantorName || 'CASH',
                            Mobile: data.Mobile
                        };
                        $scope.refreshReactProps();
                    }
                }
            });

            utl.Http.doAction({
                action: 'Visit/Visit/GetEncounters',
                data: {
                    Params: [
                        { Key: 4, Value: pid },
                        { Key: 52, Value: true }
                    ]
                },
                type: 'post',
                onComplete: function (scope, res) {
                    var encList = Array.isArray(res) ? res : (res && Array.isArray(res.Data) ? res.Data : []);
                    var enc = encList && encList.length > 0 ? encList[0] : null;
                    if (enc) {
                        var doc = enc.Doctor;
                        var docTitle = doc && doc.Title ? doc.Title.Description : 'Dr.';
                        var docName = doc ? ((docTitle.endsWith('.') ? docTitle + ' ' : docTitle + '. ') + (doc.FirstName || '') + (doc.LastName ? ' ' + doc.LastName : '')) : (enc.DoctorName || 'Dr. ANUP DUKANIYA');
                        var deptName = (enc.Department && (enc.Department.DepartmentName || enc.Department.Name)) || enc.DepartmentName || 'General OPD';

                        $scope.encounterBannerData = {
                            Id: enc.Id,
                            DoctorName: docName,
                            DepartmentName: deptName,
                            VisitDate: enc.AdmissionDate || enc.EncounterDate || enc.CreatedAt
                        };
                        $scope.refreshReactProps();
                    }
                }
            });
        };

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
                    item.IsAllOrderSelected = true;
                    item.IsSelected = true;
                    item.IsReadOnly = false;
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
                // $scope.OrderList.push(item)
                let details = item.PatientBillDetail;
                if(details){
                if (details.CancelReqRaisedStatusId !== 1 && details.CancelReqRaisedStatusId !== 2 && details.PatientBillStatusId !== 2) {
                    $scope.OrderList.push(item);
                }
            }else{
                $scope.OrderList.push(item)
            }
            }
            if (acceptCancelCount == result.length) {
                $scope.currentcontext.canDisableAcceptCancel = true;
                $scope.CanShowAccept = false;
                $scope.CanShowCancel = false;
            } else {
                $scope.currentcontext.canDisableAcceptCancel = false;
                $scope.CanShowAccept = true;
                $scope.CanShowCancel = true;
            }
            $scope.refreshReactProps();

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
            if (!$scope.currentcontext.pid && data && data.PatientId) {
                $scope.currentcontext.pid = data.PatientId;
                $scope.getPatientDetails(data.PatientId);
            }
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
            $scope.refreshReactProps();
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
                    $scope.CanShowAccept = true;
                    $scope.CanShowCancel = true;
                }

            }
        }
        $scope.IsAllOrderSelectedChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                    // $scope.CanShowAccept = true;
                    //  $scope.CanShowCancel = true;
                } else if (!detail.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                    // $scope.CanShowAccept = false;
                    //  $scope.CanShowCancel = false;
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
            $state.go('app.orderacknowledgements', {
                tp: $scope.currentcontext.TestTypeId,
                filter_id: $scope.currentcontext.orderid,
                filter_fromdate: $scope.currentcontext.filter_fromdate,
                filter_billordernum: $scope.currentcontext.filter_billordernum,
                filter_todate: $scope.currentcontext.filter_todate,
                filter_encType: $scope.currentcontext.filter_encType,
                filter_OrdStatus: $scope.currentcontext.filter_OrdStatus,
            })
        }

        //Accept order
        $scope.updateStatusCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.enablesamplecollect == 1) {
                // if (options.data.Data.selectedlist[0].TestTypeId == 1) {
                if ($scope.currentcontext.sampleTestTypeId == 1) {
                    $state.go('app.samplecollect', {
                        ordid: options.data.Id
                    });
                } else if ($scope.enablesamplecollect == 0) {
                    $scope.backToList();
                }
            } else {
                $scope.backToList();
            }
        };

        $scope.acceptOrderCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.sampleTestTypeId = (options.data.Data.selectedlist[0].TestTypeId) ? options.data.Data.selectedlist[0].TestTypeId : -1;
            var options = {
                action: 'lis/patientworkorder/updateOrderStatus',
                data: {
                    Id: $scope.currentcontext.orderid,
                },
                type: 'post',
                onComplete: $scope.updateStatusCallback
            };
            utl.Http.doAction(options);

            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // if ($scope.enablesamplecollect == 1) {
            //     if (options.data.Data.selectedlist[0].TestTypeId == 1) {
            //         $state.go('app.samplecollect', {
            //             ordid: options.data.Id
            //         });
            //     } else if ($scope.enablesamplecollect == 0) {
            //         $scope.backToList();
            //     }
            // } else {
            //     $scope.backToList();
            // }
        };

        // $scope.Accept = function () {
        //     var confirmOptions = {
        //         headingKey: 'common.confirm-modal-header.lbl',
        //         messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
        //         yesKey: 'common.yeskey.lbl',
        //         noKey: 'common.nokey.lbl',
        //         onSuccessMethod: $scope.acceptOrder,
        //     };
        //     utl.Dialog.confirmMessage(confirmOptions);

        // }
        $scope.Accept = function() {
            // if($scope.item.PatientBills.CancelReqRaisedStatusId === 1){
            //     utl.Alert.showErrorMsg($translate.instant('This OPPatient bill is Requested to cancel bill'));
            // }if($scope.item.PatientBills.CancelReqRaisedStatusId === 2){
            //     utl.Alert.showErrorMsg($translate.instant('This OPPatient bill is Cancelled'));
            // }else if($scope.item.PatientBills.PatientBillStatusId === 2){
            //     utl.Alert.showErrorMsg($translate.instant('This OPPatient bill is Cancelled'));
            // }else{
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.acceptOrder,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            // }
        }

        $scope.acceptOrder = function () {
            var selectedRows = $scope.OrderList;
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl'));
                return;
            }
            var seletedRecords = [];
            for (var idx in selectedRows) {

                if (!selectedRows[idx].OrderStatusId) {
                    selectedRows[idx].OrderStatusId = 1;
                }
                if (selectedRows[idx].OrderStatusId == 1 && selectedRows[idx].IsSelected == true) {
                    var selectedorder = selectedRows[idx];
                    selectedorder.OrderStatusId = 1;
                    seletedRecords.push(selectedorder);
                }
            }
            if (seletedRecords.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('ordermanagement.orderacknowledgement-form.test-notselection-msg.lbl'));
                return;
            }

            // Only disable accept/cancel if ALL active items in the order have now been accepted or cancelled
            var remainingPending = 0;
            for (var k = 0; k < selectedRows.length; k++) {
                var row = selectedRows[k];
                var willBeAccepted = seletedRecords.some(function (s) { return s.Id === row.Id; });
                var alreadyDone = (row.OrderStatusId == 10 || row.OrderStatusId == 2);
                if (!willBeAccepted && !alreadyDone) {
                    remainingPending++;
                }
            }
            if (remainingPending === 0) {
                $scope.currentcontext.canDisableAcceptCancel = true;
                $scope.CanShowAccept = false;
                $scope.CanShowCancel = false;
            } else {
                $scope.currentcontext.canDisableAcceptCancel = false;
            }
            // return;
            var options = {
                action: 'lis/patientworkorder/AcceptOrder',
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

        $scope.refreshReactProps = function () {
            var orderInfo = {};
            if ($scope.item) {
                orderInfo = {
                    Id: $scope.item.Id,
                    OrderNumber: $scope.item.OrderNumber,
                    BillNumber: $scope.item.BillNumber,
                    BillingId: $scope.item.BillingId,
                    EncounterTypeId: $scope.item.EncounterTypeId,
                    DoctorName: $scope.encounterBannerData ? $scope.encounterBannerData.DoctorName : ''
                };
            }

            var cleanOrderList = ($scope.OrderList || []).map(function (item) {
                return {
                    Id: item.Id,
                    TestId: item.TestId,
                    TestName: item.TestName,
                    TestCode: item.TestCode,
                    ClinicalData: item.ClinicalData,
                    Quantity: item.Quantity,
                    SampleTypeIndex: item.SampleTypeIndex,
                    Testmaster: item.Testmaster ? {
                        IsProfile: Boolean(item.Testmaster.IsProfile),
                        IsCulture: Boolean(item.Testmaster.IsCulture),
                        IsCytology: Boolean(item.Testmaster.IsCytology)
                    } : {},
                    PatientBillStatus: item.PatientBillStatus ? {
                        Description: item.PatientBillStatus.Description
                    } : {},
                    OrderStatus: item.OrderStatus ? {
                        DisplayName: item.OrderStatus.DisplayName,
                        Description: item.OrderStatus.Description
                    } : {},
                    OrderStatusId: item.OrderStatusId,
                    WorkOrderDID: item.WorkOrderDID,
                    AcceptedDate: item.AcceptedDate,
                    IsSelected: Boolean(item.IsSelected),
                    IsAllOrderSelected: Boolean(item.IsAllOrderSelected),
                    IsReadOnly: Boolean(item.IsReadOnly),
                    IsAllOrderReadOnly: Boolean(item.IsAllOrderReadOnly)
                };
            });

            $scope.reactProps = {
                orderid: $scope.currentcontext.orderid,
                pid: $scope.currentcontext.pid,
                tp: $scope.currentcontext.TestTypeId,
                patient: $scope.patientBannerData || {},
                encounter: $scope.encounterBannerData || {},
                orderInfo: orderInfo,
                orderList: cleanOrderList,
                canShowAccept: $scope.CanShowAccept !== false && !$scope.currentcontext.canDisableAcceptCancel,
                canShowCancel: $scope.CanShowCancel !== false && !$scope.currentcontext.canDisableAcceptCancel,
                canDisableAcceptCancel: Boolean($scope.currentcontext.canDisableAcceptCancel),
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL'
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'back') {
                $scope.backToList();
            } else if (actionName === 'accept') {
                $scope.Accept();
            } else if (actionName === 'cancel') {
                $scope.cancel();
            } else if (actionName === 'toggleSelectAll') {
                var selectAll = Boolean(payload && payload.selectAll);
                $scope.currentcontext.selectall = selectAll;
                for (var i = 0; i < ($scope.OrderList || []).length; i++) {
                    var item = $scope.OrderList[i];
                    if (!item.IsReadOnly && !item.IsAllOrderReadOnly && item.OrderStatusId !== 10 && item.OrderStatusId !== 2) {
                        item.IsSelected = selectAll;
                        item.IsAllOrderSelected = selectAll;
                    }
                }
                $scope.CanShowAccept = true;
                $scope.CanShowCancel = true;
                $scope.refreshReactProps();
            } else if (actionName === 'toggleItemSelect') {
                if (payload && payload.item) {
                    for (var i = 0; i < ($scope.OrderList || []).length; i++) {
                        if ($scope.OrderList[i].Id === payload.item.Id) {
                            $scope.OrderList[i].IsSelected = Boolean(payload.isSelected);
                            $scope.OrderList[i].IsAllOrderSelected = Boolean(payload.isSelected);
                            break;
                        }
                    }
                }
                if (payload && Array.isArray(payload.selectedIds)) {
                    var idSet = new Set(payload.selectedIds);
                    for (var j = 0; j < ($scope.OrderList || []).length; j++) {
                        var ord = $scope.OrderList[j];
                        if (!ord.IsReadOnly && !ord.IsAllOrderReadOnly && ord.OrderStatusId !== 10 && ord.OrderStatusId !== 2) {
                            var isSel = idSet.has(ord.Id);
                            ord.IsSelected = isSel;
                            ord.IsAllOrderSelected = isSel;
                        }
                    }
                }
                $scope.CanShowAccept = true;
                $scope.CanShowCancel = true;
                $scope.refreshReactProps();
            }
        };

        function loadData() {
            if ($scope.currentcontext.pid) {
                $scope.getPatientDetails($scope.currentcontext.pid);
            }
            $scope.getItem();
            $scope.getList();
            $scope.refreshReactProps();
        }

        loadData();
    }

    orderAcknowledgementFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$injector'];

})();