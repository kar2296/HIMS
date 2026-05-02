(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetDocumentListController', assetDocumentListController);

    function assetDocumentListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {};
        //  $scope.currentfilter.DocumentDate = new Date();
        $scope.currentcontext = {};
        $scope.currentcontext.assetid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentcontext.assetid > 0) {

                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.assetid },
                        // { Key: 2, Value: $scope.currentfilter.FacilityId },

                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'AssetManagement/AssetDocument/GetAssetDocuments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.item = {};
        $scope.backToForm = function () {
            $state.go('app.assettab.assetaccessories');
        }

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.openFixedDialog('app.assettab.assetdocument', {
                params: { id: 0 },
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
                action: 'AssetManagement/AssetDocument/DeleteAssetDocument',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        //Download File
        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function (entity) {
            var inputData = { FilePath: entity.FilePath };
            var options = {
                action: 'AssetManagement/AssetDocument/GetDocumentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Attachments);
            } else if (actionType == 'download') {
                $scope.downloadFile(entity);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "DocumentDate", displayName: $translate.instant('assetmanagement.assetdocument-list.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.DocumentDate'></ngformatdate>"
                },
                { field: "DocumentType.Description", displayName: $translate.instant('assetmanagement.assetdocument-list.type.lbl') },
                { field: "Name", displayName: $translate.instant('assetmanagement.assetdocument-list.attachments.lbl') },
                // { field: "YesNo.Description", displayName: $translate.instant('assetmanagement.assetdocument-list.releasetopatient.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'download\',entity)" ><a translate="Download"></a></span>\
                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><i class="btn btn-danger btn-xs fa fa-times" aria-hidden="true"></i></span>\
                                    </div>',
                                    handleEvent: $scope.handleEvents,
                    actions: [

                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        //  $scope.dashboard = function () {
        //    $state.go('patientemr.patientdashboard');
        // }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
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

    assetDocumentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();