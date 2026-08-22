(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FollowupListController', FollowupListController);

    function FollowupListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        var itemmasterid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var ItemCode = $state.params.ItemCode;
        var ItemName = $state.params.ItemName;

        //autosearch related code starts for Doctors
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'DoctorId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
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
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            //$scope.item.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 },
                    { Key: 1, Value: $scope.currentfilter.MRN },
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.UnitId },
                    { Key: 5, Value: $scope.currentfilter.MobileNo },
                    //{ Key: 6, Value: $scope.currentfilter.AdmissionDate },
                    { Key: 7, Value: $scope.currentfilter.FollowupTypeId },
                    { Key: 8, Value: $scope.currentfilter.FollowupStatusId },
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
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        //autosearch related code ends for Doctors

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.PatientName },
                    { Key: 2, Value: $scope.currentfilter.DoctorId },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.UnitId },
                    { Key: 5, Value: $scope.currentfilter.MobileNo },
                    //{ Key: 6, Value: $scope.currentfilter.AdmitDate },
                    { Key: 7, Value: $scope.currentfilter.FollowupTypeId },
                    { Key: 8, Value: $scope.currentfilter.FollowupStatusId },
                    // { Key: 14, Value: 1 },
                    // { Key: 15, Value: 1 },
                    //  { Key: 47, Value: true },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'registration/patientfollowup/GetPatientFollowups',
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

        // $scope.handleEvents = function (actionType, row) {
        //     if (actionType == 'edit') {
        //         $scope.openModal(row.entity.Id);
        //     } else if (actionType == 'delete') {
        //         utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
        //     }
        // };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                utl.Modal.open('app.patientfollowuptab.patientfollowup', {
                    params: {
                        id: row.entity.Id,
                        eid: row.entity.Encounter.Id,
                        encounter: row.entity
                    },
                    confirmCallback: $scope.initLookup
                }
                );
                // utl.Modal.open('app.patientfollowuptab.followup', {
                //     params: {
                //         id: row.entity.Id,
                //         patientid: row.entity.PatientId,
                //         doctorid: row.entity.DoctorId,
                //         doctorname: row.entity.DoctorName,
                //         procedureid: row.entity.ProcedureId,
                //         departmentid: row.entity.DepartmentId,
                //         procedurename: row.entity.Procedure.ProcedureName,
                //         unit: row.entity.unit,
                //         teamname: row.entity.UserTeam.Team.Descrip
                //     },
                //     confirmCallback: $scope.initLookup
                // }
                // );
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "FirstFollowupDate",
                    displayName: $translate.instant('registration.patientfollowup.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.FirstFollowupDate | date : 'dd-MMM-yyyy'}} </span></div>"
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
                { field: "Team.Description", displayName: $translate.instant('registration.patientfollowup.unit.lbl') },
                { field: "DoctorName", displayName: $translate.instant('registration.patientfollowup.referdoctor.lbl') },
                { field: "FollowupType.Description", displayName: $translate.instant('registration.patientfollowup.followuptype.lbl') },
                { field: "FollowupStatus.Description", displayName: $translate.instant('registration.patientfollowup.status.lbl') },
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
                { "Key": "FollowupType" },
                { "Key": "FollowupStatus" },
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

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to FollowupListScreen.tsx --
        // 3 mounts: FollowupNameFilterScreen, FollowupFiltersScreen,
        // FollowupGridScreen, sharing this one reactProps/handleReactAction,
        // sibling of the already-migrated PendingFollowupListScreen). All
        // API calls/business logic above are untouched -- wrapped, not
        // rewritten. See the disclosure comment block at the top of
        // FollowupListScreen.tsx for real, preserved bugs/dead code found
        // while migrating (dead AdmissionDate filter param with a typo'd
        // property name, doctor-autosearch itemchange wired to an undefined
        // function with no on-enter fallback, presearchdoctor() reading a
        // nonexistent currentfilter.MRN, silent 'patientinfo' no-op,
        // shape-mismatched edit 'encounter' param, unreachable addNew(),
        // dead backToList()/setDefaults(), and the dangling commented-out
        // older handleEvents('edit') block referencing a nonexistent
        // 'app.patientfollowuptab.followup' modal).
        // ---------------------------------------------------------------
        function toIsoDateString(d) {
            if (!d) return '';
            var dt = new Date(d);
            if (isNaN(dt.getTime())) return '';
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }
        function fromIsoDateString(s) {
            if (!s) return null;
            var parts = String(s).split('-');
            if (parts.length !== 3) return null;
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            updateReactProps();
        };

        function updateReactProps() {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                lookup: $scope.lookup || {},
                currentfilter: {
                    PatientName: $scope.currentfilter.PatientName,
                    DepartmentId: $scope.currentfilter.DepartmentId,
                    UnitId: $scope.currentfilter.UnitId,
                    AdmissionDate: toIsoDateString($scope.currentfilter.AdmissionDate),
                    MobileNo: $scope.currentfilter.MobileNo,
                    FollowupTypeId: $scope.currentfilter.FollowupTypeId,
                    FollowupStatusId: $scope.currentfilter.FollowupStatusId
                },
                pager: {
                    totalItems: vm.gridConfig.pagerObj.totalItems,
                    currentPage: vm.gridConfig.pagerObj.currentPage,
                    pageSize: vm.gridConfig.pagerObj.pageSize
                }
            };
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'filterChange':
                    $scope.currentfilter[payload.field] = payload.value;
                    updateReactProps();
                    break;
                case 'filterChangeAndSearch':
                    if (payload.field === 'AdmissionDate') {
                        $scope.currentfilter.AdmissionDate = fromIsoDateString(payload.value);
                    } else {
                        $scope.currentfilter[payload.field] = payload.value;
                    }
                    updateReactProps();
                    $scope.getList();
                    break;
                case 'search':
                    $scope.getList();
                    break;
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    break;
                case 'edit':
                    $scope.handleEvents('edit', { entity: payload.entity });
                    break;
                case 'delete':
                    $scope.handleEvents('delete', { entity: payload.entity });
                    break;
                // 'patientinfo' intentionally NOT handled here -- the real
                // handleEvents() has no case for it either, so this remains
                // the same silent no-op as production. See disclosure above.
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        updateReactProps();
    }

    FollowupListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();