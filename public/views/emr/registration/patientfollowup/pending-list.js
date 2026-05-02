(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PendingListController', PendingListController);

    function PendingListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId()
        };


        //autosearch related code starts for Doctors
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                // { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'DoctorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
                result = [vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
           // $scope.item.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                // item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.EncounterStatusId == 1) {
                    item.EncounterStatus = 'CheckedIn';
                }
                else if (item.EncounterStatusId == 2) {
                    item.EncounterStatus = 'CheckedOut';
                }
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 14, Value: 1 },
                    { Key: 15, Value: 1 },
                    { Key: 47, Value: true },
                    { Key: 11, Value: $scope.currentfilter.PatientName },
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    { Key: 6, Value: $scope.currentfilter.DepartmentId },
                    { Key: 48, Value: $scope.currentfilter.TeamId },
                    { Key: 21, Value: $scope.currentfilter.MobileNo },
                    //{ Key: 6, Value: $scope.currentfilter.AdmitDate },
                    { Key: 15, Value: $scope.currentfilter.EncounterTypeId },
                    { Key: 14, Value: $scope.currentfilter.EncounterStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
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

        $scope.backToList = function () {
            $state.go('app.qualificationsetuptab.PatientFollowup');
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'registration/PatientFollowup/DeletePatientFollowup',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.openModal = function (Id) {
            utl.Modal.open('app.patientfollowuptab.patientfollowup', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }


        $scope.addNew = function () {

            $scope.openModal(0);
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                utl.Modal.open('app.patientfollowuptab.patientfollowup', {
                    params: {
                        eid: row.entity.Id,
                        encounter: row.entity
                    },
                    confirmCallback: $scope.initLookup
                }
                );
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('registration.patientfollowup.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                //{ field: "AdmissionDate", displayName: $translate.instant('registration.patientfollowup.date.lbl') },
                { field: "Patient.MRN", displayName: $translate.instant('registration.patientfollowup.mrn.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('registration.patientfollowup.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        // + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">'
                        +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span >{{row.entity.Patient.FirstName}}</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                //{ field: "PatientName", displayName: $translate.instant('registration.patientfollowup.patientname.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('registration.patientfollowup.department.lbl') },
                { field: "UserTeam.Team.Description", displayName: $translate.instant('registration.patientfollowup.unit.lbl') },
                { field: "DoctorName", displayName: $translate.instant('registration.patientfollowup.referdoctor.lbl') },
                { field: "EncounterType.Description", displayName: $translate.instant('registration.patientfollowup.followuptype.lbl') },
                { field: "EncounterStatus", displayName: $translate.instant('registration.patientfollowup.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        function setDefaults() {
            var ActiveId = utl.Lookup.getDefault($scope.lookup.ActiveStatus, 'Active');
            $scope.currentfilter.ActiveStatusId = ActiveId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "Team" },
                { "Key": "EncounterType" },
                { "Key": "EncounterStatus" },
            ];
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

    PendingListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();