(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('returninformationFormController', returninformationFormController);

function returninformationFormController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        name : ''
    };
    var itemmasterid = parseInt($stateParams.id);

    $scope.getListCallback = function (scope, data, options, hasError) {
        vm.gridConfig.data = data;
    };

    $scope.getList = function (pageNo) {

        var inputData = { 
            Params :[
               { Key: 2, Value: itemmasterid} 
            ],
            PageContext:{
                PageSize: 25,
                PageNumber: 1
            }
        };

        var options = {
            action: 'pharmacy/itemmaster/GetItemVendorMaps',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
    $scope.cancel = function () {
            $state.go('app.purchasereturn');
        }
        
    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.itemmastertab.itemmastervendormapping', { itemvendorid:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'pharmacy/itemmaster/DeleteItemVendorMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.itemmastertab.itemmastervendormapping', { itemvendorid:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "VendorName", displayName: $translate.instant('inventory.itemmastervendormappings.vendorname.lbl') },
                        { field: "Rank", displayName: $translate.instant('inventory.itemmastervendormappings.rank.lbl') },
                        { field: "Status", displayName: $translate.instant('inventory.itemmastervendormappings.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                          ]
                        }
                    ]
    };


    
    $scope.getList();
}

returninformationFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();