(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otDocumentController', otDocumentController);

    function otDocumentController($scope, $stateParams, $state, $translate, utl, ) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {};
        $scope.currentcontext = {};
        $scope.currentcontext.otregisterid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.otregisterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'OtManagement/OtDocument/GetOtDocuments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.otregistertab.otregister', { id: $scope.currentcontext.otregisterid });
        }
        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('app.otregistertab.document', {
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
                action: 'OtManagement/OtDocument/DeleteOtDocument',
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

        $scope.downloadFile = function (row) {
            var inputData = { FilePath: row.entity.FilePath };
            var options = {
                action: 'OtManagement/OtDocument/GetDocumentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.Attachments);
            } else if (actionType == 'download') {
                $scope.downloadFile(row);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "CreatedDate", displayName: $translate.instant('assetmanagement.assetdocument-list.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.DocumentDate'></ngformatdate>"
                },
                { field: "DocumentType.Description", displayName: $translate.instant('assetmanagement.assetdocument-list.type.lbl') },
                { field: "Name", displayName: $translate.instant('assetmanagement.assetdocument-list.attachments.lbl') },
                { field: "YesNo.Description", displayName: $translate.instant('assetmanagement.assetdocument-list.releasetopatient.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="grid.appScope.handleEvents(\'download\',row)" ><a translate="Download"></a></span>\
                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                    </div>',
                    actions: [

                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.printOtDocuments = function () {
            var inputData = {
                Id: $scope.currentcontext.otregisterid
            };
            var options = {
                action: 'OtManagement/OtDocument/printOtDocuments',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

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

    otDocumentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();