(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureListController', procedureListController);

function procedureListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        ProcedureCodeSchemeId : -1,        
        Code : "",
        ProcedureName : "",
        ProcedureTypeId : -1,
        ActiveStatusId : 2
    };

    $scope.backtoList = function () {
        $state.go('app.medicalmasterdashboard');
    }
    $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentfilter.ProcedureName },
                { Key: 2, Value: $scope.currentfilter.ProcedureCodeSchemeId },
                { Key: 3, Value: $scope.currentfilter.Code },
                { Key: 4, Value: $scope.currentfilter.ProcedureTypeId },
                { Key: 5, Value: $scope.currentfilter.ActiveStatusId } 
            ],
            PageContext:{
            PageSize: vm.gridConfig.pagerObj.pageSize,
            PageNumber: vm.gridConfig.pagerObj.currentPage
        }
        };

        var options = {
            action: 'clinicalmaster/procedure/GetProcedures',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.proceduretab.details', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/procedure/DeleteProcedure',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, entity) {
        
        if(actionType == 'edit') {
            $state.go('app.proceduretab.details', { id:entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.ProcedureName);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Code", displayName: $translate.instant('clinicalmaster.procedure-list.code.lbl') },
                        { field: "ProcedureName", displayName: $translate.instant('clinicalmaster.procedure-list.name.lbl') },
                        // { field: "ProcedureVersion.Description", displayName: $translate.instant('clinicalmaster.procedure-list.version.lbl') },
                        { field: "ProcedureType.Description", displayName: $translate.instant('clinicalmaster.procedure-list.proceduretype.lbl') },
                        { field: "ProcedureCategory.Description", displayName: $translate.instant('clinicalmaster.procedure-list.category.lbl') },
                        { field: "ProcedureSubCategory.Description", displayName: $translate.instant('clinicalmaster.procedure-list.subcategory.lbl') },
                        // { field: "ProcedureOperationType.Description", displayName: $translate.instant('clinicalmaster.procedure-list.operationtype.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.procedure-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)""><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
       handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                         ]
                        }
                    ],
                    pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
    
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                            { "Key": "ProcedureCodeScheme" },
                            { "Key": "ProcedureType" },
                            { "Key": "ActiveStatus" },
                            { "Key": "ProcedureCategory" },
                            { "Key": "ProcedureSubCategory" },
                            { "Key": "AnaesthesiaType" }
                        ];

        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
    };

    // React Bridge
    $scope.refreshReactProps = function () {
        $scope.reactProps = {
            items: vm.gridConfig.data || [],
            totalItems: vm.gridConfig.pagerObj.totalItems || 0,
            currentPage: vm.gridConfig.pagerObj.currentPage || 1,
            pageSize: vm.gridConfig.pagerObj.pageSize || 25,
            pagerObj: vm.gridConfig.pagerObj,
            currentfilter: $scope.currentfilter,
            lookup: {
                ProcedureCodeScheme: ($scope.lookup && $scope.lookup.ProcedureCodeScheme) || [],
                ProcedureType: ($scope.lookup && $scope.lookup.ProcedureType) || [],
                ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || [],
                ProcedureCategory: ($scope.lookup && $scope.lookup.ProcedureCategory) || [],
                ProcedureSubCategory: ($scope.lookup && $scope.lookup.ProcedureSubCategory) || [],
                AnaesthesiaType: ($scope.lookup && $scope.lookup.AnaesthesiaType) || []
            }
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
                if (payload.Code !== undefined) $scope.currentfilter.Code = payload.Code;
                if (payload.ProcedureName !== undefined) $scope.currentfilter.ProcedureName = payload.ProcedureName;
                if (payload.ProcedureCodeSchemeId !== undefined) $scope.currentfilter.ProcedureCodeSchemeId = payload.ProcedureCodeSchemeId;
                if (payload.ProcedureTypeId !== undefined) $scope.currentfilter.ProcedureTypeId = payload.ProcedureTypeId;
                if (payload.ActiveStatusId !== undefined) $scope.currentfilter.ActiveStatusId = payload.ActiveStatusId;
            }
            vm.gridConfig.pagerObj.currentPage = 1;
            $scope.getList();
        } else if (actionName === 'resetFilters') {
            $scope.currentfilter.Code = '';
            $scope.currentfilter.ProcedureName = '';
            $scope.currentfilter.ProcedureCodeSchemeId = -1;
            $scope.currentfilter.ProcedureTypeId = -1;
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

    $scope.refreshReactProps();
    $scope.initLookup();
}

procedureListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();