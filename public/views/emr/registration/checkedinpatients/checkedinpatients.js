    (function () {
        'use strict';

        angular
            .module('app.pages')
            .controller('checkedinPatientsController', checkedinPatientsController);

        function checkedinPatientsController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
            var vm = this;

            uibButtonConfig.activeClass = "opt-selected";

            $scope.gridData = [];
            $scope.currentfilter = {
                patientname: '',
                consultationstatusid: 1,
                visitdate: utl.Formatter.getCurrentDate(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
            };

            $scope.currentcontext = {
                option: 'mycheckedin',
                DoctorId: parseInt(utl.Session.getCurrentUserId())
            };

            $scope.options = [{
                    key: 'mycheckedin',
                    name: $translate.instant('registration.checkedinpatients.mycheckedin-patients.lbl')
                },
                {
                    key: 'allcheckedin',
                    name: $translate.instant('registration.checkedinpatients.allcheckedin-patients.lbl')
                },
                {
                    key: 'scheduled',
                    name: $translate.instant('registration.checkedinpatients.scheduled-patients.lbl')
                },
                {
                    key: 'previouspatients',
                    name: $translate.instant('registration.checkedinpatients.previous-patients.lbl')
                }
            ]

            $scope.canShowScheduledList = function () {
                return $scope.currentcontext.option == 'scheduled';
            };

            function initDynamicForm() {
                $scope.advancedfilter = {};
                $scope.advancedfilterDefault = {
                    DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
                    DoctorId: -1
                };

                $scope.advancedFilterSchema = {
                    layout: 'grid',
                    title: 'common.advancedfilter-title.lbl',
                    controls: [{
                            type: 'select',
                            translate: 'admissions.department.lbl',
                            model: 'DepartmentId',
                            options: $scope.lookup.Department,
                            position: {
                                r: 0,
                                c: 0
                            }
                        },
                        {
                            type: 'select',
                            translate: 'billing.opbilling-list.doctor.lbl',
                            model: 'DoctorId',
                            options: $scope.lookup.Doctor,
                            position: {
                                r: 0,
                                c: 1
                            }
                        },
                        {
                            type: 'select',
                            translate: 'Team',
                            model: 'TeamId',
                            options: $scope.lookup.Team,
                            position: {
                                r: 1,
                                c: 0
                            }
                        },
                        {
                            type: 'select',
                            translate: 'appointment.appointment-form.visittype.lbl',
                            model: 'VisitTypeId',
                            options: $scope.lookup.VisitType,
                            position: {
                                r: 1,
                                c: 1
                            }
                        },
                    ],
                    actions: [{
                            type: 'apply',
                            translate: 'common.applyaction.lbl',
                            cls: 'btn-primary'
                        },
                        {
                            type: 'reset',
                            translate: 'common.resetaction.lbl',
                            cls: 'btn-danger'
                        }
                    ]
                };
            }

            function handleDynamicFormEvents(actionType, formData) {
                $scope.advancedfilter = formData;
                $scope.getList();
            }

            $scope.openAdvancedFilter = function () {

                utl.Modal.openDynamicForm({
                    modeldata: $scope.advancedfilter,
                    defaultdata: $scope.advancedfilterDefault,
                    schema: $scope.advancedFilterSchema,
                    relativeto: '#btnadvanced',
                    handleDynamicFormEvents: handleDynamicFormEvents
                });
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

            $scope.doctor_dashboard = function () {
                $state.go('app.doctordashboard');
            };

            $scope.bed_management = function () {
                $state.go('app.bedmanagement');
            };

            $scope.getListCallback = function (scope, res, options, hasError) {
                $scope.gridData = res.Data;
                var items = $scope.gridData;
                for (var idx in items) {
                    console.log(items[idx]);
                }
                vm.gridConfig.data = items;
                vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
                loadPhotos();
            };

            $scope.getScheduledListCallback = function (scope, res, options, hasError) {
                $scope.gridData = res.Data;
                var items = $scope.gridData;
                for (var idx in items) {
                    var item = items[idx];

                }
                vm.scheduledPatientGridConfig.data = items;
                vm.scheduledPatientGridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
                loadPhotos();
            };

            $scope.changeConsultantStatus = function (ConStatusId) {
                $scope.currentfilter.consultationstatusid = ConStatusId;
                $scope.getList();
            };

            $scope.getList = function (pageNo) {
                if ($scope.currentcontext.option != 'scheduled') {
                    var inputData = {
                        Params: [{
                                Key: 3,
                                Value: $scope.currentfilter.patientname
                            },
                            {
                                Key: 10,
                                Value: $scope.currentfilter.FacilityId
                            }
                        ],
                        PageContext: {
                            PageSize: vm.gridConfig.pagerObj.pageSize,
                            PageNumber: vm.gridConfig.pagerObj.currentPage
                        }
                    };
                    if ($scope.currentcontext.option == 'mycheckedin') {
                        if ($scope.currentfilter.consultationstatusid != 3 && $scope.currentfilter.consultationstatusid != -1) {
                            inputData.Params.push({
                                Key: 2,
                                Value: {
                                    'AppointmentStatus': 6,
                                    'My': true
                                }
                            }, {
                                Key: 4,
                                Value: $scope.currentfilter.consultationstatusid
                            }, {
                                Key: 10,
                                Value: $scope.currentfilter.FacilityId
                            });
                        }
                    } else if ($scope.currentcontext.option == 'allcheckedin') {
                        if ($scope.currentfilter.consultationstatusid != 3 && $scope.currentfilter.consultationstatusid != -1) {
                            inputData.Params.push({
                                    Key: 2,
                                    Value: {
                                        'AppointmentStatus': 6,
                                        'My': false
                                    }
                                }, {
                                    Key: 4,
                                    Value: $scope.currentfilter.consultationstatusid
                                }, {
                                    Key: 10,
                                    Value: $scope.currentfilter.FacilityId
                                },
                                // { Key: 12, Value: $scope.advancedfilter.DepartmentId }
                            );
                        }
                    } else if ($scope.currentcontext.option == 'previouspatients') {
                        inputData.Params.push({
                                Key: 2,
                                Value: {
                                    'AppointmentStatus': 11,
                                    'My': true,
                                    'IsPreviousPatient': true
                                }
                            }, {
                                Key: 10,
                                Value: $scope.currentfilter.FacilityId
                            },
                            // { Key: 12, Value: $scope.advancedfilter.DepartmentId }
                        );
                    }
                    if ($scope.currentcontext.option != 'previouspatients') {
                        if ($scope.currentfilter.consultationstatusid != -3 && $scope.currentfilter.consultationstatusid != -1) {
                            if ($scope.currentfilter.visitdate) {
                                var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
                                var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
                                inputData.Params.push({
                                    Key: 9,
                                    Value: [FrRegDt, ToRegDt]
                                });
                            }
                        }
                    }
                    if ($scope.currentcontext.option == 'previouspatients') {
                        if ($scope.currentfilter.visitdate) {
                            var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
                            var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
                            inputData.Params.push({
                                Key: 11,
                                Value: [FrRegDt, ToRegDt]
                            }, );
                        }
                    }
                    if ($scope.currentcontext.option == 'mycheckedin') {
                        if ($scope.currentfilter.consultationstatusid == -1) {
                            if ($scope.currentfilter.visitdate) {
                                var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
                                var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
                                inputData.Params.push({
                                        Key: 16,
                                        Value: [FrRegDt, ToRegDt]
                                    },
                                    // { Key: 16, Value: [FrRegDt, ToRegDt] },
                                )
                            }
                            inputData.Params.push({
                                Key: 2,
                                Value: {
                                    // 'AppointmentStatus': 11,
                                    'My': true
                                }
                            }, );
                        }
                        if ($scope.currentfilter.consultationstatusid == 3) {
                            if ($scope.currentfilter.visitdate) {
                                var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
                                var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
                                inputData.Params.push({
                                    Key: 11,
                                    Value: [FrRegDt, ToRegDt]
                                })
                            }
                            inputData.Params.push({
                                Key: 2,
                                Value: {
                                    'AppointmentStatus': 11,
                                    'My': true
                                }
                            }, );
                        }
                    }
                    if ($scope.currentcontext.option == 'allcheckedin') {
                        if ($scope.currentfilter.consultationstatusid == -1) {
                            if ($scope.currentfilter.visitdate) {
                                var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
                                var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
                                inputData.Params.push({
                                        Key: 16,
                                        Value: [FrRegDt, ToRegDt]
                                    },
                                    // { Key: 16, Value: [FrRegDt, ToRegDt] },
                                )
                            }
                            inputData.Params.push({
                                Key: 2,
                                Value: {
                                    // 'AppointmentStatus': 11,
                                    'My': false
                                }
                            }, );
                        }
                        if ($scope.currentfilter.consultationstatusid == 3) {
                            if ($scope.currentfilter.visitdate) {
                                var FrRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 00:00:00');
                                var ToRegDt = $filter('date')($scope.currentfilter.visitdate, 'yyyy-MM-dd 23:59:59');
                                inputData.Params.push({
                                    Key: 11,
                                    Value: [FrRegDt, ToRegDt]
                                })
                            }
                            inputData.Params.push({
                                Key: 2,
                                Value: {
                                    'AppointmentStatus': 11,
                                    'My': false
                                }
                            }, );
                        }
                    }
                    if ($scope.currentcontext.option == 'allcheckedin' || $scope.currentcontext.option == 'previouspatients') {
                        if ($scope.advancedfilter.DepartmentId > 0) {
                            inputData.Params.push({
                                Key: 12,
                                Value: $scope.advancedfilter.DepartmentId
                            });

                        }
                        if ($scope.advancedfilter.DoctorId > 0) {
                            inputData.Params.push({
                                Key: 13,
                                Value: $scope.advancedfilter.DoctorId
                            });

                        }
                        if ($scope.advancedfilter.TeamId > 0) {
                            inputData.Params.push({
                                Key: 14,
                                Value: $scope.advancedfilter.TeamId
                            });
                        }
                        if ($scope.advancedfilter.VisitTypeId > 0) {
                            inputData.Params.push({
                                Key: 15,
                                Value: $scope.advancedfilter.VisitTypeId
                            });
                        }
                    }
                    var options = {
                        action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getListCallback
                    };
                    utl.Http.doAction(options);
                } else if ($scope.currentcontext.option == 'previouspatients') {
                    var inputData = {
                        Params: [{
                                Key: 2,
                                Value: {
                                    'AppointmentStatus': 11,
                                    'My': true,
                                    'IsPreviousPatient': true
                                }
                            },
                            {
                                Key: 10,
                                Value: $scope.currentfilter.FacilityId
                            }
                        ],
                        PageContext: {
                            PageSize: vm.scheduledPatientGridConfig.pagerObj.pageSize,
                            PageNumber: vm.scheduledPatientGridConfig.pagerObj.currentPage
                        }
                    };
                    var options = {
                        action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getScheduledListCallback
                    };

                    utl.Http.doAction(options);
                } else if ($scope.currentcontext.option == 'scheduled') {
                    var inputData = {
                        Params: [{
                                Key: 5,
                                Value: $scope.currentcontext.DoctorId
                            },
                            {
                                Key: 8,
                                Value: utl.Formatter.getFilterDate($scope.currentfilter.visitdate)
                            },
                            {
                                Key: 16,
                                Value: $scope.currentfilter.patientname
                            },
                            {
                                Key: 2,
                                Value: $scope.currentfilter.FacilityId
                            },
                            {
                                Key: 7,
                                Value: 2
                            }, // Schedule only...
                        ],
                        PageContext: {
                            PageSize: vm.scheduledPatientGridConfig.pagerObj.pageSize,
                            PageNumber: vm.scheduledPatientGridConfig.pagerObj.currentPage
                        }
                    };
                    var options = {
                        action: 'appointment/Appointment/GetAppointments',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getScheduledListCallback
                    };

                    utl.Http.doAction(options);
                }

                $timeout(function () {
                    $('#patientname').focus();
                }, 1000);

            };

            function attentPatientCallback(scope, data, options, hasError) {
                // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                // $scope.getList();
                utl.Session.setEMRPatientId(options.data.Data.PatientId);
                $state.go('patientemr.emrdashboard', {
                    pid: options.data.Data.PatientId,
                    eid: options.data.Data.eid
                });

            };

            function attendPatientAfterConfirm(data) {
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

            function attendPatient(entity) {
                var data = entity.Patient;
                var patientName = data.FirstName;
                if (data.Title && data.Title.Description) {
                    patientName = data.Title.Description + ' ' + patientName;
                }
                if (data.LastName) {
                    patientName += ' ' + data.LastName;
                }
                if (entity.Encounter.VisitTypeId == 2) {
                    utl.Modal.open('app.patientvisit-details', {
                        params: {
                            aid: entity.AppointmentId,
                            pid: entity.PatientId,
                            eid: entity.EncounterId,
                            current_visit: entity
                        },
                        confirmCallback: $scope.onConfirmation
                    });
                } else {
                    if (entity.Encounter.IsPaidVisit && entity.Encounter.IsBillCompleted) {
                        var confirmOptions = {
                            headingKey: 'common.confirm-modal-header.lbl',
                            messageKey: 'registration.checkedinpatients.patient-attend-msg.lbl',
                            yesKey: 'common.yeskey.lbl',
                            noKey: 'common.notshownkey.lbl',
                            placeholder: {
                                patientname: patientName
                            },
                            onSuccessMethod: function () {
                                attendPatientAfterConfirm({
                                    PatientId: entity.PatientId,
                                    AppointmentId: entity.AppointmentId,
                                    Encounter: entity.Encounter
                                });
                            },
                            onErrorMethod: function () {
                                updateAppointmentStatus({
                                    PatientId: entity.PatientId,
                                    AppointmentId: entity.AppointmentId,
                                    Encounter: entity.Encounter
                                });
                                updateEncounterStatus({
                                    PatientId: entity.PatientId,
                                    AppointmentId: entity.AppointmentId,
                                    Encounter: entity.Encounter
                                });
                                updateEncounterDoctorStatus(entity);
                                getPatientBills({
                                    PatientId: entity.PatientId,
                                    Encounter: entity.Encounter
                                });
                                updateCheckoutStatus({
                                    PatientId: entity.PatientId,
                                    AppointmentId: entity.AppointmentId,
                                    Encounter: entity.Encounter
                                });
                            }
                        };
                        utl.Dialog.confirmMessageWithNoKeyMethod(confirmOptions);
                    } else {
                        utl.Alert.showErrorMsg($translate.instant('registration.checkedinpatients.consultation-alert-msg.lbl'));
                        return false;
                    }
                }
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
                    attendPatientAfterConfirm({
                        PatientId: confirmedentity.PatientId,
                        AppointmentId: confirmedentity.AppointmentId,
                        Encounter: confirmedentity.current_visit.Encounter
                    });
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

            function getPatientOrdersCallback(scope, res, options, hasError) {
                var pendingOrder = false;
                var orderNumber = '';
                if (res.Data.length > 0) {
                    for (var oidx in res.Data) {
                        var order = res.Data[oidx];
                    }
                }
            };

            function getPendingOrders(data) {
                var inputData = {
                    Params: [{
                            Key: 4,
                            Value: 1
                        },
                        {
                            Key: 2,
                            Value: data.PatientId
                        },
                        {
                            Key: 18,
                            Value: data.EncounterId
                        }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'emr/patientorder/GetPatientOrdersForApproval',
                    data: inputData,
                    type: 'post',
                    onComplete: getPatientOrdersCallback
                };

                utl.Http.doAction(options);
            };

            function patientTrackerCallback() {
                $scope.getList();
            }

            $scope.handleEvents = function (actionType, row) {
                if (actionType == 'emr') {
                    utl.Session.setEMRPatientId(row.entity.PatientId);
                    $state.go('patientemr.patientdashboard', {
                        eid: row.entity.EncounterId
                    });
                } else if (actionType == 'appointments') {
                    utl.Modal.open('app.appointment', {
                        params: {
                            id: 0,
                            pid: row.entity.PatientId
                        },
                        confirmCallback: $scope.getList
                    });
                } else if (actionType == 'attend') {
                    attendPatient({
                        PatientId: row.entity.PatientId,
                        AppointmentId: row.entity.AppointmentId,
                        Encounter: row.entity.Encounter
                    });
                    // attendPatient(row.entity);
                } else if (actionType == 'call') {
                    utl.Modal.open('app.appnmttoken', {
                        params: {
                            id: row.entity.AppointmentId,
                            pid: row.entity.PatientId,
                            eid: row.entity.Encounter.Id,
                            doctid: row.entity.DoctorId,
                            room: row.entity.Doctor.OPDRoomId
                        },
                        confirmCallback: $scope.getList
                    });
                } else if (actionType == 'checkout') {
                    /* getPendingOrders({ PatientId: row.entity.PatientId, EncounterId: row.entity.Encounter.Id }); */
                    handleCheckout(row.entity);
                } else if (actionType == 'preappoinments') {
                    utl.Modal.open('app.previousappointment', {
                        params: {
                            id: 0,
                            pid: row.entity.PatientId
                        },
                        confirmCallback: $scope.getList
                    });
                } else if (actionType == 'labresult') {
                    utl.Modal.open('patientemr.labresults', {
                        params: {
                            eid: row.entity.Encounter.Id,
                            pid: row.entity.PatientId
                        },
                        confirmCallback: $scope.getList
                    });
                } else if (actionType == 'ordertracker') {
                    utl.Modal.open('app.ordertracker', {
                        params: {
                            eid: row.entity.Encounter.Id,
                            pid: row.entity.PatientId
                        },
                        confirmCallback: $scope.getList
                    });
                } else if (actionType == 'recommend') {
                    utl.Modal.open('app.recommendation', {
                        params: {
                            eid: row.entity.Encounter.Id,
                            pid: row.entity.PatientId
                        },
                        confirmCallback: $scope.getList
                    });
                }
            };

            $scope.canShowAction = function (actionType, row) {
                if (actionType == 'waiting4u') {
                    var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                    return (row.entity.EncounterDoctorStatus == 1 && row.entity.DoctorId == currentDoctorId);
                } else if (actionType == 'waiting4others') {
                    var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                    return (row.entity.EncounterDoctorStatus == 1 && row.entity.DoctorId != currentDoctorId);
                } else if (actionType == 'attendbyu') {
                    var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                    return (row.entity.EncounterDoctorStatus == 2 && row.entity.DoctorId == currentDoctorId);
                } else if (actionType == 'attendbyothers') {
                    var currentDoctorId = parseInt(utl.Session.getCurrentUserId());
                    return (row.entity.EncounterDoctorStatus == 2 && row.entity.DoctorId != currentDoctorId);
                }
                return true;
            };

            vm.gridConfig = {
                columnDefs: [{
                    field: "Id",
                    name: 'Patient Details',
                    cellTemplate: 'checkedinPatientsTemplate.html'
                }],
                pagerObj: {
                    totalItems: 0,
                    currentPage: 1,
                    startIndex: 0,
                    pageSize: 25
                }
            };

            vm.scheduledPatientGridConfig = {
                columnDefs: [{
                    field: "Id",
                    name: 'Scheduled Patient Details',
                    cellTemplate: 'scheduledPatientsTemplate.html'
                }],
                pagerObj: {
                    totalItems: 0,
                    currentPage: 1,
                    startIndex: 0,
                    pageSize: 25
                }
            };

            $scope.lookupCallback = function (scope, data, options, hasError) {
                $scope.lookup = hasError ? {} : data;
                initDynamicForm()
                $scope.getList();
            };

            $scope.initLookup = function () {
                var inputData = [{
                        "Key": "ConsultationStatus"
                    },
                    {
                        "Key": "Department"
                    },
                    {
                        "Key": "VisitType"
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
                        "Key": "Team"
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

        checkedinPatientsController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

    })();