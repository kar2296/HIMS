(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cathlabsummarybysurgeonController', cathlabsummarybysurgeonController);

    function cathlabsummarybysurgeonController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            ChiefSurgeonId: -1
        };

        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.SurgeonSummary = res;
            $scope.NetSurgeonSummary = [];
            if ($scope.SurgeonSummary) {
                var selfsurgeon = [];
                var insurancesurgeon = [];
                if ($scope.SurgeonSummary.length > 0) {
                    selfsurgeon = $scope.SurgeonSummary[0].Value;
                }
                if ($scope.SurgeonSummary.length > 1) {
                    insurancesurgeon = $scope.SurgeonSummary[1].Value;
                }

                for (var idx in selfsurgeon) {
                    var SurgeonSummary = selfsurgeon[idx];
                    var Key = '';
                    var SurgeonName = '';
                    var SelfCount = 0;
                    for (var px in SurgeonSummary) {
                        var psummary = SurgeonSummary[px];
                        if (psummary.SurgeonName) {
                            SurgeonName = psummary.SurgeonName;
                        }
                        if (psummary.SelfCount) {
                            SelfCount = psummary.SelfCount;
                        }
                    }
                    Key = SurgeonName;
                    SelfCount = SelfCount;
                    $scope.NetSurgeonSummary.push({
                        'Key': Key,
                        'SelfCount': SelfCount,
                    });
                }

                for (var idx in insurancesurgeon) {
                    var SurgeonSummary = insurancesurgeon[idx];
                    var Key = '';
                    var SurgeonName = '';
                    var InsuranceCount = 0;
                    for (var px in SurgeonSummary) {
                        var psummary = SurgeonSummary[px];
                        if (psummary.SurgeonName) {
                            SurgeonName = psummary.SurgeonName;
                        }
                        if (psummary.InsuranceCount) {
                            InsuranceCount = psummary.InsuranceCount;
                        }
                    }
                    Key = SurgeonName;
                    InsuranceCount = InsuranceCount;
                    var valappended = 0;
                    $scope.NetSurgeonSummary.forEach(function (item) {
                        if (Key == item.Key) {
                            item.InsuranceCount = InsuranceCount;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0) {
                        $scope.NetSurgeonSummary.push({
                            'Key': Key,
                            'InsuranceCount': InsuranceCount,
                        });
                    }
                }

            }
            $scope.TotSelfCount = 0;
            $scope.TotInsuranceCount = 0;
            var totSelfCount = 0;
            var totInsuranceCount = 0;
            for (var ix in $scope.NetSurgeonSummary) {
                let netsummary = $scope.NetSurgeonSummary[ix];
                if (netsummary.SelfCount) {
                    totSelfCount += netsummary.SelfCount;
                }
                if (netsummary.InsuranceCount) {
                    totInsuranceCount += netsummary.InsuranceCount;
                }
            }
            $scope.TotSelfCount = totSelfCount;
            $scope.TotInsuranceCount = totInsuranceCount;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    IsCathlab: true,
                    ChiefSurgeonId: $scope.currentfilter.ChiefSurgeonId || -1,
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgerysummarybySurgeon',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.SelectedSurgeon = function (selectedItem) {
            var surgeonname = '';
            if (selectedItem) {
                if (selectedItem.Title) {
                    surgeonname = selectedItem.Title.Description;
                }
                if (selectedItem.FirstName) {
                    surgeonname += ' ' + selectedItem.FirstName;
                }
                if (selectedItem.LastName) {
                    surgeonname += ' ' + selectedItem.LastName;
                }
            }
            $scope.SurgeonName = surgeonname;

        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'cathlabreport') {
                $state.go('app.cathlabreports');
            }
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    IsCathlab: true,
                    ChiefSurgeonId: $scope.currentfilter.ChiefSurgeonId || -1,
                    SurgeonName: $scope.SurgeonName
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/PrintSurgerysummarybySurgeon',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
            ];

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

    cathlabsummarybysurgeonController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();