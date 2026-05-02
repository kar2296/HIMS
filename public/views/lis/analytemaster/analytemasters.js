(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyteMasterListController', analyteMasterListController);

    function analyteMasterListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: '',
            codemnemonicsnamedesc: '',
            code: '',
            ActiveStatusId: 2,
            //type : -1,
            vtype: -1,
            mnemonics: '',
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.codemnemonicsnamedesc
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.type
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.vtype
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.FacilityId
                }
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

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.analytetab.analytemaster', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/analytemaster/DeleteAnalytemaster',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.analytetab.analytemaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    AnalyteName: entity.Code + ' - ' + entity.Name
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            } else if (actionType == 'view') {
                $state.go('app.analytetab.analytemaster', {
                    id: 0
                });
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
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
                "Key": "Organization"
            },
            {
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "ANALYTETYPE"
            },
            {
                "Key": "ANALYTEUOM"
            },
            {
                "Key": "ANALYTEVALUETYPE"
            },
            {
                "Key": "SampleMaster",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }]
                }
            },
            {
                "Key": "GRAPHTYPE"
            },
            {
                "Key": "ActiveStatus"
            }
            ]
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

    analyteMasterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();