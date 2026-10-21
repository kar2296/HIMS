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

        $scope.pagerObj = {
            totalItems: 0,
            currentPage: 1,
            startIndex: 0,
            pageSize: 25
        };

        $scope.reactProps = {
            items: [],
            totalItems: 0,
            currentPage: 1,
            pageSize: 25,
            currentfilter: $scope.currentfilter,
            lookup: {},
            tempType: $scope.TempType,
            context: $scope.Context
        };

        $scope.syncReactProps = function () {
            $scope.reactProps = {
                items: $scope.Items,
                totalItems: $scope.pagerObj.totalItems,
                currentPage: $scope.pagerObj.currentPage,
                pageSize: $scope.pagerObj.pageSize,
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                tempType: $scope.TempType,
                context: $scope.Context
            };
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.Items = res.Data || [];
            $scope.pagerObj.totalItems = res.PageContext ? res.PageContext.TotalRecords : (res.Data ? res.Data.length : 0);
            if (vm.gridConfig) {
                vm.gridConfig.data = res.Data;
                vm.gridConfig.pagerObj.totalItems = $scope.pagerObj.totalItems;
            }
            $scope.syncReactProps();
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.NoteTypeId },
                    { Key: 2, Value: $scope.currentfilter.Code },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
                ],
                PageContext: {
                    PageSize: $scope.pagerObj.pageSize,
                    PageNumber: $scope.pagerObj.currentPage
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
        };

        $scope.backtoList = function () {
            if ($scope.Context == 'lab') {
                $state.go('app.labdashboard');
            } else if ($scope.Context == 'ris') {
                $state.go('app.ris_dashboard');
            } else if ($scope.Context == 'medical') {
                $state.go('app.medicalmasterdashboard');
            } else {
                $state.go('app.medicalmasterdashboard');
            }
        };

        $scope.addNew = function () {
            $scope.openModal(0);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/NoteTemplate/DeleteNoteTemplate',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.TemplateName || entity.Code);
            }
        };

        // Bridge handler for React component actions
        $scope.handleAction = function (actionName, payload) {
            $scope.$evalAsync(function () {
                switch (actionName) {
                    case 'search':
                        if (payload) {
                            $scope.currentfilter.Code = payload.Code || '';
                        }
                        $scope.pagerObj.currentPage = 1;
                        $scope.getList();
                        break;
                    case 'filterChange':
                        if (payload) {
                            if (payload.NoteTypeId !== undefined) $scope.currentfilter.NoteTypeId = payload.NoteTypeId;
                            if (payload.DepartmentId !== undefined) $scope.currentfilter.DepartmentId = payload.DepartmentId;
                            if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
                            if (payload.Code !== undefined) $scope.currentfilter.Code = payload.Code;
                        }
                        $scope.pagerObj.currentPage = 1;
                        $scope.getList();
                        break;
                    case 'pageChange':
                        if (payload && payload.page) {
                            $scope.pagerObj.currentPage = payload.page;
                            $scope.getList();
                        }
                        break;
                    case 'addNew':
                        // Handled natively by modern React NoteTemplateFormModal
                        break;
                    case 'home':
                        $scope.backtoList();
                        break;
                    case 'edit':
                        // Handled natively by modern React NoteTemplateFormModal
                        break;
                    case 'reload':
                        $scope.getList();
                        break;
                    case 'delete':
                        if (payload && payload.Id !== undefined) {
                            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, payload.Id, payload.TemplateName || payload.Code);
                        }
                        break;
                }
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.syncReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "ActiveStatus" },
                { "Key": "NoteType" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    notetemplateListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();