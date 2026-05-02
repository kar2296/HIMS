(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorsharesummaryreportController', doctorsharesummaryreportController);

    function doctorsharesummaryreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.DrShareSummary = [];
        $scope.OPDrConsShareDetails = [];
        $scope.OPDrProceShareDetails = [];
        $scope.IPDrProceShareDetails = [];
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.DocShareSummaryCallback = function (scope, res, options, hasError) {
            $scope.DrShareSummary = [];
            var grpData = _.groupBy(res.Data, 'DoctorId');

            for (var idx in grpData) {
                var item = grpData[idx];
                var shareData = {
                    OpdIncome: 0,
                    IpdIncome: 0,
                    Tds: 0,
                    DrNetAmt: 0,
                    BillAmount: 0
                };
                var netamt = 0;
                for (var kdx in item) {
                    var drsummary = item[kdx];
                    if (drsummary.PatientBill.EncounterTypeId == 1) {
                        shareData.OpdIncome += drsummary.DoctorShareAmount;
                    }
                    if (drsummary.PatientBill.EncounterTypeId == 2) {
                        if (drsummary.Encounter.AdmissionStatusId == 5 || drsummary.Encounter.AdmissionStatusId == 6) {
                            // shareData.IpdIncome += drsummary.DoctorShareAmount;
                            if(drsummary.PatientBillDetail.ProportionateDiscount>0){
                                drsummary.PatientBillDetail.GrossAmount =  drsummary.PatientBillDetail.GrossAmount -  drsummary.PatientBillDetail.ProportionateDiscount;
                                if(drsummary.DoctorSharePercentage == 0){
                                    drsummary.DoctorSharePercentage = (drsummary.DoctorShareAmount*100)/(drsummary.ServiceAmount);
                                    shareData.ipProcdoctorshare = drsummary.PatientBillDetail.GrossAmount * drsummary.DoctorSharePercentage / 100;
                                }else{
                                    shareData.ipProcdoctorshare = drsummary.PatientBillDetail.GrossAmount * drsummary.DoctorSharePercentage / 100;
                                }
                                shareData.IpdIncome += shareData.ipProcdoctorshare;
                                drsummary.DoctorShareAmount = shareData.ipProcdoctorshare;
                            }else{
                                shareData.IpdIncome += drsummary.DoctorShareAmount;
                            }
                        }
                    }
                    if (drsummary.User.GstMaster) {
                        drsummary.TdsPercentage = drsummary.User.GstMaster.GstPercentage;
                    }
                    if (drsummary.TdsPercentage) {
                        drsummary.TdsAmount = drsummary.DoctorShareAmount * (drsummary.TdsPercentage / 100);
                    }
                    shareData.BillAmount += drsummary.ServiceAmount;
                    shareData.Tds += drsummary.TdsAmount;
                    netamt = parseFloat(drsummary.DoctorShareAmount) - parseFloat(drsummary.TdsAmount || 0);
                    shareData.DrNetAmt += netamt;
                }
                $scope.DrShareSummary.push(shareData);
            }
        };
        $scope.DocShareSummary = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.EncounterTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 14,
                        Value: 3
                    },
                ]
            };

            var options = {
                action: 'billing/patientdoctorsharedetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.DocShareSummaryCallback
            };

            utl.Http.doAction(options);
        };

        $scope.OPDDrProceShareDetailsCallback = function (scope, res, options, hasError) {
            $scope.OPDrProceShareDetails = [];
            var grpData = _.groupBy(res.Data, 'PatientBillDetail.ServiceCategoryId');
            for (var gdx in grpData) {
                var drShare = grpData[gdx];
                var opproceshareData = {
                    ServiceCategoryName: '',
                    GrpdServiceItems: []
                };
                var Servicegroup = _.groupBy(drShare, 'ServiceItemId');
                for (var dx in Servicegroup) {
                    var opproceshare = Servicegroup[dx];
                    var grpServicesInfo = {
                        ServiceName: '',
                        ProcTotalPatient: 0,
                        ProcOpdAmount: 0,
                        ProcDrShare: 0,
                        ProcTds: 0,
                        ProcNetAmt: 0
                    }
                    var netamt = 0;
                    for (var ix in opproceshare) {
                        var procInfo = opproceshare[ix];
                        opproceshareData.ServiceCategoryName = procInfo.PatientBillDetail.ServiceCategory.ServiceCategoryName;
                        grpServicesInfo.ServiceName = procInfo.PatientBillDetail.ServiceName;
                        grpServicesInfo.ProcTotalPatient = opproceshare.length;
                        grpServicesInfo.ProcOpdAmount += procInfo.ServiceAmount;
                        grpServicesInfo.ProcDrShare += procInfo.DoctorShareAmount;
                        if (procInfo.User.GstMaster) {
                            procInfo.TdsPercentage = procInfo.User.GstMaster.GstPercentage;
                        }
                        if (procInfo.TdsPercentage) {
                            procInfo.TdsAmount = procInfo.DoctorShareAmount * (procInfo.TdsPercentage / 100);
                        }
                        grpServicesInfo.ProcTds += procInfo.TdsAmount;
                        netamt = parseFloat(procInfo.DoctorShareAmount) - parseFloat(procInfo.TdsAmount);
                        grpServicesInfo.ProcNetAmt += netamt;
                    }
                    opproceshareData.GrpdServiceItems.push(grpServicesInfo);
                }
                $scope.OPDrProceShareDetails.push(opproceshareData);
            }
            $scope.NetTotOpProcPatient = 0;
            $scope.NetTotOPProcOpdAmount = 0;
            $scope.NetTotOpProcDrShare = 0;
            $scope.NetTotOpProcTds = 0;
            $scope.NetOPProcTotal = 0;
            for (var cdx in $scope.OPDrProceShareDetails) {
                var itemProceshare = $scope.OPDrProceShareDetails[cdx];
                for (var jdx in itemProceshare.GrpdServiceItems) {
                    var netselect = itemProceshare.GrpdServiceItems[jdx];
                    $scope.NetTotOpProcPatient += netselect.ProcTotalPatient;
                    $scope.NetTotOPProcOpdAmount += netselect.ProcOpdAmount;
                    $scope.NetTotOpProcDrShare += netselect.ProcDrShare;
                    $scope.NetTotOpProcTds += netselect.ProcTds;
                    $scope.NetOPProcTotal += netselect.ProcNetAmt;
                }
            }
        };

        $scope.OPDDrProceShareDetails = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 5,
                        Value: 1
                    },
                    // {
                    //     Key: 7,
                    //     Value: 4
                    // },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 14,
                        Value: 3
                    },
                ]
            };

            var options = {
                action: 'billing/patientdoctorsharedetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.OPDDrProceShareDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.IPDDrProceShareDetailsCallback = function (scope, res, options, hasError) {
            $scope.IPDrProceShareDetails = [];
            var grpData = _.groupBy(res.Data, 'PatientBillDetail.ServiceCategoryId');
            for (var gdx in grpData) {
                var IPdrShare = grpData[gdx];
                var ipproceshareData = {
                    ipServiceCategoryName: '',
                    ipGrpdServiceItems: []
                };
                var IPServicegroup = _.groupBy(IPdrShare, 'ServiceItemId');
                for (var dx in IPServicegroup) {
                    var ipproceshare = IPServicegroup[dx];
                    var ipgrpServicesInfo = {
                        ipServiceName: '',
                        ipProcTotalPatient: 0,
                        ipProcIpdAmount: 0,
                        ipProcDrShare: 0,
                        ipProcTds: 0,
                        ipProcNetAmt: 0
                    }
                    var netamt = 0;
                    for (var ix in ipproceshare) {
                        var ipprocInfo = ipproceshare[ix];
                        ipproceshareData.ipServiceCategoryName = ipprocInfo.PatientBillDetail.ServiceCategory.ServiceCategoryName;
                        ipgrpServicesInfo.ipServiceName = ipprocInfo.PatientBillDetail.ServiceName;
                        ipgrpServicesInfo.ipProcTotalPatient = ipproceshare.length;
                        ipgrpServicesInfo.ipProcIpdAmount += ipprocInfo.ServiceAmount;
                        if(ipprocInfo.PatientBillDetail.ProportionateDiscount>0){
                            ipprocInfo.PatientBillDetail.GrossAmount =  ipprocInfo.PatientBillDetail.GrossAmount -  ipprocInfo.PatientBillDetail.ProportionateDiscount;
                            if(ipprocInfo.DoctorSharePercentage == 0){
                                ipprocInfo.DoctorSharePercentage = (ipprocInfo.DoctorShareAmount*100)/(ipprocInfo.ServiceAmount);
                                ipgrpServicesInfo.ipProcdoctorshare = ipprocInfo.PatientBillDetail.GrossAmount * ipprocInfo.DoctorSharePercentage / 100;
                            }else{
                                ipgrpServicesInfo.ipProcdoctorshare = ipprocInfo.PatientBillDetail.GrossAmount * ipprocInfo.DoctorSharePercentage / 100;
                            }
                            ipgrpServicesInfo.ipProcDrShare += ipgrpServicesInfo.ipProcdoctorshare;
                            ipprocInfo.DoctorShareAmount = ipgrpServicesInfo.ipProcdoctorshare;
                        }else{
                            ipgrpServicesInfo.ipProcDrShare += ipprocInfo.DoctorShareAmount;
                        } if (ipprocInfo.User.GstMaster) {
                            ipprocInfo.TdsPercentage = ipprocInfo.User.GstMaster.GstPercentage;
                        }
                        if (ipprocInfo.TdsPercentage) {
                            ipprocInfo.TdsAmount = ipprocInfo.DoctorShareAmount * (ipprocInfo.TdsPercentage / 100);
                        }
                        ipgrpServicesInfo.ipProcTds += ipprocInfo.TdsAmount;
                        netamt = parseFloat(ipprocInfo.DoctorShareAmount) - parseFloat(ipprocInfo.TdsAmount);
                        ipgrpServicesInfo.ipProcNetAmt += netamt;
                    }
                    ipproceshareData.ipGrpdServiceItems.push(ipgrpServicesInfo);
                }
                $scope.IPDrProceShareDetails.push(ipproceshareData);
            }
            $scope.NetTotIPProcPatient = 0;
            $scope.NetTotIPProcIpdAmount = 0;
            $scope.NetTotIPProcDrShare = 0;
            $scope.NetTotIPProcTds = 0;
            $scope.NetIPProcTotal = 0;
            for (var cdx in $scope.IPDrProceShareDetails) {
                var itemipProceshare = $scope.IPDrProceShareDetails[cdx];
                for (var jdx in itemipProceshare.ipGrpdServiceItems) {
                    var netipselect = itemipProceshare.ipGrpdServiceItems[jdx];
                    $scope.NetTotIPProcPatient += netipselect.ipProcTotalPatient;
                    $scope.NetTotIPProcIpdAmount += netipselect.ipProcIpdAmount;
                    $scope.NetTotIPProcDrShare += netipselect.ipProcDrShare;
                    $scope.NetTotIPProcTds += netipselect.ipProcTds;
                    $scope.NetIPProcTotal += netipselect.ipProcNetAmt;
                }
            }
        };

        $scope.IPDDrProceShareDetails = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                    {
                        Key: 8,
                        Value: [5, 6]
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 14,
                        Value: 3
                    },
                ]
            };

            var options = {
                action: 'billing/patientdoctorsharedetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.IPDDrProceShareDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backtoReport = function () {
            $state.go('app.financereporttab.doctorinvoicereport')
        }
        $scope.print = function () {
            if ($scope.currentfilter.DoctorId > 0) {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Data: {
                        FromDate: From,
                        ToDate: To,
                        DoctorName: $scope.DoctorName,
                        DoctorId: $scope.currentfilter.DoctorId,
                        FacilityId: utl.Session.getCurrentFacilityId()
                    },
                };
                var options = {
                    action: 'billing/patientdoctorsharedetails/PrintDoctorShareSummaryReport',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };


        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'User Id',
                    field: 'UserId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'User Name',
                    field: 'UserName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }
            $scope.DoctorName = result;
            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: 2
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.loadDrShareInfo = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            if ($scope.currentfilter.DoctorId > 0) {
                $scope.DrShareSummary = [];
                // $scope.OPDrConsShareDetails = [];
                $scope.OPDrProceShareDetails = [];
                $scope.IPDrProceShareDetails = [];
                $scope.DocShareSummary();
                // $scope.OPDDrConsShareDetails();
                $scope.OPDDrProceShareDetails();
                $scope.IPDDrProceShareDetails();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "EncounterType"
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();

    }

    doctorsharesummaryreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();