(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InsuranceCreditSummaryController', InsuranceCreditSummaryController);

    function InsuranceCreditSummaryController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = [" Payer Name", "OP Paid", "IP Paid", "Total Outstanding"]
            let csvContent = JsonFields.join(",") + "\n";
            $scope.InsuranceCollection = data;
            $scope.InsdataCollection = [];
            $scope.NetInsCollection = [];
            if ($scope.InsuranceCollection) {
                var inscreditcollections = [];
                if ($scope.InsuranceCollection.length > 0) {
                    inscreditcollections = $scope.InsuranceCollection[0].Value;
                }
                for (var idx in inscreditcollections) {
                    var insname = inscreditcollections[idx];
                    var Key = '';
                    var OPCredit = 0;
                    var IPCredit = 0;
                    var DueAmt = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in insname) {
                        $scope.InsuranceName = '';
                        if (insname[ix].GuarantorName) {
                            $scope.InsuranceName = insname[ix].GuarantorName;
                        }
                        if (insname[ix].OPCredit) {
                            OPCredit = insname[ix].OPCredit;
                        }
                        if (insname[ix].IPCredit) {
                            IPCredit = insname[ix].IPCredit;
                        }
                        if (insname[ix].TotalOutstanding) {
                            DueAmt = insname[ix].TotalOutstanding;
                        }
                        Key = $scope.InsuranceName;
                        OPCredit = OPCredit;
                        IPCredit = IPCredit;
                        DueAmt = DueAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.InsdataCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCredit': OPCredit,
                            'IPCredit': IPCredit,
                            'DueAmt': DueAmt
                        }
                    })
                }
            }
            $scope.Totopcredit = 0;
            $scope.Totipcredit = 0;
            $scope.Totdueamt = 0;
            for (var jdx in $scope.InsdataCollection) {
                var insdata = $scope.InsdataCollection[jdx];
                $scope.Totopcredit += insdata.Value.OPCredit;
                $scope.Totipcredit += insdata.Value.IPCredit;
                $scope.Totdueamt += insdata.Value.DueAmt;
            }

            $scope.InsdataCollection.forEach(function (rowArray) {
                var insurancename = '';
                var opcredit = '';
                var ipcredit = '';
                var totoutstanding = '';


                if (rowArray.Key) {
                    insurancename = rowArray.Key;
                }
                if (rowArray.Value.OPCredit) {
                    opcredit = rowArray.Value.OPCredit;
                }
                if (rowArray.Value.IPCredit) {
                    ipcredit = rowArray.Value.IPCredit;
                }
                if (rowArray.Value.DueAmt) {
                    totoutstanding = rowArray.Value.DueAmt;
                }
                csvContent += insurancename + ',' + opcredit + ',' + ipcredit + ',' + totoutstanding + "\n";
            });
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'InsuranceCreditSummary.csv';
            hiddenElement.click();

        }

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    GuarantorId: $scope.currentfilter.GuarantorId || 0,
                },
            };

            var options = {
                action: 'Billing/patientbills/GetInsuranceCreditSummary',
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };
        $scope.GetBillingCollectionOptionsCallBack = function (scope, res, options, hasError) {
            $scope.InsuranceCollection = res;
            $scope.InsCollection = [];
            $scope.NetInsCollection = [];
            if ($scope.InsuranceCollection) {
                var inscreditcollections = [];
                if ($scope.InsuranceCollection.length > 0) {
                    inscreditcollections = $scope.InsuranceCollection[0].Value;
                }
                for (var idx in inscreditcollections) {
                    var insname = inscreditcollections[idx];
                    var Key = '';
                    var OPCredit = 0;
                    var IPCredit = 0;
                    var DueAmt = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in insname) {
                        $scope.InsuranceName = '';
                        if (insname[ix].GuarantorName) {
                            $scope.InsuranceName = insname[ix].GuarantorName;
                        }
                        if (insname[ix].OPCredit) {
                            OPCredit = insname[ix].OPCredit;
                        }
                        if (insname[ix].IPCredit) {
                            IPCredit = insname[ix].IPCredit;
                        }
                        if (insname[ix].TotalOutstanding) {
                            DueAmt = insname[ix].TotalOutstanding;
                        }
                        Key = $scope.InsuranceName;
                        OPCredit = OPCredit;
                        IPCredit = IPCredit;
                        DueAmt = DueAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.InsCollection.push({
                        'Key': Key,
                        'Value': {
                            'OPCredit': OPCredit,
                            'IPCredit': IPCredit,
                            'DueAmt': DueAmt
                        }
                    })
                }
            }
            $scope.Totopcredit = 0;
            $scope.Totipcredit = 0;
            $scope.Totdueamt = 0;
            for (var jdx in $scope.InsCollection) {
                var insdata = $scope.InsCollection[jdx];
                $scope.Totopcredit += insdata.Value.OPCredit;
                $scope.Totipcredit += insdata.Value.IPCredit;
                $scope.Totdueamt += insdata.Value.DueAmt;
            }

        }

        $scope.GetPharmacyOptions = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }

            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    GuarantorId: $scope.currentfilter.GuarantorId || 0,
                },
            };

            var options = {
                action: 'Billing/patientbills/GetInsuranceCreditSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetBillingCollectionOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    GuarantorId: $scope.currentfilter.GuarantorId || 0,
                }
            };
            var options = {
                action: 'billing/patientbills/PrintInsuranceCreditSummary',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
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
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.currentfilter.UserId = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
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
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.opinvoicebillingreport')
        };


        // $scope.LoadDashboard = function () {
        //     $scope.GetPharmacyOptions();
        // }

        // $scope.LoadDashboard();
    }
    InsuranceCreditSummaryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();