(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipstatisticsreportController', ipstatisticsreportController);

    function ipstatisticsreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $scope.NetIPStatistics = [];
            if ($scope.IPStatistics) {
                var enccount = [];
                var occupancycount = [];
                var capacitycount = [];
                if ($scope.IPStatistics.length > 0) {
                    enccount = $scope.IPStatistics[0].Value;
                }
                if ($scope.IPStatistics.length > 1) {
                    occupancycount = $scope.IPStatistics[1].Value;
                }
                if ($scope.IPStatistics.length > 2) {
                    capacitycount = $scope.IPStatistics[2].Value;
                }
                for (var idx in enccount) {
                    var encCount = enccount[idx];
                    var Key = '';
                    var AdmissionCount = 0;
                    var DischargeCount = 0;
                    for (var ix in encCount) {
                        if (encCount[ix].WardName) {
                            Key = encCount[ix].WardName;
                        }
                        if (encCount[ix].AdmissionCount) {
                            AdmissionCount = encCount[ix].AdmissionCount;
                        }
                        if (encCount[ix].DischargeCount) {
                            DischargeCount = encCount[ix].DischargeCount;
                        }
                        Key = Key;
                        AdmissionCount = AdmissionCount;
                        DischargeCount = DischargeCount;
                    }
                    var valappended = 0;
                    $scope.NetIPStatistics.forEach(function (item) {
                        if (Key == item.Key) {
                            item.AdmissionCount = AdmissionCount;
                            item.DischargeCount = DischargeCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetIPStatistics.push({
                            'Key': Key,
                            'AdmissionCount': AdmissionCount,
                            'DischargeCount': DischargeCount,
                        })

                }
                for (var idx in occupancycount) {
                    var occuCount = occupancycount[idx];
                    var Key = '';
                    var OccupancyCount = 0;
                    for (var ix in occuCount) {
                        if (occuCount[ix].WardName) {
                            Key = occuCount[ix].WardName;
                        }
                        if (occuCount[ix].OccupancyCount) {
                            OccupancyCount = occuCount[ix].OccupancyCount;
                        }
                        Key = Key;
                        OccupancyCount = OccupancyCount;
                    }
                    var valappended = 0;
                    $scope.NetIPStatistics.forEach(function (item) {
                        if (Key == item.Key) {
                            item.OccupancyCount = OccupancyCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetIPStatistics.push({
                            'Key': Key,
                            'OccupancyCount': OccupancyCount,
                        });
                }

                for (var idx in capacitycount) {
                    var cpctycount = capacitycount[idx];
                    var Key = '';
                    var CapacityCount = 0;
                    for (var ix in cpctycount) {
                        if (cpctycount[ix].WardName) {
                            Key = cpctycount[ix].WardName;
                        }
                        if (cpctycount[ix].CapacityCount) {
                            CapacityCount = cpctycount[ix].CapacityCount;
                        }
                        Key = Key;
                        CapacityCount = CapacityCount;
                    }
                    var valappended = 0;
                    $scope.NetIPStatistics.forEach(function (item) {
                        if (Key == item.Key) {
                            item.CapacityCount = CapacityCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetIPStatistics.push({
                            'Key': Key,
                            'CapacityCount': CapacityCount,
                        });

                }

            }
            $scope.TotAdmissionCount = 0;
            $scope.TotDischargeCount = 0;
            $scope.TotOccupancyCount = 0;
            $scope.TotCapacityCount = 0;
            var totAdmissionCount = 0;
            var totDischargeCount = 0;
            var totOccupancyCount = 0;
            var totCapacityCount = 0;
            for (var ix in $scope.NetIPStatistics) {
                let netsummary = $scope.NetIPStatistics[ix];
                if (netsummary.AdmissionCount) {
                    totAdmissionCount += netsummary.AdmissionCount;
                }
                if (netsummary.DischargeCount) {
                    totDischargeCount += netsummary.DischargeCount;
                }
                if (netsummary.OccupancyCount) {
                    totOccupancyCount += netsummary.OccupancyCount;
                }
                if (netsummary.CapacityCount) {
                    totCapacityCount += netsummary.CapacityCount;
                }
            }
            $scope.TotAdmissionCount = totAdmissionCount;
            $scope.TotDischargeCount = totDischargeCount;
            $scope.TotOccupancyCount = totOccupancyCount;
            $scope.TotCapacityCount = totCapacityCount;
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
                action: 'Visit/Visit/GetIPStatistics',
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
                action: 'Visit/Visit/PrintIPStatisticsReport',
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
    ipstatisticsreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();