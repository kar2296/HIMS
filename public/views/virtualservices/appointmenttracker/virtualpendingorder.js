(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingorderController', pendingorderController);

    function pendingorderController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;

        $scope.gridData = [];
        $scope.currentfilter = {
            patientname: '',
            consultationstatusid: 1,
            visitdate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };

        $scope.currentcontext = {
            DoctorId: parseInt(utl.Session.getCurrentUserId())
        };



        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Patient.Id == patientId) {
                    item.Patient.Photo = photo;
                }
            }
        };

        $scope.getPatientProfilePic = function (item) {
            if (item.PhotoPath) {
                var inputData = {
                    Id: item.Id,
                    PhotoPath: item.PhotoPath
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

        function loadPhotos() {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Patient.PhotoPath) {
                    $scope.getPatientProfilePic(item.Patient);
                }
            }
        }

        $scope.backToList = function () {
            $state.go('app.doctordashboard');
        };

        $scope.changeConsultantStatus = function (ConStatusId) {
            $scope.currentfilter.consultationstatusid = ConStatusId;
            $scope.getList();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.Patient) {
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            loadPhotos();
        };

        $scope.getList = function () {
            if ($scope.currentfilter.visitdate == null) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Date...'));
                return false;
            }
            var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
            var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: {
                            'AppointmentStatus': 6,
                            'My': true
                        }
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.patientname
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.consultationstatusid
                    },
                    {
                        Key: 10,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 21,
                        Value: 1
                    },
                    {
                        Key: 20,
                        Value: 1
                    },

                    {
                        Key: 22,
                        Value: [FrRegDt, ToRegDt]
                    }
                ]
            }
            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     // $scope.gridData = res.Data;
        //     // var items = $scope.gridData;
        //     // for (var idx in items) {
        //     //     console.log(items[idx]);
        //     // }
        //     vm.gridConfig.data = res.Data;
        //     vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        //     loadPhotos();
        // };

        // $scope.getList = function () {
        //     var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
        //     var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
        //     var inputData = {
        //         Params: [{
        //                 Key: 2,
        //                 Value: {
        //                     'AppointmentStatus': 6,
        //                     'My': true
        //                 }
        //             },
        //             {
        //                 Key: 3,
        //                 Value: $scope.currentfilter.patientname
        //             },
        //             {
        //                 Key: 4,
        //                 Value: $scope.currentfilter.consultationstatusid
        //             },
        //             {
        //                 Key: 10,
        //                 Value: utl.Session.getCurrentFacilityId()
        //             },
        //             {
        //                 Key: 21,
        //                 Value: 1
        //             },
        //             {
        //                 Key: 20,
        //                 Value: 1
        //             },
        //             // {
        //             //     Key: 17,
        //             //     Value: FrRegDt
        //             // },
        //             // {
        //             //     Key: 18,
        //             //     Value: ToRegDt
        //             // },
        //             {
        //                 Key: 5,
        //                 Value: [FrRegDt, ToRegDt]
        //             }
        //         ]
        //     }
        //     // if ($scope.currentfilter.PatientId) {
        //     //     inputData.Params.push({
        //     //         Key: 17,
        //     //         Value: $scope.currentfilter.PatientId
        //     //     });
        //     // }
        //     // if ($scope.currentfilter.visitdate) {
        //     //     var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
        //     //     var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
        //     //     inputData.Params.push({
        //     //         Key: 16,
        //     //         Value: [FrRegDt, ToRegDt]
        //     //     });
        //     // }
        //     // if ($scope.currentfilter.DepartmentId > 0) {
        //     //     inputData.Params.push({
        //     //         Key: 6,
        //     //         Value: $scope.currentfilter.DepartmentId
        //     //     });
        //     // }
        //     var options = {
        //         action: 'Visit/EncounterDoctor/GetEncounterDoctors',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getListCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        $timeout(function () {
            $('#patientname').focus();
        }, 1000);

        // $scope.onEnter = function (data) {
        //     if (data == undefined) {
        //         $scope.currentfilter.PatientId = 0;
        //         $scope.getList();
        //     }
        // }


        function updatePatientBillsCallback(scope, data, options, hasError) {
            $scope.initLookup();
        };

        function updateAppointmentStatus(data) {
            var actionName = 'appointment/Appointment/UpdateAppointment';

            var inputData = {
                Id: data.AppointmentId,
                AppointmentStatusId: 12
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        function updateEncounterStatus(data) {
            var actionName = 'encounter/Visit/UpdateEncounter';

            var inputData = {
                Id: data.Encounter.Id,
                IsVisitCancel: 1,
                DischargeDate: utl.Formatter.getCurrentDate()
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        function updateEncounterDoctorStatus(data) {
            var actionName = 'encounter/EncounterDoctor/UpdateEncounterDoctor';

            var inputData = {
                Id: data.Id,
                EncounterDoctorStatus: 4
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        function updatePatientBills(PatientBillId, PatientBillAmount) {
            var actionName = 'billing/patientbills/UpdatePatientBillsByDefaultFlow';
            var inputData = {
                Id: PatientBillId,
                PatientBillStatusId: 2,
                IsCancelRequest: true,
                CancelReason: '',
                CancelAmount: PatientBillAmount,
                CancelledBy: parseInt(utl.Session.getCurrentUserId()),
                BillCancelStatusId: 1,
                CancelledAt: new Date()
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: updatePatientBillsCallback
            };

            utl.Http.doAction(options);
        }

        function getPatientBillsCallback(scope, res, options, hasError) {
            let PatientBillId = 0;
            let PatientBillAmount = 0;
            if (res.Data.length > 0)
                $scope.PatientBills = res.Data[0];
            PatientBillId = res.Data[0].Id;
            PatientBillAmount = res.Data[0].GrossTotal;
            if (PatientBillId > 0) {
                updatePatientBills(PatientBillId, PatientBillAmount);
            }
        };

        function getPatientBills(data) {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 12,
                        Value: data.PatientId
                    },
                    {
                        Key: 16,
                        Value: data.Encounter.Id
                    },
                    {
                        Key: 40,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: getPatientBillsCallback
            };

            utl.Http.doAction(options);
        };

        function updateCheckoutStatus(data) {
            var actionName = 'appointment/patienttracker/CheckoutPatient';

            var inputData = {
                EncounterId: data.Encounter.Id,
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId,
                DoctorId: data.Encounter.DoctorId,
                IsNotShownPatient: true
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post'
                //onComplete: updateAppointmentStatusCallback
            };

            utl.Http.doAction(options);
        }

        $scope.onConfirmation = function (confirmedentity) {
            if (confirmedentity.new_visit) {
                $scope.getList();
            } else {
                var selectedVisit = confirmedentity.selected_visit;
                $scope.selectedVisit = {};
                $scope.selectedVisit.Id = confirmedentity.current_visit.Encounter.Id;
                $scope.selectedVisit.EncounterId = confirmedentity.current_visit.Encounter.Id;
                $scope.selectedVisit.PreviousEncounterId = selectedVisit.Id;
                $scope.selectedVisit.DeductableAmount = selectedVisit.DeductableAmount;
                $scope.selectedVisit.BalanceDeductableAmount = selectedVisit.BalanceDeductableAmount;
                $scope.selectedVisit.ApprovedLimit = selectedVisit.ApprovedLimit;
                $scope.selectedVisit.BalanceApprovedLimit = selectedVisit.BalanceApprovedLimit;
                $scope.selectedVisit.ClaimProcessId = selectedVisit.ClaimProcessId;
                $scope.selectedVisit.ClaimNumber = selectedVisit.ClaimNumber;
                $scope.changeFollwUpVisit();
            }
        };

        function attentPatientCallback(scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.getList();
            utl.Session.setEMRPatientId(options.data.Data.PatientId);
            $state.go('patientemr.patientrecords', {
                pid: options.data.Data.PatientId,
                eid: options.data.Data.eid
            });

        };

        function attendPatient(data) {
            var actionName = 'appointment/patienttracker/AttendPatient';

            var inputData = {
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId,
                eid: data.Encounter.Id
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: attentPatientCallback
            };

            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'attend') {
                attendPatient({
                    PatientId: entity.PatientId,
                    AppointmentId: entity.AppointmentId,
                    Encounter: entity.Encounter
                });
                // attendPatient(entity);
            } else if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('patientemr.patientrecords', {
                    eid: entity.EncounterId,
                    pid: entity.PatientId
                });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('Ref#')
                },
                {
                    field: "StartDate",
                    displayName: $translate.instant('registration.checkedinpatients.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StartDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.StartDate| date: 'HH:mm'}}</span>" + "</div>"
                },     
                {
                    field: "Encounter.VisitType.Description",
                    displayName: $translate.instant('Service'),
                },
                {
                    field: "",
                    displayName: $translate.instant('Sub Services'),
                },
                {
                    field: "",
                    displayName: $translate.instant('Charges'),
                },
                {
                    field: "StartDate",
                    displayName: $translate.instant('Exp.Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StartDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.StartDate| date: 'HH:mm'}}</span>" + "</div>"
                }, 
                {
                    field: "ConsultationStatus.Description",
                    displayName: $translate.instant('registration.checkedinpatients.staturs.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('registration.checkedinpatients.action.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'attend\',entity)" ng-show="entity.EncounterDoctorStatus==1" tooltip-placement="top">\
                    <i class="fas fa-hospital-user" uib-tooltip="Attend"  aria-hidden="true" tooltip-placement="top"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'emr\',entity)" ng-hide="entity.EncounterDoctorStatus==1" tooltip-placement="top">\
                    <i class="fas solid fa-laptop-medical" uib-tooltip="EMR"></i></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $scope.changeFollwUpVisit = function () {
            var actionName = '';
            if ($scope.selectedVisit.Id && $scope.selectedVisit.Id > 0) {
                actionName = 'encounter/Visit/ChangeFollwUpVisit';
            }

            var inputData = {
                Header: $scope.selectedVisit
            };

            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.changeFollwUpCallback
            };

            utl.Http.doAction(options);
        };

        function handleCheckout(entity) {
            utl.Modal.open('app.patienttracker', {
                params: {
                    pid: entity.PatientId,
                    aid: entity.AppointmentId,
                    from: 'doctordashboard'
                },
                confirmCallback: patientTrackerCallback
            });
        }


        function patientTrackerCallback() {
            $scope.getList();
        }

        // $scope.handleEvents = function (actionType, entity) {
        //     if (actionType == 'emr') {
        //         utl.Session.setEMRPatientId(entity.PatientId);
        //         $state.go('patientemr.patientdashboard', {
        //             eid: entity.EncounterId
        //         });
        //     } else if (actionType == 'appointments') {
        //         utl.Modal.open('app.appointment', {
        //             params: {
        //                 id: 0,
        //                 pid: entity.PatientId
        //             },
        //             confirmCallback: $scope.getList
        //         });
        //     } else if (actionType == 'attend') {
        //         attendPatient(entity);
        //     } else if (actionType == 'call') {
        //         utl.Modal.open('app.appnmttoken', {
        //             params: {
        //                 id: entity.AppointmentId,
        //                 pid: entity.PatientId,
        //                 eid: entity.Encounter.Id,
        //                 doctid: entity.DoctorId,
        //                 room: entity.Doctor.OPDRoomId
        //             },
        //             confirmCallback: $scope.getList
        //         });
        //     } else if (actionType == 'checkout') {
        //         /* getPendingOrders({ PatientId: entity.PatientId, EncounterId: entity.Encounter.Id }); */
        //         handleCheckout(entity);
        //     } else if (actionType == 'preappoinments') {
        //         utl.Modal.open('app.previousappointment', {
        //             params: {
        //                 id: 0,
        //                 pid: entity.PatientId
        //             },
        //             confirmCallback: $scope.getList
        //         });
        //     } else if (actionType == 'labresult') {
        //         utl.Modal.open('patientemr.labresults', {
        //             params: {
        //                 eid: entity.Encounter.Id,
        //                 pid: entity.PatientId
        //             },
        //             confirmCallback: $scope.getList
        //         });
        //     } else if (actionType == 'ordertracker') {
        //         utl.Modal.open('app.ordertracker', {
        //             params: {
        //                 eid: entity.Encounter.Id,
        //                 pid: entity.PatientId
        //             },
        //             confirmCallback: $scope.getList
        //         });
        //     } else if (actionType == 'recommend') {
        //         utl.Modal.open('app.recommendation', {
        //             params: {
        //                 eid: entity.Encounter.Id,
        //                 pid: entity.PatientId
        //             },
        //             confirmCallback: $scope.getList
        //         });
        //     }
        // }

        $scope.canShowAction = function (actionType, entity) {
            if (actionType == 'waiting4u') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 1 && entity.DoctorId == currentDoctorId);
            } else if (actionType == 'waiting4others') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 1 && entity.DoctorId != currentDoctorId);
            } else if (actionType == 'attendbyu') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 2 && entity.DoctorId == currentDoctorId);
            } else if (actionType == 'attendbyothers') {
                var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                return (entity.EncounterDoctorStatus == 2 && entity.DoctorId != currentDoctorId);
            }
            return true;
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ConsultationStatus"
            }]
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

    pendingorderController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

})();