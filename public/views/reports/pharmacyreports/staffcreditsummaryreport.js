(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StaffCreditSummaryReportController', StaffCreditSummaryReportController);

    function StaffCreditSummaryReportController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.GetBillingCollectionOptionsCallBack = function (scope, res, options, hasError) {
            $scope.StaffCollection = res;
            $scope.StaffSummary = [];
            $scope.NetStaffSummary = [];
            if ($scope.StaffCollection) {
                var staffcreditcollections = [];
                if ($scope.StaffCollection.length > 0) {
                    staffcreditcollections = $scope.StaffCollection[0].Value;
                }
                for (var idx in staffcreditcollections) {
                    var StaffCol = staffcreditcollections[idx];
                    var Key = '';
                    var BillAmount = 0;
                    var PaidAmount = 0;
                    var DueAmt = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in StaffCol) {
                        $scope.StaffName = '';
                        if (StaffCol[ix].StaffName) {
                            if (StaffCol[ix].StaffName.Title)
                                $scope.StaffName = StaffCol[ix].StaffName.Title.Description;
                            if (StaffCol[ix].StaffName.FirstName)
                                $scope.StaffName += ' ' + StaffCol[ix].StaffName.FirstName;
                            if (StaffCol[ix].StaffName.LastName)
                                $scope.StaffName += ' ' + StaffCol[ix].StaffName.LastName;
                        }
                        if (StaffCol[ix].BillAmount) {
                            BillAmount = StaffCol[ix].BillAmount;
                        }
                        if (StaffCol[ix].PaidAmount) {
                            PaidAmount = StaffCol[ix].PaidAmount;
                        }
                        if (StaffCol[ix].TotalOutstanding) {
                            DueAmt = StaffCol[ix].TotalOutstanding;
                        }
                        Key = $scope.StaffName;
                        BillAmount = BillAmount;
                        PaidAmount = PaidAmount;
                        DueAmt = DueAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.StaffSummary.push({
                        'Key': Key,
                        'Value': {
                            'BillAmount': BillAmount,
                            'PaidAmount': PaidAmount,
                            'DueAmt': DueAmt
                        }
                    })
                }
            }
            $scope.TotBillAmount = 0;
            $scope.TotPaidAmount = 0;
            $scope.Totdueamt = 0;
            for (var jdx in $scope.StaffSummary) {
                var staffdata = $scope.StaffSummary[jdx];
                $scope.TotBillAmount += staffdata.Value.BillAmount;
                $scope.TotPaidAmount += staffdata.Value.PaidAmount;
                $scope.Totdueamt += staffdata.Value.DueAmt;
            }

        }

        $scope.GetPharmacyOptions = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }
            
            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StaffId: $scope.currentfilter.StaffId || 0,
                },
            };

            var options = {
                action: 'Billing/patientbills/GetStaffCreditSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetBillingCollectionOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StaffId: $scope.currentfilter.StaffId || 0,
                }
            };
            var options = {
                action: 'billing/patientbills/PrintStaffCreditSummary',
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
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };


        // $scope.LoadDashboard = function () {
        //     $scope.GetPharmacyOptions();
        // }

        // $scope.LoadDashboard();
    }
    StaffCreditSummaryReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();