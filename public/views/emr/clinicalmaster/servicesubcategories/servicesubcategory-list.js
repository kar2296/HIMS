(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceSubCategoryListController', serviceSubCategoryListController);

function serviceSubCategoryListController($scope, $stateParams, $state, $translate, utl, $filter) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        Name : '',
        FacilityId : utl.Session.getCurrentFacilityId(),
        SourceTypeId : 1,
        ServiceCategoryId : -1,
        StatusId : 2
    };

    $scope.addNewLineItem = function() {
        var lineItem = {
            Id : 0,
            FacilityId : utl.Session.getCurrentFacilityId(),
            Status : 1,
            StatusId : true
        };

        vm.items.push(lineItem);
    }

    $scope.serviceCategoryChange = function(selectedCategory, item) {
        item.ServiceGroupId = selectedCategory.ServiceGroupId;
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
                { Key: 3, Value: $scope.currentfilter.SourceTypeId },
                { Key: 5, Value: $scope.currentfilter.StatusId },
                { Key: 6, Value: $scope.currentfilter.ServiceCategoryId }
            ],
            PageContext:{
                PageSize: 100,
                PageNumber: 1
            }
        };

        var options = {
            action: 'clinicalmaster/servicecategory/GetServiceSubCategorys',
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
    }

    $scope.deleteItem = function(idx, item) {
        var name = item.ServiceCategoryName || '';
        utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
    }

    $scope.onDetailSave = function(itemFromModal) {
        for(var idx in vm.items) {
            var item = vm.items[idx];
            if(item.currenteditable) {
                item = itemFromModal;
                item.currenteditable = false;
            }
        }
    }

    $scope.moreDetails = function(idx, item) {
        item.currenteditable = true;
        utl.Modal.open('app.servicesubcategory', {
                    params: { current_item : item },
                    confirmCallback: $scope.onDetailSave
                }
            );
    }

    //Save Item
    // $scope.saveItemCallback = function (scope, data, options, hasError) {
    //     utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
    //     $scope.getList();
    // };

    // $scope.saveItem = function () {
    //     if(validateGrid()) {
    //         var lines = getLinesForSave();
    //         var options = {
    //             action: 'clinicalmaster/servicecategory/ManageSerivceCategories',
    //             data: {Data : lines },
    //             type: 'post',
    //             onComplete: $scope.saveItemCallback
    //         };
    //         utl.Http.doAction(options);
    //     }
    // };
    $scope.saveItemCallback = function(scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        $scope.getList();
    };

    $scope.saveItem = function() {
        if (validateGrid()) {
            var lines = getLinesForSave();
            var options = {
                action: 'clinicalmaster/servicecategory/ManageSerivceCategories',
                data: { Data: lines },
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
            if(idx == lastIndex && !item.ServiceCategoryCode && !item.ServiceCategoryName) {
                continue;
            }
            else if(item.FacilityId == -1 || !item.ServiceCategoryCode || !item.ServiceCategoryName) {
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
            if(item.ServiceCategoryCode && item.ServiceCategoryName) {
                result.push(item);
            }
        }
        return result;
    }

    //lookup
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;

        //Compute ServiceCategory lookup
        var serviceCatList = [];
        for(var idx in $scope.lookup.ServiceCategory) {
            var item = $scope.lookup.ServiceCategory[idx];
            if(item.ParentServiceCategoryId == -1 || item.Id == -1) {
                serviceCatList.push(item);
            }
        }
        $scope.lookup.ServiceCategory = serviceCatList;

        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [
                            { "Key": "Facility" },
                            { "Key": "SourceType" },
                            { "Key": "OrderMasterStatus" },
                            { "Key": "ServiceCategory" }
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

serviceSubCategoryListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();