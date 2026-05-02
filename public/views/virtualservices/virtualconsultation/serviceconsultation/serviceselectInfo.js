(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceSelectInfoController', ServiceSelectInfoController);

    function ServiceSelectInfoController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.details = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            TestTypeId: -1,
            orderstatusid: 1,
            CategoryId: -1,
            VirtualCategoryId: -1,
            VirtualsubCategoryId: -1,
            patient: ''
        };
        $scope.currentcontext = {};
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.currentcontext.vcategoryid = $scope.ctgryInfo.VirtualCategory.Id;
        $scope.currentcontext.vsubcategoryid = $scope.ctgryInfo.Id;
        $scope.currentcontext.ctypeId = $scope.ctgryInfo.VirtualCategory.ConsultancyTypeId;

        $scope.VirtualSubCategoryServices = [];
        $scope.CanShowOrder = false;
        $scope.canShowPrint = false;
        $scope.IsSavePanels = false;
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            VirtualOrderStatusId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || 0,
            OrderFromId: 0,
            Quantity: 1
        };
        $scope.item.VirtualCategoryId = $scope.currentcontext.vcategoryid;
        $scope.item.VirtualSubCategoryId = $scope.currentcontext.vsubcategoryid;

        $scope.IsDisabled = false;
        $scope.CanShowCancelOrder = false;

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId());

        $scope.backToList = function () {
            $state.go('app.doctorconsultant', {
                categoryid: $scope.currentcontext.vcategoryid
            });
        }

        $scope.home = function () {
            $state.go('app.createorderdashboard');
        }

        $scope.getServiceDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var rateDetail = data.Data[0];
                for (var idx in $scope.VirtualSubCategoryServices) {
                    var item = $scope.VirtualSubCategoryServices[idx];
                    if (item.Id == rateDetail.ServiceItemId) {
                        item.Amount = rateDetail.Rate;
                        if (rateDetail.DiscountModeId == 1) {
                            item.DiscountModeId = rateDetail.DiscountModeId;
                            item.DiscountAmt = rateDetail.Discount;
                        } else if (rateDetail.DiscountModeId == 2) {
                            item.DiscountModeId = rateDetail.DiscountModeId;
                            item.DiscountAmt = ((rateDetail.Rate) * (rateDetail.Discount / 100));
                        } else {
                            item.DiscountAmt = 0;
                        }
                        item.ConsultAmt = (item.Amount) - (item.DiscountAmt);
                    }
                }
            }
        }

        $scope.getServiceDetails = function (item) {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: item.Id
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getCurrentFacilityId()
                    },

                ],
            };
            var options = {
                action: 'clinicalmaster/serviceitemtariffdetail/GetServiceItemTariffDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getServiceDetailsCallback
            };

            utl.Http.doAction(options);
        }

        function loadInfo() {
            for (var idx in $scope.VirtualSubCategoryServices) {
                var item = $scope.VirtualSubCategoryServices[idx];
                $scope.getServiceDetails(item);
            }
        }

        function loadimages() {
            for (var idx in $scope.VirtualSubCategoryServices) {
                var serviceData = $scope.VirtualSubCategoryServices[idx];
                if (serviceData.Imagepath) {
                    $scope.getServiceImages(serviceData);
                }
            }
        };

        $scope.getServiceImagesCallback = function (scope, data, options, hasError) {
            var serviceId = data.Id;
            var image = data.Image;
            for (var idx in $scope.VirtualSubCategoryServices) {
                var item = $scope.VirtualSubCategoryServices[idx];
                if (item.Id == serviceId) {
                    item.Image = image;
                }
            }
        };

        $scope.getServiceImages = function (item) {
            if (item.Imagepath) {
                var inputData = {
                    Id: item.Id,
                    Imagepath: item.Imagepath
                };
                var options = {
                    action: 'clinicalmaster/serviceitem/GetServiceItemImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getServiceImagesCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getvirtualsubcategoryservicesCallback = function (scope, res, options, hasError) {
            $scope.VirtualSubCategoryServices = res.Data || [];
            loadInfo();
            loadimages();
        };

        $scope.getvirtualsubcategoryservices = function () {

            var inputData = {
                Params: [{
                        Key: 33,
                        Value: $scope.currentcontext.vsubcategoryid
                    },
                    {
                        Key: 32,
                        Value: $scope.currentcontext.vcategoryid
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.name
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 31,
                        Value: true
                    },
                ],
            };

            var options = {
                action: 'clinicalmaster/serviceitem/GetServiceItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvirtualsubcategoryservicesCallback
            };

            utl.Http.doAction(options);
        };

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.details = [];
            $scope.IsDisabled = true;
            $scope.CanShowOrder = false;
            $scope.canShowPrint = true;
            if ($scope.currentcontext.orderid > 0) {
                $scope.details = [];
                for (var idx in res.Data) {
                    res.Data[idx].Id = 0;
                    res.Data[idx].PatientOrderId = 0;
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
                    $scope.currentcontext.id = $scope.LastOrders.PatientOrder.Id;
                    $scope.getLatestOrderDetails();
                }
            }
            $scope.serviceschedule();

        };

        $scope.getList = function () {
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
            if ($scope.currentcontext.orderid) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.orderid
                });
            }
            var options = {
                action: 'emr/patientorderdetail/GetPatientOrderDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };



        $scope.addOrder = function (servicedata) {
            // if ($scope.item.TestId > 0) {
            var OrderData = {
                Id: 0,
                RequestDate: utl.Formatter.getCurrentDate(),
                ServiceId: servicedata.Id,
                ServiceCode: servicedata.ItemCode,
                ServiceName: servicedata.Name,
                Quantity: 1,
                EncounterId: 0,
                DoctorId: $scope.item.DoctorId,
                DoctorName: $scope.item.DoctorName,
                DepartmentId: $scope.item.DepartmentId,
                CategoryId: $scope.item.CategoryId,
                CategoryName: $scope.item.CategoryName,
                UnitGrossAmount: servicedata.Amount,
                UnitPrice: servicedata.ConsultAmt,
                DiscountModeId: servicedata.DiscountModeId,
                Discount: servicedata.DiscountAmt,
                TestInstruction: $scope.item.TestInstruction,
                DoctorId: $scope.item.DoctorId,
                IsDirectBill: false,
                VirtualOrderDetailStatusId: 1,
                OrderPriorityId: $scope.item.OrderPriorityId,
                OrderPriority: $scope.item.OrderPriority || 'Routine',
                ScheduleDate: $scope.item.OrderScheduleDate,
                PatientBillStatusId: 3,
                Status: 1
            }
            if (!checkExist(OrderData)) {
                $scope.details.push(OrderData);
            };
            $scope.item.TotalItem = $scope.details.length;
            $scope.computeNetAmount(OrderData);

        }

        $scope.computeNetAmount = function (item) {
            if (item.UnitPrice && item.Quantity) {
                item.NetAmount = item.UnitPrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        $scope.BillCalc = function () {
            $scope.GrossAmount = 0;
            $scope.DiscountAmount = 0;
            $scope.NetAmount = 0;
            for (var idx in $scope.details) {
                var data = $scope.details[idx];
                if (data.Status == 1) {
                    $scope.GrossAmount += data.Quantity * data.UnitGrossAmount;
                    $scope.DiscountAmount += data.Quantity * data.Discount;
                    $scope.NetAmount += data.Quantity * data.UnitPrice;
                }
            }
            $scope.item.GrossAmount = $scope.GrossAmount;
            $scope.item.DiscountAmount = $scope.DiscountAmount;
            $scope.item.TotalNetAmount = $scope.NetAmount;
            $scope.item.OrderTotal = $scope.NetAmount;
        };

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.ServiceId == $scope.details[idx].ServiceId) && ($scope.details[idx].Status == 1)) {
                    utl.Alert.showErrorMsg("This Service Already Selected");
                    return true;
                }
            }
            return false
        }

        $scope.deleteorderdetails = function (idx, selectedItem) {
            var name = selectedItem.ServiceName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.BillCalc();
        };


        $scope.createOrder = function () {
            $scope.completeOrder();
        };

        $scope.completeOrder = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
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
            $state.go('app.serviceschedule', {
                orderdata: $scope.currentcontext.id,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId
            });
        };

        $scope.saveItem = function () {
            var lines = getLinesForSave();
            var actionName = 'VirtualHealthcare/VirtualOrder/AddVirtualOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualOrder/UpdateVirtualOrder';
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
        };


        function getLinesForSave() {
            var result = [];
            var ordertotal = 0;
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                item.PatientId = $scope.item.PatientId;
                if (item.ServiceId > -1 && item.Status == 1) {
                    item.GrossAmount = item.UnitGrossAmount;
                    result.push(item);
                }
            }
            return result;
        }
        $('.panel-title > a').click(function () {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getvirtualsubcategoryservices();
            // if ($stateParams.orddetails == 0) {
            //     $scope.getList();
            // }
        };
        $scope.initLookup = function () {
            var inputData = [];
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
    ServiceSelectInfoController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();