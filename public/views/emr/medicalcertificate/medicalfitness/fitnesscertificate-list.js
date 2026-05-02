(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FitnessCertificateListController', FitnessCertificateListController);

    function FitnessCertificateListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            patientnamemrn: '',
            CertificateStatusId: -1
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            console.log(res.Data);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.patientnamemrn },
                    { Key: 3, Value: $scope.currentfilter.CertificateStatusId },
                    { Key: 4, Value: $scope.currentfilter.NoteTemplateId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/FitnessCertificate/GetFitnessCertificates',
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
            $state.go('app.fitnesscertificate', { id: 0 });
            // $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/FitnessCertificate/DeleteFitnessCertificate',
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
                $state.go('app.fitnesscertificate', { id: row.entity.Id, pid: row.entity.PatientId });
            } else if (actionType == 'view') {
                $state.go('app.fitnesscertificate', { id: row.entity.Id, pid: row.entity.PatientId });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
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
                { field: "CertificateStatus.Description", displayName: $translate.instant('medicalcertificate.dischargesummary-list.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                               <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-hide="row.entity.CertificateStatusId==2"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                               <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.CertificateStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                              <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.CertificateStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
                { "Key": "CertificateStatus" },
                { "Key": "NoteType" },
                {"Key":"NoteTemplate"}

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

    FitnessCertificateListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();