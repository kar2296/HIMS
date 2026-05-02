(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('customermasterContactListController', customermasterContactListController);

    function customermasterContactListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };

        var customermasterid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var CustomerCode = $state.params.CustomerCode;
        var CustomerName = $state.params.CustomerName;

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function(pageNo) {

            var inputData = {
                Params: [
                    { Key: 2, Value: customermasterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/customermaster/GetCustomerContacts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function() {
            $state.go('app.customermastertab.customermastercontact', { customercontactid: 0, CustomerCode: $state.params.CustomerCode, CustomerName: $state.params.CustomerName });
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'pharmacy/customermaster/DeleteCustomerContact',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.customermastertab.customermastercontact', { customercontactid: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "ContactType.Description", displayName: $translate.instant('inventory.customermastercontacts.contacttype.lbl') },
                { field: "ContactPerson", displayName: $translate.instant('inventory.customermastercontacts.contactperson.lbl') },
                { field: "MobileNo", displayName: $translate.instant('inventory.customermastercontacts.mobileno.lbl') },
                { field: "PhoneNo", displayName: $translate.instant('inventory.customermastercontacts.phoneno.lbl') },
                { field: "EMail", displayName: $translate.instant('inventory.customermastercontacts.email.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',

                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" }
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

    customermasterContactListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();