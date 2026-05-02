(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryprocedurereportController', surgeryprocedurereportController);

    function surgeryprocedurereportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };

        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.ProcedureSummary = res;
            $scope.NetProcedureSummary = [];
            if ($scope.ProcedureSummary) {
                for (var idx in $scope.ProcedureSummary) {
                    var procedureSummary = $scope.ProcedureSummary[idx];
                    var Key = '';
                    var procedurename = '';
                    var procedurecount = 0;
                    for (var px in procedureSummary) {
                        var psummary = procedureSummary[px];
                        if (psummary.ProcedureName) {
                            procedurename = psummary.ProcedureName;
                        }
                        if (psummary.ProcedureCount) {
                            procedurecount = psummary.ProcedureCount;
                        }
                    }
                    Key = procedurename;
                    procedurecount = procedurecount;
                    $scope.NetProcedureSummary.push({
                        'Key': Key,
                        'ProcedureCount': procedurecount,
                    });
                }
            }
            $scope.Totprocedurecount = 0;
            var totprocedurecount = 0;
            for (var ix in $scope.NetProcedureSummary) {
                let netsummary = $scope.NetProcedureSummary[ix];
                if (netsummary.ProcedureCount) {
                    totprocedurecount += netsummary.ProcedureCount;
                }
            }
            $scope.TotProcedureCount = totprocedurecount;
        };

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
                    IsCathlab: false,
                    ProcedureId: $scope.currentfilter.ProcedureId || 0,
                    DepartmentId: $scope.currentfilter.DepartmentId || 0,
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgerysummarybyProcedure',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.SelectedProcedure = function (selectedItem) {
            $scope.ProcedureName = selectedItem.ProcedureName;
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'surgeryreport') {
                $state.go('app.surgeryreports');
            } if ($scope.Context == 'surgerybillingreport') {
                $state.go('app.billingreportstab.surgerybillingreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
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
                    IsCathlab: false,
                    ProcedureId: $scope.currentfilter.ProcedureId || 0,
                    ProcedureName: $scope.ProcedureName
                }
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/PrintSurgerysummarybyProcedure',
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
                { "Key": "Procedure" },
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

    surgeryprocedurereportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();