(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyterefmastersListController', analyterefmastersListController);

    function analyterefmastersListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            gender: -1,
            ActiveStatusId: 2,
            type: -1,
        };

        var analyteid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.gender
                    },
                    {
                        Key: 2,
                        Value: analyteid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.type
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/analytemaster/GetAnalyterefmasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function() {
        //     $state.go('app.analytetab.analyterefmaster', { refid: 0 });
        // }
        $scope.openModal = function (Id) {
            utl.Modal.open('app.analytetab.analyterefmasters', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.backToList = function () {
            $state.go('app.analytetab.analytemaster');
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/analytemaster/DeleteAnalyterefmaster',
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
                $scope.openModal(entity.Id);
                //   $state.go('app.analytetab.analyterefmaster', { refid:entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Gender.Description);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "Gender.Description",
                    displayName: $translate.instant('lis.analyterefmasters.gender.lbl')
                },
                {
                    field: "Age#",
                    displayName: $translate.instant('lis.analyterefmasters.agefromto.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Agefrom}} - {{entity.Ageto}} Days </div>'
                },
                /*
                { field: "Agefrom", displayName: $translate.instant('lis.analyterefmasters.agefrom.lbl') },
                { field: "Ageto", displayName: $translate.instant('lis.analyterefmasters.ageto.lbl') },
                */
                {
                    field: "AnalyteRefType.Description",
                    displayName: $translate.instant('lis.analyterefmaster.analytereftype_e.lbl')
                },
                {
                    field: "Refvalue",
                    displayName: $translate.instant('lis.analyterefmaster.refvalue.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('lis.analyterefmasters.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    // actions: [{
                    //         actiontype: 'edit',
                    //         display: 'common.editaction.lbl'
                    //     },
                    //     {
                    //         actiontype: 'delete',
                    //         display: 'common.deleteaction.lbl'
                    //     }
                    // ]
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
                    "Key": "Gender"
                },
                {
                    "Key": "ANALYTETYPE"
                },
                {
                    "Key": "ALIASESTYPE"
                },
                {
                    "Key": "ANALYTEREFTYPE"
                },
                {
                    "Key": "ANALYTEUOM"
                },
                {
                    "Key": "VALUETYPE"
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
                    "Key": "AnalyteMaster"
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

    analyterefmastersListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();