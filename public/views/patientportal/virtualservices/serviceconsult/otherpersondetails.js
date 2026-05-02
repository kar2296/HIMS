(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('OtherPersonDetailsController', OtherPersonDetailsController);

    function OtherPersonDetailsController($scope, $stateParams, $state, $translate, $filter, utl, Upload, $timeout) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        // pad();
        var windowVar;
        // sysend.proxy("http://3.22.42.48");
        // sysend.proxy("http://localhost");
        // sysend.proxy("http://localhost:3000");
        // sysend.on("foo", function (message) {
        //     console.log(message);
        //     if (windowVar) {
        //         windowVar.close();
        //     }
        // });

        var vm = this;
        $scope.PaymentgatewayNo = "";
        $scope.currentcontext = {};
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.orderdata = $stateParams.orderid;
        $scope.currentcontext.id = $scope.orderdata;
        $scope.vcategoryid = $stateParams.ctgryid;
        $scope.vsubcategoryid = $stateParams.subctgryid;
        $scope.lookup = {};
        $scope.VOrderDetails = [];
        $scope.VaccineQuestion = [];
        $scope.VaccineOrderQuestionInfo = [];
        $scope.item = {
            RequestTypeId: 1,
            OrderConsultTypeId: 2,
            // PaymentModeId: 2,
            OrderModeId: 2,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            VirtualOrderStatusId: 1,
            // FacilityId: utl.Session.getCurrentFacilityId()
        }
        $scope.currentcontext = {};
        $scope.currentcontext.file = null;

        $scope.item.FacilityId = $stateParams.facid;
        if ($scope.ctgryInfo) {
            $scope.currentcontext.FacilityName = $scope.ctgryInfo.SelectedFacilityName;
            $scope.currentcontext.ResultFormatTypeId = $scope.ctgryInfo.ResultFormatTypeId;
        }
        $scope.currentcontext.islab = $stateParams.islab;
        $scope.currentcontext.isoxygenselection = $stateParams.isoxygenselection;
        $scope.currentcontext.isvaccines = $stateParams.isvaccines;
        $scope.currentcontext.isrenew = $stateParams.isrenew;
        $scope.vDetails = $stateParams.details;
        $scope.item = $stateParams.slotinfo;
        $scope.item.GrossAmount = $stateParams.slotinfo.GrossAmount;
        $scope.item.OrderTotal = $stateParams.slotinfo.OrderTotal;
        $scope.item.DiscountAmount = $stateParams.slotinfo.DiscountAmount;
        $scope.item.VATAmount = $stateParams.slotinfo.VATAmount;
        $scope.VirtualOrderDetails = $scope.vDetails;
        $scope.currentcontext.detailsinfo = $scope.VirtualOrderDetails;
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.currentcontext.oid = parseInt($stateParams.oid);
        $scope.slotdata = $stateParams.slotinfo;
        $scope.ctypeId = parseInt($stateParams.ctypeId);
        $scope.item.VirtualCategoryId = $scope.currentcontext.vcategoryid;
        $scope.item.VirtualSubCategoryId = $scope.currentcontext.vsubcategoryid;
        $scope.item.ResultFormatTypeId = $scope.currentcontext.ResultFormatTypeId;
        // $scope.item.OrderFromId = parseInt(utl.Session.getCurrentDepartmentId());
        $scope.item.CategoryTypeId = $scope.ctypeId;
        $scope.item.CategoryTypeId = $scope.ctypeId;
        $scope.AllDetails = [];
        $scope.FinalOrderInfo = [];
        $scope.FinalVaccineQstnData = [];
        $scope.CanShowPay = false;
        if ($scope.slotdata) {
            var Datefrom = $filter('date')($scope.slotdata.AppointmentDate, 'yyyy-MM-dd 00:00:00');
            var Dateto = $filter('date')($scope.slotdata.AppointmentEndDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.AppointmentDate = $filter('date')($scope.slotdata.AppointmentDate, 'yyyy-MM-dd');
            $scope.item.AppointmentDate = Datefrom;
            $scope.item.OrderScheduleDate = Datefrom;;
            $scope.item.StartTime = $scope.slotdata.StartTime;
            $scope.item.NoofDays = $scope.slotdata.NoofDays;
            $scope.item.SelectedSlot = $scope.slotdata.SelectedSlot;
            $scope.item.MinAdvAmount = $scope.slotdata.MinAdvAmount;
            $scope.item.AppointmentEndDate = Dateto;
            $scope.item.EndTime = $scope.slotdata.EndTime;
            $scope.item.Address = $scope.slotdata.Address;
            $scope.item = $scope.slotdata;
        }

        $scope.getvaccinequestionCallback = function(scope, res, options, hasError) {
            const questionBreak = [];
            if (res.Data.length > 0) {
                res.Data.forEach(item => {
                    item.questionsArr = item.Description ?
                        item.Description.split(",") : [];
                    item.Result = -1;
                    questionBreak.push(item)
                })
            }
            $scope.VaccineQuestion = questionBreak;
            $scope.VaccineOrderQuestionInfo = res.Data || [];
        };

        $scope.getvaccinequestion = function() {

            var inputData = {
                Params: []
            };

            var options = {
                action: 'VirtualHealthcare/VaccineQuestionMaster/GetVaccineQuestionMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvaccinequestionCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function() {
            $state.go('patientportal.virtualserviceselection', {
                drdata: $scope.drdetail,
                slotinfo: $scope.slotdata
            });
        };
        $scope.home = function() {
            $state.go('patientportal.virtualsubcategoryselection', {
                id: 0
            });
        }
        $scope.addotherpersons = function() {
            utl.Modal.open('patientportal.otherpersoninfo', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getOtherPatients
            });
        }
        $scope.CalcTotAmt = function() {
            $scope.NetAmount = 0;
            for (var idx in $scope.AllDetails) {
                var data = $scope.AllDetails[idx];
                if (data.Status == 1 && data.IsInclude) {
                    $scope.NetAmount += data.NetAmount;
                }
            }
            $scope.item.TotalNetAmount = $scope.NetAmount;
        }

        $scope.getOtherPatientsCallback = function(scope, res, options, hasError) {
            $scope.CanShowPay = true;
            $scope.OtherPersonInfo = [];
            if (res.Data.length > 0) {
                for (var idx in res.Data) {
                    var patientinfo = res.Data[idx];
                    var patname = '';
                    var gender = '';
                    if (patientinfo.Gender) {
                        gender = patientinfo.Gender.Description;
                    }
                    if (patientinfo.Title) {
                        patname = patientinfo.Title.Description;
                    }
                    if (patientinfo.FirstName) {
                        patname += ' ' + patientinfo.FirstName;
                    }
                    if (patientinfo.LastName) {
                        patname += ' ' + patientinfo.LastName;
                    }
                    var testinfo = {
                        Id: 0,
                        PatientId: patientinfo.Id,
                        MRN: patientinfo.MRN,
                        PatientName: patname,
                        Gender: gender,
                        parentid: patientinfo.ParentPatientId,
                        Status: 1,
                        IsInclude: true
                    }
                    $scope.OtherPersonInfo.push(testinfo);
                    $scope.AllDetails.push(testinfo);
                }
            }
            $scope.CalcTotAmt();
        };

        $scope.getOtherPatients = function() {
            var inputData = {
                Params: [{
                        Key: 38,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 39,
                        Value: true
                    }
                ]
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOtherPatientsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPatientsCallback = function(scope, res, options, hasError) {
            $scope.PatientData = res;

        };

        $scope.getPat = function() {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientsCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.IsIncludePatient = function(item) {
            if (item.IsInclude) {
                item.IsInclude = true;
            } else if (!item.IsInclude) {
                item.IsInclude = false;
            }
            $scope.CalcTotAmt();
        }

        $scope.saveorder = function() {
            $scope.PaymentModeId = 2;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to confirm this Order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.saveItem();
        };
        $scope.dashboard = function() {
            $state.go('patientportal.virtualhealthcare');
        }
        $scope.pad = function(n, width, z) {
            z = z || "0";
            n = n + "";
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }

        $scope.payNow = function() {
            $state.go('patientportal.selectpaymentprovider', {
                details: $scope.vDetails,
                slotinfo: $scope.item,
                ctgryInfo: $scope.ctgryInfo,
                ctgryid: $scope.currentcontext.vcategoryid,
                isvaccines: $scope.currentcontext.isvaccines,
                islab: $scope.currentcontext.islab,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId,
            })
        }

        // $scope.payNow = function() {
        //     var id = Date.now();
        //     var amt = $scope.item.TotalNetAmount;
        //     var fix = amt.toFixed(2);
        //     var mutate = fix * 100;
        //     var round = parseInt(mutate);
        //     var parsePrice = $scope.pad(round, 12);
        //     var urlBind = 'https://payment.swostha.com/?process_payment=1&prod_desc=labbooking&inv=' + id + '&amount=' + parsePrice;

        //     windowVar = window.open(
        //         urlBind,
        //         "New Window",
        //         "width=600,height=500,top=70,left=500"
        //     );
        //     // sysend.proxy("http://3.22.42.48");
        //     sysend.proxy("https://ap01.swostha.com");
        //     sysend.proxy("https://swostha.com");
        //     sysend.proxy("https://payment.swostha.com");
        //     // sysend.proxy("http://localhost");
        //     // sysend.proxy("http://localhost:3000");
        //     sysend.on("foo", function(message) {
        //         console.log(message);
        //         if (windowVar) {
        //             if (message && message.message === 'success' && message.transRef) {
        //                 $scope.PaymentgatewayNo = message.transRef;
        //                 $scope.PaymentModeId = 1;
        //                 $scope.IsPaidFully = true;
        //                 $scope.saveItem();
        //             }
        //             windowVar.close();
        //         }
        //     });
        // }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            // if (data == 'Already Ordered to this Center') {
            //     utl.Alert.showErrorMsg('Already Ordered to this Center');
            //     $state.go('patientportal.virtualhealthcare');
            // } else {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
            // $scope.payNow(data);
            $state.go('patientportal.virtualhealthcare');
            // }
        };

        $scope.errorItemCallback = function(data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg('Already Ordered to this Center');
                $state.go('patientportal.virtualhealthcare');
            }
        }


        $scope.saveItem = function() {
            $scope.DisableSave = true;
            $scope.FinalOrderInfo = $scope.getDataforSave();
            $scope.FinalVaccineQstnData = $scope.getvaccineDataforSave();
            var actionName = 'VirtualHealthcare/VirtualOrder/AddVirtualOrder';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/VirtualOrder/UpdateVirtualOrder';
            }
            if ($scope.FinalOrderInfo.length > 0) {
                // $scope.FinalOrderInfo = $scope.getDataforSave();
                if ($scope.currentcontext.file) {
                    var actionUrl = utl.Http.getRootPath() + actionName;
                    Upload.upload({
                        url: actionUrl,
                        data: {
                            file: $scope.currentcontext.file,
                            Data: $scope.FinalOrderInfo,
                            VaccineData: $scope.FinalVaccineQstnData
                        }
                    }).then(function(resp) { //upload function returns a promise
                            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                            $scope.currentcontext.file = null;
                            $scope.saveItemCallback();
                        },
                        function(resp) { //catch error
                            if (resp.data.Error.Code == 'ALREADYEXIST') {
                                utl.Alert.showErrorMsg('Already Ordered to this Center');
                                $state.go('patientportal.virtualhealthcare');
                            } else {
                                console.log('Error status: ' + resp.status);
                                utl.Alert.showErrorMsg('Error status: ' + resp.status);
                            }
                        },
                        function(evt) {
                            console.log(evt);
                        });
                    return false;
                } else {
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.FinalOrderInfo,
                            VaccineData: $scope.FinalVaccineQstnData
                        },
                        type: 'post',
                        onComplete: $scope.saveItemCallback,
                        onError: $scope.errorItemCallback
                    };
                    utl.Http.doAction(options);
                }
            } else {
                return;
            }
        };

        $scope.getvaccineDataforSave = function() {
            for (var vdx in $scope.VaccineOrderQuestionInfo) {
                var vqData = $scope.VaccineOrderQuestionInfo[vdx];
                var VaccineAnswer = {
                    Id: 0,
                    VirtualOrderId: 0,
                    PatientId: $scope.item.PatientId,
                    VaccineQuestionId: vqData.Id,
                    Description: vqData.Description,
                    Result: vqData.Result,
                    Status: vqData.Status,
                };
                $scope.FinalVaccineQstnData.push(VaccineAnswer);
            }
            return $scope.FinalVaccineQstnData;
        };


        function getVaccinequestionForSave() {
            var result = [];
            for (var idx in $scope.VaccineOrderQuestionInfo) {
                var item = $scope.VaccineOrderQuestionInfo[idx];
                // item.Result = item.Result || -1;
                item.Description = item.Description;
                item.Result = 1;
            }

            return result;
        }

        $scope.getDataforSave = function() {
            for (var odx in $scope.currentcontext.detailsinfo) {
                var details = $scope.currentcontext.detailsinfo[odx];
                if (details.Status == 1) {
                    $scope.VOrderDetails.push(details);
                }
            }
            $scope.FinalOrderInfo = [];
            var OrderFrom = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var OrderTo = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            for (var pdx in $scope.currentcontext.detailsinfo) {
                var patInfo = $scope.currentcontext.detailsinfo[pdx];
                // if (patInfo.IsInclude == true) {
                var headerinfo = {
                    Id: 0,
                    FacilityId: $scope.item.FacilityId,
                    ResultFormatTypeId: $scope.item.ResultFormatTypeId || 1,
                    VirtualCategoryId: $scope.vcategoryid,
                    VirtualSubCategoryId: $scope.vsubcategoryid,
                    CategoryTypeId: $scope.item.CategoryTypeId,
                    PatientId: $scope.PatientData.Id,
                    ParentPatientId: $scope.PatientData.parentid,
                    PatientMRN: $scope.PatientData.MRN,
                    PatientName: $scope.PatientData.PatientName,
                    OrderRequestDate: utl.Formatter.getCurrentDate(),
                    FromDate: OrderFrom,
                    ToDate: OrderTo,
                    OrderScheduleDate: $scope.item.OrderScheduleDate,
                    VirtualOrderStatusId: 1,
                    OrderTotal: $scope.item.OrderTotal,
                    PaymentModeId: $scope.PaymentModeId,
                    OrderModeId: 2,
                    RequestTypeId: 1,
                    AppointmentDate: $scope.item.AppointmentDate,
                    AppointmentEndDate: $scope.item.AppointmentEndDate,
                    NoofDays: $scope.item.NoofDays,
                    StartTime: $scope.item.StartTime,
                    EndTime: $scope.item.EndTime,
                    TotalNetAmount: $scope.item.OrderTotal,
                    GrossAmount: $scope.item.GrossAmount,
                    DiscountAmount: $scope.item.DiscountAmount,
                    VATAmount: $scope.item.VATAmount,
                    IsVaccineOrders: $scope.currentcontext.isvaccines,
                    IsRenewed: $scope.currentcontext.isrenew,
                    vorderId: $scope.currentcontext.oid,
                    IsLab: $scope.currentcontext.islab || false,
                    IsOxygenOrders: $scope.currentcontext.isoxygenselection || false,
                    IsLabOrders: $scope.currentcontext.islab || false,
                    Address: $scope.item.Address,
                    Landmark: $scope.item.Landmark,
                    ProofTypeId: $scope.item.ProofTypeId,
                    IssueAuthorityId: $scope.item.IssueAuthorityId,
                    CovidId: $scope.item.CovidId,
                    AllergiesId: $scope.item.AllergiesId,
                    DiseaseId: $scope.item.DiseaseId,
                    Disease: $scope.item.Disease,
                    ProofIdentify: $scope.item.ProofIdentify,
                    MinAdvance: $scope.item.MinAdvAmount,
                    Details: $scope.VOrderDetails,
                    VaccineDetails: $scope.VaccineOrderQuestionInfo,
                    PaymentGatewayRefNo: $scope.PaymentgatewayNo,
                    // IsPaidFully: $scope.IsPaidFully
                }
                $scope.FinalOrderInfo.push(headerinfo);
                // }
            }
            return $scope.FinalOrderInfo;
        }

        $scope.getPrevOrdersCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var admcount = 0;
                for (var pdx in res.Data) {
                    var vaccinedata = res.Data[pdx];
                    if (vaccinedata.OrderStatusId != 2) {
                        if (vaccinedata.OrderStatusId != 17) {
                            admcount++;
                        }
                    }
                }
                if (admcount > 0) {
                    $scope.DisableSave = true;
                }
                // utl.Alert.showErrorMsg('Vaccine Already Administered');
                // return;
            }
        };

        $scope.getPrevOrders = function() {
            var inputData = {

                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    // {
                    //     Key: 4,
                    //     Value: 17
                    // },
                    {
                        Key: 35,
                        Value: true
                    },
                ]
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevOrdersCallback
            };

            utl.Http.doAction(options);
        }

        $scope.payRazorPay = function() {
            console.clear();
            console.log('logging');
            console.log($scope.AllDetails[0]);
            var razorpayoption = {
                'key': 'rzp_test_N3RvbAy7wbhsQN',
                // Insert the amount here, dynamically, even
                'amount': ($scope.AllDetails[0].TotalNetAmount) * 100,
                'name': $scope.AllDetails[0].PatientName,
                'description': 'Thankyou For your payment',
                'image': '',
                'handler': function(transaction) {
                    console.log(transaction);
                    $scope.PaymentgatewayNo = transaction.razorpay_payment_id;
                    $scope.PaymentModeId = 1;
                    $scope.IsPaidFully = true;
                    $scope.saveItem();
                    //   $scope.transactionHandler(transaction);
                },
                'prefill': {
                    'name': '',
                    'email': '',
                    'contact': ''
                }
            };
            var rzp1 = new Razorpay(razorpayoption);
            rzp1.open();

        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            });
            $scope.getPat();
            // $scope.getvaccinequestion();
            if ($scope.currentcontext.isvaccines) {
                $scope.getPrevOrders();
            }
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Title"
                },
                {
                    "Key": "Gender"
                },
                {
                    "Key": "ProofType"
                },
                {
                    "Key": "YesNo",
                    Default: false
                }
            ]
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

    OtherPersonDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'Upload', '$timeout'];

})();