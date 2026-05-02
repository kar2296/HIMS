(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('OxygenHistoryController', OxygenHistoryController);

    function OxygenHistoryController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        vm.orders = [];
        $scope.AttachementImgs = [];
        $scope.item = {};
        $scope.currentfilter = {
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.item.PatientWorkorders = [];
        $scope.items = [];


        $scope.CancelOrderCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('Successfully Cancelled'));
            $scope.getDetails();
        };

        $scope.OnCancelOrderConfirmed = function(item, StatusId) {
            var orddata = item.item;
            var inputData = {
                Header: {
                    Id: orddata.Id,
                    OrderStatusId: 2,
                    VirtualOrderId: orddata.VirtualOrderId
                },
                Details: item.PatientOrderDetails
            };
            var options = {
                action: 'emr/patientorder/UpdateorderCancelPatientOrder',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.CancelOrderCallback
            };
            utl.Http.doAction(options);
        }
        $scope.CancelOrder = function(item) {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You want to Cancel the order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: function() {
                    $scope.OnCancelOrderConfirmed({
                        item: item,
                    });
                },
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.orderinfo = function(item) {
            utl.Modal.open('patientportal.virtualorderinfo', {
                params: {
                    id: item.VirtualOrderId,
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.renew = function(item) {
            $state.go('patientportal.oxygenrentrenewal', { id: item.VirtualOrderId });
        }

        $scope.viewResult = function(item) {
            utl.Modal.openFixedDialog('patientportal.manuallabresultview', {
                params: {
                    id: item.Id,
                    wid: item.WorkOrderId,
                },
                confirmCallback: $scope.getList
            });
        };


        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            $scope.items = [];
            for (var idx in res.Data) {
                var orderdata = res.Data[idx];
                var sname = '';
                var scatname = '';
                var catname = '';
                if (orderdata.VirtualSubCategory) {
                    scatname = orderdata.VirtualSubCategory.SubCategoryName;
                }
                if (orderdata.VirtualOrder.VirtualCategory) {
                    catname = orderdata.VirtualOrder.VirtualCategory.CategoryName;
                }
                if (orderdata.PatientOrderDetails.length > 0) {
                    for (var pdx in orderdata.PatientOrderDetails) {
                        var ordDetail = orderdata.PatientOrderDetails[pdx];
                        sname = ordDetail.ServiceName;
                    }
                }
                var workorder = [];
                var resvalue = '';
                var resvaluesid = 0;
                var resattach = '';
                let sdept = '';
                workorder = orderdata.PatientWorkorders;
                let workorderid = 0;
                if (workorder.length > 0) {
                    for (var wid in workorder) {
                        var patworkorder = workorder[wid];
                        workorderid = patworkorder.Id;
                        if (patworkorder.SubDepartment) {
                            sdept = patworkorder.SubDepartment.DepartmentName;
                        }
                        var wodetails = workorder[wid].PatientWorkorderdetails;
                        for (var wdx in wodetails) {
                            var wdetails = wodetails[wdx];
                            resvaluesid = wdetails.ResultValueId;
                            if (wdetails.ResultValue) {
                                resvalue = wdetails.ResultValue.Description;
                            }
                            resattach = wdetails.ResultAttachment;
                        }
                        var odata = {
                            Id: orderdata.Id,
                            WorkOrderId: workorderid,
                            SubDepartment: sdept,
                            PatientId: orderdata.PatientId,
                            FacilityId: orderdata.FacilityId,
                            PatientName: orderdata.PatientName,
                            EndTime: orderdata.EndTime,
                            StartTime: orderdata.StartTime,
                            AddressLine1: orderdata.Facility.AddressLine1,
                            FacilityName: orderdata.Facility.FacilityName,
                            OrderStatusId: orderdata.OrderStatusId,
                            OrderNumber: orderdata.OrderNumber,
                            OrderStatus: orderdata.OrderStatus.DisplayName,
                            OrderRequestDate: orderdata.OrderRequestDate,
                            OrderScheduleDate: orderdata.OrderScheduleDate,
                            OrderCompletedDate: orderdata.OrderCompletedDate,
                            NoofDays: orderdata.NoofDays,
                            ServiceName: sname,
                            ResultValueId: resvaluesid,
                            ResultValue: resvalue,
                            ResultAttachment: resattach,
                            ResultFormatTypeId: orderdata.ResultFormatTypeId,
                            VirtualOrderId: orderdata.VirtualOrderId,
                            SubCategoryId: orderdata.SubCategoryId,
                            PaymentModeId: orderdata.PaymentModeId,
                            PayMode: orderdata.PaymentMode.Description,
                            GrossAmount: orderdata.GrossAmount,
                            RenewalId: orderdata.RenewalId,
                            SubCategoryName: scatname,
                            CategoryName: catname
                        }
                        $scope.items.push(odata);
                    }
                } else {
                    var odata = {
                        Id: orderdata.Id,
                        WorkOrderId: workorderid,
                        SubDepartment: sdept,
                        PatientId: orderdata.PatientId,
                        FacilityId: orderdata.FacilityId,
                        PatientName: orderdata.PatientName,
                        EndTime: orderdata.EndTime,
                        StartTime: orderdata.StartTime,
                        AddressLine1: orderdata.Facility.AddressLine1,
                        FacilityName: orderdata.Facility.FacilityName,
                        OrderStatusId: orderdata.OrderStatusId,
                        OrderNumber: orderdata.OrderNumber,
                        OrderStatus: orderdata.OrderStatus.DisplayName,
                        OrderRequestDate: orderdata.OrderRequestDate,
                        OrderScheduleDate: orderdata.OrderScheduleDate,
                        OrderCompletedDate: orderdata.OrderCompletedDate,
                        NoofDays: orderdata.NoofDays,
                        ServiceName: sname,
                        ResultValueId: resvaluesid,
                        ResultValue: resvalue,
                        ResultAttachment: resattach,
                        ResultFormatTypeId: orderdata.ResultFormatTypeId,
                        VirtualOrderId: orderdata.VirtualOrderId,
                        SubCategoryId: orderdata.SubCategoryId,
                        PaymentModeId: orderdata.PaymentModeId,
                        PayMode: orderdata.PaymentMode.Description,
                        GrossAmount: orderdata.GrossAmount,
                        RenewalId: orderdata.RenewalId,
                        SubCategoryName: scatname,
                        CategoryName: catname
                    }
                    $scope.items.push(odata);
                }
            }
        };

        $scope.getDetails = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid,
                    },
                    {
                        Key: 12,
                        Value: From
                    },
                    {
                        Key: 13,
                        Value: To
                    },
                    {
                        Key: 53,
                        Value: true
                    },
                    {
                        Key: 22,
                        Value: [4, 5, 7, 8, 9]
                    }
                ]
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailsCallback
            };

            utl.Http.doAction(options);
        }

        $scope.print = function(wo) {
            $scope.currentcontext.id = wo.Orderid;
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print1 = function() {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrders',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print2 = function() {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrdersWithoutHeader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.getDetails();
    }

    OxygenHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();