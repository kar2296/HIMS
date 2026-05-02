(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('customerMastersListController', customerMastersListController);

    function customerMastersListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            CustomerCode: '',
            CustomerName: '',
            ActiveStatusId: 2,
            CustomerTypeId: 1
        };

        $scope.Item = {
            Activefrom: utl.Formatter.getCurrentDate()
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                From: '',
                To: '',
                PinCode: '',
                Country: '',
                State: '',
                CityTown: '',
                Area: ''
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'text', translate: 'inventory.customermasters.number.lbl', model: 'PhoneNumber', position: { r: 0, c: 0 } },
                    { type: 'text', translate: 'inventory.customermasters.email.lbl', model: 'EmailAddress', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'inventory.customermasters.city.lbl', model: 'City', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'inventory.customermasters.state.lbl', model: 'LeadTime', position: { r: 1, c: 1 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.CustomerCode },
                    { Key: 2, Value: $scope.currentfilter.CustomerName },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 7, Value: $scope.advancedfilter.PhoneNumber },
                    { Key: 11, Value: $scope.currentfilter.ContactPerson }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/customermaster/GetCustomerMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.customermastertab.customermaster', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/customermaster/DeleteCustomerMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.customermastertab.customermaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    CustomerCode: entity.CustomerCode,
                    CustomerName: entity.CustomerName
                });
            } else if (actionType == 'view') {
                $state.go('app.customermastertab.customermaster', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    CustomerCode: entity.CustomerCode,
                    CustomerName: entity.CustomerName
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "CustomerType.Description",
                displayName: $translate.instant('inventory.customermasters.customertype.lbl')
            },
            {
                field: "CustomerCode",
                displayName: $translate.instant('inventory.customermasters.code.lbl')
            },
            {
                field: "CustomerName",
                displayName: $translate.instant('inventory.customermasters.name.lbl')
            },
            {
                field: "ContactPerson",
                displayName: $translate.instant('inventory.customermasters.contactperson.lbl')
            },
            {
                field: "MobileNumber",
                displayName: $translate.instant('inventory.customermasters.mobilenumber.lbl')
            },
            // {
            //     field: "PhoneNumber",
            //     displayName: $translate.instant('inventory.customermasters.phonenumber.lbl')
            // },
            {
                field: "EmailAddress",
                displayName: $translate.instant('inventory.customermasters.email.lbl')
            },
            {
                field: "GSTNumber",
                displayName: $translate.instant('inventory.customermasters.gstnumber.lbl')
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('inventory.customermasters.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                \
                </div>',
                handleEvent: $scope.handleEvents,
                actions: []
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
            var inputData = [{ "Key": "ActiveStatus" }]
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

    customerMastersListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();