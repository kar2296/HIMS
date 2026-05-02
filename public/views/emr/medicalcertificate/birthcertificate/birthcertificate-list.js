(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('birthcertificateListController', birthcertificateListController);

    function birthcertificateListController($scope, $stateParams, $filter, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            wardid: -1,
            admissionstatusid: -1,
            patientnamemrn: '',
            WardId: -1
        };
        //  Start
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'registration.patientsearch.filter_registerfromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'registration.patientsearch.filter_registertodate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_admissiontype.lbl', model: 'AdmissionRequestTypeId', options: $scope.lookup.AdmissionRequestType, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'medicalcertificate.dischargesummary-form.approvedby.lbl', model: 'DoctorId', options: $scope.lookup.User, position: { r: 1, c: 2 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
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
        //Dynamic form  ends    
        //  End
        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if (item.AdmissionStatusId != 1) {
                    if (item.PatientCertificate && item.PatientCertificate === null) {
                        item.PatientCertificate.CerticateStatusId = 1;
                    }
                    vm.gridConfig.data.push(item);
                }
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            var FromAdm = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDOD = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.dischargedatte, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.dischargedatte, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.WardId },
                    { Key: 3, Value: $scope.currentfilter.admissionstatusid },
                    { Key: 11, Value: $scope.currentfilter.patientnamemrn },
                    { Key: 12, Value: $scope.currentfilter.RequestNo },
                    { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 20, Value: $scope.currentfilter.AttenderPhone },
                    // { Key: 28, Value: $scope.currentfilter.DOD },
                    { Key: 15, Value: 2 },
                    { Key: 26, Value: true },
                    { Key: 8, Value: $scope.advancedfilter.AdmissionRequestTypeId },
                    { Key: 4, Value: $scope.advancedfilter.PatientId },
                    { Key: 5, Value: $scope.advancedfilter.DoctorId },
                    { Key: 6, Value: $scope.advancedfilter.DepartmentId },
                    { Key: 7, Value: $scope.advancedfilter.ServiceRateCategoryId },
                    { Key: 9, Value: $scope.advancedfilter.DiagnosisId },
                    { Key: 10, Value: $scope.advancedfilter.AttenderName },
                    { Key: 17, Value: FromAdm },
                    { Key: 18, Value: ToDOD },
                    { Key: 28, Value: From },
                    { Key: 29, Value: To }

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Patient Info popup  Start  

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };
        // Patient Info popup  End   
        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.birthcertificate', { Id: 0 });
        };

        $scope.filter = function () {
            $state.go('app.admissions.advancefilter', { advancefilterid: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Visit/Visit/DeleteEncounter',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        // Cancel Requests from List Screen Function - Start 
        $scope.cancelItem = function () {
            $scope.item.AdmissionRequestStatusId = 3;
            var options = {
                action: 'Visit/Visit/UpdateEncounter',
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.getList
            };

            utl.Http.doAction(options);
        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.cancelItem()
        };
        $scope.getItem = function (pageNo) {

            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: { Id: $scope.CancelId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);

        };
        $scope.onCancelConfirmed = function (cancelId) {
            $scope.CancelId = cancelId;
            $scope.getItem();
        };
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.populateGrid
            });
        };


        // Cancel Requests from List Screen Function - End 
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'request') {
                $scope.getOccupancyHistory(row.entity.Id)

            }
            if (actionType == 'complete') {
                $scope.getOccupancy(row.entity.Id)

            }
            /*  for bedtransfer*/
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.VisitIdentifier);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            } else if (actionType == 'cancel') { //Cancel Event 
                utl.Dialog.confirmCancel($scope.onCancelConfirmed, row.entity.Id, row.entity.RequestIdentifier);
            } else if (actionType == 'view') {
                var certificateId = row.entity.PatientCertificate ? row.entity.PatientCertificate.Id : 0;
                $state.go('app.birthcertificate', { id: certificateId, eid: row.entity.Id, pid: row.entity.PatientId });
            }
        };

        $scope.print = function () {
            utl.Modal.open('app.admissionrequestprint', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "AdmissionDate",
                displayName: $translate.instant('admissions.admissionon.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AdmissionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
            },
            { field: "VisitIdentifier", displayName: $translate.instant('admissions.admissionno.lbl') },
            {
                field: "Patient",
                displayName: $translate.instant('admissions.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                +
                "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
                "<span >/</span>" +
                "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
                "<span >/<span>" +
                "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
                "<span >/</span>" +
                "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                "</a></div>"
            },
            { field: "WardMaster.WardName", displayName: $translate.instant('admissions.ward.lbl') },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('admissions.roomdetails.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span  ng-if='row.entity.WardRoomMaster'>{{row.entity.WardRoomMaster.RoomNo }}&nbsp;</span>" +
                "<span  ng-if='row.entity.WardRoomMaster'>/</span>" +
                "<span  ng-if='row.entity.WardRoomBedMaster'>{{row.entity.WardRoomBedMaster.BedNo}}</span>" +
                "</div>"
            },
            {
                field: "DischargeDate",
                displayName: $translate.instant('mrd.dod.lbl'),
                cellTemplate: "<ngformatdate date-val='row.entity.DischargeDate'> </ngformatdate>"
            },
            {
                field: "Patient",
                displayName: $translate.instant('admissions.admittedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                "<span >{{row.entity.Doctor.LastName}}</span>" +
                "</span></div>"
            },
            { field: "Department.DepartmentName", displayName: $translate.instant('admissions.department.lbl') },
            { field: "AdmissionStatus.Description", displayName: $translate.instant('admissions.status.lbl') },
            { field: "PatientCertificate.CertificateStatus.Description", displayName: $translate.instant('medicalcertificate.dischargesummary-list.status.lbl') },
            // { field: "AttenderPhone", displayName: $translate.instant('admissions.filter_mobileno.lbl') },

            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.PatientCertificate.CerticateStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.PatientCertificate.CerticateStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                actions: [
                    // { actiontype: 'edit', display: 'common.editaction.lbl' },
                    // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                ]
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var admitid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Admitted');
            var fitforid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Fit For Discharge');
            var clinicalid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Clinical Discharge');
            var financialid = utl.Lookup.getDefault($scope.lookup.AdmissionStatus, 'Financial Discharge');
            $scope.currentfilter.admissionstatusid = admitid + ',' + fitforid + ',' + clinicalid + ',' + financialid;
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AdmissionStatus" },
                { "Key": "AdmissionRequestType" },
                { "Key": "Ward" },
                // { "Key": "DischargeType" },
                { "Key": "CertificateStatus" },
                { "Key": "NoteType" },

            ]
            /*   2/12/2016 */
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
    birthcertificateListController.$inject = ['$scope', '$stateParams', '$filter', '$state', '$translate', 'utl'];

})();