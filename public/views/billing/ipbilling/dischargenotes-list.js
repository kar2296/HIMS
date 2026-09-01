(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('dischargenoteListController', dischargenoteListController);

    function dischargenoteListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
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
            // fromdate: '',
            fromdate: utl.Formatter.getCurrentDate(),
            todate: utl.Formatter.getCurrentDate(),
            DoctorId: -1
        };

        $scope.currentcontext = {
        };
        // $scope.currentcontext = {
        //     ismodal: modalConfig && modalConfig.params ? true : false,
        //     consultationcomparelist: []
        // };
        if ($scope.currentfilter.encounter) {
            $scope.currentcontext.pid = $scope.currentfilter.encounter.PatientId;
            $scope.currentcontext.eid = $scope.currentfilter.encounter.Id
        }

        //below session value is used for rheumatology
        // utl.Session.set('patient-rheumatology-id', 0);
        // utl.Session.set('consultation-id', 0);

        // if (modalConfig && modalConfig.params) {
        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        //     if (modalConfig.params.pid) {
        //         $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        //         $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        //     }

        // }


        // $scope.openDeptMappingTemplateCallback = function (scope, res, options, hasError) {
        //     if (res && res.Data && res.Data.length > 0) {
        //         var DischargeProfileid = $scope.getProfileId();
        //         for (var idx in res.Data) {
        //             var item = res.Data[idx];
        //             if (DischargeProfileid == item.ProfileId) {
        //                 $scope.CreateMappingTemplate(DischargeProfileid);
        //             }
        //         }
        //     }
        // };

        // $scope.openDeptMappingTemplate = function () {
        //     if ($scope.currentfilter &&
        //         $scope.currentfilter.encounter) {
        //         var inputData = {
        //             Params: [{
        //                     Key: 4,
        //                     Value: utl.Session.getCurrentDepartmentId()
        //                 },
        //                 {
        //                     Key: 6,
        //                     Value: $scope.currentfilter.encounter.VisitTypeId
        //                 },
        //                 {
        //                     Key: 8,
        //                     Value: 1
        //                 },
        //             ],
        //             PageContext: {
        //                 PageSize: 100,
        //                 PageNumber: 1
        //             }
        //         };

        //         var options = {
        //             action: 'clinicalmaster/ProfileUser/GetProfileUsers',
        //             data: inputData,
        //             type: 'post',
        //             onComplete: $scope.openDeptMappingTemplateCallback
        //         };

        //         utl.Http.doAction(options);
        //     }
        // };

        // $scope.getProfileId = function () {
        //     var ProfilemasterTypeId = 2; // discharge summary
        //     for (var idx in $scope.lookup.Profile) {
        //         var item = $scope.lookup.Profile[idx];
        //         if (item.ProfilemasterTypeId == ProfilemasterTypeId) {
        //             return item.Id;
        //         }
        //     }
        //     return -1;
        // };



        // $scope.openUserMappingTemplateCallback = function (scope, res, options, hasError) {
        //     if (res && res.Data && res.Data.length > 0) {
        //         var DischargeProfileid = $scope.getProfileId();
        //         for (var idx in res.Data) {
        //             var item = res.Data[idx];
        //             if (DischargeProfileid == item.ProfileId) {
        //                 $scope.CreateMappingTemplate(DischargeProfileid);
        //             }
        //         }
        //     } else {
        //         $scope.openDeptMappingTemplate();
        //     }
        // };

        // $scope.CreateMappingTemplateCallback = function (scope, res, options, hasError) {
        //     if (res) {
        //         var Id = res;
        //         $state.go('patientemr.dischargecasesheet', {
        //             id: Id
        //         });
        //     }
        // };

        // $scope.CreateMappingTemplate = function (ProfileId) {
        //     var item = {
        //         ConsultationDate: utl.Formatter.getCurrentDate(),
        //         PatientId: parseInt(utl.Session.getEMRPatientId()),
        //         EncounterId: $scope.currentcontext.eid,
        //         EncounterDoctorId: $scope.currentfilter.encounter.DoctorId,
        //         ProgressNoteStatusId: 1,
        //         VisitTypeId: $scope.currentfilter.encounter.VisitTypeId,
        //         ProfileId: ProfileId
        //     };
        //     var actionName = 'emr/consultation/AddConsultation';
        //     var options = {
        //         action: actionName,
        //         data: {
        //             Data: item
        //         },
        //         type: 'post',
        //         onComplete: $scope.CreateMappingTemplateCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        // $scope.openUserMappingTemplate = function () {
        //     if ($scope.currentfilter &&
        //         $scope.currentfilter.encounter) {
        //         var inputData = {
        //             Params: [{
        //                     Key: 5,
        //                     Value: utl.Session.getCurrentUserId()
        //                 },
        //                 {
        //                     Key: 6,
        //                     Value: $scope.currentfilter.encounter.VisitTypeId
        //                 },
        //                 {
        //                     Key: 8,
        //                     Value: 1
        //                 },
        //             ],
        //             PageContext: {
        //                 PageSize: 100,
        //                 PageNumber: 1
        //             }
        //         };

        //         var options = {
        //             action: 'clinicalmaster/ProfileUser/GetProfileUsers',
        //             data: inputData,
        //             type: 'post',
        //             onComplete: $scope.openUserMappingTemplateCallback
        //         };

        //         utl.Http.doAction(options);
        //     }
        // };

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.refreshReactProps();
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            var consultationList = res.Data;
            console.log(consultationList);
            if (res && res.Data && res.Data.length == 0) {
                $scope.openUserMappingTemplate();
            }
        };

        $scope.getList = function () {

            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.fromdate,
                $scope.currentfilter.todate
            );
            if (!(resultInHours >= 0 && resultInHours <= 168)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should not be more than a week... Please Search by Name");
                $scope.currentfilter.fromdate = utl.Formatter.getCurrentDate();
                // $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                // $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                return false;
            }
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
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ProgressNoteStatusId
                    },
                    // {
                    //     Key: 7,
                    //     Value: fromdate
                    // },
                    // {
                    //     Key: 8,
                    //     Value: todate
                    // },
                    {
                        Key: 11,
                        Value: 2
                    },
                    // {
                    //     Key: 11,
                    //     Value: $scope.currentfilter.PatientMRN
                    // },
                    {
                        Key: 15,
                        Value: $scope.currentfilter.PatientMRN
                    },
                    {
                        Key: 16,
                        Value: $scope.currentfilter.IPNumber
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            if (!$scope.currentfilter.PatientMRN && !$scope.currentfilter.IPNumber) {
                inputData.Params.push({
                    Key: 7,
                    Value: fromdate
                },
                {
                    Key: 8,
                    Value: todate
                }
            )
            }
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getDateDiffInHours = function(Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

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



        //React bridge: <custom-table config="vm.gridConfig"> renders through the
        //shared BridgeGridScreen. This screen has no live <ui-select>. Both row
        //actions dispatch into the existing unchanged $scope.handleEvents, so
        //reviewnote (Summary Notes) and print keep running from the controller
        //with the same entity. The third action in the original cellTemplate
        //('edit' -> Discharge Notes) is commented out and stays that way.
        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (actionType == 'rowAction') { $scope.handleEvents(payload.key, entity); }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function dt(v, f) { return v ? $filter('date')(v, f) : ''; }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: '__sno', header: hdr(0), width: '60px' },
                        { key: 'date', header: hdr(1) },
                        { key: 'patientname', header: hdr(2) },
                        { key: 'mrn', header: hdr(3), sortable: true },
                        { key: 'ipno', header: hdr(4), sortable: true },
                        { key: 'doa', header: hdr(5) },
                        { key: 'dod', header: hdr(6) },
                        { key: 'dischargetype', header: hdr(7), sortable: true },
                        { key: 'doctor', header: hdr(8), sortable: true },
                        { key: 'notesname', header: hdr(9), sortable: true },
                        { key: 'status', header: hdr(10), sortable: true }
                    ],
                    actionsHeader: hdr(11) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        var p = entity.Patient || {};
                        return {
                            id: entity.Id,
                            actions: [
                                { key: 'reviewnote', label: '', icon: 'fas fa-file-medical', variant: 'icon', title: 'Summary Notes' },
                                { key: 'print', label: '', icon: 'fa fa-print', variant: 'icon', title: 'Print' }
                            ],
                            cells: {
                                date: dt(entity.CreatedAt, 'dd-MMM-yyyy') + ' ' + dt(entity.CreatedAt, 'HH:mm'),
                                //PRE-EXISTING QUIRK: this cell reads Patient.firstname /
                                //Patient.lastname (lowercase), which do not match the
                                //API's FirstName/LastName casing, so the name renders as
                                //just the title today. Reproduced exactly.
                                patientname: ((p.Title && p.Title.Description ? p.Title.Description + ' ' : '') + (p.firstname || '') + ' ' + (p.lastname || '')).replace(/\s+/g, ' ').trim(),
                                mrn: p.MRN,
                                ipno: entity.Encounter && entity.Encounter.VisitIdentifier,
                                doa: dt(entity.AdmissionDate, 'dd-MMM-yyyy') + ' ' + dt(entity.AdmissionDate, 'HH:mm'),
                                dod: dt(entity.DischargeDate, 'dd-MMM-yyyy') + ' ' + dt(entity.DischargeDate, 'HH:mm'),
                                dischargetype: entity.DischargeType && entity.DischargeType.Description,
                                doctor: entity.Doctor,
                                notesname: entity.ProfileMaster && entity.ProfileMaster.Name,
                                status: entity.ProgressNoteStatus && entity.ProgressNoteStatus.Description
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
        };

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
                    field: "PatientName",
                    displayName: $translate.instant('Patient Name'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.Title.Description}}&nbsp;</span>" + "<span >{{entity.Patient.firstname}}&nbsp;</span>" + "<span >{{entity.Patient.lastname}}</span>" + "</div>"
                },
                {
                    field: "Patient.MRN",
                    displayName: $translate.instant('MRN')
                },
                {
                    field: "Encounter.VisitIdentifier",
                    displayName: $translate.instant('IP Number')
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
                            <!--<span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><i class="fas fa-procedures" uib-tooltip="Discharge Notes"></i></span>-->\
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

        $scope.refreshReactProps();
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

    //     $scope.Items = [];
    //     $scope.items = {};
    //     $scope.item = {
    //         receiptdate: utl.Formatter.getCurrentDate(),
    //         ToBeCancelBillId: -1,
    //         EncounterId: -1,
    //         BedId: -1,
    //     };

    //     $scope.currentfilter = {
    //         WardId: -1,
    //         PatientMRN: '',
    //         BillNumber: '',
    //         VisitIdentifier: '',
    //         AdmissionStatusId: -1,
    //         FacilityId: utl.Session.getCurrentFacilityId(),
    //         fromdate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), -3),
    //         // fromdate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), -15),
    //         todate: utl.Formatter.getCurrentDate(),
    //         ISDue: '',
    //         IsPaidFully: [0, 1]
    //     };
    //     // let year = new Date($scope.currentfilter.fromdate).getFullYear();
    //     // let month = new Date($scope.currentfilter.fromdate).getMonth();
    //     // let day = new Date($scope.currentfilter.fromdate).getDate();
    //     // let fromdate = day + '/' + month + '/' + year;
    //     // $scope.currentfilter.fromdate=fromdate;
    //     console.clear();
    //     console.log($scope.currentfilter);
    //     if ($stateParams.context) {
    //         $scope.Context = $stateParams.context;
    //     }
    //     $scope.backtoList = function() {
    //         $state.go('app.billingsdashboard');
    //     };
    //     $scope.currentcontext = {};

    //     function initDynamicForm() {
    //         $scope.advancedfilter = {};

    //         $scope.advancedfilterDefault = {
    //             DepartmentId: -1,
    //             DoctorId: -1,
    //             GuarantorTypeId: -1,
    //             GuarantorId: -1,
    //             DOD: utl.Formatter.getCurrentDate()
    //         };

    //         $scope.advancedFilterSchema = {
    //             layout: 'grid',
    //             title: 'common.advancedfilter-title.lbl',
    //             controls: [{
    //                     type: 'date',
    //                     translate: 'billing.dischargedpatients.doa.lbl',
    //                     model: 'DOA',
    //                     position: {
    //                         r: 0,
    //                         c: 0
    //                     }
    //                 },
    //                 {
    //                     type: 'date',
    //                     translate: 'billing.dischargedpatients.dod.lbl',
    //                     model: 'DOD',
    //                     position: {
    //                         r: 0,
    //                         c: 1
    //                     }
    //                 },
    //                 {
    //                     type: 'text',
    //                     translate: 'billing.inpatients.phone.lbl',
    //                     model: 'Phone',
    //                     position: {
    //                         r: 1,
    //                         c: 0
    //                     }
    //                 },
    //                 {
    //                     type: 'select',
    //                     translate: 'billing.inpatients.guarantor.lbl',
    //                     model: 'GuarantorId',
    //                     options: $scope.lookup.Guarantor,
    //                     position: {
    //                         r: 1,
    //                         c: 1
    //                     }
    //                 },
    //                 {
    //                     type: 'select',
    //                     translate: 'billing.inpatients.guarantortype.lbl',
    //                     model: 'GuarantorTypeId',
    //                     options: $scope.lookup.GuarantorType,
    //                     position: {
    //                         r: 2,
    //                         c: 0
    //                     }
    //                 },
    //                 {
    //                     type: 'select',
    //                     translate: 'billing.inpatients.admittingdoctors.lbl',
    //                     model: 'DoctorId',
    //                     options: $scope.lookup.Doctor,
    //                     position: {
    //                         r: 2,
    //                         c: 1
    //                     }
    //                 },
    //                 {
    //                     type: 'select',
    //                     translate: 'billing.inpatients.department.lbl',
    //                     model: 'DepartmentId',
    //                     options: $scope.lookup.Department,
    //                     position: {
    //                         r: 3,
    //                         c: 0
    //                     }
    //                 },
    //                 {
    //                     type: 'checkbox',
    //                     translate: 'billing.inpatients.department.lbl',
    //                     model: 'IsOutstanding',
    //                     position: {
    //                         r: 3,
    //                         c: 1
    //                     }
    //                 }
    //             ],
    //             actions: [{
    //                     type: 'apply',
    //                     translate: 'common.applyaction.lbl',
    //                     cls: 'btn-primary'
    //                 },
    //                 {
    //                     type: 'reset',
    //                     translate: 'common.resetaction.lbl',
    //                     cls: 'btn-danger'
    //                 }
    //             ]
    //         };
    //     }

    //     function handleDynamicFormEvents(actionType, formData) {
    //         $scope.advancedfilter = formData;
    //         $scope.getList();
    //     }

    //     $scope.openAdvancedFilter = function() {
    //         utl.Modal.openDynamicForm({
    //             modeldata: $scope.advancedfilter,
    //             defaultdata: $scope.advancedfilterDefault,
    //             schema: $scope.advancedFilterSchema,
    //             relativeto: '#btnadvanced',
    //             handleDynamicFormEvents: handleDynamicFormEvents
    //         });
    //     };

    //     $scope.custom_sort = function(a, b) {
    //         return new Date(b.DischargeDate).getTime() - new Date(a.DischargeDate).getTime();
    //     };
    //     $timeout(function() {
    //         removeFloatingNav();
    //     }, 100);

    //     function removeFloatingNav() {
    //         $rootScope.app.layout.isCollapsed = true;
    //     }
    //     $scope.getListCallback = function(scope, data, options, hasError) {
    //         vm.gridConfig.data = [];
    //         if (data.Data.length > 0)
    //             data.Data.sort($scope.custom_sort);
    //         for (var idx in data.Data) {
    //             var item = data.Data[idx];
    //             var finalBills = $filter('filter')(item.FinalBills, {
    //                 BillTypeId: 2
    //             });
    //             if (finalBills.length > 0) {
    //                 var bill = finalBills[0];
    //                 // } else if (finalBills.length > 1) {
    //                 // var lastIndex = finalBills.length - 1;
    //                 // var bill = finalBills[lastIndex];
    //                 item.BillDate = bill.BillDateTime;
    //                 item.BillNumber = bill.BillNumber;
    //                 item.OutStandingAmount = bill.OutStandingAmount;
    //                 item.GrossAmount = parseFloat(bill.BillAmount);
    //                 item.BillDiscount = parseFloat(bill.BillDiscount);
    //                 item.CancelReqRaisedStatusId = bill.CancelReqRaisedStatusId;
    //                 item.NetAmount = (parseFloat(item.GrossAmount) - parseFloat(item.BillDiscount));
    //             }
    //             if ($scope.currentfilter.BillNumber) {
    //                 if (item.DischargedBills.length > 0) {
    //                     vm.gridConfig.data.push(item);
    //                 }
    //             } else {
    //                 vm.gridConfig.data.push(item);
    //             }
    //             // if ($scope.currentfilter.IsEstimatedBill) {
    //             //     if (item.OutStandingAmount > 0) {
    //             //         vm.gridConfig.data.push(item);
    //             //     }
    //             // } else {
    //             //     vm.gridConfig.data.push(item);
    //             // }
    //         }
    //         if ($scope.currentfilter.IsEstimatedBill) {
    //             vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
    //         } else { vm.gridConfig.pagerObj.totalItems = data.Data.length; }
    //     };

    //     $scope.getList = function() {
    //         // if ($scope.currentfilter.doddate == null) {

    //         //     utl.Alert.showErrorMsg('Please Select any DOD date');
    //         //     vm.gridConfig.data = [];
    //         //     return true;

    //         // }
    //         // if ($scope.currentfilter.BillNumber) {
    //         //     $scope.currentfilter.fromdate = null;
    //         //     $scope.currentfilter.todate = null;
    //         // }
    //         var FrmDOA = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
    //         var ToDOA = $filter('date')($scope.advancedfilter.DOD, 'yyyy-MM-dd 23:59:59') || null;
    //         var FrmDOD = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
    //         var ToDOD = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
    //         if ($scope.currentfilter.PatientMRN || $scope.currentfilter.VisitIdentifier || $scope.currentfilter.BillNumber) {
    //             FrmDOD = null;
    //             ToDOD = null;
    //         }
    //         var inputData = {
    //             Params: [{
    //                     Key: 28,
    //                     Value: FrmDOD
    //                 },
    //                 {
    //                     Key: 29,
    //                     Value: ToDOD
    //                 },
    //                 {
    //                     Key: 17,
    //                     Value: FrmDOA
    //                 },
    //                 {
    //                     Key: 18,
    //                     Value: ToDOA
    //                 },
    //                 {
    //                     Key: 2,
    //                     Value: $scope.currentfilter.WardId
    //                 },
    //                 {
    //                     Key: 1,
    //                     Value: $scope.currentfilter.FacilityId
    //                 },
    //                 {
    //                     Key: 39,
    //                     Value: $scope.currentfilter.BillNumber
    //                 },
    //                 {
    //                     Key: 15,
    //                     Value: 2
    //                 },
    //                 {
    //                     Key: 3,
    //                     Value: 6
    //                 },
    //                 {
    //                     Key: 11,
    //                     Value: $scope.currentfilter.PatientMRN
    //                 },
    //                 {
    //                     Key: 13,
    //                     Value: $scope.currentfilter.VisitIdentifier
    //                 },
    //                 {
    //                     Key: 3,
    //                     Value: $scope.currentfilter.AdmissionStatusId
    //                 },
    //                 {
    //                     Key: 19,
    //                     Value: $scope.currentfilter.GuarantorId
    //                 },
    //                 {
    //                     Key: 5,
    //                     Value: $scope.currentfilter.DoctorId
    //                 },
    //                 {
    //                     Key: 22,
    //                     Value: true
    //                 },
    //                 {
    //                     Key: 70,
    //                     Value: $scope.currentfilter.ISDue
    //                 },
    //                 {
    //                     Key: 51,
    //                     Value: false
    //                 }, // Modified
    //                 {
    //                     Key: 69,
    //                     Value: false
    //                 },
    //                 // {
    //                 //     Key: 46,
    //                 //     Value: $scope.currentfilter.IsEstimatedBill
    //                 // },
    //             ],
    //             PageContext: {
    //                 PageSize: vm.gridConfig.pagerObj.pageSize,
    //                 PageNumber: vm.gridConfig.pagerObj.currentPage
    //             }
    //         };

    //         var options = {
    //             action: 'Visit/Visit/GetMINIPPatientsBills',
    //             data: inputData,
    //             type: 'post',
    //             onComplete: $scope.getListCallback
    //         };

    //         utl.Http.doAction(options);
    //     };

    //     $scope.patientprofiledetails = function(patientId) {
    //         utl.Modal.open('registration.patientprofile', {
    //             params: {
    //                 pid: patientId
    //             },
    //             confirmCallback: $scope.getList
    //         });
    //     };

    //     $scope.cancelBillCallback = function() {
    //         $scope.getList();
    //     };

    //     $scope.onCancelConfirmed = function() {
    //         var inputData = {
    //             PatientBillId: $scope.item.ToBeCancelBillId,
    //             EncounterId: $scope.item.EncounterId,
    //             BedId: $scope.item.BedId,
    //             CancelledBy: $scope.item.CancelledBy,
    //             CancelledOn: $scope.item.CancelledOn,
    //         };
    //         var options = {
    //             action: 'billing/patientbills/CancelIPPatientBill',
    //             data: {
    //                 Id: $scope.item.ToBeCancelBillId,
    //                 Data: inputData
    //             },
    //             type: 'post',
    //             onComplete: $scope.cancelBillCallback
    //         };
    //         utl.Http.doAction(options);
    //     };
    //     $scope.isduebill = function() {
    //         if ($scope.currentfilter.IsPaidFully == true) {
    //             $scope.currentfilter.ISDue = false;
    //         } else {
    //             $scope.currentfilter.ISDue = true;
    //         }
    //         $scope.getList();
    //     }
    //     $scope.onCancelBill = function(item) {
    //         var finalBills = $filter('filter')(item.FinalBills, {
    //             BillTypeId: 2
    //         });
    //         if (finalBills.length > 0) {
    //             var bill = finalBills[0];
    //         }
    //         // if (item.FinalBills.length == 1) {
    //         //     var bill = item.FinalBills[0];
    //         // } else if (item.FinalBills.length > 1) {
    //         //     var lastIndex = item.FinalBills.length - 1;
    //         //     var bill = item.FinalBills[lastIndex];
    //         // }
    //         $scope.item.ToBeCancelBillId = bill.Id;
    //         $scope.item.EncounterId = item.Id;
    //         $scope.item.BedId = item.BedId;
    //         $scope.item.CancelledOn = utl.Formatter.getCurrentDate();
    //         $scope.item.CancelledBy = utl.Session.getCurrentUserId();
    //         var confirmOptions = {
    //             headingKey: 'common.confirm-modal-header.lbl',
    //             messageKey: 'billing.dischargedpatients.cancelmsg.lbl',
    //             yesKey: 'common.yeskey.lbl',
    //             noKey: 'common.nokey.lbl',
    //             onSuccessMethod: $scope.onCancelConfirmed,
    //         };
    //         utl.Dialog.confirmMessage(confirmOptions);
    //     };

    //     $scope.UpdateCancelRequestPatientbillsCallback = function(scope, data, options, hasError) {
    //         utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
    //         $scope.getList();
    //     };

    //     $scope.UpdateCancelRequestPatientbills = function() {
    //         $scope.items.CancelReqRaisedStatusId = 1;
    //         $scope.items.Id = $scope.item.PatientBillId;
    //         // var lines = getLinesForSaveCancel();
    //         var actionName = 'Billing/PatientBills/UpdatePatientBillsFromCancel';

    //         var inputData = {
    //             Header: $scope.items,
    //         };
    //         var options = {
    //             action: actionName,
    //             data: {
    //                 Data: inputData
    //             },
    //             type: 'post',
    //             onComplete: $scope.UpdateCancelRequestPatientbillsCallback
    //         };
    //         utl.Http.doAction(options);
    //     };

    //     $scope.CancelRequestCallback = function(scope, data, options, hasError) {
    //         // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
    //         // $scope.currentcontext.id = (typeof data === "number") ? data : $scope.currentcontext.id;
    //         $scope.UpdateCancelRequestPatientbills();
    //     };

    //     $scope.onCancelRequest = function(item) {
    //         var finalBills = $filter('filter')(item.FinalBills, {
    //             BillTypeId: 2
    //         });
    //         if (finalBills.length > 0) {
    //             var bill = finalBills[0];
    //         }
    //         $scope.item.PatientBillId = bill.Id;
    //         $scope.item.PatientId = item.PatientId;
    //         $scope.item.EncounterId = item.Id;
    //         $scope.item.EncounterTypeId = 2;
    //         $scope.item.DepartmentId = item.DepartmentId;
    //         $scope.item.GuarantorId = item.GuarantorId;
    //         $scope.item.FacilityId = item.FacilityId;
    //         $scope.item.BillingRequestTypeId = 1;
    //         $scope.item.BillDateTime = bill.BillDateTime;
    //         $scope.item.BillingRequestDateTime = utl.Formatter.getCurrentDate();
    //         $scope.item.BillNumber = bill.BillNumber;
    //         $scope.item.PatientName = item.Patient.FirstName;
    //         $scope.item.DoctorId = item.DoctorId;
    //         $scope.item.BillAmount = bill.BillAmount;
    //         $scope.item.BillDiscount = bill.BillDiscount;
    //         $scope.item.PaidAmount = bill.PaidAmount;
    //         $scope.item.BillGeneratedBy = bill.BillGeneratedBy;
    //         $scope.item.PatientBillStatusId = bill.PatientBillStatusId;
    //         $scope.item.BillingRequestStatusId = 1;
    //         $scope.item.TypeId = 2;
    //         $scope.item.BillingRequestBy = utl.Session.getCurrentUserId();
    //         $scope.item.BillingRequestAt = utl.Formatter.getCurrentDate();

    //         var actionName = 'Billing/BillingRequest/AddBillingRequest';
    //         var options = {
    //             action: actionName,
    //             data: {
    //                 Data: $scope.item
    //             },
    //             type: 'post',
    //             onComplete: $scope.CancelRequestCallback
    //         };
    //         utl.Http.doAction(options);
    //     };

    //     $scope.handleEvents = function(actionType, entity) {
    //         if (actionType == 'edit') {
    //             $state.go('app.ipbillingtab.summary', {
    //                 id: entity.Id,
    //                 filter_from: $scope.advancedfilter.DOA,
    //                 filter_to: $scope.advancedfilter.DOD,
    //                 filter_phone: $scope.advancedfilter.Phone,
    //                 filter_guarantor: $scope.advancedfilter.GuarantorId,
    //                 filter_guarantortype: $scope.advancedfilter.GuarantorTypeId,
    //                 filter_doctor: $scope.advancedfilter.DoctorId,
    //                 filter_dept: $scope.advancedfilter.DepartmentId,
    //                 filter_isout: $scope.advancedfilter.IsOutstanding,
    //             });
    //         } else if (actionType == 'cancel') {
    //             //utl.Dialog.confirmDelete($scope.onCancelConfirmed, entity.Id, entity.BillNumber);
    //             $scope.onCancelBill(entity);
    //         } else if (actionType == 'cancelrequest') {
    //             //utl.Dialog.confirmDelete($scope.onCancelConfirmed, entity.Id, entity.BillNumber);
    //             $scope.onCancelRequest(entity);
    //         } else if (actionType == 'patientinfo') {
    //             // $scope.patientprofiledetails(entity.Patient.Id);
    //             utl.Modal.open('registration.patientprofile', {
    //                 params: {
    //                     pid: entity.PatientId
    //                 },
    //                 confirmCallback: $scope.getitem
    //             });
    //         }
    //     };

    //     var rowtpl = '<div ng-class="{\'nonself\':entity.PatientGuarantor.GuarantorTypeId!=1} "><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
    //     vm.gridConfig = {
    //         enableColumnResizing: true,
    //         rowTemplate: rowtpl,
    //         columnDefs: [{
    //                 field: "S.No",
    //                 displayName: $translate.instant('S.No'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
    //             },
    //             {
    //                 field: "BillDate",
    //                 displayName: $translate.instant('billing.dischargedpatients.billdate.lbl'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillDate| date: 'HH:mm'}}</span>" + "</div>"
    //             },
    //             {
    //                 field: "DischargeDate",
    //                 displayName: $translate.instant('Discharge Date'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
    //             },
    //             {
    //                 field: "BillNumber",
    //                 displayName: $translate.instant('billing.dischargedpatients.billno.lbl')
    //             },
    //             // { field: "VisitIdentifier", displayName: $translate.instant('billing.dischargedpatients.ipnumber.lbl') },
    //             {
    //                 field: "Patient",
    //                 displayName: $translate.instant('billing.dischargedpatients.patientname.lbl'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'>" +
    //                     // + '<a ng-click="handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} / {{entity.Patient.MRN}} / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="left" >'
    //                     '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" ' +
    //                     "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
    //                     "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
    //                     "<span ><b>{{entity.Patient.LastName}}&nbsp;</b></span>" +
    //                     "<span >/</span>" +
    //                     "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
    //                     "<span >/<span>" +
    //                     "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
    //                     "<span >&nbsp;{{entity.Patient.Age}}&nbsp;</span>" +
    //                     "<span >/</span>" +
    //                     "<span >{{entity.Patient.Gender.Description}}</span>" +
    //                     "</a></div>",
    //                 handleEvent: $scope.handleEvents,
    //             },
    //             {
    //                 field: "PaymentType.Description",
    //                 displayName: $translate.instant('billing.dischargedpatients.admittingdoctors.lbl'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'>" +
    //                     '<span ng-click="handleEvents(\'patientinfo\',row)">' +
    //                     "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
    //                     "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
    //                     "<span >{{entity.Doctor.LastName}}&nbsp;</span>" +
    //                     "</span></div>"
    //             },
    //             // {
    //             //     field: "AdmissionDate", displayName: $translate.instant('billing.dischargedpatients.doa.lbl'),
    //             //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate | date: 'HH:mm'}}</span>" + "</div>"
    //             // },
    //             // {
    //             //     field: "DischargeDate", displayName: $translate.instant('billing.dischargedpatients.dod.lbl'),
    //             //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate | date: 'HH:mm'}}</span>" + "</div>"
    //             // },
    //             {
    //                 field: "Guarantor.GuarantorName",
    //                 displayName: $translate.instant('billing.dischargedpatients.guarantor.lbl')
    //             },
    //             {
    //                 field: "GrossAmount",
    //                 displayName: $translate.instant('billing.dischargedpatients.billamount.lbl'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount | displaycurrency}}</span>" + "</div>"
    //                     // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.GrossAmount | displaycurrency}}</span>' + '</div>'
    //             },
    //             {
    //                 field: "BillDiscount",
    //                 displayName: $translate.instant('billing.dischargedpatients.discountamount.lbl'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.BillDiscount | displaycurrency}}</span>" + "</div>"
    //                     // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.BillDiscount | displaycurrency}}</span>' + '</div>'
    //             },
    //             {
    //                 field: "NetAmount",
    //                 displayName: $translate.instant('billing.dischargedpatients.netamount.lbl'),
    //                 cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
    //                     // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.NetAmount | displaycurrency}}</span>' + '</div>'
    //             },
    //             // {
    //             //     field: "OutStandingAmount", displayName: $translate.instant('billing.dischargedpatients.dueamount.lbl'),
    //             //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.OutStandingAmount | displaycurrency}}</span>' + '</div>'
    //             // },
    //             {
    //                 field: "Id",
    //                 displayName: $translate.instant('common.actions_col.lbl'),
    //                 cellTemplate: '<div class="ui-grid-cell-contents align-buttion">\
    //                         <span  ng-click="handleEvents(\'edit\',entity)"><i class="fas fa-procedures" uib-tooltip="In patients" aria-hidden="true"></i></span>\
    //                         <span  ng-click="handleEvents(\'cancelrequest\',entity)" ng-hide="entity.CancelReqRaisedStatusId==1||entity.CancelReqRaisedStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
    //                         <span  ng-click="handleEvents(\'cancel\',entity)"ng-show="entity.CancelReqRaisedStatusId==2"><i class="fas fa-times trash" aria-hidden="true"></i></span>\
    //                       </div>',
    //                 handleEvent: $scope.handleEvents,
    //                 actions: []
    //             }
    //         ],
    //         pagerObj: {
    //             totalItems: 0,
    //             currentPage: 1,
    //             startIndex: 0,
    //             pageSize: 25
    //         }
    //     };

    //     $scope.lookupCallback = function(scope, data, options, hasError) {
    //         $scope.lookup = hasError ? {} : data;
    //         initDynamicForm();
    //         if ($stateParams.filter_id > 0) {
    //             $scope.advancedfilter.DOA = $stateParams.filter_from;
    //             $scope.advancedfilter.DOD = $stateParams.filter_to;
    //             $scope.advancedfilter.Phone = $stateParams.filter_phone;
    //             $scope.advancedfilter.GuarantorId = $stateParams.filter_guarantor;
    //             $scope.advancedfilter.GuarantorTypeId = $stateParams.filter_guarantortype;
    //             $scope.advancedfilter.DoctorId = $stateParams.filter_doctor;
    //             $scope.advancedfilter.DepartmentId = $stateParams.filter_dept;
    //             $scope.advancedfilter.IsOutstanding = $stateParams.filter_isout;
    //             $scope.currentfilter.doddate = $stateParams.filter_doddate;
    //             $scope.getList();
    //         } else {
    //             $scope.getList();
    //         }
    //     };

    //     $scope.initLookup = function() {
    //         var inputData = [{
    //                 "Key": "Facility"
    //             },
    //             // {
    //             //     "Key": "ReceiptType"
    //             // },
    //             // {
    //             //     "Key": "ReceiptStatus"
    //             // },
    //             {
    //                 "Key": "Doctor",
    //                 Request: {
    //                     Params: [{
    //                         Key: 2,
    //                         Value: utl.Session.getCurrentFacilityId()
    //                     }]
    //                 }
    //             },
    //             {
    //                 "Key": "Ward"
    //             },
    //             // {
    //             //     "Key": "Guarantor"
    //             // },
    //             // {
    //             //     "Key": "Department"
    //             // },
    //             {
    //                 "Key": "Guarantor",
    //                 Request: {
    //                     Params: [{
    //                         Key: 7,
    //                         Value: [-1, utl.Session.getCurrentFacilityId()]
    //                     }]
    //                 }
    //             },
    //             {
    //                 "Key": "GuarantorType"
    //             }
    //         ]
    //         var options = {
    //             action: 'General/Options/getoptions',
    //             data: inputData,
    //             type: 'post',
    //             onComplete: $scope.lookupCallback
    //         };
    //         utl.Http.doAction(options);
    //     };

    //     $scope.initLookup();
    // }

    dischargenoteListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();