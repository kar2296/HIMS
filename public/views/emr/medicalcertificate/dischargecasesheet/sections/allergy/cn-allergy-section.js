(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('discasshtcnAllergySectionController', discasshtcnAllergySectionController);

    function discasshtcnAllergySectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Name: '',
            AllergyTypeId: -1,
            PatientAllergyStatusId: -1
        };


        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        }
        //Favorite area starts
        $scope.favconfig = {
            favoritetypeid: 1,
            selectedlist: [],
            selecteddetail: {}
        };

        $scope.addFavorite = function () {
            utl.Modal.open('patientemr.patientallergy', {
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.favconfig.selecteddetail.ItemId, cid: $scope.currentcontext.cid },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.saveFavoritesCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.saveFavorites = function () {
            var list = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                var allergy = utl.Lookup.getObject($scope.lookup.Allergy, favitem.ItemId);

                var item = {
                    PatientId: $scope.currentcontext.pid, AllergyId: favitem.ItemId,
                    AllergyName: allergy.AllergyName, AllergyTypeId: allergy.AllergyTypeId,
                    Description: allergy.Description, StartDate: utl.Formatter.getCurrentDate(),
                    PatientAllergyStatusId: 1, EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                };
                list.push(item);
            }

            var options = {
                action: 'emr/patientallergy/ManagePatientAllergys',
                data: { Data: list },
                type: 'post',
                onComplete: $scope.saveFavoritesCallback
            };
            utl.Http.doAction(options);
        }

        //Favorite area ends

        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Name },
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.AllergyTypeId },
                    { Key: 4, Value: $scope.currentfilter.PatientAllergyStatusId },
                    { Key: 5, Value: $scope.currentcontext.eid },
                    { Key: 6, Value: $scope.currentcontext.cid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
          //popup
          $scope.labresult = function () {
            utl.Modal.open('patientemr.labresults', {
                params: {
                    eid: $scope.currentcontext.eid, pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.radiologyresult = function () {
            utl.Modal.open('patientemr.radiologyresults', {
                params: {
                    eid: $scope.currentcontext.eid, pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        //Grid Actions
        $scope.backToList = function () {
            $state.go('patientemr.dischargecasesheets', { pid: $scope.currentcontext.pid });
        }
        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientallergy', {
                params: { id: 0, pid: $scope.currentcontext.pid, cid: $scope.currentcontext.cid },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientallergy/DeletePatientAllergy',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientallergy', {
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid, cid: $scope.currentcontext.cid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "AllergyType.Description", displayName: $translate.instant('patientemr.patientallergy-list.type.lbl') },
                { field: "AllergyName", displayName: $translate.instant('patientemr.patientallergy-list.name.lbl') },
                {
                    field: "StartDate", displayName: $translate.instant('patientemr.patientallergy-list.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.StartDate'></ngformatdate>"
                },
                { field: "PatientAllergyStatus.Description", displayName: $translate.instant('patientemr.patientallergy-list.status.lbl') },
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
        //viewConsultation
        $scope.viewConsultation = function (item) {
            utl.Modal.open('patientemr.reviewnotes', {
                params: { cid: item.Id, pid: $scope.currentcontext.pid }
            });
        }
        //previousnotes
        $scope.getAllConsultationCallback = function (scope, res, options, hasError) {
            $scope.consultlist = res.Data;
            // consultlist = res.Data;
        };
        $scope.getallConsultation = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.eid },
                    { Key: 3, Value: $scope.currentcontext.pid },
                    { Key: 11, Value: 2 },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/consultation/GetConsultations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAllConsultationCallback
            };
            utl.Http.doAction(options);
        };
        //get consultation
        $scope.getCurrentConsultationCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.eid = data.EncounterId;
            $scope.getallConsultation();
            //loadSectionData();
        };

        $scope.getCurrentConsultation = function (pageNo) {
            if ($scope.currentcontext.cid && $scope.currentcontext.cid > 0) {

                var options = {
                    action: 'emr/consultation/GetConsultationById',
                    data: { Id: $scope.currentcontext.cid },
                    type: 'post',
                    onComplete: $scope.getCurrentConsultationCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Allergy" },
                { "Key": "AllergyType" },
                { "Key": "PatientAllergyStatus" }
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
        $scope.getCurrentConsultation();
    }

    discasshtcnAllergySectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();