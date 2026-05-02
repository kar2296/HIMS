(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('SummaryNoteTabController', SummaryNoteTabController);

    function SummaryNoteTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        $scope.CanshowVideo = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        if ($stateParams.oid) {
            $scope.orderid = parseInt($stateParams.oid);
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.doctor)
            $scope.currentcontext.edid = $stateParams.doctor;

        $scope.tabs = [{
                title: $translate.instant('OP Notes'),
                state: 'patientemr.summarynotetab.patientdashboard',
                params: {
                    profile: 1 //Profile master type: 1
                }
            },
            {
                title: $translate.instant('Discharge Notes'),
                state: 'patientemr.summarynotetab.patientdashboard',
                params: {
                    profile: 2 //Profile master type: 2
                }
            },
            {
                title: $translate.instant('IP Notes'),
                state: 'patientemr.summarynotetab.patientdashboard',
                params: {
                    profile: 3 //Profile master type: 3
                }

            },
            {
                title: $translate.instant('Surgery Notes'),
                state: 'patientemr.summarynotetab.patientdashboard',
                params: {
                    profile: 4 ////Profile master type: 4
                }
            },
            {
                title: $translate.instant('Anesthesia Notes'),
                state: 'patientemr.summarynotetab.patientdashboard',
                params: {
                    profile: 5 ////Profile master type: 5
                }
            },
            {
                title: $translate.instant('Emergency Notes'),
                state: 'patientemr.summarynotetab.patientdashboard',
                params: {
                    profile: 6 ////Profile master type: 6
                }
            },
            {
                title: $translate.instant('Discharge Summary'),
                state: 'patientemr.summarynotetab.patientdashboard',
                params: {
                    profile: 7 ////Profile master type: 7
                }
            },
        ];
        $scope.switchTab = function(tab) {
            $state.go(tab.state, tab.params);
            // $state.go('surgeryentry.sugerypatientrecords', {
            //     pid: $scope.currentcontext.pid
            // });
        }
        $scope.doctor_dashboard = function() {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $scope.checkedinpatients = function() {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function() {
            $state.go('app.bedmanagementtab.inpatient');
        };

        // if ($scope.CanAllOutPatients) {
        //     $scope.switchTab($scope.tabs[0]);
        // }
        $scope.videoconferenceCallback = function(scope, data, options, hasError) {
            $scope.moderateJoin();
        };

        $scope.videoconference = function() {
            var inputData = {
                conferenceId: $scope.conference.Id,
            };
            var options = {
                action: 'VirtualHealthcare/VirtualConference/createRoom',
                data: inputData,
                type: 'post',
                onComplete: $scope.videoconferenceCallback
            };
            utl.Http.doAction(options);
        };
        $scope.moderateJoinCallback = function(scope, data, options, hasError) {
            $scope.ModerateData = data;
            window.open(data);
        };

        $scope.moderateJoin = function() {
            var inputData = {
                conferenceId: $scope.conference.Id,
            };
            var options = {
                action: 'VirtualHealthcare/VirtualConference/getModeratorJoinUrl',
                data: inputData,
                type: 'post',
                onComplete: $scope.moderateJoinCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getConferenceCallback = function(scope, data, options, hasError) {
            if (data.Data && data.Data.length > 0) {
                $scope.conference = data.Data[0];
                $scope.CanshowVideo = true;
            }
        };
        $scope.getConference = function(pageNo) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: $scope.orderid
                }]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualConference/GetVirtualConferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getConferenceCallback
            };
            utl.Http.doAction(options);
        };
        // get virtual order info
        $scope.getvirtulaorderinfoCallback = function(scope, data, options, hasError) {
            $scope.vodata = data.Data[0];
            if ($scope.vodata.OrderConsultTypeId == 2) {
                $scope.CanshowVideo = true;

            }
        };

        $scope.getvirtulaorderinfo = function(pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.orderid
                }]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvirtulaorderinfoCallback
            };
            utl.Http.doAction(options);
        };
        if ($scope.orderid) {
            $scope.getvirtulaorderinfo();
            $scope.getConference();
        }

    }



    SummaryNoteTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();