(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cathlabsummarybyprocedureController', cathlabsummarybyprocedureController);

    function cathlabsummarybyprocedureController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    IsCathlab: true,
                    ProcedureId: $scope.currentfilter.ProcedureId || 0,
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
            var inputData = [{
                "Key": "Procedure"
            }, ];

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

    cathlabsummarybyprocedureController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();