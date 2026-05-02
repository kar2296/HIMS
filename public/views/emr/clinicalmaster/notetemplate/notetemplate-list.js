(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('notetemplateListController', notetemplateListController);

    function notetemplateListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.temptype) {
            $scope.TempType = $stateParams.temptype;
        }
        $scope.Items = [];
        $scope.currentfilter = {
            Code: "",
            DepartmentId: -1,
            NoteTypeId: -1,
            ActiveStatusId: 2
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.NoteTypeId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.Code
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/NoteTemplate/GetNoteTemplates',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.notetemplate', {
                params: {
                    id: Id,
                    temptype: $scope.TempType
                },
                confirmCallback: $scope.initLookup
            });
        }
        $scope.backtoList = function () {
            if ($scope.Context == 'lab') {
                $state.go('app.labdashboard');
            } else if ($scope.Context == 'ris') {
                $state.go('app.ris_dashboard');
            } else if ($scope.Context == 'medical') {
                $state.go('app.medicalmasterdashboard');
            }
        }

        //Grid Actions
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
                action: 'clinicalmaster/NoteTemplate/DeleteNoteTemplate',
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
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.AllergyName);
                /*var confirmOptions = {
                    headingKey : 'common.confirm-modal-header.lbl',
                    messageKey : 'common.deletemsg.lbl',
                    yesKey : 'common.yeskey.lbl',
                    noKey : 'common.nokey.lbl',
                    onSuccessMethod : $scope.onDeleteConfirmed,
                    itemId : entity.Id
                };
                utl.Dialog.confirmMessage(confirmOptions);
                */
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "NoteType.Description",
                    displayName: $translate.instant('clinicalmaster.notetemplate-list.templatetype.lbl')
                },
                {
                    field: "Code",
                    displayName: $translate.instant('clinicalmaster.notetemplate-list.templatecode.lbl')
                },
                {
                    field: "TemplateName",
                    displayName: $translate.instant('clinicalmaster.notetemplate-list.templatename.lbl')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('clinicalmaster.notetemplate-list.department.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('clinicalmaster.notetemplate-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
                    "Key": "Department"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "NoteType"
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

    notetemplateListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();