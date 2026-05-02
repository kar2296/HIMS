(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AdminAppDashboardController', AdminAppDashboardController);

    function AdminAppDashboardController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
        };
        // $scope.currentfilter = {
        //     CompletedDate: utl.Formatter.getCurrentDate(),
        //     FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
        //     ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        // }
        $scope.currentfilter = {
            OrganizationId: utl.Session.getCurrentOrgId(),
            FacilityId: -1,
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        //console.log($scope.currentfilter);
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
            //FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityId: -1,
            OrganizationId: utl.Session.getCurrentOrgId(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.getScheduledCallback = function (scope, res, options, hasError) {
            $scope.todayscheduled = res.Data || [];
        };

        $scope.getScheduled = function () {
            var facility = [];
            if($scope.currentfilter.FacilityId == -1)
            {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id > 0) {

                            facility.push($scope.lookup.Facility[idx].Id);
                        }
                    }
            }
            else
            {
                facility.push($scope.currentfilter.FacilityId);
            }
            $scope.currentcontext.FacilityId = facility;
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
            var facility = [];
            if($scope.currentfilter.FacilityId == -1)
            {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id > 0) {

                            facility.push($scope.lookup.Facility[idx].Id);
                        }
                    }
            }
            else
            {
                facility.push($scope.currentfilter.FacilityId);
            }
            $scope.currentcontext.FacilityId = facility;
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 7,
                        Value: 6
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
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
        $scope.getcancelledCallback = function (scope, res, options, hasError) {
            $scope.todaycanceled = res.Data || [];
        };

        $scope.getcancelled = function () {
            var facility = [];
            if($scope.currentfilter.FacilityId == -1)
            {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id > 0) {

                            facility.push($scope.lookup.Facility[idx].Id);
                        }
                    }
            }
            else
            {
                facility.push($scope.currentfilter.FacilityId);
            }
            $scope.currentcontext.FacilityId = facility;
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 21,
                        Value: $scope.currentcontext.FacilityId
                    },
                    {
                        Key: 7,
                        Value: 5
                    },
                    {
                        Key: 4,
                        Value: 1//Description: "PHYSICIAN"
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
            var facility = [];
            if($scope.currentfilter.FacilityId == -1)
            {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id > 0) {

                            facility.push($scope.lookup.Facility[idx].Id);
                        }
                    }
            }
            else
            {
                facility.push($scope.currentfilter.FacilityId);
            }
            $scope.currentcontext.FacilityId = facility;
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

        /** Monthly Appointment summary*/
        $scope.monthappsummaryCallback = function (scope, result, options, hasError) {
            $scope.monthappsummary = [];
            $scope.monthsummarycount = {};

            /** Today Appointment Summary */
            $scope.groups = _.groupBy(result.Data, 'DoctorId');
            console.log($scope.groups);
            // console.log(typeof($scope.groups));

            for (var idx in $scope.groups) {
                //console.log($scope.groups[idx]);
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
                //v.Total = res.length;
                v.Scheduled = res.filter(e => e.AppointmentStatusId === 2).length || 0;
                v.Checkin = res.filter(e => e.AppointmentStatusId === 6).length || 0;
                v.Checkout = res.filter(e => e.AppointmentStatusId === 11).length || 0;
                v.Cancelled = res.filter(e => e.AppointmentStatusId === 5).length || 0;
                v.Noshown = res.filter(e => e.AppointmentStatusId === 12).length || 0;
                v.Total = (v.Scheduled + v.Checkin + v.Checkout + v.Cancelled + v.Noshown);
                $scope.monthappsummary.push(v);
            }

            $scope.monthsummarycount.Scheduled = result.Data.filter(e => e.AppointmentStatusId === 2).length || 0;
            $scope.monthsummarycount.Checkin = result.Data.filter(e => e.AppointmentStatusId === 6).length || 0;
            $scope.monthsummarycount.Checkout = result.Data.filter(e => e.AppointmentStatusId === 11).length || 0;
            $scope.monthsummarycount.Cancelled = result.Data.filter(e => e.AppointmentStatusId === 5).length || 0;
            $scope.monthsummarycount.Noshown = result.Data.filter(e => e.AppointmentStatusId === 12).length || 0;
            $scope.monthsummarycount.Total = ($scope.monthsummarycount.Scheduled + $scope.monthsummarycount.Checkin + $scope.monthsummarycount.Checkout + $scope.monthsummarycount.Cancelled + $scope.monthsummarycount.Noshown) || 0;
            /**Today Branch Appointment Summary*/

            // console.log($scope.groups);
            // console.log(typeof($scope.groups));
            $scope.monthbranchsummary = [];
            $scope.monthbranchsummarycount = {};
            for (var idx in $scope.groups) {
                //console.log($scope.groups[idx]);
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


                var facility = [];
                for (var idx in $scope.lookup.Facility) {

                    var facilityId = $scope.lookup.Facility[idx].Id;
                    //console.log($scope.lookup.Facility[idx]);
                    //console.log(facilityId);
                    if(facilityId > 0)
                    {

                        //console.log(res.filter(e => e.FacilityId === facilityId).length || 0);
                        facility.push(res.filter(e => e.FacilityId === facilityId).length || 0);

                    }
                }
                v.FacilityDet = facility;
                $scope.monthbranchsummary.push(v);

            }
            //console.log($scope.monthbranchsummary);

            $scope.branch_facility = [];
                for (var idx in $scope.lookup.Facility) {

                    var facilityId = $scope.lookup.Facility[idx].Id;
                    //console.log($scope.lookup.Facility[idx]);
                    //console.log(facilityId);
                    if(facilityId > 0)
                    {

                        //console.log(res.filter(e => e.FacilityId === facilityId).length || 0);
                        $scope.branch_facility.push(result.Data.filter(e => e.FacilityId === facilityId).length || 0);

                    }
                }

            $scope.monthbranchsummarycount.Total = result.Data.length || 0;

        };

        $scope.monthappsummary1 = function () {
            var facility = [];

            if($scope.currentfilter.FacilityId == -1)
            {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id > 0) {

                            facility.push($scope.lookup.Facility[idx].Id);
                        }
                    }
            }
            else
            {
                facility.push($scope.currentfilter.FacilityId);
            }

            $scope.currentcontext.FacilityId = facility;

            //var From = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00') || null;
            var date = utl.Formatter.getCurrentDate();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            var From = $filter('date')(firstDay, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
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
                onComplete: $scope.monthappsummaryCallback
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
                //console.log($scope.groups[idx]);
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

            /**Today Branch Appointment Summary*/

            // console.log($scope.groups);
            // console.log(typeof($scope.groups));
            $scope.todaybranchsummary = [];
            $scope.todaybranchsummarycount = {};
            for (var idx in $scope.groups) {
                //console.log($scope.groups[idx]);
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


                var facility = [];
                for (var idx in $scope.lookup.Facility) {

                    var facilityId = $scope.lookup.Facility[idx].Id;
                    //console.log($scope.lookup.Facility[idx]);
                    //console.log(facilityId);
                    if(facilityId > 0)
                    {

                        //console.log(res.filter(e => e.FacilityId === facilityId).length || 0);
                        facility.push(res.filter(e => e.FacilityId === facilityId).length || 0);

                    }
                }
                v.FacilityDet = facility;
                // v.Scheduled = res.filter(e => e.AppointmentStatusId === 2).length || 0;
                // v.Checkin = res.filter(e => e.AppointmentStatusId === 6).length || 0;
                // v.Cancelled = res.filter(e => e.AppointmentStatusId === 5).length || 0;
                // v.Noshown = res.filter(e => e.AppointmentStatusId === 12).length || 0;
                $scope.todaybranchsummary.push(v);

            }
            //console.log($scope.todaybranchsummary);
            $scope.todaybranch_facility = [];
                for (var idx in $scope.lookup.Facility) {

                    var facilityId = $scope.lookup.Facility[idx].Id;
                    //console.log($scope.lookup.Facility[idx]);
                    //console.log(facilityId);
                    if(facilityId > 0)
                    {

                        //console.log(res.filter(e => e.FacilityId === facilityId).length || 0);
                        $scope.todaybranch_facility.push(result.Data.filter(e => e.FacilityId === facilityId).length || 0);

                    }
                }


            $scope.todaybranchsummarycount.Total = result.Data.length || 0;
            // $scope.todaysummarycount.Scheduled = result.Data.filter(e => e.AppointmentStatusId === 2).length || 0;
            // $scope.todaysummarycount.Checkin = result.Data.filter(e => e.AppointmentStatusId === 6).length || 0;
            // $scope.todaysummarycount.Cancelled = result.Data.filter(e => e.AppointmentStatusId === 5).length || 0;
            // $scope.todaysummarycount.Noshown = result.Data.filter(e => e.AppointmentStatusId === 12).length || 0;
        };

        $scope.todayappsummary1 = function () {
            var facility = [];

            if($scope.currentfilter.FacilityId == -1)
            {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id > 0) {

                            facility.push($scope.lookup.Facility[idx].Id);
                        }
                    }
            }
            else
            {
                facility.push($scope.currentfilter.FacilityId);
            }

            $scope.currentcontext.FacilityId = facility;

            var From = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
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
            if (!$scope.Items.TodayScheduledCount)
                $scope.Items.TodayScheduledCount = '0';
            if (!$scope.Items.TodayCheckInCount)
                $scope.Items.TodayCheckInCount = '0';
            if (!$scope.Items.TodayCancelledCount)
                $scope.Items.TodayCancelledCount = '0';
            if (!$scope.Items.TodayNoShownCount)
                $scope.Items.TodayNoShownCount = '0';
            $scope.getScheduled();
            $scope.getcheckin();
            $scope.getcancelled();
            $scope.getnoshown();
            $scope.todayappsummary1();
            $scope.monthappsummary1();
            //$scope.monthlyappsummary();
        };

        $scope.getCount = function () {

            var facility = [];

            if($scope.currentfilter.FacilityId == -1)
            {
                for (var idx in $scope.lookup.Facility) {
                    if ($scope.lookup.Facility[idx].Id > 0) {

                            facility.push($scope.lookup.Facility[idx].Id);
                        }
                    }
            }
            else
            {
                facility.push($scope.currentfilter.FacilityId);
            }
            $scope.currentcontext.FacilityId = facility;
            //$scope.currentcontext.FromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            //$scope.currentcontext.ToDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            //$scope.currentcontext.FromDate = $scope.currentcontext.FromDate
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
        // $scope.getCount();
        // $scope.getScheduled();
        // $scope.getcheckin();
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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getCount();
            // $scope.getScheduled();
            // $scope.getcheckin();
            // $scope.getcancelled();
            // $scope.getnoshown();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 12,
                            Value: $scope.currentfilter.OrganizationId
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
            $scope.$doAction(options);
        }

        $scope.initLookup();
    }

    AdminAppDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();