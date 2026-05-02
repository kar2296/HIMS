(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('deathcertificateListController', deathcertificateListController);

    function deathcertificateListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            namemrn: '',
            patientname: '',
            CertificateStatusId: 3,
            DoctorId: -1,
            WardId: -1,
            admissionstatusid: -1,
            DischargeDate: ''
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                  

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: '',
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
        $scope.addNew = function () {
            $state.go('app.deathcertificate', {Id: 0} );

        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'DischargeSummary/PatientCertificate/DeletePatientCertificate',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.deathcertificate', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
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
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                //{ field: "NoteType.Description", displayName: $translate.instant('medicalcertificate.dischargesummary-list.type.lbl') },
                // { field: "Patient", displayName: $translate.instant('medicalcertificate.dischargesummary-list.patientid.lbl') },
                {
                    field: "ip no", displayName: $translate.instant('medicalcertificate.dischargesummary-list.ipno.lbl'),
                },
                {
      field: "AdmissionDate", displayName: $translate.instant('medicalcertificate.dischargesummary-list.doa.lbl'),
                },
                {
                    field: "Patient", displayName: $translate.instant('medicalcertificate.dischargesummary-list.patientname.lbl'),
   },
                {
                    field: "DischargeDate", displayName: $translate.instant('medicalcertificate.dischargesummary-list.dod.lbl'),
                },
  // {
                //     field: "Doctor", displayName: $translate.instant('medicalcertificate.dischargesummary-list.patientname.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{ row.entity.Doctor.Title.Description}}</span>' + '<span>&nbsp;&nbsp;</span>' +
                //     '<span>{{row.entity.Doctor.FirstName}}</span>' + '</div>'
                // },
                // { field: "Doctor.FirstName", displayName: $translate.instant('medicalcertificate.dischargesummary-list.Doctorname.lbl') },
                { field: "CertificateStatus.Description", displayName: $translate.instant('medicalcertificate.dischargesummary-list.notestatus.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    // cellTemplate: 'actionTemplate.html',
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                    //     { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    // ]
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
                { "Key": "NoteType" },
                { "Key": "Ward" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "CertificateStatus" },
                { "Key": "AdmissionStatus" }

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

    deathcertificateListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();