(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('portalvedioController', portalvedioController);

    function portalvedioController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            ScheduleDate: utl.Formatter.getCurrentDate()
        };

        $scope.currentcontext = {
            paneltype: 'panel-info'
        };

        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.dashboardinfo = {};

        $scope.getvideoDataCallback = function (scope, res, options, hasError) {
            $scope.Conferences = res.Data;
        };

        $scope.getvideoData = function () {
            var From = $filter('date')($scope.currentfilter.ScheduleDate, 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')($scope.currentfilter.ScheduleDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.VirtualOrderStatusId
                    },
                ],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualConference/GetVirtualConferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvideoDataCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getAttendeeJoinCallback = function (scope, data, options, hasError) {
            $scope.attenddata = data;
            window.open(data);
        };

        $scope.getAttendeeJoin = function (item) {
            var inputData = {
                conferenceId: item.Id,
            };
            var options = {
                action: 'VirtualHealthcare/VirtualConference/getAttendeeJoinUrl',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAttendeeJoinCallback
            };
            utl.Http.doAction(options);
        };

        $scope.Home = function () {
            $state.go('patientportal.virtualhealthcare');
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getvideoData();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "VirtualOrderStatus"
                },
                {
                    "Key": "VirtualCategory",
                },
                {
                    "Key": "VirtualSubCategory",
                }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    portalvedioController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();