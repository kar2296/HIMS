(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otrequestListController', otrequestListController);

    function otrequestListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.Items = [];
        $scope.currentfilter = {
            SurgeryTypeId: -1,
            OTRequestStatusId: 2,
        };

        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();
        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.ChiefSurgeonId = utl.Session.getCurrentUserId();
            // $scope.currentfilter.OTRequestedOn = utl.Formatter.getCurrentDate();
            $scope.userid = utl.Session.getUserTypeId()

        }
        if ($stateParams.context) {
            $scope.emrcontext = $stateParams.context;
        }
        if (!$stateParams.context) {
            $scope.emrcontext = '';
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        //Dynamic form starts

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1,
                // From: utl.Formatter.getCurrentDate(),
                // To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.from.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.to.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'otregister-form.chiefsurgeon.lbl', model: 'ChiefSurgeonId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'otrequest-form.associatesurgeonname.lbl', model: 'AssociateSurgeonId', options: $scope.lookup.Doctor, position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'otrequest-form.anesthecian.lbl', model: 'AnaesthesistId', options: $scope.lookup.Doctor, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'otrequest-form.AnaesthesiaType.lbl', model: 'AnaesthesiaTypeId', options: $scope.lookup.AnaesthesiaType, position: { r: 2, c: 1 } },],
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
        $scope.custom_sort = function (a, b) {
            return new Date(b.OTRequestedOn).getTime() - new Date(a.OTRequestedOn).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
                $scope.currentfilter.OTRequestedOn = '';
            }
            var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.OTRequestedOn, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OTRequestedOn, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.SurgeryTypeId },
                    { Key: 2, Value: $scope.currentfilter.OTRequestStatusId },
                    { Key: 3, Value: $scope.currentfilter.SurgeryId },
                    { Key: 4, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 6, Value: $scope.advancedfilter.DoctorId },
                    { Key: 6, Value: $scope.currentfilter.DoctorId },
                    { Key: 1, Value: $scope.advancedfilter.AnaesthesistId },
                    { Key: 7, Value: $scope.advancedfilter.AnaesthesiaTypeId },
                    { Key: 8, Value: $scope.advancedfilter.AssociateSurgeonId },
                    { Key: 9, Value: $scope.currentfilter.OTRequestedOn },
                    { Key: 12, Value: $scope.currentfilter.ChiefSurgeonId },
                    { Key: 10, Value: From },
                    { Key: 11, Value: To },
                    { Key: 10, Value: FromReq },
                    { Key: 11, Value: ToReq },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr')
                inputData.Params.push({ Key: 5, Value: $scope.currentcontext.pid });
            // if (utl.Session.getUserTypeId() == 2)
            //     inputData.Params.push({ Key: 9, Value: [From, To] });
            var options = {
                action: 'OtManagement/OtRequest/GetOtRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        // $scope.openModal = function (Id) {
        //     utl.Modal.open('app.notetemplates', {
        //         params: { id: Id }, confirmCallback: $scope.initLookup
        //     }
        //     );
        // }

        //Grid Actions
        // $scope.addNew = function() {
        //     if ($scope.context == 'main')
        //         $state.go('app.otrequest', { id: 0 });
        //     if ($scope.context == 'emr')
        //         $state.go('patientemr.otrequest', { id: 0 });

        // }
        $scope.addNew = function () {
            if ($scope.context == 'main')
                $state.go('app.otrequest', { id: 0 });
            if ($scope.context == 'emr' && $scope.emrcontext)
                $state.go('patientemr.otrequestform', { id: 0, context: $scope.emrcontext });
            if ($scope.context == 'emr' && (!$scope.emrcontext))
                $state.go('patientemr.otrequest', { id: 0 });
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'OtManagement/OtRequest/DeleteOtRequest',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'view') {
                if ($scope.context == 'main')
                    $state.go('app.otrequest', { id: row.entity.Id, eid: row.entity.Id, pid: row.entity.PatientId });
                if ($scope.context == 'emr')
                    $state.go('patientemr.otrequest', { id: row.entity.Id, pid: row.entity.PatientId });
            }
            if (actionType == 'edit') {
                $state.go('app.otrequest', { id: row.entity.Id, pid: row.entity.PatientId });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : row.entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            }
        }

        var OTRequestedOn = {
            field: "OTRequestedOn",
            displayName: $translate.instant('otrequest-list.requestedon.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                "<span>{{row.entity.OTRequestedOn | date:'dd-MMM-yyyy'}}</span>" + " " + "<span>{{row.entity.OTRequestedOn| date:'HH:mm'}}</span>"
                + "</div>"
        };
        var OTrequestNo = { field: "OTrequestNo", displayName: $translate.instant('otrequest-list.otno.lbl') };

        var Patient = {
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
        };
        var Doctor = {
            field: "Doctor",
            displayName: $translate.instant('otrequest-list.admittingdoctor.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.Doctor.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{row.entity.Doctor.FirstName}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                '<span>{{row.entity.Doctor.LastName}}</span>' + '</div>'
        };
        var OTRoom = { field: "OTRoom.RoomNo", displayName: $translate.instant('otrequest-list.otroom.lbl'), };

        var Procedure = { field: "SurgeryName", displayName: $translate.instant('otrequest-list.surgeryname.lbl'), };
        var SurgeryType = { field: "SurgeryType.Description", displayName: $translate.instant('otrequest-list.surgerytype.lbl'), };

        var OTRequestStatus = { field: "OTRequestStatus.Description", displayName: $translate.instant('otrequest-list.status.lbl') };

        var action = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.OTRequestStatusId==2 || row.entity.OTRequestStatusId==3||row.entity.OTRequestStatusId==4"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.OTRequestStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.OTRequestStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
            actions: [
                // { actiontype: 'edit', display: 'common.editaction.lbl' },
                // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
            ]
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [OTRequestedOn, OTrequestNo, Patient, Doctor, OTRoom, Procedure, SurgeryType, OTRequestStatus, action],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        if ($scope.context == 'emr') {
            vm.gridConfig.columnDefs = [];
            vm.gridConfig.columnDefs.push(OTRequestedOn, OTrequestNo, Doctor, OTRoom, Procedure, SurgeryType, OTRequestStatus, action);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "SurgeryType" },
                { "Key": "Procedure" },
                { "Key": "Department" },
                { "Key": "AnaesthesiaType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "OTRequestStatus" }
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

    otrequestListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();