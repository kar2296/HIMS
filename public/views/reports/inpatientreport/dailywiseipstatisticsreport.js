(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dailywiseipstatisticsreportController', dailywiseipstatisticsreportController);

    function dailywiseipstatisticsreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.GetListOptionsCallBack = function (scope, res, options, hasError) {
            $scope.IPStatistics = res;
            $scope.DailyIPStats = [];
            if ($scope.IPStatistics) {
                var admCount = [];
                var discount = [];
                var deathCount = [];

                admCount = $scope.IPStatistics[1];
                discount = $scope.IPStatistics[2];
                deathCount = $scope.IPStatistics[3];

                for (var ldx in admCount) {
                    var AdmCountStats = admCount[ldx];
                    var Key = '';
                    var AdmissionCount = 0;
                    // var DischargeCount = 0;
                    // var DeathCount = 0;
                    var year = new Date(AdmCountStats.AdmDate).getFullYear();
                    var month = new Date(AdmCountStats.AdmDate).getMonth();
                    var date = new Date(AdmCountStats.AdmDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    // var AdmissionDate = Key;
                    if (AdmCountStats.AdmissionCount) {
                        AdmissionCount = AdmCountStats.AdmissionCount;
                    }
                    // if (CountStats.DischargeCount) {
                    //     DischargeCount = CountStats.DischargeCount;
                    // }
                    // if (CountStats.DeathCount) {
                    //     DeathCount = CountStats.DeathCount;
                    // }
                    Key = Key;
                    AdmissionCount = AdmissionCount;
                    // DischargeCount = DischargeCount;
                    // DeathCount = DeathCount;

                    var valappended = 0;
                    $scope.DailyIPStats.forEach(function (item) {
                        if (Key == item.Key) {
                            item.AdmissionCount += AdmissionCount;
                            // item.DischargeCount = DischargeCount;
                            // item.DeathCount = DeathCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.DailyIPStats.push({
                            'Key': Key,
                            'AdmissionCount': AdmissionCount,
                            // 'DischargeCount': DischargeCount,
                            // 'DeathCount': DeathCount,
                        })

                }

                for (var ldx in discount) {
                    var DisCountStats = discount[ldx];
                    var Key = '';
                    var DischargeCount = 0;
                    var year = new Date(DisCountStats.DischargeDate).getFullYear();
                    var month = new Date(DisCountStats.DischargeDate).getMonth();
                    var date = new Date(DisCountStats.DischargeDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    if (DisCountStats.DischargeCount) {
                        DischargeCount = DisCountStats.DischargeCount;
                    }
                    // if (CountStats.DischargeCount) {
                    //     DischargeCount = CountStats.DischargeCount;
                    // }
                    // if (CountStats.DeathCount) {
                    //     DeathCount = CountStats.DeathCount;
                    // }
                    Key = Key;
                    DischargeCount = DischargeCount;
                    // DischargeCount = DischargeCount;
                    // DeathCount = DeathCount;

                    var valappended = 0;
                    $scope.DailyIPStats.forEach(function (item) {
                        if (Key == item.Key) {
                            item.DischargeCount += DischargeCount;
                            // item.DischargeCount = DischargeCount;
                            // item.DeathCount = DeathCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.DailyIPStats.push({
                            'Key': Key,
                            'DischargeCount': DischargeCount,
                            // 'DischargeCount': DischargeCount,
                            // 'DeathCount': DeathCount,
                        })

                }
                for (var ldx in deathCount) {
                    var DeathCountStats = deathCount[ldx];
                    var Key = '';
                    var DeathCount = 0;
                    var year = new Date(DeathCountStats.DeathDate).getFullYear();
                    var month = new Date(DeathCountStats.DeathDate).getMonth();
                    var date = new Date(DeathCountStats.DeathDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    if (DeathCountStats.DeathCount) {
                        DeathCount = DeathCountStats.DeathCount;
                    }
                    Key = Key;
                    DeathCount = DeathCount;
                    // DischargeCount = DischargeCount;
                    // DeathCount = DeathCount;

                    var valappended = 0;
                    $scope.DailyIPStats.forEach(function (item) {
                        if (Key == item.Key) {
                            item.DeathCount += DeathCount;
                            // item.DischargeCount = DischargeCount;
                            // item.DeathCount = DeathCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.DailyIPStats.push({
                            'Key': Key,
                            'DeathCount': DeathCount,
                        })

                }

            }
            $scope.TotAdmissionCount = 0;
            $scope.TotDischargeCount = 0;
            $scope.TotDeathCount = 0;
            var totAdmissionCount = 0;
            var totDischargeCount = 0;
            var totDeathCount = 0;
            for (var ix in $scope.DailyIPStats) {
                let netsummary = $scope.DailyIPStats[ix];
                if (netsummary.AdmissionCount) {
                    totAdmissionCount += netsummary.AdmissionCount;
                }
                if (netsummary.DischargeCount) {
                    totDischargeCount += netsummary.DischargeCount;
                }
                if (netsummary.DeathCount) {
                    totDeathCount += netsummary.DeathCount;
                }
            }
            $scope.TotAdmissionCount = totAdmissionCount;
            $scope.TotDischargeCount = totDischargeCount;
            $scope.TotDeathCount = totDeathCount;
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
                action: 'Visit/Visit/IPStatisticsWithDate',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetListOptionsCallBack
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
                }
            };
            var options = {
                action: 'Visit/Visit/PrintIPDailyWiseStatisticsReport',
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
        $scope.backtoReport = function () {
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            }
        };

        // $scope.GetListOptions();
    }
    dailywiseipstatisticsreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();