(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPAdmissionSummaryByDoctorController', IPAdmissionSummaryByDoctorController);

    function IPAdmissionSummaryByDoctorController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.GetIPDoctorSummaryOptionsCallBack = function (scope, res, options, hasError) {
            $scope.DoctorSummary = res;
            $scope.NetDoctorSummary = [];
            if ($scope.DoctorSummary) {
                var self = [];
                var Insurance = [];
                if ($scope.DoctorSummary.length > 0) {
                    self = $scope.DoctorSummary[0].Value;
                }
                if ($scope.DoctorSummary.length > 1) {
                    Insurance = $scope.DoctorSummary[1].Value;
                }
                for (var idx in self) {
                    var selfdoctor = self[idx];
                    var Key = '';
                    var DepartmentName = '';
                    var SelfCount = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in selfdoctor) {
                        $scope.DoctorName = '';
                        if (selfdoctor[ix].DoctorName) {
                            if (selfdoctor[ix].DoctorName.Title)
                                $scope.DoctorName = selfdoctor[ix].DoctorName.Title.Description;
                            if (selfdoctor[ix].DoctorName.FirstName)
                                $scope.DoctorName += ' ' + selfdoctor[ix].DoctorName.FirstName;
                            if (selfdoctor[ix].DoctorName.LastName)
                                $scope.DoctorName += ' ' + selfdoctor[ix].DoctorName.LastName;
                        }
                        if (selfdoctor[ix].DepartmentName) {
                            DepartmentName = selfdoctor[ix].DepartmentName;
                        }
                        if (selfdoctor[ix].SelfCount) {
                            SelfCount = selfdoctor[ix].SelfCount;
                        }
                        Key = $scope.DoctorName;
                        DepartmentName = DepartmentName;
                        SelfCount = SelfCount;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.NetDoctorSummary.push({
                        'Key': Key,
                        'DepartmentName': DepartmentName,
                        'SelfCount': SelfCount,
                    })

                }
                for (var idx in Insurance) {
                    var Insurancedoctor = Insurance[idx];
                    var Key = '';
                    var DepartmentName = '';
                    var InsuranceCount = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in Insurancedoctor) {
                        $scope.DoctorName = '';
                        if (Insurancedoctor[ix].DoctorName) {
                            if (Insurancedoctor[ix].DoctorName.Title)
                                $scope.DoctorName = Insurancedoctor[ix].DoctorName.Title.Description;
                            if (Insurancedoctor[ix].DoctorName.FirstName)
                                $scope.DoctorName += ' ' + Insurancedoctor[ix].DoctorName.FirstName;
                            if (Insurancedoctor[ix].DoctorName.LastName)
                                $scope.DoctorName += ' ' + Insurancedoctor[ix].DoctorName.LastName;
                        }
                        if (Insurancedoctor[ix].DepartmentName) {
                            DepartmentName = Insurancedoctor[ix].DepartmentName;
                        }
                        if (Insurancedoctor[ix].InsuranceCount) {
                            InsuranceCount = Insurancedoctor[ix].InsuranceCount;
                        }
                        Key = $scope.DoctorName;
                        DepartmentName = DepartmentName;
                        InsuranceCount = InsuranceCount;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    var valappended = 0;
                    $scope.NetDoctorSummary.forEach(function (item) {
                        if (Key == item.Key) {
                            item.InsuranceCount = InsuranceCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetDoctorSummary.push({
                            'Key': Key,
                            'DepartmentName': DepartmentName,
                            'InsuranceCount': InsuranceCount,
                        });

                }

            }
            $scope.TotSelfCount = 0;
            $scope.TotInsuranceCount = 0;
            $scope.TotAllCount = 0;
            var totSelfCount = 0;
            var totInsuranceCount = 0;
            for (var ix in $scope.NetDoctorSummary) {
                let netsummary = $scope.NetDoctorSummary[ix];
                if (netsummary.SelfCount) {
                    totSelfCount += netsummary.SelfCount;
                }
                if (netsummary.InsuranceCount) {
                    totInsuranceCount += netsummary.InsuranceCount;
                }
            }
            $scope.TotSelfCount = totSelfCount;
            $scope.TotInsuranceCount = totInsuranceCount;
            $scope.TotAllCount = (totSelfCount) + (totInsuranceCount);
        };

        $scope.GetListOptions = function () {  
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

            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DoctorId: $scope.currentfilter.DoctorId || 0,
                },
            };

            var options = {
                action: 'Visit/Visit/GetIPAdmissionSummaryDoctor',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetIPDoctorSummaryOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DoctorId: $scope.currentfilter.DoctorId || 0,
                    DoctorName: $scope.DoctorName
                }
            };
            var options = {
                action: 'Visit/Visit/PrintIPAdmissionSummarybyDoctor',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.doctorcontrolconfig = {
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
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                // $scope.item.DoctorId = selectedItem.Id;
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName].join(' ');
            }
            $scope.DoctorName = result;
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.doctorcontrolconfig.searchbyid == true) {
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
            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }

        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.DoctorId = 0;
                // $scope.GetListOptions();
            }
        };
        // $scope.backtoReport = function () {
        //     $state.go('app.ipopreportstab.inpatientreport')
        // };
        $scope.backtoReport = function () {
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            }

        };
        // $scope.GetListOptions();
    }
    IPAdmissionSummaryByDoctorController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();