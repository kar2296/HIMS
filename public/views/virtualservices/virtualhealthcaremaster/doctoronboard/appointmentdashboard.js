(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AppointmentDashboardController', AppointmentDashboardController);

    function AppointmentDashboardController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
        };
        $scope.currentfilter = {
            CompletedDate: utl.Formatter.getCurrentDate(),
            //FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        }
        $scope.Items = {};
        $scope.todayscheduled = {};
        $scope.todaycheckin = {};
        $scope.todaycanceled = {};
        $scope.todayonshown = {};
        $scope.Items.TodayScheduledCount = '0';
        $scope.Items.TodayCheckInCount = '0';
        $scope.Items.TodayCancelledCount = '0';
        $scope.Items.TodayNoShownCount = '0';

        $scope.currentcontext = {};
        // $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext = {
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            FacilityId: utl.Session.getCurrentFacilityId(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.getScheduledCallback = function (scope, res, options, hasError) {
            $scope.todayscheduled = res.Data || [];
        };

        $scope.getScheduled = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
                    },
                    {
                        Key: 7,
                        Value: 2
                    },
                    {
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                ],
            };
            var options = {
                action: 'appointment/Appointment/GetDashboardAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getScheduledCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getcheckinCallback = function (scope, res, options, hasError) {
            $scope.todaycheckin = res.Data || [];
        };

        $scope.getcheckin = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
                    },
                    {
                        Key: 7,
                        Value: 6
                    },
                    {
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                ],
            };
            var options = {
                action: 'appointment/Appointment/GetDashboardAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getcheckinCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getcheckoutCallback = function (scope, res, options, hasError) {
            $scope.todaycheckout = res.Data || [];
        };

        $scope.getcheckout = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
                    },
                    {
                        Key: 7,
                        Value: 11
                    },
                    {
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                ],
            };
            var options = {
                action: 'appointment/Appointment/GetDashboardAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getcheckoutCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getcancelledCallback = function (scope, res, options, hasError) {
            $scope.todaycanceled = res.Data || [];
        };

        $scope.getcancelled = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
                    },
                    {
                        Key: 7,
                        Value: 5
                    },
                    {
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                ],
            };
            var options = {
                action: 'appointment/Appointment/GetDashboardAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getcancelledCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getnoshownCallback = function (scope, res, options, hasError) {
            $scope.todayonshown = res.Data || [];
        };

        $scope.getnoshown = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
                    },
                    {
                        Key: 7,
                        Value: 12
                    },
                    {
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'appointment/Appointment/GetDashboardAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getnoshownCallback
            };

            utl.Http.doAction(options);
        };

        $scope.todayappsummaryCallback = function (scope, result, options, hasError) {
            $scope.todayappsummary = [];
            $scope.todaysummarycount = {};

            /** Today Appointment Summary */
            $scope.groups = _.groupBy(result.Data, 'DoctorId');
            //console.log($scope.groups);
            //console.log(typeof($scope.groups));

            for (var idx in $scope.groups) {
                console.log($scope.groups[idx]);
                var res = $scope.groups[idx];
                var v = {};
                v.DoctorName = '';
                if(res[0].User) {
                    if(res[0].User.Title)
                    {
                        v.DoctorName = res[0].User.Title.Description + ' ';
                    }
                    if(res[0].User.FirstName)
                    {
                        v.DoctorName += res[0].User.FirstName;
                    }
                    if(res[0].User.LastName)
                    {
                        v.DoctorName += ' ' + res[0].User.LastName;
                    }
                }
                v.Total = res.length;
                v.Scheduled = res.filter(e => e.AppointmentStatusId === 2).length || 0;
                v.Checkin = res.filter(e => e.AppointmentStatusId === 6).length || 0;
                v.Checkout = res.filter(e => e.AppointmentStatusId === 11).length || 0;
                v.Cancelled = res.filter(e => e.AppointmentStatusId === 5).length || 0;
                v.Noshown = res.filter(e => e.AppointmentStatusId === 12).length || 0;
                v.Total = v.Scheduled + v.Checkin + v.Cancelled + v.Noshown + v.Checkout;
                $scope.todayappsummary.push(v);
            }

            $scope.todaysummarycount.Scheduled = result.Data.filter(e => e.AppointmentStatusId === 2).length || 0;
            $scope.todaysummarycount.Checkin = result.Data.filter(e => e.AppointmentStatusId === 6).length || 0;
            $scope.todaysummarycount.Checkout = result.Data.filter(e => e.AppointmentStatusId === 11).length || 0;
            $scope.todaysummarycount.Cancelled = result.Data.filter(e => e.AppointmentStatusId === 5).length || 0;
            $scope.todaysummarycount.Noshown = result.Data.filter(e => e.AppointmentStatusId === 12).length || 0;
            $scope.todaysummarycount.Total = ( $scope.todaysummarycount.Scheduled + $scope.todaysummarycount.Checkin +  $scope.todaysummarycount.Checkout + $scope.todaysummarycount.Cancelled + $scope.todaysummarycount.Noshown) || 0;


        };

        $scope.todayappsummary1 = function () {


            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
                    },
                    // {
                    //     Key: 7,
                    //     Value: 12
                    // },
                    {
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'appointment/Appointment/GetDashboardAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.todayappsummaryCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.TodayScheduledCount = res.appointment.TodayScheduledCount;
            $scope.Items.TodayCheckInCount = res.appointment.TodayCheckInCount;
            $scope.Items.TodayCancelledCount = res.appointment.TodayCancelledCount;
            $scope.Items.TodayNoShownCount = res.appointment.TodayNoShownCount;
            $scope.Items.appoinmentCount = res.appointment.appoinmentCount;
            $scope.Items.TodayCheckOutCount = res.appointment.TodayCheckOutCount;
            if (!$scope.Items.TodayScheduledCount)
                $scope.Items.TodayScheduledCount = '0';
            if (!$scope.Items.TodayCheckInCount)
                $scope.Items.TodayCheckInCount = '0';
            if (!$scope.Items.TodayCancelledCount)
                $scope.Items.TodayCancelledCount = '0';
            if (!$scope.Items.TodayNoShownCount)
                $scope.Items.TodayNoShownCount = '0';
            if (!$scope.Items.appoinmentCount)
                $scope.Items.appoinmentCount = '0';
            if (!$scope.Items.TodayCheckOutCount)
                $scope.Items.TodayCheckOutCount = '0';
                $scope.getScheduled();
                $scope.getcheckin();
                $scope.getcheckout();
                $scope.getcancelled();
                $scope.getnoshown();
                $scope.todayappsummary1();
        };
        $scope.getCount = function () {
            // $scope.currentcontext.FromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            // $scope.currentcontext.ToDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'appointment' },

                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'Visit/DoctorDashboard/GetDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCountCallBack
            };
            utl.Http.doAction(options);
        };




        $scope.getCount();
        // $scope.getScheduled();
        // $scope.getcheckin();
        // $scope.getcheckout();
        // $scope.getcancelled();
        // $scope.getnoshown();

        /* Side Menu close*/
        // $timeout(function () {
        //     removeFloatingNav();
        // }, 100);

        // function removeFloatingNav() {
        //     $rootScope.app.layout.isCollapsed = true;
        // }
        // /* Side Menu close*/
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getCount();
        //     $scope.getScheduled();
        //     // $scope.getTodayCheckIn();
        //     // $scope.getTodayCancelled();
        //     // $scope.getTodayNoShownCount();
        // }

        // $scope.initLookup = function () {
        //     var inputData = []
        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     $scope.$doAction(options);
        // }

        // $scope.initLookup();
    }

    AppointmentDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();