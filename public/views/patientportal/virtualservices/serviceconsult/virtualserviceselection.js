(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualServiceSelectionController', VirtualServiceSelectionController);

    function VirtualServiceSelectionController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        // $scope.increment;
        // $scope.decrement;
        $scope.details = [];
        $scope.Items = [];
        $scope.currentfilter = {
            showFilterTab: false,
            DoctorId: utl.Session.getCurrentUserId(),
            TestTypeId: -1,
            orderstatusid: 1,
            CategoryId: -1,
            VirtualCategoryId: -1,
            VirtualsubCategoryId: -1,
            patient: '',
            RequestTypeId: 1,
            OrderConsultTypeId: 2,
            PaymentModeId: 2,
            OrderModeId: 2,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            VirtualOrderStatusId: 1,
        };
        $scope.currentcontext = {};
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.currentcontext.islab = $stateParams.islab;
        $scope.currentcontext.isvaccines = $stateParams.isvaccines;
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.vcategoryid = $scope.ctgryInfo.VirtualCategory.Id;
        $scope.currentcontext.vsubcategoryid = $scope.ctgryInfo.Id;
        $scope.currentcontext.ctypeId = $scope.ctgryInfo.VirtualCategory.ConsultancyTypeId;
        $scope.currentcontext.ResultFormatTypeId = $scope.ctgryInfo.ResultFormatTypeId;
        $scope.VirtualSubCategoryServices = [];
        $scope.VirtualCovidServices = [];
        $scope.VirtualPackageServices = [];
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderScheduleDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            VirtualOrderStatusId: 1,
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()) || 0,
            OrderFromId: 0,
            Quantity: 1,
            PatientId: $scope.currentcontext.pid
        };
        $scope.item.VirtualCategoryId = $scope.currentcontext.vcategoryid;
        $scope.item.VirtualSubCategoryId = $scope.currentcontext.vsubcategoryid;
        if ($stateParams.ctgryInfo.SelectedFacilityId) {
            $scope.item.FacilityId = $stateParams.ctgryInfo.SelectedFacilityId;
        } else {
            $scope.item.FacilityId = 1;
        }

        // vm.ServiceTypeOptions = [{
        //     Id: 1,
        //     Text: $translate.instant('Test')
        // },
        // {
        //     Id: 2,
        //     Text: $translate.instant('Covid Test')
        // },
        // {
        //     Id: 3,
        //     Text: $translate.instant('Packages')
        // }
        // ]

        // $scope.item.ServiceTypeId = 1;

        // $scope.canShowAllTest = function () {
        //     return $scope.item.ServiceTypeId == 1;
        // }

        // $scope.canShowCovidTest = function () {
        //     return $scope.item.ServiceTypeId == 2;
        // }

        // $scope.canShowPackages = function () {
        //     return $scope.item.ServiceTypeId == 3;
        // }

        $scope.backToList = function () {
            $state.go('patientportal.virtualsubcategoryselection');
        }

        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }

        // $scope.getList = function () {
        //     if ($scope.item.ServiceTypeId == 1) {
        //         $scope.getvirtualsubcategoryservices();
        //     } else if ($scope.item.ServiceTypeId == 2) {
        //         $scope.getvirtualcovidservices();
        //     } else if ($scope.item.ServiceTypeId == 3) {
        //         $scope.getvirtualpackageservices();
        //     }
        // };

        $scope.getServiceDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var rateDetail = data.Data[0];
                for (var idx in $scope.VirtualSubCategoryServices) {
                    var item = $scope.VirtualSubCategoryServices[idx];
                    if (item.Id == rateDetail.ServiceItemId) {
                        item.GrossAmount = rateDetail.Rate;
                        if (rateDetail.DiscountModeId == 1) {
                            item.DiscountModeId = rateDetail.DiscountModeId;
                            item.DiscountAmount = rateDetail.Discount;
                        }
                        if (rateDetail.DiscountModeId == 2) {
                            item.DiscountModeId = rateDetail.DiscountModeId;
                            item.DiscountAmount = ((rateDetail.Rate) * (rateDetail.Discount / 100));
                        }
                        item.ServiceAmount = (item.GrossAmount) - (item.DiscountAmount || 0);
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
                    Value: $scope.item.FacilityId
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

        // function loadimages() {
        //     for (var idx in $scope.VirtualSubCategoryServices) {
        //         var serviceData = $scope.VirtualSubCategoryServices[idx];
        //         if (serviceData.Imagepath) {
        //             $scope.getServiceImages(serviceData);
        //         }
        //     }
        // };

        // $scope.getServiceImagesCallback = function (scope, data, options, hasError) {
        //     var serviceId = data.Id;
        //     var image = data.Image;
        //     for (var idx in $scope.VirtualSubCategoryServices) {
        //         var item = $scope.VirtualSubCategoryServices[idx];
        //         if (item.Id == serviceId) {
        //             item.Image = image;
        //         }
        //     }
        // };

        // $scope.getServiceImages = function (item) {
        //     if (item.Imagepath) {
        //         var inputData = {
        //             Id: item.Id,
        //             Imagepath: item.Imagepath
        //         };
        //         var options = {
        //             action: 'clinicalmaster/serviceitem/GetServiceItemImage',
        //             data: {
        //                 Data: inputData
        //             },
        //             type: 'post',
        //             onComplete: $scope.getServiceImagesCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        $scope.getvirtualsubcategoryservicesCallback = function (scope, res, options, hasError) {
            $scope.VirtualSubCategoryServices = res.Data || [];
            loadInfo();
            // loadimages();
            // for (var sdx in res.Data) {
            //     var sinfo = res.Data[sdx];
            //     var vatamt = 0;
            //     var discamt = 0;
            //     if (sinfo.DiscountModeId == 1) {
            //         discamt = sinfo.DiscountAmount;
            //     }
            //     if (sinfo.DiscountModeId == 2) {
            //         discamt = (sinfo.ItemCost) * (sinfo.DiscountAmount) / 100;
            //     }
            //     if (sinfo.VAT) {
            //         vatamt = (sinfo.ItemCost) * (sinfo.VAT) / 100;
            //     }
            //     sinfo.GrossAmount = sinfo.ItemCost;
            //     sinfo.DiscountAmount = discamt;
            //     sinfo.VATAmount = vatamt;
            //     sinfo.ServiceAmount = (parseFloat(sinfo.ItemCost) - parseFloat(discamt)) + parseFloat(vatamt);
            //     $scope.VirtualSubCategoryServices.push(sinfo);
            // }
        };

        $scope.getvirtualsubcategoryservices = function () {
            if ($scope.currentcontext.vcategoryid != 12) {
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
                        Value: 2
                    },
                    {
                        Key: 11,
                        Value: false
                    },
                    // {
                    //     Key: 38,
                    //     Value: false
                    // },
                    {
                        Key: 34,
                        Value: $scope.item.FacilityId
                    },
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
            } else {
                var inputData = {
                    Params: [
                        {
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
                            Value: 2
                        },
                        {
                            Key: 11,
                            Value: true
                        },
                        // {
                        //     Key: 38,
                        //     Value: false
                        // },
                        {
                            Key: 34,
                            Value: $scope.item.FacilityId
                        },
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
            }

            var options = {
                action: 'clinicalmaster/serviceitem/GetServiceItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvirtualsubcategoryservicesCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openFilterTab = function () {
            if ($scope.currentfilter.showFilterTab === true) {
                $scope.currentfilter.showFilterTab = false;
            } else {
                $scope.currentfilter.showFilterTab = true;
            }
        }


        $scope.addOrder = function (servicedata) {
            if ($scope.currentcontext.ResultFormatTypeId == 2) {
                var OrderData = {
                    Id: 0,
                    PatientId: $scope.currentcontext.pid,
                    RequestDate: utl.Formatter.getCurrentDate(),
                    PatientId: parseInt(utl.Session.getPatientPortalPatientId()),
                    ServiceId: servicedata.Id,
                    ServiceCode: servicedata.ItemCode,
                    ServiceName: servicedata.Name,
                    TestId: servicedata.MasterItemId,
                    TestCode: servicedata.ItemCode,
                    TestName: servicedata.MasterName,
                    TestTypeId: 1,
                    Quantity: 1,
                    EncounterId: 0,
                    DoctorId: $scope.item.DoctorId,
                    DoctorName: $scope.item.DoctorName,
                    DepartmentId: servicedata.DepartmentId,
                    SubDepartmentId: servicedata.SubDepartmentId,
                    CategoryId: $scope.item.CategoryId,
                    CategoryName: $scope.item.CategoryName,
                    UnitGrossAmount: servicedata.GrossAmount,
                    UnitPrice: servicedata.ServiceAmount,
                    TestPrice: servicedata.ServiceAmount,
                    DiscountModeId: servicedata.DiscountModeId,
                    Discount: servicedata.DiscountAmount,
                    GrossAmount: servicedata.GrossAmount,
                    VATAmount: servicedata.VATAmount,
                    DiscountAmount: servicedata.DiscountAmount,
                    IsPackageItem: servicedata.IsPackage,
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
            } else if (!$scope.currentcontext.ResultFormatTypeId || $scope.currentcontext.ResultFormatTypeId == 1) {
                var OrderData = {
                    Id: 0,
                    PatientId: $scope.currentcontext.pid,
                    RequestDate: utl.Formatter.getCurrentDate(),
                    PatientId: parseInt(utl.Session.getPatientPortalPatientId()),
                    ServiceId: servicedata.Id,
                    ServiceCode: servicedata.ItemCode,
                    ServiceName: servicedata.Name,
                    TestTypeId: 1,
                    Quantity: 1,
                    EncounterId: 0,
                    DoctorId: $scope.item.DoctorId,
                    DoctorName: $scope.item.DoctorName,
                    DepartmentId: servicedata.DepartmentId,
                    SubDepartmentId: servicedata.SubDepartmentId,
                    CategoryId: $scope.item.CategoryId,
                    CategoryName: $scope.item.CategoryName,
                    UnitGrossAmount: servicedata.GrossAmount,
                    UnitPrice: servicedata.ServiceAmount,
                    TestPrice: servicedata.ServiceAmount,
                    DiscountModeId: servicedata.DiscountModeId,
                    GrossAmount: servicedata.GrossAmount,
                    VATAmount: servicedata.VATAmount,
                    DiscountAmount: servicedata.DiscountAmount,
                    IsPackageItem: servicedata.IsPackage,
                    Discount: servicedata.DiscountAmount,
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
            }
            if (!checkExist(OrderData)) {
                $scope.details.push(OrderData);
            };

            $scope.saveDetail = [];
            for (var sdx in $scope.details) {
                var serdata = $scope.details[sdx];
                if (serdata.Status == 1) {
                    $scope.saveDetail.push(serdata);
                }
            }
            $scope.item.TotalItem = $scope.saveDetail.length;
            $scope.computeNetAmount(OrderData);
        }

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.ServiceId == $scope.details[idx].ServiceId) && ($scope.details[idx].Status == 1)) {
                    utl.Alert.showErrorMsg("This Service Already Selected");
                    return true;
                }
                if ($scope.currentcontext.isvaccines == true) {
                    if (($scope.details[idx].ServiceId) && ($scope.details[idx].Status == 1)) {
                        utl.Alert.showErrorMsg("You should select only one vaccine at the order");
                        return true;
                    }
                }
            }
            return false
        }
        $scope.computeNetAmount = function (item) {
            if (item.UnitGrossAmount && item.Quantity) {
                item.GrossAmount = item.UnitGrossAmount * item.Quantity;
                item.NetAmount = item.UnitPrice * item.Quantity;
                $scope.BillCalc();
            }
        };

        $scope.BillCalc = function () {
            $scope.GrossAmount = 0;
            $scope.DiscountAmount = 0;
            $scope.NetAmount = 0;
            $scope.VatAmount = 0;
            for (var idx in $scope.details) {
                var data = $scope.details[idx];
                if (data.Status == 1) {
                    $scope.GrossAmount += data.Quantity * data.UnitGrossAmount;
                    $scope.DiscountAmount += data.Quantity * data.DiscountAmount;
                    $scope.VatAmount += data.Quantity * data.VATAmount;
                    $scope.NetAmount += data.Quantity * data.UnitPrice;
                }
            }
            $scope.item.GrossAmount = $scope.GrossAmount;
            $scope.item.DiscountAmount = $scope.DiscountAmount;
            $scope.item.VATAmount = $scope.VatAmount;
            $scope.item.TotalNetAmount = $scope.NetAmount;
            $scope.item.OrderTotal = $scope.NetAmount;
            // $scope.next();
        };

        $scope.deleteorderdetails = function (idx, selectedItem) {
            var name = selectedItem.ServiceName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.BillCalc();
        };

        $scope.next = function () {
            $state.go('patientportal.slotselection', {
                ctgryInfo: $scope.ctgryInfo,
                islab: $scope.currentcontext.islab,
                isvaccines: $scope.currentcontext.isvaccines,
                details: $scope.details,
                iteminfo: $scope.item
            });
        }

        $scope.getvirtualsubcategoryservices();
    }
    VirtualServiceSelectionController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();