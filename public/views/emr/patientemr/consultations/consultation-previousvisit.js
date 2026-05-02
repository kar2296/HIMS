(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('consultationPreviousListController', consultationPreviousListController);

    function consultationPreviousListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
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
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -2),
            To: utl.Formatter.getCurrentDate()
        };
        console.log($stateParams);
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        $scope.currentcontext.previousencounterid = '';

        $scope.openDeptMappingTemplateCallback = function(scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                $scope.CreateMappingTemplate(res.Data[0].ProfileId);
            }
        };

        $scope.getPreviousVisitListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if (res.Data.length > 0) {
                $scope.currentcontext.previousencounterid = res.Data[0].EncounterId;
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        console.log($scope.currentfilter.encounter);
        $scope.getList = function() {
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.pid },
                    // { Key: 13, Value: $scope.currentcontext.eid },
                    {
                        Key: 7,
                        Value: FromDate
                    },
                    {
                        Key: 8,
                        Value: ToDate
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
            // if ($scope.currentfilter.encounter.IsLatest == true) {
            //     inputData.Params.push({
            //         Key: 13, Value: $scope.currentcontext.eid
            //     })
            // }
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPreviousVisitListCallback
            }

            utl.Http.doAction(options);
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
                    context: $scope.context,
                    prev_encounterid: $scope.currentcontext.previousencounterid
                },
                confirmCallback: $scope.getList
            });
        }

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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'emr/consultation/DeleteConsultation',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'view') {
                $state.go('patientemr.consultation', {
                    id: entity.Id,
                    context: $scope.context,
                    // eid: entity.EncounterId
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
                                <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-hide="entity.ProgressNoteStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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


        $scope.initLookup = function() {
            var inputData = [{
                "Key": "ProgressNoteStatus"
            }];

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

    consultationPreviousListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();