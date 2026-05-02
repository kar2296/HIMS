(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('cnOrderSectionController', cnOrderSectionController);

    function cnOrderSectionController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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
        $scope.IsEdit = false;
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || 0,
            OrderFromId: 0,
            IsSelf: false,
            Quantity: 1,
            Duration: 1,
            DurationPeriodId: 1
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
        $scope.currentcontext.orderid = 0;
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
                $scope.EncounterStatus = 'CheckedOut';
                $scope.CanShowOrder = false;
            }
        }

        $scope.options = [{
                key: 'detail',
                name: $translate.instant('patientemr.patientorder-form.neworders.lbl')
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

        $scope.deleteItem = function(item) {
            item.Status = 2;
        };

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
            $scope.IsDisabled = true;
            // if ($scope.currentcontext.orderid > 0) {
            $scope.details = [];
            if ($scope.IsEdit == true && $scope.currentcontext.orderid > 0) {
                for (var idx in res.Data) {
                    res.Data[idx].cid = res.Data[idx].Id;
                    // res.Data[idx].Id = 0;
                    // res.Data[idx].PatientOrderId = 0;
                    if (res.Data[idx].OrderPriority) {
                        res.Data[idx].OrderPriority = res.Data[idx].OrderPriority.Description;
                    }
                    res.Data[idx].TestType = res.Data[idx].TESTMASTERTYP.Description;
                    $scope.itemDetail = res.Data[0].PatientOrder;
                    $scope.details.push(res.Data[idx]);
                    $scope.currentcontext.id = $scope.itemDetail.Id;
                    $scope.IsDisabled = false;
                    $scope.canShowPrint = false;
                    $scope.CanShowOrder = true;
                }
            } else {
                for (var idx in res.Data) {
                    res.Data[idx].Id = 0;
                    res.Data[idx].PatientOrderId = 0;
                    if (res.Data[idx].OrderPriority) {
                        res.Data[idx].OrderPriority = res.Data[idx].OrderPriority.Description;
                    }
                    res.Data[idx].TestType = res.Data[idx].TESTMASTERTYP.Description;
                    $scope.details.push(res.Data[idx]);
                    $scope.IsDisabled = true;
                    $scope.canShowPrint = true;
                }
            }
            if ($scope.currentcontext.orderid == 0) {
                if (res.Data.length > 0) {
                    var lastIndex = res.Data.length - 1;
                    $scope.LastOrders = res.Data[lastIndex];
                    $scope.currentcontext.id = $scope.LastOrders.PatientOrder.Id;
                    // $scope.getLatestOrderDetails();
                }
            }

        };

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 13,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 15,
                        Value: $scope.currentcontext.encounter.Id
                    },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.ConsultationId
                    },
                ],
            };

            var options = {
                action: 'emr/patientorderdetail/GetPatientOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.changeTestType = function(TestId) {
            $scope.currentfilter.TestTypeId = TestId;
            $scope.getList();
        }
        $scope.editOrder = function() {
            $scope.currentcontext.orderid = $scope.currentcontext.id;
            $scope.IsEdit = true;
            $scope.getList();
        }

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
                        Key: 13,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 14,
                        Value: 1
                    },
                    {
                        Key: 15,
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
                action: 'emr/patientorderdetail/GetPatientOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLatestOrderDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.editOrderByIdCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.detailId = data.Id;
            $scope.isModified = true;
        };

        $scope.editOrderById = function(item) {
            if (item.cid && item.cid > 0) {
                var options = {
                    action: 'emr/patientorderdetail/GetpatientorderdetailById',
                    data: {
                        Id: item.cid
                    },
                    type: 'post',
                    onComplete: $scope.editOrderByIdCallback
                };
                utl.Http.doAction(options);
            }
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
        $scope.updateOrder = function() {
            var editOrderData = {
                Id: 0,
                PatientId: $scope.item.PatientId,
                EncounterId: $scope.item.EncounterId,
                DoctorId: $scope.item.DoctorId,
                DoctorName: $scope.item.DoctorName,
                DepartmentId: $scope.item.DepartmentId,
                TestId: $scope.item.TestId,
                TestCode: $scope.item.TestCode,
                TestName: $scope.item.TestName,
                CategoryId: $scope.item.CategoryId,
                IsExternalLab: $scope.item.IsExternalLab,
                CategoryName: $scope.item.CategoryName,
                TestPrice: $scope.item.TestPrice,
                TestTypeId: $scope.item.TestTypeId,
                TestType: $scope.item.TestType,
                Quantity: $scope.item.Quantity,
                TestInstruction: $scope.item.TestInstruction,
                ClinicalData: $scope.item.ClinicalData,
                ExternalProviderId: $scope.item.ExternalProviderId,
                Duration: $scope.item.Duration || 1,
                DurationPeriodId: $scope.item.DurationPeriodId || 1,
                DtnPeriod: $scope.item.DtnPeriod || 'Days',
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
                Status: 1,
                ischanged: true
            }
            for (var pdx in $scope.details) {
                var ordold = $scope.details[pdx];
                if ((ordold.TestId == editOrderData.TestId && editOrderData.ischanged)) {
                    // isold++;
                    ordold.Status = 2;
                }
            }
            $scope.details.push(editOrderData);
            $scope.computeNetAmount(editOrderData);
            $scope.ClearData();
        }


        $scope.addOrder = function() {
            if ($scope.item.TestId > 0) {
                var OrderData = {
                    Id: 0,
                    PatientId: $scope.item.PatientId,
                    EncounterId: $scope.item.EncounterId,
                    DoctorId: $scope.item.DoctorId,
                    DoctorName: $scope.item.DoctorName,
                    DepartmentId: $scope.item.DepartmentId,
                    TestId: $scope.item.TestId,
                    TestCode: $scope.item.TestCode,
                    TestName: $scope.item.TestName,
                    CategoryId: $scope.item.CategoryId,
                    IsExternalLab: $scope.item.IsExternalLab,
                    CategoryName: $scope.item.CategoryName,
                    TestPrice: $scope.item.TestPrice,
                    TestTypeId: $scope.item.TestTypeId,
                    TestType: $scope.item.TestType,
                    Quantity: $scope.item.Quantity,
                    TestInstruction: $scope.item.TestInstruction,
                    ClinicalData: $scope.item.ClinicalData,
                    ExternalProviderId: $scope.item.ExternalProviderId,
                    Duration: $scope.item.Duration || 1,
                    DurationPeriodId: $scope.item.DurationPeriodId || 1,
                    DtnPeriod: $scope.item.DtnPeriod || 'Days',
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
                utl.Alert.showErrorMsg('Select any Test');
                return false;
            }
        }
        $scope.ClearData = function() {
            document.getElementById("testid").value = '';
            // document.getElementById("item_form").reset();
            $scope.item.TestId = 0;
            $scope.item.TestName = '';
            $scope.item.Quantity = 1;
            $scope.item.ServicePrice = '';
            $scope.item.OrderPriorityId = 1;
            $scope.item.TestInstruction = '';
            $scope.CanShowOrder = true;
            $scope.canShowPrint = false;
        }
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
                Params: [
                    // {
                    //     Key: 3,
                    //     Value: $scope.currentcontext.testtype
                    // },
                    {
                        Key: 6,
                        Value: 2
                    },
                    {
                        Key: 8,
                        Value: {
                            'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId,
                            'FacilityId': utl.Session.getCurrentFacilityId()
                        }
                    }
                ],
                PageContext: {
                    PageSize: -1,
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

        $scope.testChanged = function(idx, item) {
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
                item.IsExternalLab = testMaster.ServiceItem.IsExternalLab || 0;
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
                if ($scope.item.GuarantorTypeId > 1) {
                    if ($scope.item.CoPayPercent) {
                        item.PatNetAmount = parseFloat(item.NetAmount) * parseFloat(parseFloat($scope.item.CoPayPercent) / 100);
                        item.InsNetAmount = parseFloat(item.NetAmount) - parseFloat(item.PatNetAmount);
                    }
                    if (!$scope.item.CoPayPercent) {
                        item.InsNetAmount = parseFloat(item.NetAmount);
                    }
                }
                if (item.Discount) {
                    item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice)) - parseFloat(item.Discount);
                } else {
                    item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.TestPrice));
                }
                $scope.item.OrderTotal += item.NetAmount;
                $scope.item.NetPatientAmount += item.PatNetAmount || 0;
                $scope.item.NetInsuranceAmount += item.InsNetAmount || 0;
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

        $scope.onDurationPeriodChange = function(item) {
            $scope.item.DurationPeriod = item.Text;
        }

        $scope.computeNetAmount = function(item) {
            if (item.TestPrice && item.Quantity) {
                item.NetAmount = item.TestPrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.TestId == $scope.details[idx].TestId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        $scope.panelconfig = {
            paneltypeid: 3,
            selectedlist: {}
        };
        $scope.savePanels = function() {
            $scope.details = [];
            var panelitem = $scope.panelconfig.selectedlist;
            for (var indx in panelitem.TemplateMasterDetails) {
                var TestType = '';
                if (panelitem.TemplateMasterDetails[indx].TestTypeId == 1) {
                    TestType = 'Lab';
                }
                if (panelitem.TemplateMasterDetails[indx].TestTypeId == 2) {
                    TestType = 'Radiology';
                }
                var item = {
                    TestId: panelitem.TemplateMasterDetails[indx].ItemId,
                    TestName: panelitem.TemplateMasterDetails[indx].DisplayName || '',
                    ItemId: panelitem.TemplateMasterDetails[indx].ItemId,
                    TestTypeId: panelitem.TemplateMasterDetails[indx].TestTypeId,
                    TestType: TestType,
                    Quantity: panelitem.TemplateMasterDetails[indx].Quantity,
                    IsDirectBill: panelitem.TemplateMasterDetails[indx].IsDirectBill,
                    TestPrice: $scope.item.TestPrice,
                    DoctorId: $scope.item.DoctorId,
                    OrderStatusId: $scope.item.OrderStatusId,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    OrderPriority: $scope.item.OrderPriority || 'Routine',
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    TestInstruction: $scope.item.TestInstruction,
                    ClinicalData: $scope.item.ClinicalData,
                    Duration: $scope.item.Duration,
                    DurationPeriodId: $scope.item.DurationPeriodId,
                    DurationPeriod: $scope.item.DurationPeriod || 'Days',
                    PatientBillStatusId: 3,
                    Status: 1,
                    StartDate: utl.Formatter.getCurrentDate(),
                };
                if (!checkExist(item)) {
                    $scope.details.push(item);
                    $scope.IsSavePanels = true;
                    $scope.currentcontext.id = 0;
                    $scope.IsDisabled = false;
                    $scope.CanShowOrder = true;
                }
            }
        };

        $scope.saveastemplate = function() {
            //             var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            //             if (userObj) {
            //                 $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
            //                 $scope.currentcontext.userId = userObj.Id;
            //             }
            var tests = [];
            for (var idx in $scope.details) {
                var orderDetails = $scope.details[idx];

                if (orderDetails.Status == 1 && orderDetails.TestId) {
                    var item = {
                        PanelMasterId: 0,
                        TemplateTypeId: 3,
                        ItemId: orderDetails.TestId,
                        DisplayName: orderDetails.TestName,
                        TestType: orderDetails.TestType,
                        TestTypeId: orderDetails.TestTypeId,
                        Quantity: orderDetails.Quantity,
                        OrderPriority: orderDetails.OrderPriority,
                        TestInstruction: orderDetails.TestInstruction,
                        ClinicalData: orderDetails.ClinicalData,
                        Duration: orderDetails.Duration,
                        DurationPeriodId: orderDetails.DurationPeriodId,
                        DurationPeriod: orderDetails.DurationPeriod
                    };
                    tests.push(item);
                }
            }
            utl.Modal.open('app.templatemaster', {
                params: {
                    id: 0,
                    templatetypeid: 3,
                    deptid: $scope.currentcontext.userDepartmentId,
                    userid: $scope.currentcontext.userId,
                    items: tests
                }
            });
        };

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
                var serviceRate = {};
                if (ticksheetitem.Testmaster.ServiceItem) {
                    if (ticksheetitem.Testmaster.ServiceItem.ServiceItemTariffDetails.length > 0) {
                        serviceRate = ticksheetitem.Testmaster.ServiceItem.ServiceItemTariffDetails[0];
                    }
                }
                var item = {
                    Id: 0,
                    PatietnOrderId: 0,
                    RequestDate: utl.Formatter.getCurrentDate(),
                    TestId: ticksheetitem.ItemId,
                    TestName: ticksheetitem.TestName,
                    TestCode: ticksheetitem.TestCode,
                    Quantity: ticksheetitem.Quantity,
                    TestPrice: serviceRate.Rate,
                    Discount: 0,
                    TaxCost: 0,
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    OrderPriority: 'Routine',
                    IsDirectBill: ticksheetitem.IsDirectBill || false,
                    TestTypeId: ticksheetitem.TestTypeId,
                    TestType: ticksheetitem.Testmaster.TESTMASTERTYP.Description,
                    NetAmount: 0,
                    Duration: 1,
                    DurationPeriodId: 1,
                    DurationPeriod: 'Days',
                    OrderStatusId: $scope.item.OrderStatusId,
                    RequestDate: $scope.item.OrderRequestDate,
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    Status: 1,
                }
                if (!checkExist(item)) {
                    // item.autoSearchName = item.autoSearchName || getAutoSearchName();
                    $scope.details.push(item);
                    computeTestData(item, ticksheetitem.Testmaster);
                }
            }
            // $scope.addNewLineItem();
            $scope.CanShowOrder = true;
            $scope.IsDisabled = false;
            $scope.currentcontext.option = 'detail';
        }

        $scope.addTickSheet = function() {
            var testmaster = $scope.ticksheetconfig.selecteddetail.Testmaster;
            utl.Modal.open('patientemr.profileinfo', {
                params: {
                    tid: testmaster.Id
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        function getNewItem() {
            var detail = {
                Id: 0,
                PatientId: $scope.item.PatientId,
                TestId: -1,
                itemidxdesc: null,
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
                ResourceId: -1,
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
            if (typeof(data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Header.Id;
                    $scope.IsDisabled = true;
                }
            } else if (typeof(data) == "number") {
                $scope.currentcontext.id = data;
                $scope.currentcontext.prescribeid = data;
                $scope.IsDisabled = true;
            }
            $scope.ClearData();
        };

        $scope.saveItem = function() {
            if ($scope.item.OrderStatusId == 2) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                var actionName = 'emr/patientorder/AddPatientOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/patientorder/UpdatePatientOrder';
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
                if ($scope.IsEdit == true) {
                    $scope.item.Id = $scope.currentcontext.id;
                    $scope.item.OrderNumber = $scope.itemDetail.OrderNumber;
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
                if (item.TestId > -1 && item.Quantity <= 0) {
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
                if (item.Duration == 1 && item.DurationPeriodId == 1) {
                    item.IsFollowup = false;
                } else {
                    item.IsFollowup = true;
                }
                if (item.Duration && item.DtnPeriod) {
                    item.FollowupAppointmentOn = utl.Formatter.computeDateBasedOnPeriod(item.Duration, item.DtnPeriod);
                }
                item.PatientId = $scope.item.PatientId;
                item.GuarantorId = $scope.item.GuarantorId;
                item.OrderStatusId = $scope.item.OrderStatusId;
                item.RequestDate = $scope.item.OrderRequestDate;
                item.IsDirectBill = item.IsDirectBill || false;
                if ($scope.item.GuarantorId == 1000) {
                    item.OrderDetailApprovalStatusId = 4;
                    item.IsSelf = true;
                }
                if (item.TestId > -1 && item.Status == 1) {
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
                    },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.encounter.Id
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrderWithoutDetails',
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
                {
                    "Key": "DurationPeriod"
                },
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
    cnOrderSectionController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();