(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemmasterContractListController', facilityitemmasterContractListController);

    function facilityitemmasterContractListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {};
        //  $scope.currentfilter.DocumentDate = new Date();
        $scope.currentcontext = {};
        // $scope.currentcontext.assetid = parseInt($stateParams.id);   

        $scope.backToList = function () {
            $state.go('app.itemmastertab.itemmaster');
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentcontext.id > 0) {

                var inputData = {
                    Params: [
                        //   { Key: 1, Value: $scope.currentcontext.assetid } 
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'pharmacy/ItemContractMap/GetItemContractMaps',
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
            utl.Modal.open('app.itemmastertab.itemmastercontract', {
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
                action: 'pharmacy/ItemContractMap/DeleteItemContractMap',
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
                action: 'pharmacy/ItemContractMap/GetDocumentFile',
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
                    field: "DocumentDate", displayName: $translate.instant('assetmanagement.assetdocument-list.date.lbl'),
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

    facilityitemmasterContractListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();