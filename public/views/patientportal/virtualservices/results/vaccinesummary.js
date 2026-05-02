(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('vaccinesummaryController', vaccinesummaryController);

    function vaccinesummaryController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        vm.orders = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            ToDate: utl.Formatter.getCurrentDate(),
            VaccinationTypeId: -1,
            // ServiceId: 1
        };

        $scope.CancelOrderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('Successfully Cancelled'));
            $scope.getDetails();
        };

        $scope.OnCancelOrderConfirmed = function (item, StatusId) {
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
        $scope.CancelOrder = function (item) {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You want to Cancel the order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: function () {
                    $scope.OnCancelOrderConfirmed({
                        item: item,
                    });
                },
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.items = [];
            for (var idx in res.Data) {
                var orderdata = res.Data[idx];
                var Dosage = '';
                var VaccinatedBy = '';
                var Batch = '';
                var VaccinationType = '';
                var Manufacturer = '';
                if (orderdata.Dosage) {
                    Dosage = orderdata.Dosage.Description
                }
                if (orderdata.VaccinationType) {
                    VaccinationType = orderdata.VaccinationType.Description
                }
                Manufacturer = orderdata.Manufacturer
                VaccinatedBy = orderdata.VaccinatedBy
                Batch = orderdata.Batch
                var sname = '';
                var serviceid = 0;
                if (orderdata.PatientOrderDetails.length > 0) {
                    for (var pdx in orderdata.PatientOrderDetails) {
                        var ordDetail = orderdata.PatientOrderDetails[pdx];
                        serviceid = ordDetail.ServiceId;
                        sname = ordDetail.ServiceName;
                    }
                }
                var workorder = [];
                // var patientorderdetails = [];
                var resvalue = '';
                var resvaluesid = 0;
                var resattach = '';
                var vdosage = 0;
                var vtype = 0;
                var nextschdate = '';
                // var vaccinatedby = 0;
                var vaccinateduser = '';
                var title = 0;
                var firstname='';
                var lastname='';
                var lotno = '',
                    workorder = orderdata.PatientWorkorders;
                let workorderid = 0;
                // patientorderdetails = orderdata.PatientOrderDetails;
                // if (patientorderdetails.length > 0) {
                //     for (var podid in patientorderdetails) {
                //         ServiceName = patientorderdetails[podid].ServiceName;
                //     }
                // }
                if (workorder.length > 0) {
                    for (var wid in workorder) {
                        var patworkorder = workorder[wid];
                        workorderid = patworkorder.Id;
                        var wodetails = workorder[wid].PatientWorkorderdetails;
                        for (var wdx in wodetails) {
                            var wdetails = wodetails[wdx];
                            resvaluesid = wdetails.ResultValueId;
                            if (wdetails.ResultValue) {
                                resvalue = wdetails.ResultValue.Description;
                            }
                            // vdosageid = wdetails.DosageId;
                            if (wdetails.Dosage) {
                                vdosage = wdetails.Dosage.Description;
                            }
                            // vtypeid = wdetails.VaccinationTypeId;
                            if (wdetails.VaccinationType) {
                                vtype = wdetails.VaccinationType.Description;
                            }

                            // vaccinatedby = wdetails.VaccinatedBy;
                            // if (wdetails.VaccinatedUser) {
                            //     vaccinateduser = wdetails.VaccinatedUser.FirstName;
                            // }
                            if (wdetails.VaccinatedUser) {
                                firstname = wdetails.VaccinatedUser.FirstName;
                            }
                            if (wdetails.VaccinatedUser) {
                                lastname = wdetails.VaccinatedUser.LastName;
                            }
                            lotno = wdetails.LotNo;
                            if (wdetails.LotNo) {
                                lotno = wdetails.LotNo;
                            }
                            if (wdetails.NextScheduleDate) {
                                nextschdate = wdetails.NextScheduleDate;
                            }
                            if (wdetails.NextScheduleDate) {
                                nextschdate = wdetails.NextScheduleDate;
                            }
                            resattach = wdetails.ResultAttachment;
                        }
                    }
                }

                var odata = {
                    Id: orderdata.Id,
                    WorkOrderId: workorderid,
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
                    SubCategory: orderdata.VirtualSubCategory.SubCategoryName,
                    ServiceName: sname,
                    VaccineCenterName: orderdata.VaccineCenterName,
                    ServiceId: serviceid,
                    ResultValueId: resvaluesid,
                    ResultValue: resvalue,
                    VDosage: vdosage,
                    VType: vtype,
                    Dosage: Dosage,
                    VaccinationType: VaccinationType,
                    Manufacturer: Manufacturer,
                    Batch: Batch,
                    Title:title,
                    FirstName:firstname,
                    LastName:lastname,
                    VaccinatedBy: VaccinatedBy,
                    LotNo: lotno,
                    VaccinatedUser: vaccinateduser,
                    NextScheduleDate: nextschdate,
                    ResultAttachment: resattach,
                    VirtualOrderId: orderdata.VirtualOrderId,
                    PaymentModeId: orderdata.PaymentModeId,
                    // if(PaymentMode){
                    // PaymentMode:orderdata.PaymentMode.Description
                    // }
                }
                $scope.currentcontext.ServiceId = odata.ServiceId;

                $scope.items.push(odata);

            }
        };

        $scope.getDetails = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    {
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
                    // {
                    //     Key: 36,
                    //     Value: $scope.currentcontext.pid,
                    // },
                    {
                        Key: 4,
                        Value: [1, 10, 11, 15, 17]
                    },
                    {
                        Key: 22,
                        Value: [4, 5, 7, 8, 9, 10]
                    }, // includeWOStatus Approved and Released
                    {
                        Key: 35,
                        Value: true
                    },
                    {
                        Key: 56,
                        Value: $scope.currentfilter.VaccinationTypeId,
                    },
                    {
                        Key: 57,
                        Value: $scope.currentfilter.ServiceId,
                    },
                ]
            };

            var options = {
                action: 'emr/patientorder/GetVirtualPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailsCallback
            };

            utl.Http.doAction(options);
        }
        $scope.resultinfo = function (item) {
            utl.Modal.open('patientportal.vaccineresultinfo', {
                params: {
                    woid: item.WorkOrderId,
                },
                confirmCallback: $scope.getDetails
            });
        }

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    Paymenttype: $scope.Paymenttype,
                    PatientId: $scope.currentcontext.pid
                },
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
                    Key: 4,
                    Value: [1, 10, 11, 15, 17]
                },
                {
                    Key: 22,
                    Value: [4, 5, 7, 8, 9, 10]
                }, // includeWOStatus Approved and Released
                {
                    Key: 35,
                    Value: true
                }
                ],
            };
            var options = {
                action: 'emr/patientorder/PrintVaccineSummary',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        // $scope.print = function () {
        //     var inputData = {
        //         Id: $scope.currentcontext.woid,
        //     };
        //     var options = {
        //         action: 'lis/patientworkorder/PrintPatientVaccineWorkorder',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "VaccinationType"
            },
            {
                "Key": "ServiceItem",
                Request: {
                    Params: [{
                        Key: 37,
                        Value: true
                    }]
                }
            },];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();

        // $scope.getDetails();
    }

    vaccinesummaryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();