(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ClinicalListController', ClinicalListController);

    function ClinicalListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            
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
                action: 'SystemSettings/facility/GetFacilitys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            $state.go('app.clinicalmanagements', { id: 0 });
        }



        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'AssetManagement/AssetAudit/DeleteAssetAudit',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {

                $state.go('app.manageevents', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AssetName);
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
                { field: "PatientId", displayName: $translate.instant('appointment.clinicalmanagement.patientid.lbl') },

                { field: "PatientName", displayName: $translate.instant('appointment.clinicalmanagement.patientname.lbl') },

                { field: "DOB", displayName: $translate.instant('appointment.clinicalmanagement.dob.lbl') },
                { field: "Age", displayName: $translate.instant('appointment.clinicalmanagement.age.lbl') },
                { field: "Gender", displayName: $translate.instant('appointment.clinicalmanagement.gender.lbl') },
                { field: "DoctorName", displayName: $translate.instant('appointment.clinicalmanagement.doctorname.lbl') },

                { field: "Contact", displayName: $translate.instant('appointment.clinicalmanagement.contact.lbl') },

                { field: "Address", displayName: $translate.instant('appointment.clinicalmanagement.address.lbl') },
                { field: "lastdetail", displayName: $translate.instant('appointment.clinicalmanagement.lastdetail.lbl') },
                
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "EventType" },
                
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

    ClinicalListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();