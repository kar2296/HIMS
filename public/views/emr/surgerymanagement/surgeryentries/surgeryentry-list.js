(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryEntryListController', SurgeryEntryListController);

    function SurgeryEntryListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
        }

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            pid: parseInt(utl.Session.getEMRPatientId())
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.lookup = {};
        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            DoctorId: -1,
            wardid: -1,
            ChiefSurgeonId: -1,
            statusid: 1,
            namemrn: '',
            // SurgeryEntryStatusId: 2,
            otregisteredon: utl.Formatter.getCurrentDate(),
            SurgeryRoomId: -1
        };




        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // var FrmDate = $filter('date')($scope.currentfilter.OTDate, 'yyyy-MM-dd 00:00:00');
            // var ToDate = $filter('date')($scope.currentfilter.OTDate, 'yyyy-MM-dd 23:59:59');
            var From = $filter('date')($scope.currentfilter.otregisteredon, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.otregisteredon, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.PatientNameMRN
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.SurgeryEntryStatusId
                    },
                    // {
                    //     Key: 9,
                    //     Value: FrmDate
                    // },
                    // {
                    //     Key: 10,
                    //     Value: ToDate
                    // },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.OTIdentifier
                    // },
                    // {
                    //     Key: 7,
                    //     Value: $scope.currentfilter.ProcedureId
                    // },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ChiefSurgeonId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.SurgeryRoomId
                    },
                    {
                        Key: 16,
                        Value: From
                    },
                    {
                        Key: 17,
                        Value: To
                    },
                    {
                        Key: 19,
                        Value: false
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if ($scope.context == 'emr' || $scope.currentcontext.ismodal == true)
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentcontext.pid
                });

            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.addNew = function () {
            $state.go('app.surgeryentry-form', {
                id: 0
            });
        };
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };

        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        };

        function patientPickerCallback(patientdata) {
            $state.go('app.otregistertab.otregister', {
                id: patientdata.pid
            });
        }
        $scope.backtoList = function () {
            $state.go('app.surgerydashboard')
        }
        $scope.pickPatient = function () {
            utl.Modal.open('app.patientpicker', {
                params: {},
                confirmCallback: patientPickerCallback
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'OtManagement/SurgeryEntry/DeleteSurgeryEntry',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                if ($scope.currentcontext.ismodal) {
                    utl.Modal.open('patientemr.otregister', {
                        params: {
                            id: entity.Id,
                            pid: entity.PatientId
                        }
                    });
                } else if ($scope.context == 'emr') {
                    $state.go('patientemr.otregister', {
                        id: entity.Id,
                        pid: entity.PatientId
                    });
                } else if ($scope.context == 'main') {
                    $state.go('app.surgeryentry-form', {
                        id: entity.Id,
                        eid: entity.EncounterId,
                        pid: entity.PatientId,
                        otidentifier: entity.OTIdentifier,
                        doctorid: entity.AdmissionDoctorId,
                        doctorname: entity.DoctorName,
                        wardid: entity.WardId,
                        roomid: entity.RoomId,
                        bedid: entity.BedId,
                        otroomid: entity.OTRoomId
                    });
                }
            }
            if (actionType == 'view') {
                if ($scope.currentcontext.ismodal) {
                    utl.Modal.open('patientemr.otregister', {
                        params: {
                            id: entity.Id,
                            pid: entity.PatientId
                        }
                    });
                } else if ($scope.context == 'emr') {
                    $state.go('patientemr.otregister', {
                        id: entity.Id,
                        pid: entity.PatientId
                    });
                } else if ($scope.context == 'main') {
                    $state.go('app.surgeryentry-form', {
                        id: entity.Id,
                        eid: entity.EncounterId,
                        pid: entity.PatientId
                    });
                }
            } else if (actionType == 'summary') {
                $state.go('surgeryentry.sugerypatientrecords', {
                    id: entity.Id,
                    pid: entity.PatientId,
                    eid: entity.EncounterId
                })
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GuarantorName);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            }
        };

        var OTStartedate = {
            field: "SurgeryStartedate",
            displayName: $translate.instant('Surgery Date & Time'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span>{{entity.SurgeryStartedate | date:'dd-MMM-yyyy'}}</span>" + " " + "<span>{{entity.SurgeryStartedate| date:'HH:mm'}}</span>" + " - " +
                "<span>{{entity.SurgeryEndDate| date:'HH:mm'}}</span>" + " " +
                "</div>"
        };

        var OTIdentifier = {
            field: "SurgeryIdentifier",
            displayName: $translate.instant('otregister-list.otnumber.lbl')
        };

        var Patient = {
            field: "Patient",
            displayName: $translate.instant('admissions.patientname.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
                "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                "{{entity.Patient.Title.Description}}&nbsp;</span>" +
                "<span >{{entity.Patient.FirstName}}&nbsp;</span>" +
                "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                "<span >/</span>" +
                "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                "<span >/<span>" +
                "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                "<span >/</span>" +
                "<span >{{entity.Patient.Gender.Description}}</span>" +
                "</a></div>"
        };
        var Roomdetails = {
            field: "Roomdetails",
            displayName: $translate.instant('otrequest-list.roomdetails.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span  ng-if='entity.WardMaster'>{{entity.WardMaster.WardName}} </span>" +
                "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo}} </span>" +
                "<span  ng-if='entity.WardRoomBedMaster'>/</span>" +
                "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                "</div>"
        };
        var Surgeon = {
            field: "Surgeon",
            displayName: $translate.instant('otregister-form.chiefsurgeon.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ entity.ChiefSurgeon.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{entity.ChiefSurgeon.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{entity.ChiefSurgeon.LastName}}</span>' + '</div>'
        };

        var OTRoom = {
            field: "SurgeryRoomMaster.Name",
            displayName: $translate.instant('otregister-list.otrooms.lbl'),
        };

        // var Procedure = {
        //     field: "Procedure.ProcedureName",
        //     displayName: $translate.instant('otrequest-list.surgeryname.lbl'),
        // };

        var Status = {
            field: "SurgeryEntryStatus.Description",
            displayName: $translate.instant('otregister-list.status.lbl')
        };
        var AnaesthesiaType = {
            field: "AnaesthesiaType.Description",
            displayName: $translate.instant('otregister-form.anesthesiatype.lbl')
        };
        var Anaesthesist = {
            field: "Anaesthesist",
            displayName: $translate.instant('otregister-form.anaesthetist.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ entity.Anaesthesist.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{entity.Anaesthesist.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{entity.Anaesthesist.LastName}}</span>' + '</div>'
        };
        var action = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                          <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                          <span class="grid-action" ng-click="handleEvents(\'summary\',entity)"ng-show="entity.SurgeryEntryStatusId == 2 || entity.SurgeryEntryStatusId == 3"> <img src="assets/svg/summary.svg" alt=""></span>\
                          <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.SurgeryEntryStatusId==1"> <img src="assets/svg/delete.svg" alt=""></span>\
                      </div>',
            handleEvent: $scope.handleEvents,
        }

        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     columnDefs: [OTStartedate, OTIdentifier, Patient, Roomdetails, Surgeon, OTRoom, Procedure, Anaesthesist, Status, action],
        //     pagerObj: {
        //         totalItems: 0,
        //         currentPage: 1,
        //         startIndex: 0,
        //         pageSize: 25
        //     }
        // };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [OTStartedate, OTIdentifier, Patient, Roomdetails, OTRoom, Anaesthesist, Status, action],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        if ($scope.context == 'emr' || $scope.currentcontext.ismodal) {
            vm.gridConfig.columnDefs = [];
            vm.gridConfig.columnDefs.push(OTStartedate, OTIdentifier, Surgeon, AnaesthesiaType, Anaesthesist, OTRoom, Procedure, Status, action);
        }

        vm.procedurecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Procedure Name',
                    field: 'ProcedureName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/procedure/GetProcedures',
            formatdisplay: formatselectedprocedure,
            presearch: presearchprocedure,
            postsearch: postsearchprocedure
        };

        function formatselectedprocedure() {
            var selectedItem = vm.procedurecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ProcedureName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.procedurecontrolconfig.rowdata) {
                result = [vm.procedurecontrolconfig.rowdata.Code, vm.procedurecontrolconfig.rowdata.ProcedureName].join(' ');
            }
            $scope.item.ProcedureName = result;

            return result;
        }

        function presearchprocedure() {
            var query = vm.procedurecontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 9,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.procedurecontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.procedurecontrolconfig.searchparams = inputData;
        }

        function postsearchprocedure() {
            for (var idx in vm.procedurecontrolconfig.result) {
                var item = vm.procedurecontrolconfig.result[idx];
                item.ProcedureId = item.Code;
                item.ProcedureName = item.ProcedureName;
            }
        }

        $scope.onEnter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ProcedureId = -1;
                $scope.getList();
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function setDefaults() {
            var DraftId = utl.Lookup.getDefault($scope.lookup.SurgeryEntryStatus, 'Draft');
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.SurgeryEntryStatus, 'Approved');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.SurgeryEntryStatus, 'Completed');
            var CompletedId = utl.Lookup.getDefault($scope.lookup.SurgeryEntryStatus, 'Cancelled');
            $scope.currentfilter.SurgeryEntryStatusId = DraftId + "," + ApprovedId;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    'Key': 'Facility'
                },
                {
                    'Key': 'SurgeryEntryStatus',
                    Default: false
                },
                {
                    'Key': 'Ward'
                },
                {
                    'Key': 'SurgeryRoom'
                },
                {
                    "Key": "Room",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: 3
                        }]
                    }
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                                Key: 3,
                                Value: 2
                            },
                            {
                                Key: 5,
                                Value: 2
                            },
                            {
                                Key: 2,
                                Value: [-1, $scope.currentfilter.facilityid]
                            }
                        ]
                    }
                },
                // {
                //     "Key": "Doctor",
                //     Request: {
                //         Params: [{
                //             Key: 12,
                //             Value: true
                //         }]
                //     }
                // },
                // {
                //     "Key": "Procedure"
                // }
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

    SurgeryEntryListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig', '$timeout'];

})();