(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otcnFamilySocialHistorySectionController', otcnFamilySocialHistorySectionController);

    function otcnFamilySocialHistorySectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            SocialHistoryStatusId: 1
        };

        $scope.currentfilter = {
            name: '',
            SocialTypeId: -1
        };

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.currentcontext = {};

        $scope.currentcontext.otregid = $scope.$parent.currentcontext.id;
        $scope.currentcontext.pid = $scope.$parent.currentcontext.pid;
        $scope.currentcontext.eid = $scope.$parent.currentcontext.eid;

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.cid = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.cid = $scope.$parent.cncontext.consultationid;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        //Favorite area starts
        $scope.favconfig = {
            favoritetypeid: 5,
            selectedlist: [],
            selecteddetail: {}
        };

        $scope.addFavorite = function () {
            utl.Modal.open('patientemr.familysocialhistory', {
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
                var procedure = utl.Lookup.getObject($scope.lookup.Procedure, favitem.ItemId);

                var item = {
                    PatientId: $scope.currentcontext.pid, SocialTypeId: favitem.ItemId,
                    ReviewDate: utl.Formatter.getCurrentDate(), SocialHistoryStatusId: 1,
                    EncounterId: $scope.currentcontext.eid,
                    ConsultationId: $scope.currentcontext.cid
                };
                list.push(item);
            }

            var options = {
                action: 'emr/familysocialhistory/ManageFamilySocialHistorys',
                data: { Data: list },
                type: 'post',
                onComplete: $scope.saveFavoritesCallback
            };
            utl.Http.doAction(options);
        }

        //Favorite area ends

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.SocialTypeId },
                    { Key: 6, Value: $scope.currentcontext.cid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/familysocialhistory/GetFamilySocialHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.backToList = function () {
            $state.go('patientemr.consultations', { pid: $scope.currentcontext.pid });
        }
        $scope.addNew = function () {
            utl.Modal.open('patientemr.familysocialhistory', {
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
                action: 'emr/familysocialhistory/DeleteFamilySocialHistory',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.familysocialhistory', {
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid, cid: $scope.currentcontext.cid },
                    confirmCallback: $scope.getList
                }
                );
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.SocialSeverity);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "SocialType.Description", displayName: $translate.instant('patientemr.familysocialhistory-list.socialtype.lbl') },
                { field: "SocialFrequency.Description", displayName: $translate.instant('patientemr.familysocialhistory-list.frequency.lbl') },
                { field: "Relationship.Description", displayName: $translate.instant('patientemr.familysocialhistory-list.relationship.lbl') },
                { field: "Severity.Description", displayName: $translate.instant('patientemr.familysocialhistory-list.severity.lbl') },
                {
                    field: "ReviewDate", displayName: $translate.instant('patientemr.familysocialhistory-list.reviewdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.ReviewDate'></ngformatdate>"
                },
                { field: "SocialHistoryStatus.Description", displayName: $translate.instant('patientemr.familysocialhistory-list.status.lbl') },
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
                { "Key": "SocialType" },
                { "Key": "SocialFrequency" },
                { "Key": "Relationship" },
                { "Key": "SocialHistoryStatus" }
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

    otcnFamilySocialHistorySectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();