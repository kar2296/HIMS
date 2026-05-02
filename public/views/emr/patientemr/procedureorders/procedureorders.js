(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ProcedureOrdersController', ProcedureOrdersController);

    function ProcedureOrdersController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.details = [];
        $scope.LastOrders = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            TestTypeId: -1,
            orderstatusid: 1,
            patient: ''
        };
        $scope.IsDisabled = false;

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }

        // $scope.canShowTickSheetArea = function () {
        //     return $scope.currentcontext.option == 'ticksheet';
        // };
        $scope.CanShowOrder = false;
        $scope.canShowPrint = false;
        $scope.IsSavePanels = false;
        $scope.item = {
            Quantity: 1,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || 0,
            OrderFromId: 0,
            IsSelf: false
        };
        $scope.showbutton = false;
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

        if ($stateParams.orddetails) {
            $scope.details = $stateParams.orddetails;
            $scope.CanShowOrder = true;
            $scope.currentcontext.id = 0;
        } else {
            $scope.currentcontext.id = 0;
        }

        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId()),
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
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
            $scope.IsBillLocked = $scope.currentcontext.encounter.IsBillLock;
            if ($scope.currentcontext.encounter.EncounterStatusId == 1) {
                $scope.EncounterStatus = 'CheckedIn'
            }
            if ($scope.currentcontext.encounter.EncounterStatusId == 2) {
                $scope.EncounterStatus = 'CheckedOut'
            }
        }

        $scope.currentcontext.uid = parseInt(utl.Session.getCurrentUserId());
        if ($stateParams.pid) {
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        }
        if ($stateParams.cid) {
            $scope.currentcontext.copyid = $stateParams.cid;
            $scope.currentcontext.orderid = $scope.currentcontext.copyid;
        } else {
            $scope.currentcontext.orderid = 0;
        }

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.details = [];
            // if ($scope.currentcontext.orderid > 0) {
            //     $scope.CanShowOrder = false;
            //     $scope.canShowPrint = true;
            // }
            $scope.CanShowOrder = false;
            $scope.canShowPrint = true;
            $scope.IsDisabled = true;
            if ($scope.currentcontext.orderid > 0) {
                $scope.details = [];
                for (var idx in res.Data) {
                    res.Data[idx].Id = 0;
                    res.Data[idx].ProcedureOrderId = 0;
                    res.Data[idx].OrderPriority = res.Data[idx].OrderPriority.Description;
                    //                     res.Data[idx].TestType = res.Data[idx].TESTMASTERTYP.Description;
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
                    // $scope.CanShowOrder = true;
                }
                $scope.currentcontext.id = $scope.LastOrders.ProcedureOrder.Id;
                $scope.getLatestProcedureDetails();
            }

        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 14,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 15,
                    //     Value: $scope.currentfilter.orderstatusid
                    // },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.encounter.Id
                    },
                ],
            };
            if ($scope.currentcontext.orderid) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.orderid
                });
            }
            var options = {
                action: 'emr/ProcedureOrderDetail/GetProcedureOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getLatestProcedureDetailsCallback = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                var procedureData = res.Data[idx];
                procedureData.OrderPriority = procedureData.OrderPriority.Description;
                $scope.details.push(procedureData);
            }
            $scope.IsDisabled = false;
        };

        $scope.getLatestProcedureDetails = function () {
            var inputData = {
                Params: [{
                        Key: 14,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 15,
                    //     Value: $scope.currentfilter.orderstatusid
                    // },
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
                onComplete: $scope.getLatestProcedureDetailsCallback
            };
            utl.Http.doAction(options);
        };
        //Grid Actions

        $scope.addNew = function () {
            if (!$scope.IsBillLocked) {
                $scope.details = [];
                $scope.CanShowOrder = false;
                $scope.canShowPrint = false;
                $scope.IsDisabled = false;
                $scope.OrderData = {};
                $scope.currentcontext.id = 0;
            } else {
                var msg = '';
                msg = 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.canShowPrint = function () {
            return $scope.IsDisabled || $scope.item.OrderStatusId == 3 || $scope.item.OrderStatusId == 4 || $scope.item.OrderStatusId == 5 ||
                $scope.item.OrderStatusId == 6 || $scope.item.OrderStatusId == 7 || $scope.item.OrderStatusId == 8 || $scope.item.OrderStatusId == 10;
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };

        $scope.addOrder = function () {
            if ($scope.item.ServiceItemId) {
                var OrderData = {
                    Id: 0,
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    DepartmentId: $scope.item.DepartmentId,
                    ProcedureId: $scope.item.ServiceItemId,
                    ProcedureCode: $scope.item.ProcedureCode,
                    ProcedureName: $scope.item.ProcedureName,
                    ProcedureDescription: $scope.item.ProcedureDescription,
                    ProcedurePrice: $scope.item.ServicePrice,
                    ServiceItemId: $scope.item.ServiceItemId,
                    ServiceCode: $scope.item.ServiceCode,
                    ServiceName: $scope.item.ServiceName,
                    ServiceCategoryId: $scope.item.ServiceCategoryId,
                    ServiceCategoryName: $scope.item.ServiceCategoryName,
                    ServicePrice: $scope.item.ServicePrice,
                    OrderType: $scope.item.OrderType,
                    Quantity: $scope.item.Quantity,
                    Comments: $scope.item.Comments,
                    NetAmount: 0,
                    IsOrdered: true,
                    DoctorId: $scope.item.DoctorId,
                    IsDirectBill: false,
                    IsCanceled: false,
                    OrderStatusId: $scope.item.OrderStatusId,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    OrderPriority: $scope.item.OrderPriority || 'Routine',
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    PatientBillStatusId: 1,
                    Status: 1
                }
                $scope.details.push(OrderData);
                $scope.computeNetAmount(OrderData);
                $scope.ClearData();
            } else {
                utl.Alert.showErrorMsg('Select any Test');
                return false;
            }
        }
        $scope.addorders = function () {
            $state.go('patientemr.procedureordertab.procedureorders');
        };
        $scope.favorders = function () {
            $state.go('patientemr.procedureordertab.favoriteorders', {
                pid: $scope.currentcontext.pid
            });
        };

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.ProcedureId == $scope.details[idx].ProcedureId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }
        $scope.panelconfig = {
            paneltypeid: 1,
            selectedlist: {}
        };

        $scope.savePanels = function () {
            $scope.details = [];
            var panelitem = $scope.panelconfig.selectedlist;
            for (var indx in panelitem.TemplateMasterDetails) {
                // var TestType = '';
                // if (panelitem.TemplateMasterDetails[indx].TestTypeId == 1) {
                //     TestType = 'Lab';
                // }
                // if (panelitem.TemplateMasterDetails[indx].TestTypeId == 2) {
                //     TestType = 'Radiology';
                // }
                var item = {
                    Id: 0,
                    ProcedureOrderId: 0,
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    ProcedureId: panelitem.TemplateMasterDetails[indx].ItemId,
                    ProcedureCode: panelitem.TemplateMasterDetails[indx].ServiceCode || '',
                    ProcedureName: panelitem.TemplateMasterDetails[indx].ServiceName || '',
                    ServiceItemId: panelitem.TemplateMasterDetails[indx].ItemId,
                    ServiceCategoryId: panelitem.TemplateMasterDetails[indx].ServiceCategoryId,
                    ServiceCode: panelitem.TemplateMasterDetails[indx].ServiceCode,
                    ServiceName: panelitem.TemplateMasterDetails[indx].ServiceName,
                    ProcedureTypeId: panelitem.TemplateMasterDetails[indx].TemplateTypeId,
                    // ProcedureType: ProcedureType,
                    Quantity: panelitem.TemplateMasterDetails[indx].Quantity,
                    IsDirectBill: panelitem.TemplateMasterDetails[indx].IsDirectBill,
                    ProcedurePrice: $scope.item.TestPrice,
                    DoctorId: $scope.item.DoctorId,
                    OrderStatusId: $scope.item.OrderStatusId,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    OrderPriority: $scope.item.OrderPriority || 'Routine',
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    PatientBillStatusId: 3,
                    Status: 1,
                    StartDate: utl.Formatter.getCurrentDate(),
                };
                if (!checkExist(item)) {
                    $scope.details.push(item);
                    $scope.IsSavePanels = true;
                    $scope.IsDisabled = false;
                    $scope.CanShowOrder = true;
                    $scope.currentcontext.id = 0;
                }
            }
        };
        $scope.ClearData = function () {
            document.getElementById("testid").value = '';
            $scope.item.ServiceItemId = 0;
            $scope.item.Quantity = 1;
            $scope.item.ServicePrice = '';
            $scope.item.OrderPriorityId = 1;
            $scope.item.Comments = '';
            $scope.CanShowOrder = true;
            $scope.canShowPrint = false;
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
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        $scope.procedure_history = function () {
            utl.Modal.open('patientemr.procedureorderhistory', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getItem
            });
        };


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.OrderId = data.Id;
            $scope.CanShowCancelOrder = true;
            $scope.CanShowOrder = false;
            $scope.canShowPrint = true;
            if (data.OrderStatusId == 2) {
                $scope.CanShowCancelOrder = false;
            }

            $scope.getList();
        };

        $scope.getItem = function (returnData) {
            if (returnData.ordid && returnData.ordid > 0) {
                var options = {
                    action: 'emr/procedureorder/GetProcedureOrderById',
                    data: {
                        Id: returnData.ordid
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

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

        $scope.serviceChanged = function (idx, item) {
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

        function computeTestData(item, serviceMaster) {
            var Tariff = {
                Rate: 0,
                DoctorShare: 0
            };

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
            // item.OrderType = serviceMaster.TESTMASTERTYP.Description;
            item.ServiceName = serviceMaster.Name;
            item.ServiceCategoryId = serviceMaster.CategoryId;
            if (serviceMaster.ParentCategory) {
                item.ServiceCategoryName = serviceMaster.ParentCategory.ServiceCategoryName;
            } else {
                item.ServiceCategoryName = '';
            }
            item.ServicePrice = Tariff.Rate;
            $scope.item.ServicePrice = Tariff.Rate;
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

        $scope.computeNetAmount = function (item) {
            if (item.ServicePrice && item.Quantity) {
                $scope.item.NetAmount = item.ServicePrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        $scope.BillCalc = function () {
            $scope.item.OrderTotal = 0;
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                $scope.item.OrderTotal += item.NetAmount;
            }
            // $scope.details.forEach((item, idx) => {
            //     $scope.item.OrderTotal += item.NetAmount;
            // });
        };

        $scope.OnPrioritySelected = function (selectedItem) {
            $scope.item.OrderPriority = selectedItem.Text;
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

        $scope.onCancelConfirmed = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CANCELLED');
            $scope.saveItem();
        };

        $scope.createOrder = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
            // if ($scope.item.OrderStatusId === -1) {
            //     $scope.item.OrderStatusId = 2;
            // }
            $scope.completeOrder();
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
            $scope.currentcontext.id = data;
            $scope.ClearData();
            $scope.getList();
        };

        $scope.saveItem = function () {
            if ($scope.item.OrderStatusId != 2 && !utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.currentcontext.copyid > 0) {
                $scope.currentcontext.id = 0;
            }
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'emr/procedureorder/AddProcedureOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/procedureorder/UpdateProcedureOrder';
                } else {
                    $scope.item.BillingStatusId = 1;
                }
                if ($scope.item.OrderStatusId == 1 && $scope.Encounter) {
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
                if (item.ServiceItemId > 0 && item.Quantity <= 0) {
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

        $('.panel-title > a').click(function () {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.getPrevListCallback = function (scope, res, options, hasError) {
            $scope.CanShowOrder = true;
            $scope.canShowPrint = true;
            $scope.Items = res.Data;
        };

        $scope.getPrevList = function () {
            var inputData = {
                Params: [{
                        Key: 14,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 15,
                    //     Value: $scope.currentfilter.orderstatusid
                    // },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.encounter.Id
                    },
                ],
            };
            var options = {
                action: 'emr/ProcedureOrderDetail/GetProcedureOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($stateParams.orddetails == 0) {
                $scope.getList();
            }
            $scope.getPrevList();
        };

        $scope.initLookup = function () {
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
                // {
                //     "Key": "Department"
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
    }
    ProcedureOrdersController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();