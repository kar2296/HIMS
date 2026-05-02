(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnProcedureOrdersSectionController', cnProcedureOrdersSectionController);

    function cnProcedureOrdersSectionController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.details = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            TestTypeId: -1,
            orderstatusid: 1,
            patient: ''
        };
        $scope.CanShowOrder = false;
        $scope.canShowPrint = false;
        $scope.IsSavePanels = false;
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || 0,
            OrderFromId: 0,
            IsSelf: false,
            Quantity: 1
        };
        $scope.CanShowCancel = false;
        $scope.CanShowOrder = false;
        $scope.details = [];
        $scope.IsDisabled = false;
        $scope.OrderData = {};
        $scope.currentcontext.id = 0;
        $scope.CanShowCancel = false;
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.consid = parseInt(modalConfig.params.consid);
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId());
        $scope.currentcontext.option = 'detail';
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.ConsultationId = $scope.$parent.cncontext.consultationid;
        $scope.item.ConsultationId = $scope.$parent.cncontext.consultationid;
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.DoctorName = $scope.currentcontext.encounter.DoctorName;
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
            $scope.IsBillLocked = $scope.currentcontext.encounter.IsBillLock;
            if ($scope.currentcontext.encounter.EncounterStatusId == 1) {
                $scope.EncounterStatus = 'CheckedIn'
            }
            if ($scope.currentcontext.encounter.EncounterStatusId == 2) {
                $scope.EncounterStatus = 'CheckedOut'
            }
        }

        $scope.options = [{
                key: 'detail',
                name: $translate.instant('Add Procedures')
            },
            {
                key: 'ticksheet',
                name: $translate.instant('Favorites')
            }
        ];

        $scope.canShowOrdersArea = function() {
            return $scope.currentcontext.option == 'detail';
        }

        $scope.canShowTickSheetArea = function() {
            return $scope.currentcontext.option == 'ticksheet';
        }


        $scope.addorders = function() {
            $state.go('patientemr.consultation');
        };
        $scope.favorders = function() {
            $state.go('patientemr.notefavorate', {
                pid: $scope.currentcontext.pid
            });
        };

        //getList
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.details = [];
            // $scope.IsDisabled = true;
            $scope.CanShowOrder = false;
            $scope.canShowPrint = true;
            if ($scope.currentcontext.orderid > 0) {
                $scope.details = [];
                for (var idx in res.Data) {
                    res.Data[idx].Id = 0;
                    res.Data[idx].procedureorderId = 0;
                    res.Data[idx].OrderPriority = res.Data[idx].OrderPriority.Description;
                    res.Data[idx].TestType = res.Data[idx].TESTMASTERTYP.Description;
                    $scope.details.push(res.Data[idx]);
                    $scope.IsDisabled = false;
                    $scope.CanShowOrder = true;
                }
            }
            if ($scope.currentcontext.orderid == 0) {
                if (res.Data.length > 0) {
                    var lastIndex = res.Data.length - 1;
                    $scope.LastOrders = res.Data[lastIndex];
                    if ($scope.LastOrders.OrderPriority) {
                        $scope.LastOrders.OrderPriority = $scope.LastOrders.OrderPriority.Description;
                    }
                    $scope.OrderData = $scope.LastOrders;
                    // $scope.details = res.Data;
                    $scope.currentcontext.id = $scope.LastOrders.procedureorder.Id;
                    $scope.getLatestOrderDetails();
                }
            }

        };

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 14,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.encounter.Id
                    },
                    {
                        Key: 17,
                        Value: $scope.currentcontext.ConsultationId
                    },
                ],
            };

            var options = {
                action: 'emr/ProcedureOrderDetail/GetProcedureOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getLatestOrderDetailsCallback = function(scope, res, options, hasError) {
            for (var idx in res.Data) {
                var orderData = res.Data[idx];
                if (orderData.TESTMASTERTYP)
                    orderData.TestType = orderData.TESTMASTERTYP.Description;
                if (orderData.OrderPriority)
                    orderData.OrderPriority = orderData.OrderPriority.Description;
                $scope.details.push(orderData);
            }
        };

        $scope.getLatestOrderDetails = function() {
            var inputData = {
                Params: [{
                        Key: 14,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.encounter.Id
                    },
                ],
            };
            if ($scope.currentcontext.id) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.id
                });
            }
            var options = {
                action: 'emr/ProcedureOrderDetail/GetProcedureOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLatestOrderDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function() {
            $scope.details = [];
            $scope.IsDisabled = false;
            $scope.OrderData = {};
            $scope.currentcontext.id = 0;
            $scope.CanShowOrder = false;
            $scope.canShowPrint = false;
            $scope.CanShowCancel = false;
        };

        //Grid Actions

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        }
        $scope.addOrder = function() {
            if ($scope.item.ServiceItemId > 0) {
                var OrderData = {
                    Id: 0,
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    DoctorId: $scope.item.DoctorId,
                    DoctorName: $scope.item.DoctorName,
                    DepartmentId: $scope.item.DepartmentId,
                    ServiceItemId: $scope.item.ServiceItemId,
                    ServiceCode: $scope.item.ServiceCode,
                    ServiceName: $scope.item.ServiceName,
                    ProcedureId: $scope.item.ProcedureId,
                    ProcedureCode: $scope.item.ProcedureCode,
                    ProcedureName: $scope.item.ProcedureName,
                    ServiceCategoryId: $scope.item.ServiceCategoryId,
                    ServiceCategoryName: $scope.item.ServiceCategoryName,
                    ServicePrice: $scope.item.ServicePrice,
                    ProcedurePrice: $scope.item.ProcedurePrice,
                    Quantity: $scope.item.Quantity,
                    ProcedureInstructions: $scope.item.ProcedureInstructions,
                    NetAmount: 0,
                    IsOrdered: true,
                    DoctorId: $scope.item.DoctorId,
                    IsDirectBill: false,
                    IsCanceled: false,
                    OrderStatusId: $scope.item.OrderStatusId,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    OrderPriority: $scope.item.OrderPriority || 'Routine',
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    PatientBillStatusId: 3,
                    Status: 1
                }
                $scope.details.push(OrderData);
                $scope.computeNetAmount(OrderData);
                $scope.ClearData();
            } else {
                utl.Alert.showErrorMsg('Select any Procedure');
                return false;
            }
        }
        $scope.ClearData = function() {
            document.getElementById("ServiceItemId").value = '';
            // document.getElementById("item_form").reset();
            $scope.item.ServiceItemId = 0;
            $scope.item.ServiceName = '';
            $scope.item.Quantity = 1;
            $scope.item.ServicePrice = '';
            $scope.item.OrderPriorityId = 1;
            $scope.item.ProcedureInstructions = '';
            $scope.CanShowOrder = true;
            $scope.canShowPrint = false;
        }

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'ServiceItem Rate',
                    field: 'ServiceItemRate',
                    datatype: 'string',
                    headercls: 'td-rate',
                    fieldcls: 'td-rate'
                }
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
                Params: [{
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 30,
                        Value: $scope.item.ServiceRateCategoryId
                    },
                    {
                        Key: 29,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                    ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
                }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare || 0;
                }
            }
        }

        $scope.serviceChanged = function(idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.details, {
                pivotkey: 'ServiceItemId',
                displaykey: 'Name'
            });
            if (isDuplicate) {
                item.Name = '';
                item.ServiceItemId = '';
                return;
            }

            computeTestData(item, item.SelectedItem);
        };

        function computeTestData(item, testMaster) {
            item.DepartmentId = testMaster.DepartmentId;
            item.IsDirectBill = testMaster.IsDirectBill || false;
            item.TestTypeId = testMaster.TESTMASTERTYPId;
            if (testMaster.TESTMASTERTYP)
                item.TestType = testMaster.TESTMASTERTYP.Description;
            item.TestCode = testMaster.Code;
            item.TestName = testMaster.Name;
            item.TestDescription = testMaster.Description;
            item.SpecimanId = testMaster.SampletypeId;
            item.ResourceId = testMaster.ResourceId || 0;
            if (testMaster.ServiceItem) {
                item.CategoryId = testMaster.ServiceItem.CategoryId || 0;
                if (testMaster.ServiceItem.ParentCategory) {
                    item.CategoryName = testMaster.ServiceItem.ParentCategory.ServiceCategoryName || '';
                }
            }
            if (testMaster.ScheduleDate) {
                item.ScheduleDate = testMaster.ScheduleDate;
            } else
                item.ScheduleDate = $scope.item.OrderScheduleDate;

            var Tariff = {
                Rate: 0,
                DoctorShare: 0
            };
            /*
            var ServiceItem = testMaster.ServiceItem;
            if (ServiceItem && ServiceItem.Id > 0 &&
                ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                Tariff = ServiceItem.ServiceItemTariffDetails[0];
            }
            */
            if (testMaster.ServiceItemTariffDetails && testMaster.ServiceItemTariffDetails.length > 0) {
                Tariff = testMaster.ServiceItemTariffDetails[0];
            }

            item.TestPrice = Tariff.Rate;
            $scope.item.TestPrice = Tariff.Rate;
            item.DoctorShare = Tariff.DoctorShare || 0;
            $scope.computeNetAmount(item);
        }

        $scope.BillCalc = function() {
            $scope.BillAmount = 0;
            $scope.BillDiscount = 0;
            $scope.item.OrderTotal = 0;
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                $scope.BillAmount += parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                $scope.BillDiscount += parseFloat(item.Discount);
                item.Rate = item.TestPrice;
                item.Quantity = item.Quantity;
                item.Amount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                item.GrossAmount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
                item.DiscountAmount = parseFloat(item.Discount);
                if (item.Discount) {
                    item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice)) - parseFloat(item.Discount);
                } else {
                    item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice));
                }
                $scope.item.OrderTotal += item.NetAmount;
            }
            // $scope.details.forEach((item, idx) => {
            //     $scope.BillAmount += parseFloat(item.Quantity) * parseFloat(item.TestPrice);
            //     $scope.BillDiscount += parseFloat(item.Discount);
            //     item.Rate = item.TestPrice;
            //     item.Quantity = item.Quantity;
            //     item.Amount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
            //     item.GrossAmount = parseFloat(item.Quantity) * parseFloat(item.TestPrice);
            //     item.DiscountAmount = parseFloat(item.Discount);
            //     item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice)) - parseFloat(item.Discount);
            //     $scope.item.OrderTotal += item.NetAmount;
            // });
        };
        $('.panel-title > a').click(function() {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.computeNetAmount = function(item) {
            if (item.TestPrice && item.Quantity) {
                item.NetAmount = item.TestPrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.ServiceItemId == $scope.details[idx].ServiceItemId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        $scope.ticksheetconfig = {
            ticksheetmastertypeid: 2,
            selectedlist: [],
            selecteddetail: {},
            departmentid: -1
        };

        $scope.saveTickSheets = function() {
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
                    ServiceItemId: ticksheetitem.ItemId
                }
                if (!checkExist(item)) {
                    // item.autoSearchName = item.autoSearchName || getAutoSearchName();
                    $scope.details.push(item);
                    computeTestData(item, ticksheetitem.Testmaster);
                }
            }
            // $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.addTickSheet = function() {
            var testmaster = $scope.ticksheetconfig.selecteddetail.Testmaster;

            var currentItem = getNewItem();
            currentItem.ServiceItemId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.TestTypeId = testmaster.TESTMASTERTYPId;
            currentItem.TestName = testmaster.Name;
            currentItem.TestCode = testmaster.Code;
            currentItem.TestDescription = testmaster.Description;

            utl.Modal.open('patientemr.procedureorderdetail', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    current_item: currentItem
                },
                confirmCallback: $scope.onDetailSave
            });
        }


        $scope.OnPrioritySelected = function(selectedItem) {
            $scope.item.OrderPriority = selectedItem.Text;
        };

        $scope.createOrder = function() {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
            $scope.completeOrder();
        };

        $scope.completeOrder = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            $scope.ClearData();
            $scope.getList();
        };

        $scope.saveItem = function() {
            if ($scope.item.OrderStatusId == 2) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                var actionName = 'emr/ProcedureOrder/AddProcedureOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/ProcedureOrder/UpdateProcedureOrder';
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
                }
                var inputData = {
                    Header: $scope.item,
                    Details: lines
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
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.details, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.ServiceItemId > -1 && item.Quantity <= 0) {
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
                item.RequestDate = $scope.item.OrderRequestDate;
                item.IsDirectBill = item.IsDirectBill || false;
                if ($scope.item.GuarantorId == 1000) {
                    item.OrderDetailApprovalStatusId = 4;
                    item.IsSelf = true;
                }
                if (item.ServiceItemId > -1 && item.Status == 1) {
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



        $scope.viewConsultation = function(item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: {
                    cid: item.Id,
                    pid: $scope.currentcontext.pid
                }
            });
        };

        $scope.getAllConsultationCallback = function(scope, res, options, hasError) {
            $scope.consultlist = res.Data;
        };

        $scope.getallConsultation = function(pageNo) {
            var inputData = {
                Params: [
                    // { Key: 2, Value: $scope.currentcontext.eid },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getCurrentConsultationCallback = function(scope, data, options, hasError) {
            var ConsultData = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
        };

        $scope.getCurrentConsultation = function(pageNo) {
            if ($scope.currentcontext.ConsultationId && $scope.currentcontext.ConsultationId > 0) {
                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: {
                        Id: $scope.currentcontext.ConsultationId
                    },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.order_history = function() {
            utl.Modal.open('patientemr.cnorders', {
                params: {
                    pid: $scope.currentcontext.pid,
                    cid: $scope.currentcontext.ConsultationId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.getPreviousOrderListCallback = function(scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var consultlist = 0;
                for (var idx in res.Data) {
                    var Order = res.Data[idx];
                    if (!Order.ConsultationId) {
                        consultlist++
                    }
                }
                if (consultlist > 0) {
                    $scope.order_history();

                } else {
                    $scope.getList();
                }
            } else {
                $scope.getList();
            }
        };

        $scope.getPreviousOrderList = function() {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/ProcedureOrder/GetProcedureOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPreviousOrderListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getPreviousOrderList();
            $scope.getList();
        };



        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "OrderPriority"
                },
                {
                    "Key": "OrderStatus"
                },
                // {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "TESTMASTERTYP"
                },
                {
                    "Key": "EncounterType"
                },
                {
                    "Key": "Department"
                },
                // {
                //     "Key": "Guarantor"
                // },
                {
                    "Key": "OrderType"
                },
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
    }
    cnProcedureOrdersSectionController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();