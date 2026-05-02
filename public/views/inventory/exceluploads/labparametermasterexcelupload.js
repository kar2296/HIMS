(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabParameterMasterExceluploadController', LabParameterMasterExceluploadController);

    function LabParameterMasterExceluploadController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.lookup = {};

        $scope.backtoDashboard = function () {
            $state.go('app.exceluploads');
        }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.importlabparametermasterexcel', {
                params: { id: Id },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.itemUpload = function() {
            $scope.openModal(0,false);
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [{
                    Key: 6,
                    Value: true
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/analytemaster/GetAnalytemasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/analytemaster/DeleteAnalytemaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id,false);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "Code",
                displayName: $translate.instant('lis.analytemasters.code.lbl')
            },
            {
                field: "Name",
                displayName: $translate.instant('lis.analytemasters.name.lbl')
            },
            {
                field: "AnalyteType.Description",
                displayName: $translate.instant('lis.analytemasters.type.lbl')
            },
            {
                field: "Mnemonics",
                displayName: $translate.instant('lis.analytemasters.mnemonics.lbl')
            },
            {
                field: "AnalyteuomId",
                displayName: $translate.instant('lis.analytemasters.uom.lbl')
            },
            // { field: "Loinccode", displayName: $translate.instant('lis.analytemasters.loinccode.lbl') },
            // { field: "Component", displayName: $translate.instant('lis.analytemasters.component.lbl') },
            {
                field: "Methodology",
                displayName: $translate.instant('lis.analytemasters.methodology.lbl')
            },
            {
                field: "Sampletype.Name",
                displayName: $translate.instant('lis.analytemasters.sampletypeid.lbl')
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('lis.analytemasters.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                </div>',
                handleEvent: $scope.handleEvents,
                // actions: [
                //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                //     { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                //                      ]
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },]
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

    LabParameterMasterExceluploadController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();