(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templateMasterListController', templateMasterListController);

    function templateMasterListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Name: "",
            FacilityId: utl.Session.getCurrentFacilityId(),
            TemplateTypeId: -1,
            AccessibleTypeId: -1,
            ActiveStatusId: 2
        };

        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                DepartmentId: -1,
                UserId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'select',
                        translate: 'clinicalmaster.panelmaster-list.user.lbl',
                        model: 'UserId',
                        options: $scope.lookup.User,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'clinicalmaster.panelmaster-list.department.lbl',
                        model: 'DepartmentId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
                ]
            };
        }


        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.backtoList = function () {
            $state.go('app.medicalmasterdashboard');
        }
        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        //Dynamic form  ends

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = data.Data.length;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.Name
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.TemplateTypeId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 5,
                        Value: $scope.advancedfilter.UserId
                    },
                    {
                        Key: 7,
                        Value: $scope.advancedfilter.DepartmentId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.AccessibleTypeId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/TemplateMaster/GetTemplateMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.templatemaster', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/TemplateMaster/DeleteTemplateMaster',
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
                $state.go('app.templatemaster', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "Facility.FacilityName", displayName: $translate.instant('clinicalmaster.panelmaster-list.facility.lbl') },
                {
                    field: "Name",
                    displayName: $translate.instant('clinicalmaster.panelmaster-list.name.lbl')
                },
                {
                    field: "TemplateType.Description",
                    displayName: $translate.instant('clinicalmaster.panelmaster-list.type.lbl')
                },
                {
                    field: "AccessibleType.Description",
                    displayName: $translate.instant('clinicalmaster.ticksheet-list.accessiabletype.lbl')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('clinicalmaster.panelmaster-list.department.lbl')
                },
                {
                    field: "User",
                    displayName: $translate.instant('clinicalmaster.panelmaster-list.user.lbl'),
                    cellTemplate: "<div>" +
                        "<span>{{entity.User.Title.Description}}&nbsp;</span>" +
                        "<span>{{entity.User.FirstName}}&nbsp;</span>" +
                        "<span>{{entity.User.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('clinicalmaster.panelmaster-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "AccessibleType"
                },
                {
                    "Key": "TemplateType"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "User"
                },
                {
                    "Key": "Department"
                },
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

    templateMasterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();