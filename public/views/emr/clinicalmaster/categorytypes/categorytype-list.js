(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('categoryTypeListController', categoryTypeListController);

function categoryTypeListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        CategoryTypeRefId : -1,
        ActiveStatusId : 2
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentfilter.Name },
                { Key: 2, Value: $scope.currentfilter.CategoryTypeRefId },
                { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'clinicalmaster/CategoryTypeMaster/GetCategoryTypeMasters',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $scope.openModal(0);
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/CategoryTypeMaster/DeleteCategoryTypeMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $scope.openModal(row.entity.Id);
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        }
    }

    $scope.openModal = function (Id) {
        utl.Modal.open('app.categorytype', {
            params: { id: Id }, confirmCallback: $scope.initLookup
        });
    }

    categoryTypeListController
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Name", displayName: $translate.instant('clinicalmaster.categorytype-list.name.lbl') },
                        { field: "Description", displayName: $translate.instant('clinicalmaster.categorytype-list.description.lbl') },
                        { field: "CategoryTypeRef.Description", displayName: $translate.instant('clinicalmaster.categorytype-list.type.lbl') },
                        { field: "IsAssociatedWithCC", displayName: $translate.instant('clinicalmaster.categorytype-list.associatedwithcc.lbl'),
                            cellTemplate : "<displayyesno input-val='row.entity.IsAssociatedWithCC'></displayyesno>" },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.categorytype-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                         ]
                        }
                    ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
    
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    };

    $scope.refreshReactProps = function () {
        $scope.reactProps = {
            items: vm.gridConfig.data || [],
            totalItems: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.totalItems) || 0,
            currentPage: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.currentPage) || 1,
            pageSize: (vm.gridConfig.pagerObj && vm.gridConfig.pagerObj.pageSize) || 25,
            pagerObj: vm.gridConfig.pagerObj,
            currentfilter: $scope.currentfilter,
            lookup: $scope.lookup || {}
        };
    };

    var _origGetListCallback = $scope.getListCallback;
    $scope.getListCallback = function (scope, res, options, hasError) {
        _origGetListCallback(scope, res, options, hasError);
        $scope.refreshReactProps();
        $scope.$applyAsync();
    };

    var _origLookupCallback = $scope.lookupCallback;
    $scope.lookupCallback = function (scope, data, options, hasError) {
        _origLookupCallback(scope, data, options, hasError);
        $scope.refreshReactProps();
        $scope.$applyAsync();
    };

    $scope.handleReactAction = function (actionName, payload) {
        if (actionName === 'search') {
            if (payload) {
                if (payload.Name !== undefined) $scope.currentfilter.Name = payload.Name;
                if (payload.CategoryTypeRefId !== undefined) $scope.currentfilter.CategoryTypeRefId = payload.CategoryTypeRefId;
                if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
            }
            vm.gridConfig.pagerObj.currentPage = 1;
            $scope.getList();
        } else if (actionName === 'resetFilters') {
            $scope.currentfilter.Name = '';
            $scope.currentfilter.CategoryTypeRefId = -1;
            $scope.currentfilter.ActiveStatusId = 2;
            vm.gridConfig.pagerObj.currentPage = 1;
            $scope.getList();
        } else if (actionName === 'pageChange') {
            vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
            $scope.getList();
        } else if (actionName === 'addNew') {
            $scope.addNew();
        } else if (actionName === 'edit') {
            $scope.handleEvents('edit', payload);
        } else if (actionName === 'delete') {
            $scope.handleEvents('delete', payload);
        } else if (typeof $scope[actionName] === 'function') {
            $scope[actionName]();
        }
        $scope.refreshReactProps();
        $scope.$applyAsync();
    };

    $scope.initLookup = function () {
        var inputData = [ 
                            { "Key": "CategoryTypeRef" },
                            { "Key": "ActiveStatus" }
                        ];

        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    };
    
    $scope.refreshReactProps();
    $scope.initLookup();
}

categoryTypeListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();