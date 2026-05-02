(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralfeedbackListController', referralfeedbackListController);

    function referralfeedbackListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            patientnamemrn: '',
            ReferralStatusId: -1,
            ReferralDate: utl.Formatter.getCurrentDate(),
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            console.log(res.Data);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.ReferralDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ReferralDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 2, Value: $scope.currentfilter.VisitNo },
                    { Key: 3, Value: $scope.currentfilter.PhoneNo },
                    //{ Key: 4, Value: $scope.currentfilter.ReferralDate },
                    { Key: 5, Value: $scope.currentfilter.SourceId },
                    { Key: 6, Value: $scope.currentfilter.ReferralId },
                    { Key: 7, Value: $scope.currentfilter.ReferralStatusId },
                    // { Key: 8, Value: From },
                    // { Key: 9, Value: To },
                    { Key: 4, Value: [From, To] }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'DischargeSummary/ReferralFeedback/GetReferralFeedbacks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        // $scope.openModal = function (Id) {
        //     utl.Modal.open('app.fitnesscertificate', {
        //         params: { id: Id }, confirmCallback: $scope.initLookup
        //     }
        //     );
        // }

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.referralfeedback', { id: 0 });
            // $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'DischargeSummary/ReferralFeedback/DeleteReferralFeedback',
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

            if (actionType == 'edit') {
                $state.go('app.referralfeedback', { id: row.entity.Id, pid: row.entity.PatientId });
            } else if (actionType == 'view') {
                $state.go('app.referralfeedback', { id: row.entity.Id, pid: row.entity.PatientId });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Referral Code', field: 'ReferralCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Referral Name', field: 'ReferralName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                // { header: 'Referral Type', field: 'ReferralType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                // { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-price', fieldcls: 'td-generic' }
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
                $scope.item.ReferralId = selectedItem.Id;
                $scope.item.ReferralCode = selectedItem.ReferralCode;
                $scope.item.ReferralName = selectedItem.ReferralName;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: $scope.item.ReferralId });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];

                item.ReferralCode = item.ReferralCode;
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Patient.MRN", displayName: $translate.instant('medicalcertificate.fitnesscertificate.patientmrn.lbl') },
                {
                    field: "Patient.FirstName",
                    displayName: $translate.instant('appointment.appointment-list.patientname.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description'>{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                        "<span>{{row.entity.Patient.FirstName}}</span>&nbsp;<span>{{row.entity.Patient.LastName}}</span>" +
                        "<span ng-if='row.entity.Patient.Age'>/&nbsp;{{row.entity.Patient.Age}}</span>" +
                        "</a></div>"
                },
                { field: "VisitNo", displayName: $translate.instant('medicalcertificate.dischargesummary-list.opno.lbl') },
                {
                    field: "ReferralDate", displayName: $translate.instant('medicalcertificate.dischargesummary-list.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.ReferralDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.ReferralDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "ReferralType.Description", displayName: $translate.instant('medicalcertificate.dischargesummary-list.source.lbl') },
                { field: "ReferralDoctor", displayName: $translate.instant('medicalcertificate.dischargesummary-list.referralname.lbl') },
                { field: "CertificateStatus.Description", displayName: $translate.instant('medicalcertificate.dischargesummary-list.statuss.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                               <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-hide="row.entity.ReferralStatusId==2"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                               <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.ReferralStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                              <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.ReferralStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "Source" },
                //{ "Key": "Referral" },
                { "Key": "CertificateStatus" },
                { "Key": "ReferralType" },
                { "Key": "NoteType" },

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

    referralfeedbackListController.$inject = ['$scope','$filter', '$stateParams', '$state', '$translate', 'utl'];

})();