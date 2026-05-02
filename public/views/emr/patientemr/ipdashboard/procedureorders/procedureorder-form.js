(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ProcedureOrdersFormController', ProcedureOrdersFormController);

    function ProcedureOrdersFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";

        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: -1,
            OrderApprovalStatusId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || 0,
            OrderFromId: 0,
            IsSelf: false
        };
        $scope.showbutton = false;
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            attachmentcount: 0,
            testtype: -1,
            ismodal: modalConfig && modalConfig.params ? true : false,
            copyid: 0
        };

        $scope.IsCopy = false;
        if ($stateParams.copyid && $stateParams.copyid > 0) {
            $scope.IsCopy = true;
            $scope.currentcontext.copyid = parseInt($stateParams.copyid)
        }

        if ($stateParams.eid) {
            $scope.item.EncounterId = parseInt($stateParams.eid);
        }


        $scope.currentcontext.testtype = parseInt($stateParams.testtype);
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.id = 0;
        $scope.item.PatientId = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.option = 'detail';
        $scope.currentcontext.userDepartmentId = -1;

        $scope.IsDisabled = false;
        $scope.DisableCancelBtn = true;
        $scope.details = [];
        $scope.options = [
            { key: 'detail', name: $translate.instant('patientemr.patientorder-form.neworders.lbl') },
            { key: 'ticksheet', name: $translate.instant('patientemr.patientorder-form.ticksheet.lbl') }
        ];

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
            $scope.currentcontext.context = modalConfig.params.context;
            $scope.currentcontext.testtype = -1;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($stateParams.id) {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.OrderFromId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.currentcontext.userDepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.OrderToId = 8;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            if ($scope.currentcontext.encounter.EncounterTypeId == 2) {
                $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            }
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
            $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
            $scope.item.ClaimProcessId = $scope.currentcontext.encounter.ClaimProcessId;
            $scope.item.ClaimNumber = $scope.currentcontext.encounter.ClaimNumber;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
        }
        if ($stateParams.prorderid && $stateParams.prorderid > 0) {
            $scope.currentcontext.prorderid = parseInt($stateParams.prorderid);
            $scope.showbutton = true;
        }
        $scope.serviceRateCategoryChanged = function () {
            $scope.ticksheetconfig.ticksheetmastertypeid = null;
            loadTickSheet();
        };



        // $scope.canShowPatientControl = function () {
        //     return isMainContext();
        // };

        // $scope.canShowPatientBanner = function () {
        //     if (isMainContext() && this.item.PatientId > 0) {
        //         return true;
        //     }
        //     return false;
        // };

        $scope.canShowPrint = function () {
            return $scope.IsDisabled || $scope.item.OrderStatusId == 3 || $scope.item.OrderStatusId == 4 || $scope.item.OrderStatusId == 5 ||
                $scope.item.OrderStatusId == 6 || $scope.item.OrderStatusId == 7 || $scope.item.OrderStatusId == 8;//|| $scope.item.OrderStatusId == 9;
        };

        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        $scope.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        };

        $scope.editorders = function () {
            $scope.IsDisabled = false;
        };

        $scope.listview = function () {
            utl.Modal.open('patientemr.procedureordersview', {
                params: { pid: $scope.item.PatientId, consid: $scope.item.ConsultationId },
                confirmCallback: $scope.onReloadConfirm
            });
        };

        $scope.onReloadConfirm = function (PatOrderData) {
            var patorderinfo = {};
            patorderinfo.copyid = PatOrderData.copyid;
            patorderinfo.IsDisabled = PatOrderData.IsDisabled;
            patorderinfo.ConsId = PatOrderData.cid;
            patorderinfo.id = PatOrderData.id;

            $scope.currentcontext.copyid = patorderinfo.copyid;
            $scope.IsDisabled = patorderinfo.IsDisabled;
            $scope.currentcontext.id = patorderinfo.ConsId;
            $scope.currentcontext.id = patorderinfo.id;
            loadData();
        };

        $scope.setIndexforTableIndex = function () {
            for (var idx in $scope.details) {
                if ($scope.details[idx].Status == 1) {
                    $scope.details[idx].itemidxdesc = 'desc' + idx;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var detail = getNewItem();
            if ($scope.currentcontext.id > 0) {
                detail.ProcedureOrderId = $scope.currentcontext.id;
            }
            $scope.details.push(detail);
            $scope.setIndexforTableIndex();
        };

        function getNewItem() {
            var detail = {
                Id: 0,
                PatientId: $scope.item.PatientId,
                EncounterId: 0,
                DepartmentId: 0,
                SubDepartmentId: 0,
                MasterObjectTypeId: 0,
                MasterId: 0,
                ProcedureTypeId: 0,
                ProcedureId: 0,
                ProcedureCode: '',
                ProcedureName: '',
                ProcedureDescription: '',
                ProcedurePrice: 0,
                ServiceItemId: 0,
                ServiceCode: '',
                ServiceName: '',
                ServiceCategoryId: 0,
                ServiceCategoryName: '',
                ServicePrice: 0,
                Quantity: 1,
                GstId: 1,
                GstPercentage: 0,
                NetAmount: 0,
                DiagnosisId: 0,
                IsOrdered: true,
                DoctorId: 0,
                OrderFromLocationId: 0,
                OrderToLocationId: 0,
                OrderStatusId: $scope.item.OrderStatusId,
                OrderPriorityId: $scope.item.OrderPriorityId,
                OrderDetailApprovalStatusId: -1,
                ProcedureInstructions: '',
                GuarantorId: 0,
                IsSelf: false,
                IsAlertRequired: false,
                ScheduleDate: $scope.item.OrderScheduleDate,
                IsProcessed: false,
                ResultEstimatedDate: null,
                IsCanceled: false,
                CanceledById: 0,
                CanceledDateTime: null,
                PatientBillDetailId: 0,
                PatientBillId: 0,
                PatientBillStatusId: 1,
                IsDirectBill: false,
                ToothNo: '',
                Comments: '',
                Status: 1,
                itemidxdesc: null,
                tabindex: $scope.tabindexmap.detailtabindex++
            };
            detail.autoSearchName = getAutoSearchName();
            return detail;
        }

        function getAutoSearchName() {
            return 'test_' + getRandomNumber();
        }

        function getRandomNumber() {
            var uniqId = Math.floor((Math.random() * 10000) + 1);
            return uniqId;
        }

        $scope.canShowCancelBtn = function () {
            return $scope.item.OrderStatusId == utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
        };

        $scope.canShowClearBtn = function () {
            return $scope.item.OrderStatusId == utl.Lookup.getDefault($scope.lookup.OrderStatus, 'DRAFT');
        };

        $scope.canShowOrdersArea = function () {
            return $scope.currentcontext.option == 'detail';
        };

        $scope.canShowTickSheetArea = function () {
            return $scope.currentcontext.option == 'ticksheet';
        };

        function loadTickSheet() {
            var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            if (userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
            }

            $scope.ticksheetconfig = {
                ticksheetmastertypeid: 4,
                selectedlist: [],
                selecteddetail: {},
                departmentid: $scope.currentcontext.userDepartmentId,
                additionalinfo: { ServiceRateCategoryId: $scope.item.ServiceRateCategoryId }
            };
        }

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.ServiceItemId == $scope.details[idx].ServiceItemId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        $scope.saveTickSheets = function () {
            $scope.details.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var DefaultQuantity = 1;
                var ServicePrice = 0;
                if (ticksheetitem.ServiceItem) {
                    if (ticksheetitem.ServiceItem.ServiceItemTariffDetails && ticksheetitem.ServiceItem.ServiceItemTariffDetails.length > 0) {
                        ServicePrice = ticksheetitem.ServiceItem.ServiceItemTariffDetails[0].Rate;
                    }
                }
                var item = {
                    Quantity: DefaultQuantity,
                    ServicePrice: ServicePrice,
                    Discount: 0,
                    TaxCost: 0,
                    PatientId: $scope.item.PatientId,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    NetAmount: DefaultQuantity * ServicePrice,
                    OrderStatusId: 1,
                    RequestDate: $scope.item.OrderRequestDate,
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    OrderDetailApprovalStatusId: -1,
                    PatientBillStatusId: 1,
                    ResourceId: 0,
                    ToothNo: '',
                    ProcedureInstructions: '',
                    Status: 1,
                    ServiceItemId: ticksheetitem.ItemId
                }
                if (!checkExist(item)) {
                    item.autoSearchName = item.autoSearchName || getAutoSearchName();
                    $scope.details.push(item);
                    computeTickSheetTestData(item, ticksheetitem.ServiceItem);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        };

        function computeTickSheetTestData(item, ServiceItem) {
            item.DepartmentId = ServiceItem.DepartmentId;
            item.IsDirectBill = ServiceItem.IsDirectBill || false;
            item.ServiceCode = ServiceItem.ItemCode;
            item.ServiceName = ServiceItem.Name;
            item.TestDescription = ServiceItem.Description;
            item.SpecimanId = ServiceItem.SampletypeId || 0;
            item.ResourceId = ServiceItem.ResourceId || 0;
            if (ServiceItem) {
                item.CategoryId = ServiceItem.CategoryId || 0;
                if (ServiceItem.ParentCategory) {
                    item.CategoryName = ServiceItem.ParentCategory.ServiceCategoryName || '';
                }
            }
            // if (ScheduleDate) {
            //     item.ScheduleDate = ScheduleDate;
            // } else
            //     item.ScheduleDate = $scope.item.OrderScheduleDate;

            var Tariff = { Rate: 0, DoctorShare: 0 };

            var ServiceItem = ServiceItem;
            if (ServiceItem && ServiceItem.Id > 0 &&
                ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                Tariff = ServiceItem.ServiceItemTariffDetails[0];
            }

            item.TestPrice = Tariff.Rate;
            item.DoctorShare = Tariff.DoctorShare || 0;
            $scope.computeNetAmount(item);
        }

        $scope.addTickSheet = function () {
            var testmaster = $scope.ticksheetconfig.selecteddetail.Testmaster;
            var currentItem = getNewItem();
            currentItem.TestId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.TestTypeId = testmaster.TESTMASTERTYPId;
            currentItem.TestName = testmaster.Name;
            currentItem.TestCode = testmaster.Code;
            currentItem.TestDescription = testmaster.Description;

            utl.Modal.open('patientemr.patientorderdetail', {
                params: { id: 0, pid: $scope.item.PatientId, current_item: currentItem },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.addNew = function () {
            $state.reload();
        };

        $scope.originalprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print = function () {
            var inputData = { Id: $scope.currentcontext.id };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printDotMatrix = function () {
            var inputData = { Id: $scope.currentcontext.id };
            var options = {
                action: 'emr/patientorder/GetOrderHtml',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrintHTMLCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getPrintHTMLCallBack = function (scope, data, options, hasError) {
            var printOptions = { data: data };
            $scope.printHtml(printOptions);
        };

        $scope.getpendingorder = function (data) {
            $scope.currentcontext.id = data.id;
            $scope.getItem();
            $scope.getDetails();
        };

        $scope.pendingOrder = function () {
            utl.Modal.open('app.pendingorder', {
                params: { id: $scope.item.PatientId, eid: $scope.item.EncounterId },
                confirmCallback: $scope.getpendingorder
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            $scope.details.splice(-1, 1);
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.ProcedureOrderId = $scope.currentcontext.id;
                }
                if (!checkExist(itemFromModal) && (itemFromModal.ServiceItemId)) {
                    itemFromModal.autoSearchName = itemFromModal.autoSearchName || getAutoSearchName();
                    $scope.details.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        };

        $scope.editDetail = function (item) {
            if (item == 0) {
                $state.go(formState, { id: 0, pid: $scope.item.PatientId });
            } else {
                item.currenteditable = true;
                item.IsDisabled = $scope.IsDisabled;
                utl.Modal.open('patientemr.patientorderdetail', {
                    params: { id: 0, pid: $scope.item.PatientId, current_item: item },
                    confirmCallback: $scope.onDetailSave
                });
            }
        };

        $scope.previousorders = function () {
            utl.Modal.open('patientemr.previousorders', {
                params: { id: 0, pid: $scope.item.PatientId }
            });
        };

        $scope.patientallergy = function () {
            utl.Modal.open('patientemr.patientallergies', {
                params: { pid: $scope.item.PatientId }
            });
        };

        $scope.vital = function () {
            utl.Modal.open('patientemr.patientvitals', {
                params: { pid: $scope.item.PatientId }
            });
        };

        $scope.clear = function () {
            $scope.IsDisabled = false;
            $scope.details = [];
            $scope.item.OrderTotal = 0;
            $scope.addNewLineItem();
        };

        $scope.computeNetAmount = function (item) {
            if (item.ServicePrice && item.Quantity) {
                item.NetAmount = item.ServicePrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        $scope.serviceChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.details, { pivotkey: 'ServiceItemId', displaykey: 'Name' });
            if (isDuplicate) {
                item.Name = '';
                item.ServiceItemId = '';
                return;
            }

            computeTestData(item, item.SelectedItem);

            var lastIndex = $scope.details.length - 1;
            if ($scope.details.indexOf(item) == lastIndex) {
                $scope.addNewLineItem();
            }
            //$scope.getOrderInfoDetails(testdata);
        };

        $scope.getOrderDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientOrderDetails = res.Data || [];
            var orders = [];
            var orderdetails = [];
            if ($scope.vm.testcontrolconfig) {
                for (var idx in res.Data) {
                    var orders = res.Data[idx];
                    if (orders.PatientId == $scope.item.PatientId) {
                        for (var iddx in orders.PatientOrderDetails) {
                            var orderdetails = orders.PatientOrderDetails[iddx];
                            for (var jdx in $scope.details) {
                                if ($scope.details[jdx].TestId > 0)
                                    var Test = $scope.details[jdx].TestId;
                            }
                            if (orderdetails.TestId == Test) {
                                utl.Alert.showErrorMsg($translate.instant('Item Already Ordered'));
                            }
                        }
                    }
                }
            }
        };

        $scope.getOrderInfoDetails = function (testdata) {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            if ($scope.item.PatientId) {
                var inputData = {
                    Params: [
                        { Key: 12, Value: FromDate },
                        { Key: 13, Value: ToDate },
                        { Key: 2, Value: $scope.item.PatientId },
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
                    onComplete: $scope.getOrderDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        function computeTestData(item, serviceMaster) {
            var Tariff = { Rate: 0, DoctorShare: 0 };

            if (serviceMaster.ServiceItemTariffDetails && serviceMaster.ServiceItemTariffDetails.length > 0) {
                Tariff = serviceMaster.ServiceItemTariffDetails[0];
            }

            item.PatientId = $scope.item.PatientId;
            item.EncounterId = $scope.item.EncounterId;
            item.DepartmentId = serviceMaster.DepartmentId;;
            item.SubDepartmentId = serviceMaster.SubDepartmentId;
            item.MasterObjectTypeId = 0;
            item.MasterId = 0;
            item.ProcedureTypeId = 0;
            item.ProcedureId = serviceMaster.Id;
            item.ProcedureCode = serviceMaster.ItemCode;
            item.ProcedureName = serviceMaster.Name;
            item.ProcedureDescription = serviceMaster.Description;
            item.ProcedurePrice = Tariff.Rate;
            item.ServiceItemId = serviceMaster.Id;
            item.ServiceCode = serviceMaster.ItemCode;
            item.ServiceName = serviceMaster.Name;
            item.ServiceCategoryId = serviceMaster.CategoryId;
            if (serviceMaster.ParentCategory) {
                item.ServiceCategoryName = serviceMaster.ParentCategory.ServiceCategoryName;
            } else {
                item.ServiceCategoryName = '';
            }
            item.ServicePrice = Tariff.Rate;
            item.Quantity = 1;
            item.GstId = serviceMaster.GstId;
            if (serviceMaster.GstId === 2) {
                item.GstPercentage = 5;
            } else {
                item.GstPercentage = 0;
            }
            item.NetAmount = 0;
            item.DiagnosisId = 0;
            item.IsOrdered = true;
            item.DoctorId = $scope.item.DoctorId;
            item.OrderFromLocationId = 0;
            item.OrderToLocationId = 0;
            item.OrderStatusId = $scope.item.OrderStatusId;
            item.OrderPriorityId = $scope.item.OrderPriorityId;
            item.OrderDetailApprovalStatusId = -1;
            item.ProcedureInstructions = '';
            item.GuarantorId = $scope.item.GuarantorId;
            item.IsSelf = false;
            item.IsAlertRequired = false;
            item.ScheduleDate = $scope.item.OrderScheduleDate;
            item.IsProcessed = false;
            item.ResultEstimatedDate = null;
            item.IsCanceled = false;
            item.CanceledById = 0;
            item.CanceledDateTime = null;
            item.PatientBillDetailId = 0;
            item.PatientBillId = 0;
            item.PatientBillStatusId = 1;
            item.IsDirectBill = false;
            item.ToothNo = '';
            item.Comments = '';

            $scope.computeNetAmount(item);
        }

        $scope.BillCalc = function () {
            $scope.item.OrderTotal = 0;
            $scope.details.forEach((item, idx) => {
                $scope.item.OrderTotal += item.NetAmount;
            });
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            var lastidx = $scope.details.length - 1;
            if ($scope.details.indexOf(item) === lastidx) {
                $scope.addNewLineItem();
            }
        };

        $scope.deleteDetail = function (idx, item) {
            var lastidx = $scope.details.length - 1;
            if ($scope.details.indexOf(item) !== lastidx) {
                var name = item.TestName || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            var result = [];
            $scope.item.OrderTotal = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.autoSearchName = getAutoSearchName();
                $scope.item.OrderTotal += item.NetAmount
                result.push(item);
            }
            $scope.details = result;
            if ($scope.item.BillingStatusId <= 1) {
                $scope.addNewLineItem();
            }
        };

        $scope.copyDetailsCallback = function (scope, res, options, hasError) {
            var result = [];
            $scope.item.OrderTotal = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.autoSearchName = getAutoSearchName();
                $scope.item.OrderTotal += item.NetAmount;
                result.push(item);
            }
            $scope.details = result;
            $scope.addNewLineItem();
        };

        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{ Key: 2, Value: $scope.currentcontext.id }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'emr/procedureorderdetail/GetProcedureOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyid > 0) {
                var inputData = {
                    Params: [{ Key: 2, Value: $scope.currentcontext.copyid }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'emr/procedureorderdetail/GetProcedureOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.copyDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getItemCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var data = res.Data[0];
                $scope.item = data;
                $scope.IsDisabled = true;
                $scope.currentcontext.userDepartmentId = data.OrderFromId;
                if ($scope.item.OrderStatusId == 1 || $scope.item.OrderStatusId == 2) {
                    $scope.DisableCancelBtn = false;
                }
                if ($scope.item.OrderStatusId == 2) {
                    $scope.DisableCancelBtn = true;
                }
            } else {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, utl.Session.getCurrentUserId());
                if (doctorObj) {
                    $scope.item.DoctorId = doctorObj.Id;
                    $scope.item.OrderFromId = doctorObj.DepartmentId;
                    $scope.currentcontext.userDepartmentId = doctorObj.DepartmentId;
                }
            }
            if ($scope.currentcontext.prorderid) {
                $scope.IsDisabled = false;
            }
            // $scope.getDetails();
            loadTickSheet();
            $scope.refreshBanner();
        };

        $scope.copyCallback = function (scope, res, options, hasError) {
            $scope.item.EncounterId = data.EncounterId;
            $scope.item.PatientId = data.PatientId;
            $scope.item.DoctorId = data.DoctorId;
            $scope.item.DoctorName = data.DoctorName;
            $scope.item.OrderFromId = data.OrderFromId;
            $scope.item.OrderToId = data.OrderToId;
            $scope.item.BillAmount = data.BillAmount;
            $scope.item.ServiceRateCategoryId = data.ServiceRateCategoryId;
            // if (res && res.Data && res.Data.length > 0) {
            //     var data = res.Data[0];
            //     $scope.item = data;
            //     $scope.currentcontext.userDepartmentId = data.OrderFromId;
            //     if ($scope.item.OrderStatusId == 1 || $scope.item.OrderStatusId == 2) {
            //         // $scope.IsDisabled = true;
            //         $scope.DisableCancelBtn = false;
            //     }
            //     if ($scope.item.OrderStatusId == 2) {
            //         $scope.DisableCancelBtn = true;
            //     }
            // } else {
            //     var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, utl.Session.getCurrentUserId());
            //     if (doctorObj) {
            //         $scope.item.DoctorId = doctorObj.Id;
            //         $scope.item.OrderFromId = doctorObj.DepartmentId;
            //         $scope.currentcontext.userDepartmentId = doctorObj.DepartmentId;
            //     }
            // }

            // // $scope.getDetails();
            // loadTickSheet();
            $scope.refreshBanner();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{ Key: 0, Value: $scope.currentcontext.id }]
                };
                var options = {
                    action: 'emr/procedureorder/GetProcedureOrders',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyid && $scope.currentcontext.copyid > 0) {
                var inputData = {
                    Params: [{ Key: 0, Value: $scope.currentcontext.copyid }]
                };
                var options = {
                    action: 'emr/procedureorder/GetProcedureOrders',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.copyCallback
                };
                utl.Http.doAction(options);
            }

        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.backToList = function () {
            $state.go('patientemr.procedureorders', {
                pid: $scope.item.PatientId
            });
        };

        $scope.addNewOrder = function () {
            $state.go('patientemr.procedureordersform', {
                id: '', pid: $scope.item.PatientId
            });
        }
        $scope.saveDraft = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'DRAFT');
            if ($scope.item.OrderStatusId === -1) {
                $scope.item.OrderStatusId = 1;
            }
            $scope.saveItem();
        };

        $scope.createOrder = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
            if ($scope.item.OrderStatusId === -1) {
                $scope.item.OrderStatusId = 2;
            }
            $scope.completeOrder();
        };

        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            if (doctorObj) {
                $scope.item.OrderFromId = doctorObj.DepartmentId;
            }
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CANCELLED');
            $scope.saveItem();
        };

        $scope.openattachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.item.PatientId, itemid: $scope.item.Id, objecttypeid: 1 },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('Please Order'));
            }
        };

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        };

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.id }],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.completeOrder = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            loadData();
        };

        $scope.saveItem = function () {
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                // if ($scope.currentcontext.copyid > 0) {
                //     $scope.currentcontext.id = $scope.currentcontext.copyid;
                // }
                var actionName = 'emr/procedureorder/AddProcedureOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/procedureorder/UpdateProcedureOrder';
                } else {
                    $scope.item.BillingStatusId = 1;
                }
                if ($scope.item.OrderStatusId == 1 && $scope.Encounter) {
                    $scope.item.WardId = $scope.Encounter.WardId;
                    $scope.item.RoomId = $scope.Encounter.RoomId;
                    $scope.item.BedId = $scope.Encounter.BedId;
                    if ($scope.Encounter.EncounterTypeId == 2)
                        $scope.item.BillingStatusId = 2;
                }
                if ($scope.item.GuarantorId == 1000) {
                    $scope.item.IsSelf = true;
                    $scope.item.ClaimProcessId = 0;
                    $scope.item.ClaimNumber = '';
                    $scope.item.OrderApprovedById = utl.Session.getCurrentUserId();
                    $scope.item.OrderApprovedDate = utl.Formatter.getCurrentDate();
                    $scope.item.OrderAuthorizedById = utl.Session.getCurrentUserId();
                    $scope.item.OrderAuthorizedDate = utl.Formatter.getCurrentDate();
                    $scope.item.OrderApprovalStatusId = 4;
                }
                var inputData = { Header: $scope.item, Details: lines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.details, [
                { search: 1, fields: ['Status'] }
            ]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.ServiceItemId > 0 && (item.Quantity <= 0 || item.ServicePrice <= 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var ordertotal = 0;
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                item.PatientId = $scope.item.PatientId;
                item.GuarantorId = $scope.item.GuarantorId;
                item.OrderStatusId = $scope.item.OrderStatusId;
                item.IsDirectBill = false;
                if ($scope.item.GuarantorId == 1000) {
                    item.OrderDetailApprovalStatusId = 4;
                    item.IsSelf = true;
                }
                if (item.ServiceItemId > 0 && item.Status == 1) {
                    result.push(item);
                    ordertotal += item.NetAmount;
                }
            }
            for (var didx in $scope.details) {
                var ditem = $scope.details[didx];
                if (ditem.Id > 0 && ditem.Status == 2) {
                    result.push(ditem);
                }
            }
            $scope.item.OrderTotal = ordertotal;
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getDetails();
            $scope.getPatientAttachments();
        }

        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Title', field: 'Title', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'PatientName', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Age/Gender', field: 'Age', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'DOB', field: 'DOB', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'MRN', field: 'MRN', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Visit#', field: 'VisitIdentifier', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Ward/Room/Bed', field: 'WardDetail', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
            ],
            searchparams: {},
            result: {},
            api: 'Encounter/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            if (selectedItem) {
                if (selectedItem.IsBillLock) {
                    var msg = 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
                else if (selectedItem.IsBillFinalized) {
                    var msg = 'Bill has been Finalized';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem) {
                var strTitle = selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                var strTitle = selectedItem.Patient && selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
        }

        $scope.patientChanged = function () {
            $scope.Encounter = $scope.item.SelectedItem;
            var selectedItem = $scope.item.SelectedItem;
            if (selectedItem) {
                $scope.item.DoctorId = selectedItem.DoctorId;
                $scope.item.DoctorName = selectedItem.Doctor.Title.Description + ' ' + selectedItem.Doctor.FirstName + ' ' + selectedItem.Doctor.LastName;
                $scope.item.OrderFromId = selectedItem.DepartmentId;
                $scope.item.OrderToId = 8;
                $scope.item.PatientId = selectedItem.PatientId;
                $scope.item.PatientName = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                } else {
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                    $scope.item.EncounterTypeId = 1;
                }
                $scope.item.EncounterId = selectedItem.Id;
                $scope.item.PatientGuarantorId = selectedItem.PatientGuarantorId;
                $scope.item.GuarantorId = selectedItem.GuarantorId;

                $scope.refreshBanner();
                loadTickSheet();
            }
        };

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };
            if ($scope.currentcontext.id == 0 && $scope.currentcontext.testtype > 0) {
                inputData.Params.push({ Key: 3, Value: 2 || 3 || 4 }, { Key: 15, Value: 2 })
            }
            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 11, Value: query });
            }
            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        }

        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Type', field: 'Sampletype', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
                { header: 'Price', field: 'Price', datatype: 'string', headercls: 'td-price', fieldcls: 'td-price' },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTests',
            formatdisplay: formatselectedtest,
            presearch: presearchtest,
            postsearch: postsearchtest
        };

        function formatselectedtest() {
            var selectedItem = vm.testcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.testcontrolconfig.rowdata) {
                result = [vm.testcontrolconfig.rowdata.TestCode, vm.testcontrolconfig.rowdata.TestName].join(' ');
            }
            return result;
        }

        function presearchtest() {
            var query = vm.testcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.testtype },
                    { Key: 6, Value: 2 },
                    { Key: 8, Value: { 'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId } }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };
            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                var Tariff = { Rate: 0, DoctorShare: 0 };
                if (item.ServiceItemTariffDetails && item.ServiceItemTariffDetails.length > 0) {
                    Tariff = item.ServiceItemTariffDetails[0];
                }
                item.Tariff = Tariff;
                item.Price = Tariff.Rate;
                item.Department = item.Department.DepartmentName;
                if (item.SampletypeId > 0) {
                    item.Sampletype = item.Sampletype.Name;
                }
            }
        }

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'ServiceItem Rate', field: 'ServiceItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
                // { header: 'Night Tariff %', field: 'NightTariffAmt', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                    { Key: 27, Value: false },
                    { Key: 28, Value: $scope.item.ServiceRateCategoryId },
                    { Key: 29, Value: true }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.item.ServiceRateCategoryId }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare || 0;
                }
            }
        }

        $scope.testprofiledetails = function (TestId) {
            utl.Modal.open('app.testprofile', {
                params: { tid: TestId },
                confirmCallback: $scope.getList
            });
        };

        $scope.viewConsultation = function (item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: { cid: item.Id, pid: $scope.currentcontext.pid }
            });
        };

        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.consultlist = res.Data;
        };

        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [
                    // { Key: 2, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.pid },
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: $scope.currentcontext.cid },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "User" },
                { "Key": "OrderPriority" },
                { "Key": "Department" },
                { "Key": "ServiceRateCategory" },
                { "Key": "OrderStatus" },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
        $scope.getCurrentConsultation();
        $scope.itemindex = -1;

        $scope.getResourceAppointment = function (idx, item) {
            $scope.itemindex = idx;
            var lastidx = $scope.details.length - 1;
            if ($scope.details.indexOf(item) !== lastidx) {
                utl.Modal.open('app.appointment', {
                    params: { id: 0, ct: 'ris', ResourceId: item.ResourceId, pid: $scope.item.PatientId },
                    confirmCallback: $scope.getAppointmentModalCallback
                });
            }
        };

        $scope.getAppointmentModalCallback = function (orderscheduleId) {
            var options = {
                action: 'appointment/Appointment/GetAppointmentById',
                data: { Id: orderscheduleId },
                type: 'post',
                onComplete: $scope.getAppointmentDataCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getAppointmentDataCallback = function (scope, data, options, hasError) {
            var appdatetime = utl.Formatter.getDateString(data.AppointmentDate) + ' ' + data.StartTime;
            var appdt = utl.Formatter.getDate(appdatetime);
            $scope.details[$scope.itemindex].ScheduleDate = appdt;
        };
    }

    ProcedureOrdersFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig', '$timeout'];

})();