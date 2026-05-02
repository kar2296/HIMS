(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VaccineSummaryQRCodeController', VaccineSummaryQRCodeController);

    function VaccineSummaryQRCodeController($http, $scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        // console.log($stateParams.id, '***********************');
        $scope.item = {};
        $scope.VaccineData = {};
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        // $stateParams.id = parseInt($stateParams.woid);
        // $scope.confirmCallback = $uibModalInstance.close;
        // $scope.cancelCallback = $uibModalInstance.dismiss;

        selfUserLogin();

        function selfUserLogin() {
            var options = {
                action: 'auth/getClientToken',
                data: {
                    userName: 'selfuser',
                    password: 'pwd',
                    userList: $scope.userData
                },
                type: 'post',
                onComplete: (scope, data) => {
                    console.log('jjjjjj', data);
                    var clientToken = data.token;
                    localStorage.setItem('token', clientToken)
                    $http.defaults.headers.post.Authorization = `bearer ${localStorage.getItem('token')}`;
                    $scope.getDetails();
                }
            };
            utl.Http.doAction(options);
        }

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     $scope.item = data;
        //     $scope.getDetails();
        // };

        // $scope.getItem = function () {
        //     if ($stateParams.id) {

        //         var options = {
        //             action: 'lis/patientworkorder/GetPatientWorkorderById',
        //             data: {
        //                 Id: $stateParams.id
        //             },
        //             type: 'post',
        //             onComplete: $scope.getItemCallback
        //         };
        //         utl.Http.doAction(options);
        //     }
        // };

        // $scope.getDetailsCallback = function (scope, res, options, hasError) {
        //     $scope.items = [];
        //     for (var idx in res.Data) {
        //         var orderdata = res.Data[idx];
        //         var Dosage = '';
        //         var VaccinatedBy = '';
        //         var Batch = '';
        //         var VaccinationType = '';
        //         var Manufacturer = '';
        //         if (orderdata.Dosage) {
        //             Dosage = orderdata.Dosage.Description
        //         }
        //         if (orderdata.VaccinationType) {
        //             VaccinationType = orderdata.VaccinationType.Description
        //         }
        //         Manufacturer = orderdata.Manufacturer
        //         VaccinatedBy = orderdata.VaccinatedBy
        //         Batch = orderdata.Batch
        //         var sname = '';
        //         var serviceid = 0;
        //         if (orderdata.PatientOrderDetails.length > 0) {
        //             for (var pdx in orderdata.PatientOrderDetails) {
        //                 var ordDetail = orderdata.PatientOrderDetails[pdx];
        //                 serviceid = ordDetail.ServiceId;
        //                 sname = ordDetail.ServiceName;
        //             }
        //         }
        //         var workorder = [];
        //         // var patientorderdetails = [];
        //         var resvalue = '';
        //         var resvaluesid = 0;
        //         var resattach = '';
        //         var vdosage = 0;
        //         var vtype = 0;
        //         var nextschdate = '';
        //         // var vaccinatedby = 0;
        //         var vaccinateduser = '';
        //         var title = 0;
        //         var firstname='';
        //         var lastname='';
        //         var lotno = '',
        //             workorder = orderdata.PatientWorkorders;
        //         let workorderid = 0;
        //         // patientorderdetails = orderdata.PatientOrderDetails;
        //         // if (patientorderdetails.length > 0) {
        //         //     for (var podid in patientorderdetails) {
        //         //         ServiceName = patientorderdetails[podid].ServiceName;
        //         //     }
        //         // }
        //         if (workorder.length > 0) {
        //             for (var wid in workorder) {
        //                 var patworkorder = workorder[wid];
        //                 workorderid = patworkorder.Id;
        //                 var wodetails = workorder[wid].PatientWorkorderdetails;
        //                 for (var wdx in wodetails) {
        //                     var wdetails = wodetails[wdx];
        //                     resvaluesid = wdetails.ResultValueId;
        //                     if (wdetails.ResultValue) {
        //                         resvalue = wdetails.ResultValue.Description;
        //                     }
        //                     // vdosageid = wdetails.DosageId;
        //                     if (wdetails.Dosage) {
        //                         vdosage = wdetails.Dosage.Description;
        //                     }
        //                     // vtypeid = wdetails.VaccinationTypeId;
        //                     if (wdetails.VaccinationType) {
        //                         vtype = wdetails.VaccinationType.Description;
        //                     }

        //                     // vaccinatedby = wdetails.VaccinatedBy;
        //                     // if (wdetails.VaccinatedUser) {
        //                     //     vaccinateduser = wdetails.VaccinatedUser.FirstName;
        //                     // }
        //                     if (wdetails.VaccinatedUser) {
        //                         firstname = wdetails.VaccinatedUser.FirstName;
        //                     }
        //                     if (wdetails.VaccinatedUser) {
        //                         lastname = wdetails.VaccinatedUser.LastName;
        //                     }
        //                     lotno = wdetails.LotNo;
        //                     if (wdetails.LotNo) {
        //                         lotno = wdetails.LotNo;
        //                     }
        //                     if (wdetails.NextScheduleDate) {
        //                         nextschdate = wdetails.NextScheduleDate;
        //                     }
        //                     if (wdetails.NextScheduleDate) {
        //                         nextschdate = wdetails.NextScheduleDate;
        //                     }
        //                     resattach = wdetails.ResultAttachment;
        //                 }
        //             }
        //         }

        //         var odata = {
        //             Id: orderdata.Id,
        //             WorkOrderId: workorderid,
        //             PatientName: orderdata.Patient.FirstName,
        //             EndTime: orderdata.EndTime,
        //             StartTime: orderdata.StartTime,
        //             AddressLine1: orderdata.Facility.AddressLine1,
        //             FacilityName: orderdata.Facility.FacilityName,
        //             OrderStatusId: orderdata.OrderStatusId,
        //             OrderNumber: orderdata.OrderNumber,
        //             OrderStatus: orderdata.OrderStatus.DisplayName,
        //             OrderRequestDate: orderdata.OrderRequestDate,
        //             OrderScheduleDate: orderdata.OrderScheduleDate,
        //             SubCategory: orderdata.VirtualSubCategory.SubCategoryName,
        //             ServiceName: sname,
        //             VaccineCenterName: orderdata.VaccineCenterName,
        //             ServiceId: serviceid,
        //             ResultValueId: resvaluesid,
        //             ResultValue: resvalue,
        //             VDosage: vdosage,
        //             VType: vtype,
        //             Dosage: Dosage,
        //             VaccinationType: VaccinationType,
        //             Manufacturer: Manufacturer,
        //             Batch: Batch,
        //             Title:title,
        //             FirstName:firstname,
        //             LastName:lastname,
        //             VaccinatedBy: VaccinatedBy,
        //             LotNo: lotno,
        //             VaccinatedUser: vaccinateduser,
        //             NextScheduleDate: nextschdate,
        //             ResultAttachment: resattach,
        //             VirtualOrderId: orderdata.VirtualOrderId,
        //             PaymentModeId: orderdata.PaymentModeId,
        //             // if(PaymentMode){
        //             // PaymentMode:orderdata.PaymentMode.Description
        //             // }
        //         }
        //         $scope.currentcontext.ServiceId = odata.ServiceId;

        //         $scope.items.push(odata);

        //     }
        // };

        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            $scope.VaccineData = res.Data[0];
        };

        $scope.getDetails = function () {
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $stateParams.id,
                    },
                    // {
                    //     Key: 12,
                    //     Value: From
                    // },
                    // {
                    //     Key: 13,
                    //     Value: To
                    // },
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
                    // {
                    //     Key: 56,
                    //     Value: $scope.currentfilter.VaccinationTypeId,
                    // },
                    // {
                    //     Key: 57,
                    //     Value: $scope.currentfilter.ServiceId,
                    // },
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


        $scope.print = function () {
            var inputData = {
                Id: $stateParams.id,
            };
            var options = {
                action: 'lis/patientworkorder/PrintPatientVaccineWorkorder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        // $scope.getItem();
    }

    VaccineSummaryQRCodeController.$inject = ['$http', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();