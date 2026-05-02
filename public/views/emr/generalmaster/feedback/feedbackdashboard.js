(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('feedbackDashboardController', feedbackDashboardController);

    function feedbackDashboardController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.rows = [];
        $scope.row = { cols: [] };
        $scope.headerRow = { cols: [] };

        $scope.Items = {

        };
        $scope.todayfeedback = {};
        $scope.monthfeedback = {};
        $scope.overallfeedback = {};
        $scope.Items.TodayFeedbackCount = '0';
        $scope.Items.OverallFeedbackCount = '0';
        $scope.Items.IPFeedbackCount = '0';
        $scope.Items.OPFeedbackCount = '0';
        $scope.currentcontext = {
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.currentfilter = {
            FeedbackOn: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.getListCallBack = function (scope, res, options, hasError) {
            $scope.Items.TodayFeedbackCount = res.PatientFeedbackbo.TodayFeedbackCount;
            if (!$scope.Items.TodayFeedbackCount)
                $scope.Items.TodayFeedbackCount = '0';
            $scope.Items.OverallFeedbackCount = res.PatientFeedbackbo.OverallFeedbackCount;
            if (!$scope.Items.OverallFeedbackCount)
                $scope.Items.OverallFeedbackCount = '0';
            $scope.Items.IPFeedbackCount = res.PatientFeedbackbo.IPFeedbackCount;
            if (!$scope.Items.IPFeedbackCount)
                $scope.Items.IPFeedbackCount = '0';
            $scope.Items.OPFeedbackCount = res.PatientFeedbackbo.OPFeedbackCount;
            if (!$scope.Items.OPFeedbackCount)
                $scope.Items.OPFeedbackCount = '0';
        };
        $scope.getList = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'PatientFeedbackbo' }]
                },
                Attributes: $scope.currentcontext
            };
            var options = {
                action: 'emr/PatientFeedbackDashboard/GetPatientFeedbackDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.getOverallfeedbackCallback = function (scope, res, options, hasError) {
            $scope.overallfeedback = [];
            if (res.Data.length > 0) {
                for (var pdx in res.Data) {
                    var item = res.Data[pdx];
                    item.Title = item.Patient.Title.Description;
                    item.FirstName = item.Patient.FirstName;
                    item.LastName = item.Patient.LastName;
                    item.VeryGoodCount = 0;
                    item.GoodCount = 0;
                    item.FairCount = 0;
                    item.PoorCount = 0;
                    item.VeryPoorCount = 0;
                    if (item.PatientFeedbackDetails.length > 0) {
                        for (var ddx in item.PatientFeedbackDetails) {
                            var details = item.PatientFeedbackDetails[ddx];
                            if (details.RatingId == 5) {
                                item.VeryGoodCount++;
                            }
                            if (details.RatingId == 4) {
                                item.GoodCount++;
                            }
                            if (details.RatingId == 3) {
                                item.FairCount++;
                            }
                            if (details.RatingId == 2) {
                                item.PoorCount++;
                            }
                            if (details.RatingId == 1) {
                                item.VeryPoorCount++;
                            }
                        }
                    }
                    $scope.overallfeedback.push(item);
                }
            }
        };

        $scope.getOverallfeedback = function () {
            var From = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    // { Key: 3, Value: $scope.currentfilter.FeedbackTypeId },
                    // { Key: 2, Value: $scope.currentfilter.PatientId },
                    {
                        Key: 5,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 6,
                        Value: utl.Formatter.getFilterDate(To)
                    }
                ],
                // PageContext: {
                //     PageSize: vm.gridConfig.pagerObj.pageSize,
                //     PageNumber: vm.gridConfig.pagerObj.currentPage
                // }
            };

            var options = {
                action: 'emr/PatientFeedback/GetPatientFeedbacks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOverallfeedbackCallback
            };

            utl.Http.doAction(options);
        };
        //Today Feedback
        $scope.gettodayfeedbackCallback = function (scope, res, options, hasError) {
            $scope.NetTodayFeedback = [];
            $scope.todayfeedback = res;
            if ($scope.todayfeedback) {
                var opfeedback = [];
                var ipfeedback = [];
                if ($scope.todayfeedback.length > 0) {
                    opfeedback = $scope.todayfeedback[0].Value;
                }
                if ($scope.todayfeedback.length > 1) {
                    ipfeedback = $scope.todayfeedback[1].Value;
                }
                if (opfeedback) {
                    for (var idx in opfeedback) {
                        var opfeedbackcount = opfeedback[idx];
                        var Key = '';
                        var Rating = '';
                        var OPCount = 0;
                        for (var ix in opfeedbackcount) {
                            if (opfeedbackcount[ix].Rating) {
                                Rating = opfeedbackcount[ix].Rating;
                            }
                            if (opfeedbackcount[ix].OPCount) {
                                OPCount = opfeedbackcount[ix].OPCount;
                            }
                            Key = Rating;
                            OPCount = OPCount;
                        }
                        $scope.NetTodayFeedback.push({
                            'Key': Key,
                            'OPCount': OPCount,
                        })
                    }
                }
                if (ipfeedback) {
                    for (var idx in ipfeedback) {
                        var ipfeedbackcount = ipfeedback[idx];
                        var Key = '';
                        var Rating = '';
                        var IPCount = 0;
                        for (var ipx in ipfeedbackcount) {
                            if (ipfeedbackcount[ipx].Rating) {
                                Rating = ipfeedbackcount[ipx].Rating;
                            }
                            if (ipfeedbackcount[ipx].IPCount) {
                                IPCount = ipfeedbackcount[ipx].IPCount;
                            }
                            Key = Rating;
                            IPCount = IPCount;
                        }
                        var valappended = 0;
                        $scope.NetTodayFeedback.forEach(function (item) {
                            if (Key == item.Key) {
                                item.IPCount = IPCount;
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetTodayFeedback.push({
                                'Key': Key,
                                'IPCount': IPCount,
                            })
                    }
                }
            }
        };

        $scope.gettodayfeedback = function () {
            var From = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                },
            };
            var options = {
                action: 'emr/PatientFeedbackDetails/GetPatientFeedbackSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettodayfeedbackCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getmonthfeedbackCallback = function (scope, res, options, hasError) {
            $scope.NetMonthFeedback = [];
            $scope.monthfeedback = res;
            if ($scope.monthfeedback) {
                var opfeedback = [];
                var ipfeedback = [];
                if ($scope.monthfeedback.length > 0) {
                    opfeedback = $scope.monthfeedback[0].Value;
                }
                if ($scope.monthfeedback.length > 1) {
                    ipfeedback = $scope.monthfeedback[1].Value;
                }
                if (opfeedback) {
                    for (var idx in opfeedback) {
                        var opfeedbackcount = opfeedback[idx];
                        var Key = '';
                        var Rating = '';
                        var OPCount = 0;
                        for (var ix in opfeedbackcount) {
                            if (opfeedbackcount[ix].Rating) {
                                Rating = opfeedbackcount[ix].Rating;
                            }
                            if (opfeedbackcount[ix].OPCount) {
                                OPCount = opfeedbackcount[ix].OPCount;
                            }
                            Key = Rating;
                            OPCount = OPCount;
                        }
                        $scope.NetMonthFeedback.push({
                            'Key': Key,
                            'OPCount': OPCount,
                        })
                    }
                }
                if (ipfeedback) {
                    for (var idx in ipfeedback) {
                        var ipfeedbackcount = ipfeedback[idx];
                        var Key = '';
                        var Rating = '';
                        var IPCount = 0;
                        for (var ipx in ipfeedbackcount) {
                            if (ipfeedbackcount[ipx].Rating) {
                                Rating = ipfeedbackcount[ipx].Rating;
                            }
                            if (ipfeedbackcount[ipx].IPCount) {
                                IPCount = ipfeedbackcount[ipx].IPCount;
                            }
                            Key = Rating;
                            IPCount = IPCount;
                        }
                        var valappended = 0;
                        $scope.NetMonthFeedback.forEach(function (item) {
                            if (Key == item.Key) {
                                item.IPCount = IPCount;
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetMonthFeedback.push({
                                'Key': Key,
                                'IPCount': IPCount,
                            })
                    }
                }
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getmonthfeedback = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                },
            };
            var options = {
                action: 'emr/PatientFeedbackDetails/GetPatientFeedbackSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.getmonthfeedbackCallback
            };

            utl.Http.doAction(options);
        };
        $scope.More = function () {
            $state.go('app.assets', { id: 0 });
            // $scope.openModal(0);
        }
        $scope.patientfeedback = function () {
            $state.go('app.patient-feedback');
        }
        $scope.ipfeedback = function () {
            $state.go('app.ippatient-feedback');
        }
        $scope.overallfeedback = function () {
            $state.go('app.feedback-analyzer');
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.gettodayfeedback();
            $scope.getOverallfeedback();
             $scope.getmonthfeedback();

        }

        $scope.initLookup = function () {
            var inputData = [

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

    feedbackDashboardController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();