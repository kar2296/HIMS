(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientOrderFormController', patientOrderFormController);

    function patientOrderFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;

        $scope.currentfilter = {};
        $scope.currentfilter.DiscountModeId = 0;

        uibButtonConfig.activeClass = "opt-selected";
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.PatientOrderDetails = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            attachmentcount: 0,
            testtype: -1,
            ismodal: modalConfig && modalConfig.params ? true : false,
            copyid: 0
        };
        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.CanSave = utl.Privilege.hasPrivilege('CanSave');
            $scope.currentcontext.CanOrder = utl.Privilege.hasPrivilege('CanOrder');
        }
        $scope.IsCopy = false;
        if ($stateParams.context) {
            $scope.currentcontext.context = $stateParams.context;
        }
        if ($stateParams.copyid && $stateParams.copyid > 0) {
            $scope.IsCopy = true;
            $scope.currentcontext.copyid = parseInt($stateParams.copyid)
        }

        $scope.DiscountEnabled = false;
        $scope.discountamtinpatientorder =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'discountamtinpatientorder');
        if ($scope.discountamtinpatientorder > 0)
            $scope.DiscountEnabled = true;

        if ($stateParams.eid)
            $scope.item.EncounterId = parseInt($stateParams.eid);

        $scope.item.ConsultationId = $stateParams.cid ? parseInt($stateParams.cid) : null;
        $scope.currentcontext.selecteddept = [];
        $scope.currentcontext.testtype = parseInt($stateParams.testtype);
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.PatientId = parseInt($stateParams.pid);
        $scope.currentcontext.option = 'detail';
        if ($scope.currentcontext.copyid) {
            $scope.currentcontext.option = 'detail';
        }
        $scope.currentcontext.userDepartmentId = -1;
        var parentState = isMainContext() ? 'app.patientorders' : 'patientemr.patientorders';
        if ($stateParams.ct == 'consultation') {
            parentState = 'patientemr.consultation';
            $scope.currentcontext.option = 'ticksheet';
        }
        $scope.showbutton = false;
        $scope.IsDisabled = false;
        $scope.DisableCancelBtn = true;
        $scope.details = [];
        $scope.options = [{
            key: 'detail',
            name: $translate.instant('patientemr.patientorder-form.neworders.lbl')
        },
        {
            key: 'ticksheet',
            name: $translate.instant('patientemr.patientorder-form.ticksheet.lbl')
        }
        ];

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;
            $scope.currentcontext.returnurl = modalConfig.params.returnurl;
            $scope.currentcontext.context = modalConfig.params.context;
            $scope.currentcontext.testtype = -1;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        if ($stateParams.orderid && $stateParams.orderid > 0) {
            $scope.currentcontext.orderid = parseInt($stateParams.orderid);
            $scope.showbutton = true;
        }
        var formState = isMainContext() ? 'app.patientorder' : 'patientemr.patientorder';
        if (!isMainContext()) {
            $scope.currentcontext.option = 'ticksheet';
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();

            if ($scope.currentcontext.encounter) {
                //Setting defaults from current encounter  -
                //CAUTION : This defaulting is mandatory to load ticksheets based on serviceratecategory
                $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
                $scope.item.OrderFromId = $scope.currentcontext.encounter.DepartmentId;
                $scope.item.OrderToId = 8;
                $scope.item.ServiceRateCategoryId = 1;
                if ($scope.currentcontext.encounter.EncounterTypeId == 2) {
                    $scope.item.ServiceRateCategoryId = 2;
                }
                $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            }
            loadTickSheet();
        }
        // Copy from a previous visit (EMR workspace): the ticked tests of earlier orders are loaded as a NEW
        // order for the current visit (current encounter/doctor/rates kept); the user reviews and saves.
        //   params.copyFromOrderIds: [patientOrderId], params.copyDetailIds: [patientOrderDetailId] (optional filter)
        if (modalConfig && modalConfig.params && angular.isArray(modalConfig.params.copyFromOrderIds)
            && modalConfig.params.copyFromOrderIds.length) {
            $scope.currentcontext.copyFromOrderIds = modalConfig.params.copyFromOrderIds;
            $scope.currentcontext.copyDetailIds = angular.isArray(modalConfig.params.copyDetailIds) ? modalConfig.params.copyDetailIds : null;
            $scope.currentcontext.id = 0;
            $scope.currentcontext.option = 'detail';
        }
        // Callers can open the form on a given tab (the EMR Workspace "New order" button asks for 'detail').
        if (modalConfig && modalConfig.params && (modalConfig.params.startTab === 'detail' || modalConfig.params.startTab === 'ticksheet')) {
            $scope.currentcontext.option = modalConfig.params.startTab;
        }

        /** Number of service rows that have a test selected (shown next to the Services heading). */
        $scope.serviceCount = function () {
            return ($scope.details || []).filter(function (d) {
                return d.Status == 1 && d.TestId > 0;
            }).length;
        };

        $scope.serviceRateCategoryChanged = function () {
            $scope.ticksheetconfig.ticksheetmastertypeid = null; //fix to reload ticksheet
            loadTickSheet();
        }

        //Visibility rules starts

        function isMainContext() {
            return $scope.currentcontext.context == 'main';
        }

        $scope.canShowPatientControl = function () {
            return isMainContext();
        }

        $scope.canShowPatientBanner = function () {
            if (isMainContext() && this.item.PatientId > 0) {
                return true;
            }
            return false;
        }

        $scope.canShowPrint = function () {
            return $scope.IsDisabled || $scope.item.OrderStatusId == 3 || $scope.item.OrderStatusId == 4 || $scope.item.OrderStatusId == 5 ||
                $scope.item.OrderStatusId == 6 || $scope.item.OrderStatusId == 7 || $scope.item.OrderStatusId == 8; //|| $scope.item.OrderStatusId == 9;
        }

        //Visibility rules ends

        //Reload banner code starts
        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        $scope.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        };
        //Reload banner code ends

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.details) {
                if ($scope.details[idx].Status == 1) {
                    $scope.details[idx].SNo = SNo;
                    $scope.details[idx].itemidxdesc = 'desc' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var detail = getNewItem();

            if ($scope.currentcontext.id > 0) {
                detail.PatientOrderId = $scope.currentcontext.id;
            }

            $scope.details.push(detail);
            $scope.setIndexforTableIndex();
        }



        function getNewItem() {
            var detail = {
                Id: 0,
                SNo: 0,
                IsDirectBill: false,
                PatientId: $scope.item.PatientId,
                TestId: -1,
                // itemidxdesc: null,
                Quantity: 1,
                TestPrice: 0,
                Discount: 0,
                TaxCost: 0,
                OrderPriorityId: $scope.item.OrderPriorityId,
                NetAmount: 0,
                OrderStatusId: $scope.item.OrderStatusId,
                RequestDate: $scope.item.OrderRequestDate,
                ScheduleDate: $scope.item.OrderScheduleDate,
                Status: 1,
                // Explicit, like the other order screens: the column defaults to 1, which marked every line cancelled.
                IsCanceled: 0,
                ResourceId: -1,
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
        //Visibility handling starts

        $scope.canShowCancelBtn = function () {
            return $scope.item.OrderStatusId == utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
        }

        $scope.canShowClearBtn = function () {
            return $scope.item.OrderStatusId == utl.Lookup.getDefault($scope.lookup.OrderStatus, 'DRAFT');
        }
        //Visibility handling ends

        //Tab selection
        $scope.canShowOrdersArea = function () {
            return $scope.currentcontext.option == 'detail';
        }

        $scope.canShowTickSheetArea = function () {
            return $scope.currentcontext.option == 'ticksheet';
        }

        //TickSheet area begins
        function loadTickSheet() {
            var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            if (userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
            }

            $scope.ticksheetconfig = {
                ticksheetmastertypeid: 2,
                selectedlist: [],
                selecteddetail: {},
                departmentid: $scope.currentcontext.userDepartmentId,
                additionalinfo: {
                    ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
                }
            };
        }

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.TestId == $scope.details[idx].TestId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        $scope.saveTickSheets = function () {
            $scope.details.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var item = {
                    Quantity: 1,
                    TestPrice: 10,
                    Discount: 0,
                    TaxCost: 0,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    NetAmount: 10,
                    OrderStatusId: $scope.item.OrderStatusId,
                    RequestDate: $scope.item.OrderRequestDate,
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    Status: 1,
                    TestId: ticksheetitem.ItemId
                }
                if (!checkExist(item)) {
                    item.autoSearchName = item.autoSearchName || getAutoSearchName();
                    $scope.details.push(item);
                    computeTestData(item, ticksheetitem.Testmaster);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.addTickSheet = function () {
            var testmaster = $scope.ticksheetconfig.selecteddetail.Testmaster;

            var currentItem = getNewItem();
            currentItem.TestId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.TestTypeId = testmaster.TESTMASTERTYPId;
            currentItem.TestName = testmaster.Name;
            currentItem.TestCode = testmaster.Code;
            currentItem.TestDescription = testmaster.Description;
            currentItem.SpecimanId = testmaster.SampletypeId;

            utl.Modal.open('patientemr.patientorderdetail', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    current_item: currentItem
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        //back

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        // TickSheet area ends

        $scope.addNew = function () {
            $state.reload();
            // utl.Modal.open('patientemr.patientorderdetail', {
            //     params: { id: 0, pid: $scope.item.PatientId },
            //     confirmCallback: $scope.onDetailSave
            // }
            // );
        }

        $scope.historypage = function () {
            utl.Modal.open('app.patientorderhistory', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    oid: $scope.item.Id
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        //original print
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
        }
        //print
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
            if ($scope.currentcontext.context == 'dashboard') {
                $state.go('patientemr.emrdashboard')
            }
        }

        //Dot matrix print starts
        $scope.printDotMatrix = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/patientorder/GetOrderHtml',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrintHTMLCallBack
            };
            utl.Http.doAction(options);
        }

        $scope.getPrintHTMLCallBack = function (scope, data, options, hasError) {
            var printOptions = {
                data: data
            };
            $scope.printHtml(printOptions);
        }
        //Dot matrix print ends

        $scope.getpendingorder = function (data) {
            $scope.currentcontext.id = data.id;
            $scope.getItem();
            $scope.getDetails();
        }
        $scope.pendingOrder = function () {
            utl.Modal.open('app.pendingorder', {
                params: {
                    id: $scope.item.PatientId,
                    eid: $scope.item.EncounterId
                },
                confirmCallback: $scope.getpendingorder
            });
        }

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
                    itemFromModal.PatientOrderId = $scope.currentcontext.id;
                }
                if (!checkExist(itemFromModal) && (itemFromModal.TestId)) {
                    itemFromModal.autoSearchName = itemFromModal.autoSearchName || getAutoSearchName();
                    $scope.details.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.editDetail = function (item) {
            if (item == 0) {
                $state.go(formState, {
                    id: 0,
                    pid: $scope.currentcontext.pid
                });
                // $scope.clear();
            } else {
                item.currenteditable = true;
                item.IsDisabled = $scope.IsDisabled;
                utl.Modal.open('patientemr.patientorderdetail', {
                    params: {
                        id: 0,
                        pid: $scope.item.PatientId,
                        current_item: item
                    },
                    confirmCallback: $scope.onDetailSave
                });
            }
        }

        $scope.previousorders = function () {
            utl.Modal.open('patientemr.previousorders', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId
                }
            });
        }


        $scope.patientallergy = function () {
            utl.Modal.open('patientemr.patientallergies', {
                params: {
                    pid: $scope.item.PatientId
                }
            });
        }

        $scope.vital = function () {
            utl.Modal.open('patientemr.patientvitals', {
                params: {
                    pid: $scope.item.PatientId
                }
            });
        }

        $scope.clear = function () {
            $scope.IsDisabled = false;
            $scope.details = [];
            $scope.item.OrderTotal = 0;
            $scope.addNewLineItem();
        }


        //computeNetAmount
        $scope.computeNetAmount = function (item) {
            if (item.TestPrice && item.Quantity) {
                item.NetAmount = item.TestPrice * item.Quantity;
                $scope.BillCalc();
            }
        }

        $scope.testChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.details, {
                pivotkey: 'TestId',
                displaykey: 'TestName'
            });
            if (isDuplicate) {
                item.TestName = '';
                item.TestId = '';
                return;
            }

            computeTestData(item, item.SelectedItem);
            var testdata = item.SelectedItem;
            var lastIndex = $scope.details.length - 1;
            if ($scope.details.indexOf(item) == lastIndex) {
                $scope.addNewLineItem();
            }
            $scope.getOrderInfoDetails(testdata);
        }

        $scope.getOrderDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientOrderDetails = res.Data || [];
            var orders = [];
            var orderdetails = [];
            if ($scope.vm.testcontrolconfig &&
                $scope.vm.testcontrolconfig.selected &&
                $scope.vm.testcontrolconfig.selected.Id) {
                for (var idx in res.Data) {
                    var orders = res.Data[idx];
                    if (orders.PatientId == $scope.item.PatientId) {
                        for (var iddx in orders.PatientOrderDetails) {
                            var orderdetails = orders.PatientOrderDetails[iddx];
                            if (orderdetails.TestId == $scope.vm.testcontrolconfig.selected.Id) {
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
                    Params: [{
                        Key: 12,
                        Value: FromDate
                    },
                    {
                        Key: 13,
                        Value: ToDate
                    },
                    {
                        Key: 2,
                        Value: $scope.item.PatientId
                    },
                        // { Key: 6, Value: vm.Context == 'OP' ? 1 : 5 }
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

        function computeTestData(item, testMaster) {
            //Set department id
            item.DepartmentId = testMaster.DepartmentId;
            item.IsDirectBill = testMaster.IsDirectBill;
            item.TestTypeId = testMaster.TESTMASTERTYPId;
            item.TestCode = testMaster.Code;
            item.TestName = testMaster.Name;
            item.TestDescription = testMaster.Description;
            item.SpecimanId = testMaster.SampletypeId;
            item.ResourceId = testMaster.ResourceId; // added by
            if (testMaster.ScheduleDate) {
                item.ScheduleDate = testMaster.ScheduleDate; // added by
            } else
                item.ScheduleDate = $scope.item.OrderScheduleDate;

            var Tariff = {
                Rate: 0,
                DoctorShare: 0
            };
            var ServiceItem = testMaster.ServiceItem;
            if (ServiceItem && ServiceItem.Id > 0 &&
                ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                Tariff = ServiceItem.ServiceItemTariffDetails[0];
            }

            item.TestPrice = Tariff.Rate;
            item.DoctorShare = Tariff.DoctorShare;
            item.IsExecutableProcedure = ServiceItem.IsExecutableProcedure;
            $scope.computeNetAmount(item);
        }

        $scope.BillCalc = function () {
            $scope.BillAmount = 0;
            $scope.BillDiscount = 0;
            $scope.item.OrderTotal = 0;
            $scope.details.forEach((item, idx) => {
                if (item.Status == 1) {
                    $scope.BillAmount += parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                    var netamt = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                    item.Discount = 0;
                    if ($scope.currentfilter.DiscountModeId > 0 &&
                        $scope.currentfilter.DiscountModeId == 2 &&
                        item.DiscountAmount > 0 && netamt > 0) {// percentage
                        var discamt = (item.DiscountAmount / 100) * netamt;
                        item.NetAmount = netamt - discamt;
                        item.Discount = discamt.toFixed(2);
                    } else if ($scope.currentfilter.DiscountModeId > 0 &&
                        $scope.currentfilter.DiscountModeId == 1 &&
                        item.DiscountAmount > 0) {
                        item.NetAmount = netamt - item.DiscountAmount;
                        item.Discount = parseFloat(item.DiscountAmount);
                    } else {
                        item.Discount = 0;
                        item.DiscountAmount = 0;
                        item.NetAmount = netamt;
                    }

                    $scope.BillDiscount += parseFloat(item.Discount);
                    item.Rate = item.TestPrice;
                    item.Quantity = item.Quantity;
                    item.Amount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                    item.GrossAmount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                    item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice)) - parseFloat(item.Discount);
                    $scope.item.OrderTotal += item.NetAmount;
                }
            });
        };


        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            var lastidx = $scope.details.length - 1;
            if ($scope.details.indexOf(item) === lastidx) {
                $scope.addNewLineItem();
            }
            $scope.setIndexforTableIndex();
            $scope.BillCalc();
        }

        $scope.deleteDetail = function (idx, item) {
            var lastidx = $scope.details.length - 1;
            if ($scope.details.indexOf(item) !== lastidx) {
                var name = item.TestName || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }


        }

        //getDetails
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
            $scope.setIndexforTableIndex();
        };
        $scope.copyDetailsCallback = function (scope, res, options, hasError) {
            var result = [];
            $scope.item.OrderTotal = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.autoSearchName = getAutoSearchName();
                $scope.item.OrderTotal += item.NetAmount;
                item.Id = 0;
                result.push(item);
            }
            $scope.details = result;
            $scope.addNewLineItem();
        };
        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };


                var options = {
                    action: 'emr/patientorderdetail/GetPatientOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyid > 0) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.copyid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };


                var options = {
                    action: 'emr/patientorderdetail/GetPatientOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.copyDetailsCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyFromOrderIds) {
                loadCopiedOrderLines($scope.currentcontext.copyFromOrderIds, $scope.currentcontext.copyDetailIds);
            } else {
                $scope.addNewLineItem();
            }
        };

        // Fields that describe the test itself; everything else (ids, billing, status, results) starts fresh.
        var COPIED_ORDER_FIELDS = ['GroupId', 'SideId', 'TestMasterPositionId', 'TestId', 'TestCode', 'TestName', 'CategoryName',
            'TestDescription', 'TestTypeId', 'DiagnosisId', 'TestPrice', 'TestPriceCurrencyCode', 'TestPriceCode', 'Discount', 'TestCost',
            'TestCostCurrencyCode', 'TestCostCode', 'TaxId', 'TaxCost', 'OrderToLocationId', 'OrderLocationId', 'TestInstruction',
            'SpecimanId', 'BodySiteId', 'Indication', 'ProfileName', 'PackageName', 'MasterObjectTypeId', 'MasterId', 'DepartmentId',
            'SubDepartmentId', 'Quantity', 'IsCalculateGST', 'NetAmount', 'IsPackage', 'IsExecutableProcedure', 'IsExternalLab',
            'ExternalPrice', 'ClinicalReason', 'OrderComments', 'Duration', 'DurationPeriodId'];

        function toCopiedOrderLine(source) {
            var line = getNewItem();
            COPIED_ORDER_FIELDS.forEach(function (field) {
                if (source[field] !== undefined) {
                    line[field] = source[field];
                }
            });
            return line;
        }

        function loadCopiedOrderLines(orderIds, detailIds) {
            var pending = orderIds.length;
            var copied = [];
            orderIds.forEach(function (orderId) {
                utl.Http.doAction({
                    action: 'emr/patientorderdetail/GetPatientOrderDetails',
                    data: { Params: [{ Key: 2, Value: orderId }], PageContext: { PageSize: 100, PageNumber: 1 } },
                    type: 'post',
                    onComplete: function (scope, res) {
                        (res && res.Data || []).forEach(function (line) {
                            var cancelled = line.OrderStatusId == 2 || line.Status === 2;
                            var wanted = !detailIds || detailIds.indexOf(line.Id) >= 0;
                            var alreadyCopied = copied.some(function (c) { return c.TestId === line.TestId; });
                            if (!cancelled && wanted && !alreadyCopied && line.TestId > 0) {
                                copied.push(toCopiedOrderLine(line));
                            }
                        });
                        pending--;
                        if (pending === 0) {
                            $scope.details = copied;
                            $scope.item.OrderTotal = copied.reduce(function (sum, l) { return sum + (Number(l.NetAmount) || 0); }, 0);
                            $scope.addNewLineItem();
                            if (copied.length) {
                                utl.Alert.showSuccessMsg(copied.length + ' test(s) copied from the previous visit. Review and save the order.');
                            }
                        }
                    }
                });
            });
        }


        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.OrderStatusId == 1 || $scope.item.OrderStatusId == 2) {
                $scope.IsDisabled = true;
                $scope.DisableCancelBtn = false;
            }
            if ($scope.item.OrderStatusId == 2) {
                $scope.DisableCancelBtn = true;
            }
            if ($scope.currentcontext.orderid) {
                $scope.IsDisabled = false;
            }
            loadTickSheet();
            $scope.refreshBanner();
            $scope.setIndexforTableIndex();
        }

        $scope.copyCallback = function (scope, data, options, hasError) {
            $scope.item.EncounterId = data.EncounterId;
            $scope.item.PatientId = data.PatientId;
            $scope.item.OrderTypeId = data.OrderTypeId; // was assigned to PatientId by mistake
            $scope.item.DoctorId = data.DoctorId;
            $scope.item.DoctorName = data.DoctorName;
            $scope.item.OrderFromId = data.OrderFromId;
            $scope.item.OrderToId = data.OrderToId;
            $scope.item.BillAmount = data.BillAmount;
            $scope.item.ServiceRateCategoryId = data.ServiceRateCategoryId;
            $scope.refreshBanner();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientorder/GetPatientOrderById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.copyid && $scope.currentcontext.copyid > 0) {
                var options = {
                    action: 'emr/patientorder/GetPatientOrderById',
                    data: {
                        Id: $scope.currentcontext.copyid
                    },
                    type: 'post',
                    onComplete: $scope.copyCallback
                };
                utl.Http.doAction(options);
            } else {
                //Set Order by value for Doctor login
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, utl.Session.getCurrentUserId());
                if (doctorObj) {
                    $scope.item.DoctorId = doctorObj.Id;
                    $scope.item.OrderFromId = doctorObj.DepartmentId;
                }
            }
        };

        //Actions

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
                return;
            }
            if ($scope.currentcontext.context == 'dashboard') {
                $state.go('patientemr.clinicalorders');
            } else
                $state.go(parentState, {
                    tp: $scope.currentcontext.testtype
                });
        }

        $scope.saveDraft = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'DRAFT');
            $scope.saveItem();
        }

        $scope.createOrder = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
            $scope.completeOrder();
        }
        $scope.doctorChange = function () {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            if (doctorObj) {
                $scope.item.OrderFromId = doctorObj.DepartmentId;
            }
        }

        $scope.onCancelConfirmed = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CANCELLED');
            $scope.saveItem();
        }

        $scope.openattachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.currentcontext.id,
                        itemid: $scope.item.Id,
                        objecttypeid: 1
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('Please Order'));
            }
        }
        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }
        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.id
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        }




        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.completeOrder = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.amountcollectinpatientorder =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'amountcollectinpatientorder');

            var callbackmethod = $scope.saveItem;
            if ($scope.amountcollectinpatientorder) {
                if (checkMandatoryFields()) {
                    callbackmethod = $scope.openAdanace;
                    var confirmOptions = {
                        headingKey: 'common.confirm-modal-header.lbl',
                        messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                        yesKey: 'common.yeskey.lbl',
                        noKey: 'common.nokey.lbl',
                        onSuccessMethod: callbackmethod,
                    };
                    utl.Dialog.confirmMessage(confirmOptions);
                }
            } else {
                if (checkMandatoryFields()) {
                    var confirmOptions = {
                        headingKey: 'common.confirm-modal-header.lbl',
                        messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                        yesKey: 'common.yeskey.lbl',
                        noKey: 'common.nokey.lbl',
                        onSuccessMethod: callbackmethod,
                    };
                    utl.Dialog.confirmMessage(confirmOptions);
                }
            }
        }

        function removeLastEntryBeforeSave() {
            var item = $scope.details[$scope.details.length - 1];
            if (!item.TestId || item.TestId == -1) {
                $scope.details.splice(-1, 1);
            }
        }

        //Save item callback
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                if ($scope.currentcontext.ismodal) {
                    $scope.confirmCallback();
                }
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                if ($scope.currentcontext.ismodal) {
                    $scope.confirmCallback();
                }
                $scope.currentcontext.id = data;
            }

            if ($scope.item && $scope.item.PatientReceiptId) {
                var inputData = {
                    Id: $scope.item.PatientReceiptId
                };
                var options = {
                    action: 'Billing/PatientPaymentDetails/PrintPatientPaymentDetails',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }

            ////// if ($scope.currentcontext.context == 'dashboard') {
            //////     $state.go('patientemr.emrdashboard')
            ////// }
            //loadData();
            //$scope.print();
            if ($scope.currentcontext.returnurl) $scope.cancelCallback();
            else $scope.backToList();
        };

        $scope.openAdanace = function () {
            $scope.item.PatientReceiptId = null;
            var advcomments = '';
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (item && item.Status == 1 && item.TestName) {
                    if (!advcomments) advcomments = item.TestName;
                    else advcomments += ' ,  ' + item.TestName;
                }
            }

            if (advcomments) {
                advcomments += ' , Total Amt:  ' + $scope.item.OrderTotal;
            }

            utl.Modal.open('app.ipreceipt-form', {
                params: {
                    id: $scope.Encounter.Id,
                    rid: 0,
                    billid: 0,
                    osamt: $scope.item.OrderTotal,
                    patientorderreq: true,
                    advcomments: advcomments,
                    summarystatus: $scope.Encounter.IsBillFinalized,
                    guarantorid: $scope.Encounter.GuarantorId,
                    patient: $scope.Encounter.Patient,
                    guarantortypeid: $scope.Encounter.GuarantorTypeId
                },
                confirmCallback: $scope.getReceiptId,
                cancelCallback: $scope.saveItem,
            });
        }

        $scope.getReceiptId = function (data) {
            if (data && data.ReceiptId) {
                $scope.item.PatientReceiptId = data.ReceiptId;
            }
            $scope.saveItem();
        }

        $scope.saveItem = function () {

            //removeLastEntryBeforeSave();

            // TODO : Patient edit check
            if ($scope.item.OrderStatusId != 2 && !utl.Validator.validate($scope)) {
                return;
            }

            //Check Mandatory values
            if (checkMandatoryFields()) {

                var lines = getLinesForSave();
                var actionName = 'emr/patientorder/AddPatientOrderWithExecutableProcedures';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/patientorder/UpdatePatientOrder';
                } else
                    $scope.item.BillingStatusId = 1;
                if ($scope.item.OrderStatusId == 1 && $scope.Encounter) {
                    $scope.item.WardId = $scope.Encounter.WardId;
                    $scope.item.RoomId = $scope.Encounter.RoomId;
                    $scope.item.BedId = $scope.Encounter.BedId;
                    if ($scope.Encounter.EncounterTypeId == 2)
                        $scope.item.BillingStatusId = 2;
                }
                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
                // inputData.BillData = {};
                // if ($scope.item.OrderStatusId == 1) {
                //     inputData.BillData.Data = $scope.billDetailsToSave();
                // }

                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.details, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.TestId > -1 && (item.Quantity <= 0 || item.TestPrice <= 0)) {
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
                item.OrderStatusId = $scope.item.OrderStatusId;
                item.FacilityId = utl.Session.getCurrentFacilityId();
                if (item.TestId > -1 && item.Status == 1) {
                    result.push(item);
                    ordertotal += item.NetAmount;
                }
            }
            $scope.item.OrderTotal = ordertotal;
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getDetails();
            $scope.getPatientAttachments();

            if (!isMainContext()) {
                $timeout(function () {
                    $('#desc0').focus();
                }, 1000);
            }
        }

        // Patient AutoSearch
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Title',
                field: 'Title',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Name',
                field: 'PatientName',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Age/Gender',
                field: 'Age',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'DOB',
                field: 'DOB',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'MRN',
                field: 'MRN',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Visit#',
                field: 'VisitIdentifier',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Ward/Room/Bed',
                field: 'WardDetail',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
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
                } else if (selectedItem.IsBillFinalized) {
                    var msg = 'Bill has been Finalized';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                    selectedItem = '';
                    $scope.item = {};
                }
            }
            var result = '';
            if (selectedItem) {
                result = '';
                if (selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = '';
                if (selectedItem.Patient && selectedItem.Patient.Title)
                    result += selectedItem.Patient.Title.Description;
                if (selectedItem.Patient && selectedItem.Patient.FirstName)
                    result += ' ' + selectedItem.Patient.FirstName;
                if (selectedItem.Patient && selectedItem.Patient.LastName)
                    result += ' ' + selectedItem.Patient.LastName;
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
                $scope.item.PatientName = '';
                if (selectedItem.Patient.Title)
                    $scope.item.PatientName += selectedItem.Patient.Title.Description;

                if (selectedItem.Patient.FirstName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.FirstName;

                if (selectedItem.Patient.LastName)
                    $scope.item.PatientName += ' ' + selectedItem.Patient.LastName;

                if (selectedItem.EncounterTypeId == 2) {
                    $scope.item.EncounterTypeId = 2;
                    $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
                } else {
                    $scope.item.ServiceRateCategoryId = 1;
                    $scope.item.EncounterTypeId = 1;
                }
                $scope.item.EncounterId = selectedItem.Id;

                $scope.refreshBanner();
                loadTickSheet();
            }
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;

            //Only ip encounter
            var inputData = {
                Params: [

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.id == 0 && $scope.currentcontext.testtype > 0) {
                inputData.Params.push({
                    Key: 3,
                    Value: 2 || 3 || 4
                }, {
                        Key: 15,
                        Value: 2
                    })
            }

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 11,
                    Value: query
                });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                if (item.Patient.LastName) item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                else item.PatientName = item.Patient.FirstName;
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

        // TestMaster AutoSearch
        vm.testcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Name',
                field: 'Name',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Type',
                field: 'Sampletype',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            },
            {
                header: 'Department',
                field: 'Department',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            {
                header: 'Price',
                field: 'Price',
                datatype: 'string',
                headercls: 'td-price',
                fieldcls: 'td-price'
            },
            ],
            searchparams: {},
            result: {},
            api: 'lis/testmaster/GetTestmasters',
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
                Params: [{
                    Key: 3,
                    Value: $scope.currentcontext.testtype
                },
                {
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 8,
                    Value: {
                        'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId,
                        // tariffs are per facility; without it every test priced at 0 and could not be ordered
                        'FacilityId': utl.Session.getCurrentFacilityId()
                    }
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.testcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.testcontrolconfig.searchparams = inputData;
        }

        function postsearchtest() {
            for (var idx in vm.testcontrolconfig.result) {
                var item = vm.testcontrolconfig.result[idx];
                var Tariff = {
                    Rate: 0,
                    DoctorShare: 0
                };
                var ServiceItem = item.ServiceItem;
                if (ServiceItem && ServiceItem.Id > 0 &&
                    ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                    Tariff = ServiceItem.ServiceItemTariffDetails[0];
                }
                item.Tariff = Tariff;
                item.Price = Tariff.Rate;
                item.Department = item.Department.DepartmentName;
                if (item.SampletypeId > 0) {
                    item.Sampletype = item.Sampletype.Name;
                }
            }
        }
        $scope.testprofiledetails = function (TestId) {
            utl.Modal.open('app.testprofile', {
                params: {
                    tid: TestId
                },
                confirmCallback: $scope.getList
            });
        }

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "User"
            },
            {
                "Key": "OrderPriority"
            },
            {
                "Key": "Department"
            },
            {
                "Key": "ServiceRateCategory"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "OrderStatus",
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

        /*  06-09-17 -Resource Avialability  start  */

        // item.ResourceId  added
        $scope.itemindex = -1;
        $scope.getResourceAppointment = function (idx, item) {
            $scope.itemindex = idx;
            var lastidx = $scope.details.length - 1;
            if ($scope.details.indexOf(item) !== lastidx) {
                utl.Modal.open('app.appointment', {
                    params: {
                        id: 0,
                        ct: 'ris',
                        ResourceId: item.ResourceId,
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getAppointmentModalCallback
                });
            }
        };

        $scope.getAppointmentModalCallback = function (orderscheduleId) {
            //console.log(orderscheduleId);
            var options = {
                action: 'appointment/Appointment/GetAppointmentById',
                data: {
                    Id: orderscheduleId
                },
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



        /*  06-09-17 -Resource Avialability  End  */


    }

    patientOrderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig', '$timeout'];

})();