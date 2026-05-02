(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReferralListController', ReferralListController);

    function ReferralListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            EncounterTypeId: 1,
            EncounterStatusId: 1
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.ReferralId > 0) {
                    if (item.ReferralTypeId == 2)
                    vm.gridConfig.data.push(item);
                }
                if (item.EncounterStatusId == 1) {
                    item.EncounterStatus = 'Checked-In';
                } else if (item.EncounterStatusId == 2) {
                    item.EncounterStatus = 'Checked-Out';
                }
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    // { Key: 14, Value: 1 },
                    // { Key: 15, Value: 1 },
                    { Key: 11, Value: $scope.currentfilter.PatientName },
                    { Key: 41, Value: $scope.currentfilter.ReferralId },
                    { Key: 6, Value: $scope.currentfilter.DepartmentId },
                    { Key: 48, Value: $scope.currentfilter.TeamId },
                    { Key: 21, Value: $scope.currentfilter.MobileNo },
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
                $state.go('app.referralfeedback', { id: 0, eid: row.entity.Id, pid: row.entity.PatientId });
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

                { field: "Patient.MRN", displayName: $translate.instant('registration.patientfollowup.mrn.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('registration.patientfollowup.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} ' + '{{row.entity.Patient.FirstName }} ' +
                        '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | ' + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
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
                { field: "Department.DepartmentName", displayName: $translate.instant('registration.patientfollowup.department.lbl') },
                { field: "UserTeam.Team.Description", displayName: $translate.instant('registration.patientfollowup.unit.lbl') },
                { field: "ReferralName", displayName: $translate.instant('registration.patientfollowup.referdoctor.lbl') },
                { field: "EncounterType.Description", displayName: $translate.instant('registration.patientfollowup.followuptype.lbl') },
                { field: "EncounterStatus", displayName: $translate.instant('registration.patientfollowup.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: -1 }
        };
        function setDefaults() {
            var ActiveId = utl.Lookup.getDefault($scope.lookup.ActiveStatus, 'Active');
            $scope.currentfilter.ActiveStatusId = ActiveId;
        }
        //autosearch related code starts for Referral
        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Referral Code', field: 'ReferralCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Referral Name', field: 'ReferralName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Referral Type', field: 'ReferralType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                { header: 'PhoneNo', field: 'PhoneNo', datatype: 'string', headercls: 'td-phone', fieldcls: 'td-phone' },
                { header: 'Area', field: 'Area', datatype: 'string', headercls: 'td-area', fieldcls: 'td-area' }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };
        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }
        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }
        //autosearch related code ends for Referral

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

    ReferralListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();