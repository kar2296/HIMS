(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipstatisticsbywardController', ipstatisticsbywardController);

    function ipstatisticsbywardController($scope, $filter, $stateParams, $state, $translate, utl) {
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
                var transfercount = [];
                if ($scope.IPStatistics.length > 0) {
                    enccount = $scope.IPStatistics[0].Value;
                }
                if ($scope.IPStatistics.length > 1) {
                    transfercount = $scope.IPStatistics[1].Value;
                }
                for (var idx in enccount) {
                    var encCount = enccount[idx];
                    var Key = '';
                    var AdmissionCount = 0;
                    var DischargeCount = 0;
                    var DeathCount = 0;
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
                        if (encCount[ix].DeathCount) {
                            DeathCount = encCount[ix].DeathCount;
                        }
                        Key = Key;
                        AdmissionCount = AdmissionCount;
                        DischargeCount = DischargeCount;
                        DeathCount = DeathCount;
                    }
                    var valappended = 0;
                    $scope.NetIPStatistics.forEach(function (item) {
                        if (Key == item.Key) {
                            item.AdmissionCount = AdmissionCount;
                            item.DischargeCount = DischargeCount;
                            item.DeathCount = DeathCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetIPStatistics.push({
                            'Key': Key,
                            'AdmissionCount': AdmissionCount,
                            'DischargeCount': DischargeCount,
                            'DeathCount': DeathCount,
                        })

                }
                for (var idx in transfercount) {
                    var transCount = transfercount[idx];
                    var Key = '';
                    var TransferInCount = 0;
                    var TransferOutCount = 0;
                    for (var ix in transCount) {
                        if (transCount[ix].WardName) {
                            Key = transCount[ix].WardName;
                        }
                        if (transCount[ix].TransferInCount) {
                            TransferInCount = transCount[ix].TransferInCount;
                        }
                        if (transCount[ix].TransferOutCount) {
                            TransferOutCount = transCount[ix].TransferOutCount;
                        }
                        Key = Key;
                        TransferInCount = TransferInCount;
                        TransferOutCount = TransferOutCount;
                    }
                    var valappended = 0;
                    $scope.NetIPStatistics.forEach(function (item) {
                        if (Key == item.Key) {
                            item.TransferInCount = TransferInCount;
                            item.TransferOutCount = TransferOutCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetIPStatistics.push({
                            'Key': Key,
                            'TransferInCount': TransferInCount,
                            'TransferOutCount': TransferOutCount,
                        });
                }

            }
            $scope.TotAdmissionCount = 0;
            $scope.TotDischargeCount = 0;
            $scope.TotDeathCount = 0;
            $scope.TotTransferInCount = 0;
            $scope.TotTransferOutCount = 0;
            var totAdmissionCount = 0;
            var totDischargeCount = 0;
            var totDeathCount = 0;
            var totTransferInCount = 0;
            var totTransferOutCount = 0;
            for (var ix in $scope.NetIPStatistics) {
                let netsummary = $scope.NetIPStatistics[ix];
                if (netsummary.AdmissionCount) {
                    totAdmissionCount += netsummary.AdmissionCount;
                }
                if (netsummary.DischargeCount) {
                    totDischargeCount += netsummary.DischargeCount;
                }
                if (netsummary.DeathCount) {
                    totDeathCount += netsummary.DeathCount;
                }
                if (netsummary.TransferInCount) {
                    totTransferInCount += netsummary.TransferInCount;
                }
                if (netsummary.TransferOutCount) {
                    totTransferOutCount += netsummary.TransferOutCount;
                }
            }
            $scope.TotAdmissionCount = totAdmissionCount;
            $scope.TotDischargeCount = totDischargeCount;
            $scope.TotDeathCount = totDeathCount;
            $scope.TotTransferInCount = totTransferInCount;
            $scope.TotTransferOutCount = totTransferOutCount;
        };

        $scope.GetListOptions = function () {

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
                action: 'Visit/Visit/GetIPStatisticsByWard',
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
                action: 'Visit/Visit/PrintIPStatisticsByWard',
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
    ipstatisticsbywardController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();