(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dashboardFormController', dashboardFormController);

    function dashboardFormController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CurrentDate: utl.Formatter.getCurrentDate(),
        }
        $scope.currentfilter = {
            // FacilityId: utl.Session.getCurrentFacilityId(),
            // FacilityName: utl.Session.getCurrentFacilityName(),
            // BillDate: utl.Formatter.getCurrentDate(),
            GuarantorTypeId: -1,
            BillTypeId: -1,
            GuarantorId: -1,
        };
        $scope.Items = [];
        $scope.Items.TotalAdmissionCount = '0';
        $scope.Items.DischargeCount = '0';
        $scope.Items.AdmittedCount = '0';
        $scope.Items.FitforDischargeCount = '0';
        $scope.Items.ClinicalDischargeCount = '0';
        $scope.Items.FinancialDischargeCount = '0';
        $scope.Items.TotalOccupancyCount = '0';

        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        }

        $scope.custom_sort = function (a, b) {
            if (b.Value && a.Value && b.Value.DisplayOrder && a.Value.DisplayOrder)
                return a.Value.DisplayOrder - b.Value.DisplayOrder;
            else
                return 0;
        }
        $scope.getoccupancyCountCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.TotalOccupancyCount = res.Data.length;
            } else {
                $scope.Items.TotalOccupancyCount = '0';
            }

        };

        $scope.getoccupancyCount = function() {
            var inputData = {
                Params: [

                    {
                        Key: 2,
                        Value: 1
                    },
                    {
                        Key: 6,
                        Value: [2, 3, 4, 5]
                    },
                ],

            };

            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getoccupancyCountCallback
            };

            utl.Http.doAction(options);
        };
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
            if (res.ippharmacydue) {
                for (var idx in res.ippharmacydue)
                    $scope.FacilityInfo.receipt.push(res.ippharmacydue[idx]);
            }
            if (res.billrefund) {
                for (var idx in res.billrefund)
                    $scope.FacilityInfo.receipt.push(res.billrefund[idx]);
            }
            if (res.refund) {
                for (var idx in res.refund)
                    $scope.FacilityInfo.receipt.push(res.refund[idx]);
            }

            if ($scope.FacilityInfo.receipt)
                $scope.FacilityInfo.receipt.sort($scope.custom_sort);

            $scope.TotCashAmt = 0;
            $scope.TotCardAmt = 0;
            $scope.TotOtherAmt = 0;

            var totalcollectioncash = ($scope.FacilityInfo.receipt[0].Value.CashAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.CashAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.CashAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.CashAmount || 0);

            var totalrefundcash = ($scope.FacilityInfo.receipt[3].Value.CashAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.CashAmount || 0);

            $scope.TotCashAmt = totalcollectioncash - totalrefundcash;

            var totalcollectioncard = ($scope.FacilityInfo.receipt[0].Value.CardAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.CardAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.CardAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.CardAmount || 0);

            var totalrefundcard = ($scope.FacilityInfo.receipt[3].Value.CardAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.CardAmount || 0);

            $scope.TotCardAmt = totalcollectioncard - totalrefundcard;

            var totalcollectionother = ($scope.FacilityInfo.receipt[0].Value.OtherAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.OtherAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.OtherAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.OtherAmount || 0);

            var totalrefundother = ($scope.FacilityInfo.receipt[3].Value.OtherAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.OtherAmount || 0);

            $scope.TotOtherAmt = totalcollectionother - totalrefundother;

            var totalcollection = ($scope.FacilityInfo.receipt[0].Value.BillAmount || 0) +
                ($scope.FacilityInfo.receipt[1].Value.BillAmount || 0) + ($scope.FacilityInfo.receipt[2].Value.BillAmount || 0) +
                ($scope.FacilityInfo.receipt[4].Value.BillAmount || 0);

            var totalrefund = ($scope.FacilityInfo.receipt[3].Value.BillAmount || 0) +
                ($scope.FacilityInfo.receipt[5].Value.BillAmount || 0);

            $scope.TotAmt = totalcollection - totalrefund;
            if ($scope.FacilityInfo.encounter) {
                $scope.IPCounts = $scope.FacilityInfo.encounter;
                if ($scope.IPCounts.TotalAdmissionCount) {
                    $scope.Items.TotalAdmissionCount = $scope.IPCounts.TotalAdmissionCount;
                } else {
                    $scope.Items.TotalAdmissionCount = '0';
                }
                if ($scope.IPCounts.DischargeCount) {
                    $scope.Items.DischargeCount = $scope.IPCounts.DischargeCount;
                } else {
                    $scope.Items.DischargeCount = '0';
                }
                if ($scope.IPCounts.AdmissionCount) {
                    $scope.Items.AdmittedCount = $scope.IPCounts.AdmissionCount;
                } else {
                    $scope.Items.AdmittedCount = '0';
                }
                if ($scope.IPCounts.FitfordischargeCount) {
                    $scope.Items.FitforDischargeCount = $scope.IPCounts.FitfordischargeCount;
                } else {
                    $scope.Items.FitforDischargeCount = '0';
                }
                if ($scope.IPCounts.ClinicaldischargeCount) {
                    $scope.Items.ClinicalDischargeCount = $scope.IPCounts.ClinicaldischargeCount;
                } else {
                    $scope.Items.ClinicalDischargeCount = '0';
                }
                if ($scope.IPCounts.FinancedischargeCount) {
                    $scope.Items.FinancialDischargeCount = $scope.IPCounts.FinancedischargeCount;
                } else {
                    $scope.Items.FinancialDischargeCount = '0';
                }
            }
            $scope.GetCategoryCollection();


            //console.log($scope.FacilityInfo);

        }

        $scope.GetCategoryCollection = function () {
            $scope.FacilityInfo.category = [];
            $scope.FacilityInfo.totcategory = [];
            $scope.FacilityInfo.opcategory = [];
            $scope.FacilityInfo.totopcategory = [];
            $scope.FacilityInfo.ipcategory = [];
            $scope.FacilityInfo.totipcategory = [];
            if ($scope.FacilityInfo.categorycollection) {
                var opcollection = [];
                var ipcollection = [];

                if ($scope.FacilityInfo.categorycollection.length > 0)
                    opcollection = $scope.FacilityInfo.categorycollection[0].Value;


                if ($scope.FacilityInfo.categorycollection.length > 1)
                    ipcollection = $scope.FacilityInfo.categorycollection[1].Value;

                var opTotNetAmt = 0;
                for (var idx in opcollection) {
                    var coll = opcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    opTotNetAmt += NetAmt;
                    $scope.FacilityInfo.opcategory.push({ 'Key': key, 'Value': NetAmt });
                    $scope.FacilityInfo.category.push({ 'Key': key, 'Value': { 'OP': NetAmt, 'IP': 0.00 } });
                }
                $scope.FacilityInfo.totopcategory.push({
                    'Key': 'Total', 'Value': opTotNetAmt
                });
                var ipTotNetAmt = 0;
                for (var idx in ipcollection) {
                    var coll = ipcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    ipTotNetAmt += NetAmt;
                    $scope.FacilityInfo.ipcategory.push({
                        'Key': key, 'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.FacilityInfo.category.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.FacilityInfo.category.push({
                            'Key': key, 'Value': { 'OP': 0.00, 'IP': NetAmt }
                        });

                }
                $scope.FacilityInfo.totipcategory.push({
                    'Key': 'Total', 'Value': ipTotNetAmt
                });

                $scope.FacilityInfo.category.push({
                    'Key': 'Total', 'Value':
                        { 'OP': opTotNetAmt, 'IP': ipTotNetAmt }
                });

            }
        }
        $scope.GetFacilityDashboardOptions = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: {
                    Keys: [{ Key: 'encounter' },
                    { Key: 'patient' },
                    { Key: 'appointment' },
                    { Key: 'newborn' },
                    { Key: 'receipt' },
                    // { Key: 'ippharmacydue' },
                    { Key: 'refund' },
                    { Key: 'billrefund' },
                    { Key: 'categorycollection' }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getBillInfoDashBoardCallBack = function (scope, res, options, hasError) {
            $scope.Bills = res.Data;
        }

        $scope.getBillInfoDashBoard = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: $scope.currentcontext
            };

            var options = {
                action: 'billing/patientbills/GetBillInfoDashBoard',
                data: inputData,
                type: 'post',
                onComplete: $scope.getBillInfoDashBoardCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getWardInfoDashBoardCallBack = function (scope, res, options, hasError) {
            $scope.Wards = res.Data;
            $scope.wardtotal = { BedsCount: 0, OccupiedBeds: 0, AvailableBeds: 0, OtherBeds: 0 };
            $scope.Wards.forEach((v) => {
                $scope.wardtotal.BedsCount += parseInt(v.BedsCount);
                $scope.wardtotal.OccupiedBeds += parseInt(v.OccupiedBeds);
                $scope.wardtotal.AvailableBeds += parseInt(v.AvailableBeds);
                $scope.wardtotal.OtherBeds += parseInt(v.OtherBeds);
            });
        }

        $scope.getWardInfoDashBoard = function () {
            // $scope.currentcontext.FromDate=$filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00'),
            // $scope.currentcontext.ToDate=$filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59'),
            var inputData = {
                Data: { FacilityId: $scope.currentcontext.FacilityId }
            };

            var options = {
                action: 'generalmaster/wardmaster/GetWardInfoDashBoard',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWardInfoDashBoardCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getDischargeNoticedListCallBack = function (scope, res, options, hasError) {
            $scope.fitfordischarge = res.Data;
        }

        $scope.getDischargeNoticedList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 3, Value: 3 },
                    { Key: 17, Value: $scope.currentcontext.FromDate },
                    { Key: 18, Value: $scope.currentcontext.ToDate }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargeNoticedListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getDischargedListCallBack = function (scope, res, options, hasError) {
            $scope.DiscrgData = res.Data;
            $scope.LatDiscrgData=[];
            for (var idx in $scope.DiscrgData) {
                var Discrg = $scope.DiscrgData[idx];
                Discrg.patientname = '';
                if (Discrg.Patient.Title)
                    Discrg.patientname = Discrg.Patient.Title.Description + ' .';
                if (Discrg.Patient.FirstName)
                    Discrg.patientname += ' ' + Discrg.Patient.FirstName;
                if (Discrg.Patient.LastName)
                    Discrg.patientname += ' ' + Discrg.Patient.LastName;

                Discrg.doctorname = '';
                if (Discrg.Doctor.Title)
                    Discrg.doctorname = Discrg.Doctor.Title.Description + ' .';
                if (Discrg.Doctor.FirstName)
                    Discrg.doctorname += ' ' + Discrg.Doctor.FirstName;
                if (Discrg.Doctor.LastName)
                    Discrg.doctorname += ' ' + Discrg.Doctor.LastName;

                Discrg.warddetails = '';
                if (Discrg.WardMaster)
                    Discrg.warddetails = Discrg.WardMaster.WardName + ' - ';
                if (Discrg.WardRoomMaster)
                    Discrg.warddetails += Discrg.WardRoomMaster.RoomNo;
                if (Discrg.WardRoomBedMaster) + ' - '
                Discrg.warddetails += Discrg.WardRoomBedMaster.BedNo;

                $scope.LatDiscrgData.push(Discrg);
            }
        }

        $scope.getDischargedList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 3, Value: 6 },
                    { Key: 28, Value: $scope.currentcontext.FromDate },
                    { Key: 29, Value: $scope.currentcontext.ToDate }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargedListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getAdmittedListCallBack = function (scope, res, options, hasError) {
            $scope.LatAdmsnData = [];
            $scope.AdmittedData = res.Data;
            for (var idx in $scope.AdmittedData) {
                var admInfo = $scope.AdmittedData[idx];
                admInfo.patientname = '';
                if (admInfo.Patient.Title)
                    admInfo.patientname = admInfo.Patient.Title.Description + ' .';
                if (admInfo.Patient.FirstName)
                    admInfo.patientname += ' ' + admInfo.Patient.FirstName;
                if (admInfo.Patient.LastName)
                    admInfo.patientname += ' ' + admInfo.Patient.LastName;

                admInfo.doctorname = '';
                if (admInfo.Doctor.Title)
                    admInfo.doctorname = admInfo.Doctor.Title.Description + ' .';
                if (admInfo.Doctor.FirstName)
                    admInfo.doctorname += ' ' + admInfo.Doctor.FirstName;
                if (admInfo.Doctor.LastName)
                    admInfo.doctorname += ' ' + admInfo.Doctor.LastName;

                admInfo.warddetails = '';
                if (admInfo.WardMaster)
                    admInfo.warddetails = admInfo.WardMaster.WardName + ' - ';
                if (admInfo.WardRoomMaster)
                    admInfo.warddetails += admInfo.WardRoomMaster.RoomNo + ' - ';
                if (admInfo.WardRoomBedMaster)
                    admInfo.warddetails += admInfo.WardRoomBedMaster.BedNo;

                $scope.LatAdmsnData.push(admInfo);
            }
        }

        $scope.getAdmittedList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                    { Key: 17, Value: $scope.currentcontext.FromDate },
                    { Key: 18, Value: $scope.currentcontext.ToDate }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAdmittedListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {

        }

        $scope.prepareMailData = function () {
            var DataTable = '';
            if ($scope.FacilityInfo &&
                $scope.FacilityInfo.receipt &&
                $scope.FacilityInfo.receipt.length > 0) {
                DataTable += '<table>';
                DataTable += '<thead>';
                DataTable += '<td><span>Particulars</span></td>';
                DataTable += '<td><span>Amount</span></td>';
                DataTable += '<td><span>Cash</span></td>';
                DataTable += '<td><span>Card</span></td>';
                DataTable += '<td><span>Others</span></td>';
                DataTable += '</thead>';
                for (var idx in $scope.FacilityInfo.receipt) {
                    var item = $scope.FacilityInfo.receipt[idx];
                    DataTable += '<tr>';
                    DataTable += '<td ><span>' + item.Key + '</span></td>';
                    DataTable += '<td align= "right">' + item.Value.BillAmount || 0.00 + '</td>';
                    DataTable += '<td align= "right">' + item.Value.CashAmount || 0.00 + '</td>';
                    DataTable += '<td align= "right">' + item.Value.CardAmount || 0.00 + '</td>';
                    DataTable += '<td align= "right">' + item.Value.OtherAmount || 0.00 + '</td>';
                    DataTable += '</tr>';
                    DataTable += '</table>';
                }
            }
            return DataTable;
        }


        $scope.print = function () {
            var inputData = {
                Id: 0,
                Data: {
                    Keys: [{ Key: 'encounter' }, { Key: 'patient' },
                    { Key: 'appointment' }, { Key: 'newborn' }, { Key: 'receipt' },
                    { Key: 'ippharmacydue' }, { Key: 'refund' }, { Key: 'billrefund' },
                    { Key: 'categorycollection' }]
                },
                Attributes: $scope.currentcontext
            };
            var options = {
                action: 'SystemSettings/facilitydashboard/PrintFacilityDashboard',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };

        $scope.sendmail = function () {
            // var MailData = $scope.prepareMailData();
            // if(MailData.length > 0) {
            var inputData = {
                Data: {
                    MailData
                }
            };
            var options = {
                action: 'SystemSettings/facilitydashboard/SendFacilityDashboardMail',
                data: inputData,
                type: 'post',
                onComplete: $scope.sendmailCallBack
            };
            utl.Http.doAction(options);
            //}
        };

        $scope.getDocStatListCallBack = function (scope, res, options, hasError) {
            $scope.DoctorInfo = res;
            $scope.doctor = [];
            $scope.totdoctor = [];
            $scope.newvisitcount = [];
            $scope.followupcount = [];
            if ($scope.DoctorInfo) {
                var docnewVisit = [];
                var docfollowup = [];
                if ($scope.DoctorInfo.length > 0)
                    docnewVisit = $scope.DoctorInfo[0].Value;
                if ($scope.DoctorInfo.length > 1)
                    docfollowup = $scope.DoctorInfo[1].Value;
                for (var idx in docnewVisit) {
                    var coll = docnewVisit[idx];
                    var NewCount = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName.Title)
                            $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        NewCount += coll[idx].NewCount;
                    }
                    $scope.doctor.push({
                        'Key': key,
                        'NewCount': NewCount
                    });
                }
                for (var idx in docfollowup) {
                    var coll = docfollowup[idx];
                    var FollowUpCount = 0;
                    var key = '';
                    for (var idx in coll) {
                        $scope.docName = '';
                        if (coll[idx].DoctorName.Title)
                            $scope.docName = coll[idx].DoctorName.Title.Description;
                        if (coll[idx].DoctorName.FirstName)
                            $scope.docName += ' ' + coll[idx].DoctorName.FirstName;
                        if (coll[idx].DoctorName.LastName)
                            $scope.docName += ' ' + coll[idx].DoctorName.LastName;

                        key = $scope.docName;
                        FollowUpCount += coll[idx].FollowUpCount;
                    }

                    var valappended = 0;
                    $scope.doctor.forEach(function (item) {
                        if (key === item.Key) {
                            item.FollowUpCount = FollowUpCount;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.doctor.push({
                            'Key': key,
                            'FollowUpCount': FollowUpCount
                        });

                }
                $scope.TotNewCount = 0;
                $scope.TotFollowupCpunt = 0;
                var totnewCount = 0;
                var totfollowupCount = 0;
                for (var dx in $scope.doctor) {
                    var docCount = $scope.doctor[dx];
                    totnewCount = totnewCount + (docCount.NewCount || 0);
                    totfollowupCount = totfollowupCount + (docCount.FollowUpCount || 0);
                }
                $scope.TotNewCount = totnewCount;
                $scope.TotFollowupCpunt = totfollowupCount;

            }
        }

        $scope.getDocStatList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: {
                    FromDate: $scope.currentcontext.FromDate,
                    ToDate: $scope.currentcontext.ToDate,
                    FacilityId: utl.Session.getCurrentFacilityId(),

                },
            };

            var options = {
                action: 'Visit/Visit/GetDocStatsDashBoard',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDocStatListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getInsuranceAgingListCallBack = function (scope, res, options, hasError) {
            $scope.InsAgeData = [];
            var insData = {
                InsuranceType: '',
                InsuranceName: '',
                InsuranceId: 0,
                Lessthan30Days: 0,
                Lessthan60Days: 0,
                Lessthan90Days: 0,
                Above90Days: 0
            }
            for (var idx in res.Data) {

                var less30 = 0;
                var less60 = 0;
                var less90 = 0;
                var above90 = 0;
                var insagingData = res.Data[idx];
                if (insagingData.GuarantorTypeId > 1) {
                    if (insagingData.GuarantorId > 0) {
                        var date1 = new Date(insagingData.BillDateTime);
                        var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                        var date2 = new Date(To);
                        var difference_ms = date2.getTime() - date1.getTime();
                        difference_ms = difference_ms / 1000;
                        var seconds = Math.floor(difference_ms % 60);
                        difference_ms = difference_ms / 60;
                        var minutes = Math.floor(difference_ms % 60);
                        difference_ms = difference_ms / 60;
                        var hours = Math.floor(difference_ms % 24);
                        var days = Math.floor(difference_ms / 24);
                        var NoofDays = days + 1;
                        if (insagingData.GuarantorType) {
                            insData.InsuranceType = insagingData.GuarantorType.Description;
                        }
                        if (insagingData.GuarantorMaster) {
                            insData.InsuranceName = insagingData.GuarantorMaster.GuarantorName;
                        }
                        var InsuranceId = insagingData.GuarantorId;
                        if (NoofDays <= 30) {
                            less30 = insagingData.OutStandingAmount;
                        }
                        if (NoofDays > 30 && NoofDays <= 60) {
                            less60 = insagingData.OutStandingAmount;
                        }
                        if (NoofDays > 60 && NoofDays <= 90) {
                            less90 = insagingData.OutStandingAmount;
                        }
                        if (NoofDays > 90) {
                            above90 = insagingData.OutStandingAmount;
                        }
                        var valappended = 0;
                        if ($scope.InsAgeData.length > 0) {
                            $scope.InsAgeData.forEach(function (item) {
                                if (insagingData.GuarantorId == item.InsuranceId) {
                                    item.InsuranceType = insData.InsuranceType;
                                    item.InsuranceName = insData.InsuranceName;
                                    if (item.Lessthan30Days > 0) {
                                        item.Lessthan30Days += less30;
                                    } else {
                                        item.Lessthan30Days = less30;
                                    }
                                    if (item.Lessthan60Days > 0) {
                                        item.Lessthan60Days += less60;
                                    } else {
                                        item.Lessthan60Days = less60;
                                    }
                                    if (item.Lessthan90Days > 0) {
                                        item.Lessthan90Days += less90;
                                    } else {
                                        item.Lessthan90Days = less90;
                                    }
                                    if (item.Above90Days > 0) {
                                        item.Above90Days += above90;
                                    } else {
                                        item.Above90Days = above90;
                                    }
                                    valappended = 1;
                                }
                            });
                        }
                        if (valappended == 0)
                            $scope.InsAgeData.push({
                                'InsuranceType': insData.InsuranceType,
                                'InsuranceName': insData.InsuranceName,
                                'InsuranceId': InsuranceId,
                                'Lessthan30Days': less30,
                                'Lessthan60Days': less60,
                                'Lessthan90Days': less90,
                                'Above90Days': above90,
                            })
                    }
                }
            }
            var TotLessthan30Days = 0;
            var TotLessthan60Days = 0;
            var TotLessthan90Days = 0;
            var TotAbove90Days = 0;

            for (var idx in $scope.InsAgeData) {
                var OverallInsData = $scope.InsAgeData[idx];
                TotLessthan30Days = TotLessthan30Days + (OverallInsData.Lessthan30Days || 0);
                TotLessthan60Days = TotLessthan60Days + (OverallInsData.Lessthan60Days || 0);
                TotLessthan90Days = TotLessthan90Days + (OverallInsData.Lessthan90Days || 0);
                TotAbove90Days = TotAbove90Days + (OverallInsData.Above90Days || 0);
            }
            $scope.TotLessthan30Days = TotLessthan30Days;
            $scope.TotLessthan60Days = TotLessthan60Days;
            $scope.TotLessthan90Days = TotLessthan90Days;
            $scope.TotAbove90Days = TotAbove90Days;
        }

        $scope.getInsuranceAgingList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    // {
                    //     Key: 17,
                    //     Value: From
                    // },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.ToDate
                    },
                    {
                        Key: 8,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.GuarantorTypeId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 63,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.BillTypeId
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientbills/GetPatientBillswithoutdetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInsuranceAgingListCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.getInsuranceDisallowanceListCallback = function (scope, res, options, hasError) {
            $scope.Insurance = res;
            $scope.InsuranceDis = [];
            $scope.totinsurance = [];
            $scope.opamt = [];
            $scope.ipamt = [];
            if ($scope.Insurance) {
                var opamt = [];
                var ipamt = [];
                if ($scope.Insurance.length > 0)
                    var OPDis = $scope.Insurance[0].Value;
                if ($scope.Insurance.length > 1)
                    var IPDis = $scope.Insurance[1].Value;
                for (var idx in OPDis) {
                    var coll = OPDis[idx];
                    var opamt = 0;
                    var Key = '';
                    for (var idx in coll) {
                        $scope.GuarantorName = coll[idx].GuarantorName;

                        Key = $scope.GuarantorName;
                        opamt = coll[idx].OpAmount;
                    }
                    $scope.InsuranceDis.push({
                        'Key': Key,
                        'opamt': opamt
                    });
                }
                for (var idx in IPDis) {
                    var coll = IPDis[idx];
                    var ipamt = 0;
                    var Key = '';
                    for (var idx in coll) {
                        $scope.GuarantorName = coll[idx].GuarantorName;
                        Key = $scope.GuarantorName;
                        ipamt = coll[idx].IpAmount;
                    }
                    var valappended = 0;
                    $scope.InsuranceDis.forEach(function (item) {
                        if (Key == item.Key) {
                            item.ipamt = ipamt;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.InsuranceDis.push({
                            'Key': Key,
                            'ipamt': ipamt
                        });
                }

                if ($scope.InsuranceDis.length > 0) {
                    for (var idx in $scope.InsuranceDis) {
                        $scope.InsuranceDis[idx].Total = ($scope.InsuranceDis[idx].opamt || 0) + ($scope.InsuranceDis[idx].ipamt || 0);
                    }
                }


                $scope.TotOPAmt = 0;
                $scope.TotIPAmt = 0;
                $scope.TotTotal = 0;
                var totopamt = 0;
                var totipamt = 0;
                var tottotal = 0;
                for (var dx in $scope.InsuranceDis) {
                    var insdis = $scope.InsuranceDis[dx];
                    totopamt = totopamt + (insdis.opamt || 0);
                    totipamt = totipamt + (insdis.ipamt || 0);
                    tottotal = tottotal + (insdis.Total || 0);
                }
                $scope.TotOPAmt = totopamt;
                $scope.TotIPAmt = totipamt;
                $scope.TotTotal = tottotal;

            }



        };

        $scope.getInsuranceDisallowanceList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: {
                    FromDate: $scope.currentcontext.FromDate,
                    ToDate: $scope.currentcontext.ToDate,
                    FacilityId: utl.Session.getCurrentFacilityId(),

                },
            };


            var options = {
                action: 'billing/insurancepaymentdetails/GetInsuranceDisallowance',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInsuranceDisallowanceListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getDoctorShareListCallback = function (scope, res, options, hasError) {
            $scope.DrShareSummary = [];
            var grpData = _.groupBy(res.Data, 'DoctorId');

            for (var idx in grpData) {
                var item = grpData[idx];
                var shareData = {
                    OpdIncome: 0,
                    IpdIncome: 0,
                    DoctorName: '',
                    TotalIncome: 0,
                };
                for (var kdx in item) {
                    var drsummary = item[kdx];
                    $scope.docName = '';
                    if (item[kdx].User.Title)
                        $scope.docName = item[kdx].User.Title.Description;
                    if (item[kdx].User.FirstName)
                        $scope.docName += ' ' + item[kdx].User.FirstName;
                    if (item[kdx].User.LastName)
                        $scope.docName += ' ' + item[kdx].User.LastName;

                    shareData.DoctorName = $scope.docName;
                    if (drsummary.PatientBill.EncounterTypeId == 1) {
                        shareData.OpdIncome += drsummary.DoctorShareAmount;
                    }
                    if (drsummary.PatientBill.EncounterTypeId == 2) {
                        if (drsummary.Encounter.AdmissionStatusId == 5 || drsummary.Encounter.AdmissionStatusId == 6) {
                            shareData.IpdIncome += drsummary.DoctorShareAmount;
                        }
                    }
                    shareData.TotalIncome = (shareData.OpdIncome || 0) + (shareData.IpdIncome || 0);
                }
                $scope.DrShareSummary.push(shareData);
            }
            var TotDocOPAmt = 0;
            var TotDocIPAmt = 0;
            var TotTotalIncome = 0;
            $scope.TotdocOPAmt = 0;
            $scope.TotdocIPAmt = 0;
            $scope.TotdocIncome = 0;
            // var TotTotal = 0;

            for (var idx in $scope.DrShareSummary) {
                var OverallDocData = $scope.DrShareSummary[idx];
                TotDocOPAmt = TotDocOPAmt + (OverallDocData.OpdIncome || 0);
                TotDocIPAmt = TotDocIPAmt + (OverallDocData.IpdIncome || 0);
                TotTotalIncome = TotTotalIncome + (OverallDocData.TotalIncome || 0);
            }
            $scope.TotdocOPAmt = TotDocOPAmt;
            $scope.TotdocIPAmt = TotDocIPAmt;
            $scope.TotdocIncome = TotTotalIncome;
        };

        $scope.getDoctorShareList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 2,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 14,
                    Value: 3
                },
                {
                    Key: 21,
                    Value: [1, 2, 5]
                },
                ]
            };


            var options = {
                action: 'billing/PatientDoctorShareDetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDoctorShareListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getReferralDoctorListCallback = function (scope, res, options, hasError) {
            $scope.ReferralDoctor = [];
            var grpData = _.groupBy(res.Data, 'ReferralId');

            for (var idx in grpData) {
                var item = grpData[idx];
                var RefData = {
                    OpCount: 0,
                    IpCount: 0,
                    RefName: '',
                };
                for (var kdx in item) {
                    var refsummary = item[kdx];
                    RefData.Referral = refsummary.Referral.ReferralName;
                    if (refsummary.EncounterTypeId == 1) {
                        RefData.OpCount++;
                    }
                    if (refsummary.EncounterTypeId == 2) {
                        RefData.IpCount++
                    }
                    RefData.TotalCount = (RefData.OpCount || 0) + (RefData.IpCount || 0);

                }
                $scope.ReferralDoctor.push(RefData);
            }
            var TotOPcount = 0;
            var TotIPcount = 0;
            var TotCount = 0;
            $scope.TotOP = 0;
            $scope.TotIP = 0;
            $scope.TotTotCount = 0;

            for (var idx in $scope.ReferralDoctor) {
                var OverallRefData = $scope.ReferralDoctor[idx];
                TotOPcount = TotOPcount + (OverallRefData.OpCount || 0);
                TotIPcount = TotIPcount + (OverallRefData.IpCount || 0);
                TotCount = TotCount + (OverallRefData.TotalCount || 0);
            }
            $scope.TotOP = TotOPcount;
            $scope.TotIP = TotIPcount;
            $scope.TotTotCount = TotCount;
        };

        $scope.getReferralDoctorList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 17,
                    Value: $scope.currentcontext.FromDate
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.ToDate
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.FacilityId
                },
                // {
                //     Key: 15,
                //     Value: 2
                // },

                {
                    Key: 77,
                    Value: 9
                }
                ]
            };


            var options = {
                action: "Visit/Visit/GetEncounters",
                data: inputData,
                type: 'post',
                onComplete: $scope.getReferralDoctorListCallback
            };

            utl.Http.doAction(options);
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.LoadDashboard = function () {
            $scope.GetFacilityDashboardOptions();
            //$scope.getBillInfoDashBoard();
            $scope.getWardInfoDashBoard();
            $scope.getDischargeNoticedList();
            $scope.getDischargedList();
            $scope.getAdmittedList();
            $scope.getDocStatList();
            $scope.getInsuranceAgingList();
            $scope.getInsuranceDisallowanceList();
            $scope.getDoctorShareList();
            $scope.getReferralDoctorList();
        $scope.getoccupancyCount();

        }

        $scope.LoadDashboard();
    }
    dashboardFormController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();