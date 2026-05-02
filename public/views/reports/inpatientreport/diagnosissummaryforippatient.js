(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DiagnosisSummaryforIPPatientController', DiagnosisSummaryforIPPatientController);

    function DiagnosisSummaryforIPPatientController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.GetListCallBack = function (scope, res, options, hasError) {
            $scope.DiagnosisSummary = res;

            $scope.NetDiagnosisSummary = [];
            if ($scope.DiagnosisSummary) {
                for (var idx in $scope.DiagnosisSummary) {
                    var diagSummary = $scope.DiagnosisSummary[idx];
                    var Key = '';
                    var DiagnosisName = '';
                    var diagCount = 0;
                    var DiagnosisCount = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in diagSummary) {
                        if (diagSummary[ix].DiagnosisName) {
                            DiagnosisName = diagSummary[ix].DiagnosisName;
                        }
                        if (diagSummary[ix].DiagnosisCount) {
                            diagCount = diagSummary[ix].DiagnosisCount;
                        }
                        Key = DiagnosisName;
                        DiagnosisCount = diagCount;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.NetDiagnosisSummary.push({
                        'Key': Key,
                        'DiagnosisCount': DiagnosisCount,
                    })

                }

            }
            $scope.TotDiagnosisCount = 0; 
            var totDiagnosisCount = 0; 
            for (var ix in $scope.NetDiagnosisSummary) {
                let netsummary = $scope.NetDiagnosisSummary[ix];
                if (netsummary.DiagnosisCount) {
                    totDiagnosisCount += netsummary.DiagnosisCount;
                } 
            }
            $scope.TotDiagnosisCount = totDiagnosisCount; 
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
                action: 'Visit/Visit/GetDiagnosissummaryforIp',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetListCallBack
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
                action: 'Visit/Visit/PrintDiagnosissummaryforIp',
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
                $scope.GetListOptions();
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
    DiagnosisSummaryforIPPatientController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();