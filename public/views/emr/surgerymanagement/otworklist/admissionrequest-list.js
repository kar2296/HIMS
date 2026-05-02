(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionRequestListController', admissionRequestListController);

    function admissionRequestListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            wardid: -1,
            admissionstatusid: 2,
            namemrn: ''
        };
        //  Start
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                RemarkId: -1,
                LocationId: -1,
                AdmittingReasonId: -1,
                PriorityId: -1,
                AdmissionRequestTypeId: -1,
                DiagnosisId: -1,
                DoctorId: -1,
                PatientId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'admissionrequests.filter_fromdate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'admissionrequests.filter_todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'admissionrequests.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'admissionrequests.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'admissionrequests.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'admissionrequests.filter_requesttype.lbl', model: 'AdmissionRequestTypeId', options: $scope.lookup.AdmissionRequestType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'admissionrequests.filter_priority.lbl', model: 'PriorityId', options: $scope.lookup.Priority, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'admissionrequests.filter_admittingreason.lbl', model: 'AdmittingReasonId', options: $scope.lookup.AdmittingReason, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'admissionrequests.filter_location.lbl', model: 'LocationId', options: $scope.lookup.Location, position: { r: 4, c: 0 } },
                    { type: 'select', translate: 'admissionrequests.filter_remark.lbl', model: 'RemarkId', options: $scope.lookup.Remark, position: { r: 4, c: 1 } }],
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
        }
        //Dynamic form  ends    
        //  End

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.getPatientProfilePic();
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentfilter.facilityid },
                    { Key: 1, Value: $scope.currentfilter.wardid },
                    { Key: 2, Value: $scope.currentfilter.admissionstatusid },
                    { Key: 4, Value: $scope.advancedfilter.RemarkId },
                    { Key: 5, Value: $scope.advancedfilter.LocationId },
                    { Key: 6, Value: $scope.advancedfilter.AdmittingReasonId },
                    { Key: 7, Value: $scope.advancedfilter.PriorityId },
                    { Key: 8, Value: $scope.advancedfilter.AdmissionRequestTypeId },
                    { Key: 9, Value: $scope.advancedfilter.DiagnosisId },
                    { Key: 10, Value: $scope.advancedfilter.DoctorId },
                    { Key: 11, Value: $scope.advancedfilter.PatientId },
                    { Key: 12, Value: $scope.currentfilter.namemrn },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/admissionrequest/GetAdmissionRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.admissionrequest', { id: 0 });
        }

        $scope.filter = function () {
            $state.go('app.admissionrequests.admissionfilter', { admissionfilterid: 0 });
        }


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/admissionrequest/DeleteAdmissionRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.showPatientInfo = function (item) {

        }

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

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.admissionrequest', { id: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RequestIdentifier);
            }
        }
        $scope.getPatientInfo = function (entity) {
            console.log(entity);
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "CreatedAt", displayName: $translate.instant('admissionrequests.requestedon.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}},</span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "RequestIdentifier", displayName: $translate.instant('admissionrequests.requestedno.lbl') },
                {
                    field: "Patient", displayName: $translate.instant('admissionrequests.patientname.lbl')
                    , cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + "<a ng-click='getPatientInfo(entity.Patient.Id)'>"
                    + "<span >{{entity.Patient.MRN}}</span>"
                    + "<span >/<span>"
                    + "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >"
                    + "{{entity.Patient.Title.Description}}</span>"
                    + "<span >{{entity.Patient.FirstName}}</span>"
                    + "<span >{{entity.Patient.LastName}}</span>"
                    + "<span >/</span>"
                    + "<span >{{entity.Patient.Age}}</span>"
                    + "<span >/</span>"
                    + "<span >{{entity.Patient.Gender.Description}}</span>"
                    + "</a></div>"
                },
                { field: "WardMaster.WardName", displayName: $translate.instant('admissionrequests.ward.lbl') },
                {
                    field: "ALOS", displayName: $translate.instant('admissionrequests.requestplan.lbl'),
                    cellTemplate: "<span >{{entity.ALOS}}</span>days"
                },
                {
                    field: "User", displayName: $translate.instant('admissionrequests.requestedby.lbl'),
                    cellTemplate: "<displayuser user='entity.User'></displayuser>"
                },
                { field: "AdmissionRequestStatus.Description", displayName: $translate.instant('admissionrequests.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "AdmissionRequestStatus" },
                { "Key": "Ward" },
                { "Key": "Patient" }
            ];
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
    admissionRequestListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();