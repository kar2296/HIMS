(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipformController', ipformController);

    function ipformController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.CanshowVideo = false;
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.oid) {
            $scope.orderid = parseInt($stateParams.oid);
        }

        if ($stateParams.from) {
            $scope.Fromview = $stateParams.from;
        }
        $scope.doctor_dashboard = function () {
            if ($scope.orderid) {
                $scope.virtual_dashboard();
            } else if ($scope.Fromview == 'fromward') {
                $state.go('app.bedmanagementtab.inpatient');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        // $scope.videoconference = function () {
        //     window.open("https://appr.tc/r/pkvtech");
        // };

        $scope.videoconferenceCallback = function (scope, data, options, hasError) {
            $scope.moderateJoin();
        };

        $scope.videoconference = function () {
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

        $scope.moderateJoinCallback = function (scope, data, options, hasError) {
            $scope.ModerateData = data;
            window.open(data);
            // $state.go('patientemr.videoconsult', {
            //     "code": "VIDEO_CONSULT",
            //     link: data
            // })
            // window.location.replace(data);
        };

        $scope.moderateJoin = function () {
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

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getPatientInfo = function (scope, data, options, hasError) {
            if (data.Data && data.Data.length > 0) {
                $scope.selectedPatient = data.Data[0];
                if ($scope.selectedPatient.Title) {
                    $scope.item.PatientName = $scope.selectedPatient.Title.Description;
                    if ($scope.selectedPatient.FirstName)
                        $scope.item.PatientName += ' ' + $scope.selectedPatient.FirstName;
                    if ($scope.selectedPatient.LastName)
                        $scope.item.PatientName += ' ' + $scope.selectedPatient.LastName;
                }
                $scope.item.Age = $scope.selectedPatient.Age;
                $scope.item.DOB = $scope.selectedPatient.DOB;
                $scope.item.GenderId = $scope.selectedPatient.GenderId;
                if ($scope.selectedPatient.Gender) {
                    if ($scope.selectedPatient.Gender.Description) {
                        $scope.item.Gender = $scope.selectedPatient.Gender.Description;
                    }
                }
                $scope.item.NationalityId = $scope.selectedPatient.NationalityId;
                if ($scope.selectedPatient.Nationality) {
                    if ($scope.selectedPatient.Nationality.Description) {
                        $scope.item.Nationality = $scope.selectedPatient.Nationality.Description;
                    }
                }
                $scope.item.NationalityIdentifier = $scope.selectedPatient.NationalityIdentifier;
                $scope.item.Mobile = $scope.selectedPatient.Mobile;
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
                $scope.item.AddressLine1 = $scope.selectedPatient.AddressLine1;
                $scope.item.AddressLine2 = $scope.selectedPatient.AddressLine2;
                $scope.item.City = $scope.selectedPatient.City;
                $scope.item.Country = $scope.selectedPatient.Country;
                $scope.item.State = $scope.selectedPatient.State;
                $scope.item.PasspostNumber = $scope.selectedPatient.PasspostNumber;
                if ($scope.selectedPatient.Guarantor) {
                    if ($scope.selectedPatient.Guarantor.GuarantorName)
                        $scope.item.GuarantorName = $scope.selectedPatient.Guarantor.GuarantorName;
                }
                if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                    if ($scope.context == 'emr') {
                        var encounteritem = $filter('filter')($scope.selectedPatient.Encounters, {
                            EncounterTypeId: 1,
                            Id: $scope.currentcontext.eid
                        })[0];
                    }
                    if ($scope.context == 'vorders') {
                        var encounteritem = $filter('filter')($scope.selectedPatient.Encounters, {
                            EncounterTypeId: 1,
                            Id: $scope.currentcontext.eid
                        })[0];
                    }
                    if ($scope.context == 'ipemr') {
                        var encounteritem = $filter('filter')($scope.selectedPatient.Encounters, {
                            EncounterTypeId: 2,
                            Id: $scope.currentcontext.eid
                        })[0];
                    }
                    // var encounteritem = $scope.selectedPatient.Encounters[0];
                    if (encounteritem.Doctor.Title) {
                        $scope.item.DoctorName = encounteritem.Doctor.Title.Description;
                        if (encounteritem.Doctor.FirstName)
                            $scope.item.DoctorName += ' ' + encounteritem.Doctor.FirstName;
                        if (encounteritem.Doctor.LastName)
                            $scope.item.DoctorName += ' ' + encounteritem.Doctor.LastName;
                    }
                    $scope.item.VisitIdentifier = encounteritem.VisitIdentifier;
                    $scope.item.Department = encounteritem.Department.DepartmentName;
                    if (encounteritem.VisitTypeId) {
                        $scope.item.VisitTypeId = encounteritem.VisitTypeId;

                    }
                    if (encounteritem.VisitType) {
                        if (encounteritem.VisitType.Description) {
                            $scope.item.VisitType = encounteritem.VisitType.Description;
                        }
                    }
                    if (encounteritem.EncounterType) {
                        if (encounteritem.EncounterType.Description) {
                            $scope.item.EncounterType = encounteritem.EncounterType.Description;
                        }
                    }
                    if (encounteritem.EncounterTypeId == 1 && encounteritem.EncounterStatusId == 1) {
                        $scope.item.EncounterStatus = 'Checked In'
                    }

                    if (encounteritem.EncounterTypeId == 1 && encounteritem.EncounterStatusId == 2) {
                        $scope.item.EncounterStatus = 'Checked Out'

                    }
                    if (encounteritem.EncounterTypeId == 2) {
                        $scope.item.AdmissionStatus = encounteritem.AdmissionStatus.Description;
                    }

                    if (encounteritem.EncounterTypeId) {
                        $scope.item.EncounterTypeId = encounteritem.EncounterTypeId;
                    }
                    if (encounteritem.WardMaster) {
                        $scope.item.WardName = encounteritem.WardMaster.WardName;
                    }
                    if (encounteritem.WardRoomMaster) {
                        $scope.item.WardName += '/' + encounteritem.WardRoomMaster.RoomNo;
                    }
                    if (encounteritem.WardRoomBedMaster) {
                        $scope.item.WardName += '/' + encounteritem.WardRoomBedMaster.BedNo;
                    }
                    $scope.item.DepartmentId = encounteritem.DepartmentId;
                    $scope.item.DoctorId = encounteritem.DoctorId;
                    $scope.item.TeamId = encounteritem.TeamId;
                    $scope.item.Comments = encounteritem.Comments;
                    $scope.item.EncounterId = encounteritem.EncounterId;
                    $scope.item.AdmissionDate = encounteritem.AdmissionDate;
                    $scope.AppointmentId = encounteritem.AppointmentId;
                }
                $scope.getPatientProfilePic();

            }
        };

        $scope.patientChange = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/patient/GetPatientsInfoBanner',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientInfo
            };
            utl.Http.doAction(options);
        };

        $scope.getConferenceCallback = function (scope, data, options, hasError) {
            if (data.Data && data.Data.length > 0) {
                $scope.conference = data.Data[0];
                $scope.CanshowVideo = true;
            }
        };
        $scope.getConference = function (pageNo) {
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

        $scope.virtual_dashboard = function () {
            $state.go('app.virtualdashboard');
        };

        $scope.completecallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.doctordashboard');
        };

        $scope.checkoutorder = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to Complete this Order?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnCompleteConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.OnCompleteConfirmed = function () {
            $scope.trackdata = {
                AppointmentId: $scope.vodata.AppointmentId,
                PatientId: $scope.currentcontext.pid,
                oid: $scope.orderid,
                DoctorId: $scope.vodata.DoctorId
            }
            var actionName = 'appointment/patienttracker/CheckoutPatient';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.trackdata
                },
                type: 'post',
                onComplete: $scope.completecallback
            };
            utl.Http.doAction(options);

        };


        // get virtual order info
        $scope.getvirtulaorderinfoCallback = function (scope, data, options, hasError) {
            $scope.vodata = data.Data[0];
            if ($scope.vodata.OrderConsultTypeId == 2) {
                $scope.CanshowVideo = true;

            }
        };

        $scope.getvirtulaorderinfo = function (pageNo) {
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

        document.getElementById('buttons').addEventListener('click', function (evt) {
            var target = evt.target;
            if (target.id === '1') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 1,
                    },
                };
            } else if (target.id === '2') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 2,
                    },
                };
            }  else if (target.id === '3') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 3,
                    },
                };
            }  else if (target.id === '4') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 4,
                    },
                };
            }  else if (target.id === '5') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 5,
                    },
                };
            }  else if (target.id === '6') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 6,
                    },
                };
            }  else if (target.id === '7') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 7,
                    },
                };
            }  else if (target.id === '8') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 8,
                    },
                };
            }  else if (target.id === '9') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 9,
                    },
                };
            }  else if (target.id === '10') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 10,
                    },
                };
            }  else if (target.id === '11') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 11,
                    },
                };
            }  else if (target.id === '12') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 12,
                    },
                };
            }  else if (target.id === '13') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 13,
                    },
                };
            }  else if (target.id === '14') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 14,
                    },
                };
            }  else if (target.id === '15') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 15,
                    },
                };
            }  else if (target.id === '16') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 16,
                    },
                };
            }  else if (target.id === '17') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 17,
                    },
                };
            }  else if (target.id === '18') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 18,
                    },
                };
            } else if (target.id === '19') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 19,
                    },
                };
            } else if (target.id === '20') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 20,
                    },
                };
            } else if (target.id === '21') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 21,
                    },
                };
            } else if (target.id === '22') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 22,
                    },
                };
            } else if (target.id === '23') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 23,
                    },
                };
            } else if (target.id === '24') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 24,
                    },
                };
            } else if (target.id === '25') {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    Data: {
                        ids: 25,
                    },
                };
            } else {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                };
            }
            var options = {
                action: 'registration/Patient/PrintIpForms',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }, false);

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = false;
        }
        if ($scope.orderid) {
            $scope.getvirtulaorderinfo();
            $scope.getConference();
        }
        $scope.patientChange();

    }

    ipformController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();