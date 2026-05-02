(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('GeneralExpensesListController', GeneralExpensesListController);

    function GeneralExpensesListController($rootScope, $scope, $stateParams, $state, $filter, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            UserId: utl.Session.getCurrentUserId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            PaymentTypeId: -1,
            ExpenseStatusId: 2,
        };
        $scope.lookup = {};

        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        //     vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        // };

        $scope.getListCallback = function(scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var totalamount = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.ExpenseAmount = isNaN(parseFloat(item.ExpenseAmount)) ? (0) : parseFloat(item.ExpenseAmount);

                totalamount = totalamount + (item.ExpenseAmount)

                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetamount = totalamount;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.VoucherNo
                    },
                    // { Key: 2, Value: $scope.currentfilter.ExpenseDate },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.UserId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.GeneralExpenseStatusId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.PaymentTypeId
                    },
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    },
                    {
                        Key: 7,
                        Value: utl.Session.getCurrentFacilityId()
                    },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/GeneralExpenses/GetGeneralExpensess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                    vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.currentfilter.UserId = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.openModal = function(Id) {
            utl.Modal.openFixedDialog('app.generalexpensesform', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }

        //Grid Actions
        $scope.addNew = function() {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'Billing/GeneralExpenses/DeleteGeneralExpenses',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.CancelCallback = function(scope, data, options, hasError) {
            $scope.getList();
        };
        $scope.Cancel = function(GeneralExpenseId) {
            var options = {
                action: 'Billing/GeneralExpenses/UpdateGeneralExpenses',
                data: {
                    Data: {
                        Id: GeneralExpenseId,
                        ExpenseStatusId: 3
                    }
                },
                type: 'post',
                onComplete: $scope.CancelCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            }
            if (actionType == 'view') {
                $scope.openModal(entity.Id);
            }
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
            if (actionType == 'cancel') {
                utl.Dialog.confirmCancel($scope.Cancel, entity.Id);
                // utl.Dialog.confirmDelete( $scope.Cancel, entity.Id,3);
                // $scope.Cancel(entity.Id, 3);
            }

        }

        var rowtpl = '<div ng-class="{\'GeneralExpenseStatus\':entity.ExpenseStatusId==3 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('billing.generalexpenses.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "ExpenseDate",
                    displayName: $translate.instant('billing.generalexpenses.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ExpenseDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.ExpenseDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "VoucherNo",
                    displayName: $translate.instant('billing.generalexpenses.voucherno.lbl'),

                },
                {
                    field: "ExpenseAmount",
                    displayName: $translate.instant('billing.generalexpenses.amount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ExpenseAmount | displaycurrency}}</span>" + "</div>"
                        // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.ExpenseAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "RequestedUser",
                    displayName: $translate.instant('billing.generalexpenses.username.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.RequestedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestedUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "GeneralExpenseType.Description",
                    displayName: $translate.instant('billing.generalexpenses.type.lbl'),

                },
                {
                    field: "PaymentType.Description",
                    displayName: $translate.instant('Payment Mode'),

                },
                {
                    field: "Remarks",
                    displayName: $translate.instant('Remarks'),

                },
                {
                    field: "GeneralExpenseStatus.Description",
                    displayName: $translate.instant('billing.generalexpenses.status.lbl'),

                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span> \
                                <span class="grid-action" ng-click="handleEvents(\'cancel\',entity)"  ng-show="entity.ExpenseStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ExpenseStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                              </div>',
                    handleEvent: $scope.handleEvents,
                }

                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' },
                //         { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                //     ]
                // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "GeneralExpenseStatus"
                },
                {
                    "Key": "GeneralExpenseType"
                },
                {
                    "Key": "PaymentType"
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

    GeneralExpensesListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$filter', '$translate', 'utl', '$timeout'];

})();