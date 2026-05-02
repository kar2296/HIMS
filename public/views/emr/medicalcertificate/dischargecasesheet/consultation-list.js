(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtconsultationListController', discasshtconsultationListController);

    function discasshtconsultationListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.gridData = [];
        $scope.currentfilter = {
            ProgressNoteStatusId: -1,
            encounter: utl.Session.getPatientEncounter(),
            fromdate: '',
            todate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            consultationcomparelist: []
        };
        if ($scope.currentfilter.encounter) {
            $scope.currentcontext.pid = $scope.currentfilter.encounter.PatientId;
            $scope.currentcontext.eid = $scope.currentfilter.encounter.Id
        }

        //below session value is used for rheumatology
        utl.Session.set('patient-rheumatology-id', 0);
        utl.Session.set('consultation-id', 0);

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            if (modalConfig.params.pid) {
                $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
                $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            }

        }


        $scope.openDeptMappingTemplateCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var DischargeProfileid = $scope.getProfileId();
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    if (DischargeProfileid == item.ProfileId) {
                        $scope.CreateMappingTemplate(DischargeProfileid);
                    }
                }
            }
        };

        $scope.openDeptMappingTemplate = function () {
            if ($scope.currentfilter &&
                $scope.currentfilter.encounter) {
                var inputData = {
                    Params: [{
                            Key: 4,
                            Value: utl.Session.getCurrentDepartmentId()
                        },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.encounter.VisitTypeId
                        },
                        {
                            Key: 8,
                            Value: 1
                        },
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'clinicalmaster/ProfileUser/GetProfileUsers',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.openDeptMappingTemplateCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getProfileId = function () {
            var ProfilemasterTypeId = 2; // discharge summary
            for (var idx in $scope.lookup.Profile) {
                var item = $scope.lookup.Profile[idx];
                if (item.ProfilemasterTypeId == ProfilemasterTypeId) {
                    return item.Id;
                }
            }
            return -1;
        };



        $scope.openUserMappingTemplateCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var DischargeProfileid = $scope.getProfileId();
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    if (DischargeProfileid == item.ProfileId) {
                        $scope.CreateMappingTemplate(DischargeProfileid);
                    }
                }
            } else {
                $scope.openDeptMappingTemplate();
            }
        };

        $scope.CreateMappingTemplateCallback = function (scope, res, options, hasError) {
            if (res) {
                var Id = res;
                $state.go('patientemr.dischargecasesheet', {
                    id: Id
                });
            }
        };

        $scope.CreateMappingTemplate = function (ProfileId) {
            var item = {
                ConsultationDate: utl.Formatter.getCurrentDate(),
                PatientId: parseInt(utl.Session.getEMRPatientId()),
                EncounterId: $scope.currentcontext.eid,
                EncounterDoctorId: $scope.currentfilter.encounter.DoctorId,
                ProgressNoteStatusId: 1,
                VisitTypeId: $scope.currentfilter.encounter.VisitTypeId,
                ProfileId: ProfileId
            };
            var actionName = 'emr/consultation/AddConsultation';
            var options = {
                action: actionName,
                data: {
                    Data: item
                },
                type: 'post',
                onComplete: $scope.CreateMappingTemplateCallback
            };
            utl.Http.doAction(options);
        };

        $scope.openUserMappingTemplate = function () {
            if ($scope.currentfilter &&
                $scope.currentfilter.encounter) {
                var inputData = {
                    Params: [{
                            Key: 5,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.encounter.VisitTypeId
                        },
                        {
                            Key: 8,
                            Value: 1
                        },
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'clinicalmaster/ProfileUser/GetProfileUsers',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.openUserMappingTemplateCallback
                };

                utl.Http.doAction(options);
            }
        };

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            var consultationList = res.Data;
            console.log(consultationList);
            if (res && res.Data && res.Data.length == 0) {
                $scope.openUserMappingTemplate();
            }
        };

        $scope.getList = function () {
            var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.EncounterDoctorId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ProgressNoteStatusId
                    },
                    {
                        Key: 7,
                        Value: fromdate
                    },
                    {
                        Key: 8,
                        Value: todate
                    },
                    {
                        Key: 11,
                        Value: 2
                    },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.compareConsultation = function () {
            $state.go('patientemr.discasshtconsultationcompare', {
                cids: JSON.stringify($scope.currentcontext.consultationcomparelist)
            });
        };

        $scope.consultationCompareSelection = function (consultation) {
            var compareList = $scope.currentcontext.consultationcomparelist;
            if (compareList.includes(consultation.Id)) {
                var idx = compareList.indexOf(consultation.Id);
                compareList.splice(idx, 1);
                consultation.isSelected = false;
            } else {
                if (compareList.length <= 2) {
                    consultation.isSelected = true;
                    compareList.push(consultation.Id);
                } else {
                    consultation.isSelected = false;
                }
            }
        };

        $scope.disableCompareListSelection = function (consultation) {
            if ($scope.currentcontext.consultationcomparelist.length < 3 || consultation.isSelected) {
                return false;
            } else {
                return true;
            }
        }

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        $scope.addNew = function () {
            utl.Modal.open('patientemr.discstconsultationform', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.printConsultation = function (entity) {

            console.log(entity);
            // return;
            var inputData = {
                Id: parseInt(entity.Id),
                Data: {
                    PatientId: entity.PatientId,
                    EncounterId: entity.EncounterId,
                    ConsultationId: entity.Id
                }
            };
            var options = {
                action: 'emr/consultation/PrintDischargeCasesheet',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/consultation/DeleteConsultation',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        //Grid Actions

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('patientemr.dischargecasesheet', {
                    id: entity.Id
                });
                utl.Session.set('consultation-id', entity.Id);
                if ($scope.currentcontext.ismodal) {
                    $state.go('patientemr.dischargecasesheet', {
                        id: entity.Id
                    });
                    $scope.confirmCallback();
                }
            } else if (actionType == 'reviewnote') {
                utl.Modal.open('patientemr.dischargecasesheet', {
                    params: {
                        cid: entity.Id,
                        pid: $scope.currentcontext.pid,
                        id: entity.Id
                    }
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'print') {
                $scope.printConsultation(entity);
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "CreatedAt",
                    displayName: $translate.instant('patientemr.dischargecasesheetlist.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('patientemr.dischargecasesheetlist.doa.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DischargeDate",
                    displayName: $translate.instant('patientemr.dischargecasesheetlist.dod.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DischargeType.Description",
                    displayName: $translate.instant('patientemr.dischargecasesheetlist.dischargetype.lbl')
                },
                {
                    field: "Doctor",
                    displayName: $translate.instant('Doctor Name')
                },
                {
                    field: "ProfileMaster.Name",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.notesname.lbl')
                },
                {
                    field: "ProgressNoteStatus.Description",
                    displayName: $translate.instant('Status')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><i class="fas fa-procedures" uib-tooltip="Discharge Notes"></i></span>\
                            <span class="grid-action" ng-click="handleEvents(\'reviewnote\',entity)" ><i class="icofont-patient-file"  uib-tooltip="Summary Notes"></i></span>\
                            <span class="grid-action" ng-click="handleEvents(\'print\',entity)"><i class="fa fa-print" aria-hidden="true"></i></span>\
                           </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }

        };
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'EncounterDoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.EncounterDoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.currentfilter.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.EncounterDoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }



        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ProgressNoteStatus"
                },
                {
                    "Key": "Profile"
                }
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

    discasshtconsultationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();