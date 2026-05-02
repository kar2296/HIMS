(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPAdmissionSummaryByInsuranceController', IPAdmissionSummaryByInsuranceController);

    function IPAdmissionSummaryByInsuranceController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $scope.GuarantorSummary = res;
            $scope.NetGurantorSummary = [];
            if ($scope.GuarantorSummary) {
                var self = []; 
                if ($scope.GuarantorSummary.length > 0) {
                    self = $scope.GuarantorSummary[0].Value;
                } 
                for (var idx in self) {
                    var selfGuar = self[idx];
                    var Key = ''; 
                    var GuarantorType = '';
                    var GuarantorCount = 0;
                    // var DueCollectAmt = 0;
                    for (var ix in selfGuar) {
                        if (selfGuar[ix].GuarantorName) {
                             
                                $scope.GuarantorName = selfGuar[ix].GuarantorName;
                             
                        }
                        if (selfGuar[ix].GuarantorType) {
                            GuarantorType = selfGuar[ix].GuarantorType;
                        }
                        if (selfGuar[ix].GuarantorCount) {
                            GuarantorCount = selfGuar[ix].GuarantorCount;
                        }
                        Key = $scope.GuarantorName;
                        GuarantorType = GuarantorType;
                        GuarantorCount = GuarantorCount;
                        // DueCollectAmt = DueCollectAmt;
                    }
                    $scope.NetGurantorSummary.push({
                        'Key': Key,
                        'GuarantorType': GuarantorType,
                        'GuarantorCount': GuarantorCount,
                    })

                } 

            }
            $scope.TotGuarantorCount = 0;  
            var totGuarantorCount = 0; 
            for (var ix in $scope.NetGurantorSummary) {
                let netsummary = $scope.NetGurantorSummary[ix];
                if (netsummary.GuarantorCount) {
                    totGuarantorCount += netsummary.GuarantorCount;
                } 
            }
            $scope.TotGuarantorCount = totGuarantorCount;  
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
                },
            };

            var options = {
                action: 'Visit/Visit/GetIPAdmissionSummaryInsurance',
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
                }
            };
            var options = {
                action: 'Visit/Visit/PrintIPAdmissionSummarybyInsurance',
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
    IPAdmissionSummaryByInsuranceController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();