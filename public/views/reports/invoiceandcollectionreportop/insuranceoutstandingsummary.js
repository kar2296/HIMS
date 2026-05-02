(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InsuranceOutstandingSummaryController', InsuranceOutstandingSummaryController);

    function InsuranceOutstandingSummaryController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            GuarantorTypeId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.getListCallBack = function (scope, res, options, hasError) {
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
                    var InsuranceType = '';
                    var OPOutstanding = 0;
                    var IPOutstanding = 0;
                    var DueAmt = 0;
                    var GuarantorId=0;
                    // var DueCollectAmt = 0;
                    for (var ix in insname) {
                        $scope.InsuranceName = '';
                        if (insname[ix].GuarantorName) {
                            $scope.InsuranceName = insname[ix].GuarantorName;
                        }
                        if (insname[ix].GuarantorType) {
                            InsuranceType = insname[ix].GuarantorType;
                        }
                        if (insname[ix].OPOutstanding) {
                            OPOutstanding = insname[ix].OPOutstanding;
                        }
                        if (insname[ix].IPOutstanding) {
                            IPOutstanding = insname[ix].IPOutstanding;
                        }
                        if (insname[ix].TotalOutstanding) {
                            DueAmt = insname[ix].TotalOutstanding;
                        }
                        if (insname[ix].GuarantorId) {
                            GuarantorId = insname[ix].GuarantorId;
                        }
                        Key = $scope.InsuranceName;
                        InsuranceType = InsuranceType;
                        OPOutstanding = OPOutstanding;
                        IPOutstanding = IPOutstanding;
                        GuarantorId = GuarantorId;
                        DueAmt = DueAmt;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.InsCollection.push({
                        'Key': Key,
                        'InsuranceType': InsuranceType,
                        'OPOutstanding': OPOutstanding,
                        'IPOutstanding': IPOutstanding,
                        'GuarantorId': GuarantorId,
                        'DueAmt': DueAmt
                    })
                }
            }
            $scope.Totopoutstanding = 0;
            $scope.Totipoutstanding = 0;
            $scope.Totdueamt = 0;
            for (var jdx in $scope.InsCollection) {
                var insdata = $scope.InsCollection[jdx];
                $scope.Totopoutstanding += insdata.OPOutstanding;
                $scope.Totipoutstanding += insdata.IPOutstanding;
                $scope.Totdueamt += insdata.DueAmt;
            }

        }

        $scope.getList = function () {
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
                    GuarantorTypeId: $scope.currentfilter.GuarantorTypeId || 0,
                },
            };

            var options = {
                action: 'Billing/patientbills/GetInsuranceOutstandingSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallBack
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
                    GuarantorTypeId: $scope.currentfilter.GuarantorTypeId || 0,
                }
            };
            var options = {
                action: 'billing/patientbills/PrintInsuranceOutstandingSummary',
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
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.opinvoicebillingreport')
        };
        $scope.viewopbills = function (info) {
            utl.Modal.open('app.outstandingreportview', {
                params: {
                    gid: info.GuarantorId,
                    facId: utl.Session.getCurrentFacilityId(),
                    fromdate:$scope.currentfilter.FromDate,
                    todate:$scope.currentfilter.ToDate,
                    // encTypeId:1,
                    billtypeId:[1,5],
                    from:'summary'
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.viewipbills = function (info) {
            utl.Modal.open('app.outstandingreportview', {
                params: {
                    gid: info.GuarantorId,
                    facId: utl.Session.getCurrentFacilityId(),
                    fromdate:$scope.currentfilter.FromDate,
                    todate:$scope.currentfilter.ToDate,
                    // encTypeId:2,
                    billtypeId:2,
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "GuarantorType"
                },

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
    InsuranceOutstandingSummaryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();