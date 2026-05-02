(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('consultationCurrentListController', consultationCurrentListController);

    function consultationCurrentListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
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
        $scope.lookup = {};
        $scope.currentfilter = {
            ProgressNoteStatusId: -1,
            encounter: utl.Session.getPatientEncounter(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        $scope.count = 0;
        console.log($stateParams);
        // console.log($scope.currentfilter);return;
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.doctor)
            $scope.currentcontext.doctor = $stateParams.doctor;

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        console.log(parseInt(utl.Session.getEncounterId()));
        $scope.openDeptMappingTemplateCallback = function(scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                $scope.CreateMappingTemplate(res.Data[0].ProfileId);
            }
        };

        $scope.getCurrentVisitListCallback = function(scope, res, options, hasError) {

            if (res.Data.length == 0) {
                if ($stateParams.type == 'attend') {

                    if ($scope.count == 0) {
                        $scope.addNew();
                    }

                }
            }
            $scope.count++;
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function() {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentcontext.doctor
                    // },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 7,
                        Value: FromDate
                    },
                    {
                        Key: 8,
                        Value: ToDate
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.ProfileId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            }
            if ($scope.context == 'emr') {
                inputData.Params.push({
                    Key: 11,
                    Value: 1
                })
            }
            if ($scope.context == 'ipemr') {
                inputData.Params.push({
                    Key: 11,
                    Value: 3
                })
            }
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCurrentVisitListCallback
            }
            if ($scope.currentcontext.eid > 0) {
                utl.Http.doAction(options);
            }

        };

        $scope.openDeptMappingTemplate = function() {
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
                        PageSize: 1,
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

        $scope.openUserMappingTemplateCallback = function(scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                $scope.CreateMappingTemplate(res.Data[0].ProfileId);
            } else {
                $scope.openDeptMappingTemplate();
            }
        };

        $scope.CreateMappingTemplateCallback = function(scope, res, options, hasError) {
            if (res) {
                var Id = res;
                $state.go('patientemr.consultation', {
                    id: Id
                });
            }
        };

        $scope.CreateMappingTemplate = function(ProfileId) {
            var item = {
                ConsultationDate: utl.Formatter.getCurrentDate(),
                PatientId: parseInt(utl.Session.getEMRPatientId()),
                EncounterId: $scope.currentcontext.eid,
                EncounterDoctorId: $scope.currentfilter.encounter.DoctorId,
                ClaimProcessId: $scope.currentfilter.encounter.ClaimProcessId,
                ClaimNumber: $scope.currentfilter.encounter.ClaimNumber,
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

        $scope.openUserMappingTemplate = function() {
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
                        PageSize: 1,
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

        // //getList
        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        //     vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        //     var consultationList = res.Data;
        //     console.log(consultationList);
        //     if (res && res.Data && res.Data.length == 0) {
        //         $scope.openUserMappingTemplate();
        //     }
        // };

        // $scope.getList = function () {
        //     var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
        //     var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
        //     var inputData = {
        //         Params: [{
        //                 Key: 2,
        //                 Value: $scope.currentcontext.eid
        //             },
        //             {
        //                 Key: 3,
        //                 Value: $scope.currentcontext.pid
        //             },
        //             {
        //                 Key: 4,
        //                 Value: $scope.currentfilter.EncounterDoctorId
        //             },
        //             {
        //                 Key: 5,
        //                 Value: $scope.currentfilter.ProgressNoteStatusId
        //             },
        //             {
        //                 Key: 7,
        //                 Value: fromdate
        //             },
        //             {
        //                 Key: 8,
        //                 Value: todate
        //             },
        //             {
        //                 Key: 11,
        //                 Value: 1
        //             },
        //         ],
        //         PageContext: {
        //             PageSize: 100,
        //             PageNumber: 1
        //         }
        //     };

        //     var options = {
        //         action: 'emr/consultation/GetConsultations',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getListCallback
        //     };

        //     utl.Http.doAction(options);
        // };

        $scope.compareConsultation = function() {
            $state.go('patientemr.consultationcompare', {
                cids: JSON.stringify($scope.currentcontext.consultationcomparelist)
            });
        };
        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        };
        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        };
        $scope.currentpatient = function() {
            $state.go('app.bedmanagementtab.inpatient');
        };

        $scope.consultationCompareSelection = function(consultation) {
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

        $scope.disableCompareListSelection = function(consultation) {
            if ($scope.currentcontext.consultationcomparelist.length < 3 || consultation.isSelected) {
                return false;
            } else {
                return true;
            }
        }

        $scope.addNew = function() {
            utl.Modal.openFixedDialog('patientemr.consultationtab.consultationform', {
                params: {
                    id: 0,
                    eid: $scope.currentcontext.eid,
                    doctor: $scope.currentcontext.doctor,
                    context: $scope.context
                },
                confirmCallback: $scope.getList
            });
        }


        // $scope.addNew = function () {
        //     utl.Modal.open('patientemr.consultationform', {
        //         params: {
        //             id: 0
        //         },
        //         confirmCallback: $scope.getList
        //     });
        // }

        //Grid Actions

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



        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/consultation/DeleteConsultation',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'view') {
                $state.go('patientemr.consultation', {
                    id: entity.Id,
                    context: $scope.context
                });
                utl.Session.set('consultation-id', entity.Id);
                if ($scope.currentcontext.ismodal) {
                    $state.go('patientemr.consultation', {
                        id: entity.Id
                    });
                    $scope.confirmCallback();
                }
            } else if (actionType == 'reviewnote') {
                utl.Modal.open('patientemr.reviewnotes', {
                    params: {
                        cid: entity.Id,
                        context: $scope.context,
                        pid: $scope.currentcontext.pid
                    }
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
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
                    displayName: $translate.instant('inventory.grns.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Encounter.VisitType.Description",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.visittype.lbl')
                },
                {
                    field: "ProfileMaster.Name",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.notesname.lbl')
                },
                // {
                //     field: "FirstName",
                //     displayName: $translate.instant('ordermanagement.orderacknowledgement-list.doctorname.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">{{entity.Encounter.DoctorName}}</div>'
                // },
                {
                    field: "Doc",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.doctorname.lbl'),
                    cellTemplate: "<div><span >{{entity.Doc.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doc.FirstName}}&nbsp;</span>" +
                        "</div>",
                },
                {
                    field: "ProgressNoteStatus.Description",
                    displayName: $translate.instant('Status')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents emr-flex">\
                                <span class="grid-action" uib-tooltip="View" tooltip-placement="bottom" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                <span class="grid-action" uib-tooltip="Summary" tooltip-placement="bottom" ng-click="handleEvents(\'reviewnote\',entity)" ><i class="fas fa-clipboard-list"></i></span>\
                                <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ProgressNoteStatusId==1" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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

        $scope.getOpProfileCallback = function(scope, res, options, hasError) {
            $scope.lookup.SelectedProfile = res.Data;
        };

        $scope.getOpProfile = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                ],
            };
            var options = {
                action: 'clinicalmaster/ProfileMaster/GetProfileMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOpProfileCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getIpProfileCallback = function(scope, res, options, hasError) {
            $scope.lookup.SelectedProfile = res.Data;
        };

        $scope.getIpProfile = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                ],
            };
            var options = {
                action: 'clinicalmaster/ProfileMaster/GetProfileMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getIpProfileCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getEmergencyProfileCallback = function(scope, res, options, hasError) {
            $scope.lookup.SelectedProfile = res.Data;
        };

        $scope.getEmergencyProfile = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 6
                    },
                    {
                        Key: 3,
                        Value: 2
                    },
                ],
            };
            var options = {
                action: 'clinicalmaster/ProfileMaster/GetProfileMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEmergencyProfileCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                $scope.lookup.SelectedProfile = [];
                if (key == 'Profile') {
                    if ($scope.context == 'emr') {
                        $scope.getOpProfile();
                    }
                    if ($scope.context == 'ipemr') {
                        $scope.getIpProfile();
                    }
                    if ($scope.context == 'aeemr') {
                        $scope.getEmergencyProfile();
                    }
                }
            });
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "ProgressNoteStatus"
                },
                {
                    "Key": "Profile",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
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

    consultationCurrentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();