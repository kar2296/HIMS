(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceGroupListController', serviceGroupListController);

function serviceGroupListController($scope, $stateParams, $state, $translate, utl, $filter) {
    var vm = this;
    
    $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            Name: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            SourceTypeId: 1,
            ActiveStatusId: true
        };

        $scope.addNewLineItem = function () {
        var lineItem = {
            Id : 0,
            FacilityId : utl.Session.getCurrentFacilityId(),
            SourceTypeId : 1,
            Status : 1,
            StatusId : true
        };

        vm.items.push(lineItem);
    }
    //getlist
    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.items = res.Data;
        $scope.addNewLineItem();
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentfilter.Name },
                { Key: 2, Value: $scope.currentfilter.FacilityId },
                { Key: 3, Value: $scope.currentfilter.SourceTypeId }
            ],
            PageContext:{
                PageSize: 100,
                PageNumber: 1
            }
        };

        if($scope.currentfilter.StatusId == 1) {
            inputData.Params.push( { Key: 5, Value: 1});
        } else if($scope.currentfilter.StatusId == 0) {
            inputData.Params.push( { Key: 6, Value: 1});
        }

        var options = {
            action: 'clinicalmaster/servicegroup/GetServiceGroups',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
     
    $scope.clear = function() {
        vm.items = [];
        $scope.addNewLineItem();
    }

    $scope.addNew = function() {
        $scope.addNewLineItem();
    }

    //deleteLineItem
    $scope.onDeleteConfirmed = function(item) {
        item.Status = 2;
		$scope.saveItem();
    }

    $scope.deleteItem = function(idx, item) {
        var name = item.ServiceGroupName || '';
        utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
    }

    //Save Item
    $scope.saveItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.getList();
    };

    $scope.saveItem = function () {
        if(validateGrid()) {
            var lines = getLinesForSave();
            var options = {
                action: 'clinicalmaster/servicegroup/ManageSerivceGroups',
                data: {Data : lines },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
    };

    function validateGrid() {
        var activeRecords = $filter('filterArrayItems')(vm.items, [
            { search: 1, fields: ['Status'] }
        ]);

        var lastIndex = activeRecords.length-1;
        for(var idx in activeRecords) {
            var item = activeRecords[idx];
            if(idx == lastIndex && !item.ServiceGroupCode && !item.ServiceGroupName) {
                continue;
            }
            else if(item.FacilityId == -1 || item.SourceTypeId == -1 || !item.ServiceGroupCode || !item.ServiceGroupName) {
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                return false;
            }
        }
        return true;
    }

    function getLinesForSave() {
        var result = [];
        var lastIndex = vm.items.length-1;

        for(var idx in vm.items) {
            var item = vm.items[idx];
            if(item.ServiceGroupCode && item.ServiceGroupName) {
                result.push(item);
            } 
        }
        return result;
    }

    //lookup
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                            { "Key": "Facility" },
                            { "Key": "SourceType" },
                            { "Key": "OrderMasterStatus" },
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

serviceGroupListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();