(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referencevalueListController', referencevalueListController);

    function referencevalueListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            name: ''
        };

        $scope.currentcontext = {};
        $scope.currentcontext.groupId = parseInt($stateParams.groupId);
        $scope.currentcontext.groupCode = $stateParams.groupCode;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    /* { Key: 'Name', Value: $scope.gridConfig.search ? $scope.gridConfig.search.text : "" }*/
                    {
                        Key: 2,
                        Value: $scope.currentcontext.groupId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.DescCode
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/referencevalue/GetReferenceValues',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.openModal = function (Id) {
            utl.Modal.open('app.referencevalue', {
                params: {
                    id: 0,
                    groupId: $scope.currentcontext.groupId,
                    groupCode: $scope.currentcontext.groupCode
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
        $scope.backToList = function () {
            $state.go('app.referencevaluegroups');
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/referencevalue/DeleteReferenceValue',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit' || actionType == 'view') {
                utl.Modal.open('app.referencevalue', {
                    params: {
                        id: entity.Id,
                        groupId: $scope.currentcontext.groupId,
                        groupCode: $scope.currentcontext.groupCode
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Description);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ReferenceValueCode",
                    displayName: $translate.instant('appmanager.referencevalues.code.lbl')
                },
                {
                    field: "Description",
                    displayName: $translate.instant('appmanager.referencevalues.description.lbl')
                },
                {
                    field: "DisplayOrder",
                    displayName: $translate.instant('appmanager.referencevalues.displayorder.lbl')
                },
                {
                    field: "ReferenceValueCodeId",
                    displayName: $translate.instant('appmanager.referencevalue.valuecodeid.lbl')
                },
                // { field: "AlternateName", displayName: $translate.instant('appmanager.referencevalues.alternatename.lbl') },
                {
                    field: "ColorCode",
                    displayName: $translate.instant('appointment.appointmentcategory-list.color.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:20px;width:20px;background:{{entity.ColorCode}}' class='col-sm-2'></div>\
                                                &nbsp;<span>{{entity.ColorCode}}</span>\
                                            </div>"
                },
                // {
                //     field: "ActiveFrom", displayName: $translate.instant('appmanager.referencevalues.activefrom.lbl'),
                //     cellTemplate: "<ngformatdate date-val='entity.ActiveFrom'></ngformatdate>"
                // },
                // {
                //     field: "ActiveTo", displayName: $translate.instant('appmanager.referencevalues.activeto.lbl'),
                //     cellTemplate: "<ngformatdate date-val='entity.ActiveTo'></ngformatdate>"
                // },
                // { field: "Language.Description", displayName: $translate.instant('appmanager.referencevalues.language.lbl') },
                // { field: "NumericValue", displayName: $translate.instant('appmanager.referencevalues.numericvalue.lbl') },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('appmanager.referencevaluegroups.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        },
                        {
                            actiontype: 'delete',
                            display: 'common.deleteaction.lbl'
                        }
                    ]
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
                "Key": "ActiveStatus"
            }]
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

    referencevalueListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();