(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('vendormasterERPMapListController', vendormasterERPMapListController);

    function vendormasterERPMapListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };

        var vendormasterid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var VendorCode = $state.params.VendorCode;
        var VendorName = $state.params.VendorName;

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function(pageNo) {

            var inputData = {
                Params: [
                    //{ Key: 2, Value: vendormasterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/vendormaster/GetVendorERPMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        /*
        $scope.addNew = function() {
            utl.Modal.open('app.vendormastertab.vendormastererpmapping', {
                params: { id: $scope.currentcontext.id },
                confirmCallback: $scope.getList
            });
        }
        */
        $scope.addNew = function() {
            $state.go('app.vendormastertab.vendormastererpmapping', { vendorerpid: 0, VendorCode: $state.params.VendorCode, VendorName: $state.params.VendorName });
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'pharmacy/vendormaster/DeleteVendorERPMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        /*
        $scope.openModal = function(Id) {
            utl.Modal.open('app.vendormastertab.vendormastererpmapping', {
                params: { id: Id },
                confirmCallback: $scope.getList

            });
        }

        $scope.handleEvents = function(actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('app.vendormastertab.vendormastererpmapping', {
                    params: { id: row.entity.Id },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }
        */

        $scope.handleEvents = function(actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.vendormastertab.vendormastererpmapping', { vendorerpid: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "ErpAccountType.Description", displayName: $translate.instant('inventory.vendormastererpmappings.accounttype.lbl') },
                { field: "ErpSubAccountType.Description", displayName: $translate.instant('inventory.vendormastererpmappings.subaccounttype.lbl') },
                { field: "ErpGLClassType.Description", displayName: $translate.instant('inventory.vendormastererpmappings.glclasstype.lbl') },
                { field: "ErpGLClassName", displayName: $translate.instant('inventory.vendormastererpmappings.glclassname.lbl') },
                { field: "ErpCreditAccountNo", displayName: $translate.instant('inventory.vendormastererpmappings.creditaccountno.lbl') },
                { field: "ErpDebitAccountNo", displayName: $translate.instant('inventory.vendormastererpmappings.debitaccountno.lbl') },
                { field: "Bank.Description", displayName: $translate.instant('inventory.vendormastererpmappings.vendorbankname.lbl') },
                { field: "BankAccountNo", displayName: $translate.instant('inventory.vendormastererpmappings.vendoraccountno.lbl') },
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

    vendormasterERPMapListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();