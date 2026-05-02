(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('vaccineresultsController', vaccineresultsController);

    function vaccineresultsController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        vm.orders = [];
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            ToDate: utl.Formatter.getCurrentDate()
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
                    VirtualOrderId: orddata.VirtualOrderId,
                    CancelReason: orddata.CancelReason,
                    PatientId: orddata.PatientId
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

        $scope.cancelreason = function (item) {
            utl.Modal.openFixedDialog('patienportal.patcancelreason', {
                params: {
                    oid: item.Id,
                    item: item
                },
                confirmCallback: $scope.cancelreasonSave
            });
        }

        $scope.cancelreasonSave = function (item, itemFromModal) {
            item.CancelReason = item.CancelReason;
            $scope.CancelOrder(item, status);
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
                 var patientorderid=0;
                patientorderid=orderdata.Id;
                var orderstatusid=0;
                orderstatusid=orderdata.OrderStatusId;
                // var sname = '';
                // if (orderdata.PatientOrderDetails.length > 0) {
                //     for (var pdx in orderdata.PatientOrderDetails) {
                //         var ordDetail = orderdata.PatientOrderDetails[pdx];
                //         sname = ordDetail.ServiceName;
                //     }
                // }
                var workorder = [];
                var resvalue = '';
                var resvaluesid = 0;
                var resattach = '';
                workorder = orderdata.PatientWorkorders;
                let workorderid = 0;
                //                 if (workorder.length > 0) {
                //                     for (var wid in workorder) {
                //                         var patworkorder = workorder[wid];
                //                         workorderid = patworkorder.Id;
                //                         var wodetails = workorder[wid].PatientWorkorderdetails;
                //                         for (var wdx in wodetails) {
                //                             var wdetails = wodetails[wdx];
                //                             resvaluesid = wdetails.ResultValueId;
                //                             if (wdetails.ResultValue) {
                //                                 resvalue = wdetails.ResultValue.Description;
                //                             }
                //                             resattach = wdetails.ResultAttachment;
                //                         }
                //                     }
                //                 }

                var odata = {
                    Id: orderdata.Id,
                    WorkOrderId: workorderid,
                    PatientId: orderdata.PatientId,
                    Title: orderdata.Patient.Title.Description,
                    FirstName: orderdata.Patient.FirstName,
                    LastName: orderdata.Patient.LastName,
                    EndTime: orderdata.EndTime,
                    StartTime: orderdata.StartTime,
                    AddressLine1: orderdata.Facility.AddressLine1,
                    FacilityName: orderdata.Facility.FacilityName,
                    OrderStatusId: orderdata.OrderStatusId,
                    OrderNumber: orderdata.OrderNumber,
                    OrderStatus: orderdata.OrderStatus.DisplayName,
                    OrderRequestDate: orderdata.OrderRequestDate,
                    OrderScheduleDate: orderdata.OrderScheduleDate,
                    SubCategoryId: orderdata.VirtualSubCategory.Id,
                    SubCategory: orderdata.VirtualSubCategory.SubCategoryName,
                    IsVaccineSelfCard: orderdata.IsVaccineSelfCard,
                    orderstatusid:orderstatusid,
                    PatientOrderId:patientorderid,
                    // ServiceName: sname,
                    //                     ResultValueId: resvaluesid,
                    //                     ResultValue: resvalue,
                    ResultAttachment: resattach,
                    VirtualOrderId: orderdata.VirtualOrderId,
                    PaymentModeId: orderdata.PaymentModeId,
                    CancelReason: orderdata.CancelReason,
                    // if(PaymentMode){
                    // PaymentMode:orderdata.PaymentMode.Description
                    // }
                }
                $scope.items.push(odata);
            }

        };

        $scope.getDetails = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid,
                },
                // {
                //     Key: 36,
                //     Value: $scope.currentcontext.pid,
                // },
                //                     {
                //                         Key: 22,
                //                         Value: [4, 5, 7, 8, 9, 10]
                //                     }, // includeWOStatus Approved and Released
                {
                    Key: 35,
                    Value: true
                }
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
            utl.Modal.openFixedDialog('patientportal.vaccineresultinfo', {
                params: {
                    oid: item.Id,
                    selfcard: item.IsVaccineSelfCard
                },
                confirmCallback: $scope.getDetails
            });
        }
        $scope.Editvaccinecard = function (item) {
            utl.Modal.openFixedDialog('patientportal.vaccinecardedit', {
                params: {
                    id: item.PatientOrderId,
                },
                confirmCallback: $scope.getDetails
            });
        }

        $scope.printinfo = function (item) {
            $state.go('self.vaccinecertificate', {
                woid: item.WorkOrderId
            });
        }
        $scope.vaccinesummary = function () {
            $state.go('patientportal.vaccinesummary');
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = res.Data;
        };

        $scope.getList = function () {
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
                    Key: 22,
                    Value: [4, 5, 7, 8, 9, 10]
                }, // includeWOStatus Approved and Released
                {
                    Key: 35,
                    Value: true
                }
                ]
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        }


        $scope.getDetails();
    }

    vaccineresultsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();