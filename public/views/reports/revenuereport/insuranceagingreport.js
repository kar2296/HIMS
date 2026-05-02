(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('insuranceagingreportController', insuranceagingreportController);

    function insuranceagingreportController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            BillDate: utl.Formatter.getCurrentDate(),
            GuarantorTypeId: -1,
            GuarantorId: -1,
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.InsAgeData = [];
            var insData = {
                InsuranceType: '',
                InsuranceName: '',
                InsuranceId: 0,
                Lessthan30Days: 0,
                Lessthan60Days: 0,
                Lessthan90Days: 0,
                Above90Days: 0
            }
            for (var idx in res.Data) {

                var less30 = 0;
                var less60 = 0;
                var less90 = 0;
                var above90 = 0;
                var insagingData = res.Data[idx];
                if ($scope.currentfilter.GuarantorId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorName = insagingData.GuarantorName;
                    }
                } else {
                    $scope.GuarantorName = '';
                }
                if ($scope.currentfilter.GuarantorTypeId > 0) {
                    if (res.Data.length > 0) {
                        $scope.GuarantorType = insagingData.GuarantorType.Description;
                    }
                } else {
                    $scope.GuarantorType = '';
                }
                if (insagingData.GuarantorTypeId > 1) {
                    if (insagingData.GuarantorId > 0) {
                        var date1 = new Date(insagingData.BillDateTime);
                        var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                        var date2 = new Date(To);
                        var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                        var date2 = new Date(To);
                        var date1WithoutTime = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
                        var date2WithoutTime = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
                        var differenceMs = date2WithoutTime - date1WithoutTime;
                        var differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
                        var NoofDays = differenceDays;
                        // var difference_ms = date2.getTime() - date1.getTime();
                        // difference_ms = difference_ms / 1000;
                        // var seconds = Math.floor(difference_ms % 60);
                        // difference_ms = difference_ms / 60;
                        // var minutes = Math.floor(difference_ms % 60);
                        // difference_ms = difference_ms / 60;
                        // var hours = Math.floor(difference_ms % 24);
                        // var days = Math.floor(difference_ms / 24);
                        // var NoofDays = days + 1;
                        if (insagingData.GuarantorType) {
                            insData.InsuranceType = insagingData.GuarantorType.Description;
                        }
                        if (insagingData.GuarantorMaster) {
                            insData.InsuranceName = insagingData.GuarantorMaster.GuarantorName;
                        }
                        var InsuranceId = insagingData.GuarantorId;
                        if (NoofDays <= 30) {
                            less30 = insagingData.OutStandingAmount;
                        }
                        if (NoofDays > 30 && NoofDays <= 60) {
                            less60 = insagingData.OutStandingAmount;
                        }
                        if (NoofDays > 60 && NoofDays <= 90) {
                            less90 = insagingData.OutStandingAmount;
                        }
                        if (NoofDays > 90) {
                            above90 = insagingData.OutStandingAmount;
                        }
                        var valappended = 0;
                        if ($scope.InsAgeData.length > 0) {
                            $scope.InsAgeData.forEach(function (item) {
                                if (insagingData.GuarantorId == item.InsuranceId) {
                                    item.InsuranceType = insData.InsuranceType;
                                    item.InsuranceName = insData.InsuranceName;
                                    if (item.Lessthan30Days > 0) {
                                        item.Lessthan30Days += less30;
                                    } else {
                                        item.Lessthan30Days = less30;
                                    }
                                    if (item.Lessthan60Days > 0) {
                                        item.Lessthan60Days += less60;
                                    } else {
                                        item.Lessthan60Days = less60;
                                    }
                                    if (item.Lessthan90Days > 0) {
                                        item.Lessthan90Days += less90;
                                    } else {
                                        item.Lessthan90Days = less90;
                                    }
                                    if (item.Above90Days > 0) {
                                        item.Above90Days += above90;
                                    } else {
                                        item.Above90Days = above90;
                                    }
                                    valappended = 1;
                                }
                            });
                        }
                        if (valappended == 0)
                            $scope.InsAgeData.push({
                                'InsuranceType': insData.InsuranceType,
                                'InsuranceName': insData.InsuranceName,
                                'InsuranceId': InsuranceId,
                                'Lessthan30Days': less30,
                                'Lessthan60Days': less60,
                                'Lessthan90Days': less90,
                                'Above90Days': above90,
                            })
                    }
                }
            }
            var TotLessthan30Days = 0;
            var TotLessthan60Days = 0;
            var TotLessthan90Days = 0;
            var TotAbove90Days = 0;

            for (var idx in $scope.InsAgeData) {
                var OverallInsData = $scope.InsAgeData[idx];
                TotLessthan30Days = TotLessthan30Days + (OverallInsData.Lessthan30Days || 0);
                TotLessthan60Days = TotLessthan60Days + (OverallInsData.Lessthan60Days || 0);
                TotLessthan90Days = TotLessthan90Days + (OverallInsData.Lessthan90Days || 0);
                TotAbove90Days = TotAbove90Days + (OverallInsData.Above90Days || 0);
            }
            $scope.TotLessthan30Days = TotLessthan30Days;
            $scope.TotLessthan60Days = TotLessthan60Days;
            $scope.TotLessthan90Days = TotLessthan90Days;
            $scope.TotAbove90Days = TotAbove90Days;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.BillDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 17,
                    //     Value: From
                    // },
                    {
                        Key: 18,
                        Value: To
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.GuarantorTypeId
                    },
                    {
                        Key: 61,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 63,
                        Value: '0'
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.BillTypeId
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 20,
                        Value: [1, 2, 4, 5, 6]
                    },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientbills/GetPatientBillswithoutdetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.viewduebills = function (info, dayscount) {
            utl.Modal.open('app.agingoutstandingreportview', {
                params: {
                    gid: info.InsuranceId,
                    facId: utl.Session.getCurrentFacilityId(),
                    todate: $scope.currentfilter.BillDate,
                    dayscount: dayscount
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    GuarantorName: $scope.GuarantorName,
                    GuarantorType: $scope.GuarantorType,
                },
                Params: [{
                    Key: 18,
                    Value: To
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 63,
                    Value: '0'
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.GuarantorTypeId
                },
                {
                    Key: 61,
                    Value: $scope.currentfilter.GuarantorId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.BillTypeId
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 20,
                    Value: [1, 2, 4, 5, 6]
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintInsuranceAgingReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        $scope.backtoReport = function () {
            if ($scope.Context == 'revenuesummary') {
                $state.go('app.financereporttab.revenuesummary');
            }
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
            }

        };

        // $scope.getList();
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "BillType"
                },
                {
                    "Key": "GuarantorType"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
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
    insuranceagingreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();