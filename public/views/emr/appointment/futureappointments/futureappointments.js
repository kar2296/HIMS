(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FutureAppointmentsController', FutureAppointmentsController);

    function FutureAppointmentsController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.Trackers = [];
        $scope.item = [];
        $scope.currentcontext = {};

        var today = new Date();
        $scope.currentfilter = {
            FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
            DepartmentId: -1,
            AppointmentTypeId: -1,
            DoctorId: '',
            FollowupTrackerStatusId: -1,
            followupdate: utl.Formatter.getCurrentDate(),
            MRN: '',
            fromdate: utl.Formatter.getCurrentDate(),
            //todate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), -7)
            todate: today.setDate(today.getDate() + 7)
        };
        console.log($scope.currentfilter);

        if (utl.Session.getUserTypeId() == 2) {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId().toString();
        }

        $scope.handleEvents = function (actionType, entity) {
            console.log(entity);
            if (actionType == 'view') {
                $scope.followup(entity);
                // followup({
                //     PatientId: entity.PatientId,
                //     AppointmentId: entity.AppointmentId,
                //     Encounter: entity.Encounter,
                //     ocid: entity.OrderConsultTypeId,
                //     oid: entity.VirtualOrderId
                // });
                // attendPatient(entity);
            } else if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('patientemr.patientrecords', {
                    eid: entity.EncounterId,
                    pid: entity.PatientId,
                    aid: entity.AppointmentId,
                    ocid: entity.OrderConsultTypeId,
                    oid: entity.VirtualOrderId,
                    context: 'emr'
                });
            } else if (actionType == 'call') {
                // utl.Modal.open('app.appnmttoken', {
                //     params: {
                //         id: entity.AppointmentId, pid: entity.PatientId, eid: entity.EncounterId, doctid: entity.DoctorId,
                //         room: (entity.Doctor)?entity.Doctor.OPDRoomId:''
                //     },
                //     confirmCallback: $scope.getList
                // });
                utl.Modal.open('app.appnmtfollowup', {
                    params: {
                        id: entity.Id,
                        aid: entity.AppointmentId, pid: entity.PatientId, eid: entity.EncounterId, doctid: entity.DoctorId,
                        room: (entity.Doctor) ? entity.Doctor.OPDRoomId : ''
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                });
            }
        }

        $scope.selectAllItems = function () {
            for (var idx in $scope.Trackers) {
                var item = $scope.Trackers[idx];
                if (!item.IsSMSNotified) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSelected = $scope.currentcontext.selectall;
                }
            }
        }

        $scope.apnmntSelectionChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllSelected && !detail.IsSMSNotified) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllSelected && !detail.IsSMSNotified) {
                    detail.IsSelected = false;
                }
            }
        }

        $scope.followup = function (entity) {
            utl.Modal.open('app.patienttracker', {
                params: {
                    pid: entity.PatientId,
                    aid: entity.AppointmentId,
                    eid: entity.EncounterId,
                    from: 'followuptracker',
                    tracker: entity,
                    //assignto: 1
                },
                confirmCallback: $scope.getList
            });
            // var confirmOptions = {
            //     headingKey: 'common.confirm-modal-header.lbl',
            //     messageKey: 'Do You Want to Complete this Order?',
            //     yesKey: 'common.yeskey.lbl',
            //     noKey: 'common.nokey.lbl',
            //     onSuccessMethod: $scope.OnCompleteConfirmed,
            // };
            // utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Trackers = [];
            for (var pdx in res.Data) {
                var trackData = res.Data[pdx];
                // if (trackData.AssignedUserId > 0) {
                //     if (trackData.FollowupAppointmentOn) {
                //         $scope.Trackers.push(trackData);
                //     }
                // }

                if (trackData.FollowupAppointmentOn) {
                    $scope.Trackers.push(trackData);
                }

            }
        };

        $scope.getList = function () {
            // var From = $filter('date')($scope.currentfilter.followupdate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.followupdate, 'yyyy-MM-dd 23:59:59') || null;
            var From = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 7,
                    //     Value: 2
                    // },
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                    // {
                    //     Key: 10,
                    //     Value: $scope.currentfilter.FollowupTrackerStatusId
                    // }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if ($scope.currentfilter.FollowupTrackerStatusId > 0) {
                inputData.Params.push({ Key: 10, Value: $scope.currentfilter.FollowupTrackerStatusId });
            }

            if ($scope.currentfilter.DepartmentId > 0) {
                inputData.Params.push({ Key: 11, Value: $scope.currentfilter.DepartmentId });
            }

            var options = {
                action: 'appointment/patienttracker/GetPatientTrackers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.sendsms = function () {
            $scope.SelectedRows = [];
            for (var idx in $scope.Trackers) {
                var item = $scope.Trackers[idx];
                if (item.IsSelected == true) {
                    $scope.SelectedRows.push(item);
                }
            }
            $scope.item = $scope.SelectedRows;

            var options = {
                action: 'appointment/patienttracker/SendSMSNotifications',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);

        }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "Department"
            },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "FollowupTrackerStatus"
            },

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

    FutureAppointmentsController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();