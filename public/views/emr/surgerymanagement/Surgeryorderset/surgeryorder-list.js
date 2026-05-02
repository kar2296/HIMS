(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryorderListController', surgeryorderListController);

    function surgeryorderListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            ProcedureCodeSchemeId: -1,
            Code: "",
            ProcedureName: "",
            ProcedureTypeId: -1,
            ActiveStatusId: 2
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.ProcedureName
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ProcedureCodeSchemeId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.Code
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ProcedureTypeId
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/procedure/GetProcedures',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.openFixedDialog('app.surgeryorder-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
            // $state.go('app.surgeryorder-form', { id:0 });
        }


        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.openFixedDialog('app.surgeryorder-form', {
                    params: {
                        id: entity.Id,
                        IsProfile: entity.IsProfile,
                        ProcedureName: entity.ProcedureName
                    },
                    confirmCallback: $scope.initLookup
                });
                // $state.go('app.surgeryorder-form', {
                //     id: entity.Id,
                //     IsProfile: entity.IsProfile,
                //     ProcedureName: entity.ProcedureName
                // });
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ProcedureName",
                    displayName: $translate.instant('billingmaster.procedureservice-list.procedurename.lbl')
                },
                {
                    field: "Code",
                    displayName: $translate.instant('surgeryorder.code.lbl')
                },
                // { field: "ProcedureName", displayName: $translate.instant('billingmaster.procedureservice-list.procedurename.lbl') },
                // {
                //     field: "Department.SpecialityName",
                //     displayName: $translate.instant('billingmaster.procedureservice-list.department.lbl')
                // },
                {
                    field: "ProcedureType.Description",
                    displayName: $translate.instant('surgeryorder.type.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('billingmaster.procedureservice-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                       </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                        actiontype: 'edit',
                        display: 'common.editaction.lbl'
                    }]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ProcedureCodeScheme"
                },
                {
                    "Key": "ProcedureCategory"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "Department"
                }
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

    surgeryorderListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();