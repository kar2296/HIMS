(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('eventTemplateListController', eventTemplateListController);

function eventTemplateListController($rootScope,$scope, $stateParams, $state, $translate, utl, $timeout) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        facilityid : -1,
        eventtypeid : -1
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
              { Key: 1, Value: $scope.currentfilter.facilityid },
              { Key: 2, Value: $scope.currentfilter.eventtypeid }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'SystemSettings/EventTemplate/GetEventTemplates',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.eventtemplate', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'SystemSettings/EventTemplate/DeleteEventTemplate',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, entity) {
        
        if(actionType == 'edit') {
            $state.go('app.eventtemplate', { id:entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);                   
        }
    }
    
    vm.gridConfig = {
        columnDefs: [
                        { field: "Facility.FacilityName", displayName: $translate.instant('appmanager.eventtemplate-list.facility.lbl') },
                        { field: "TemplateKey", displayName: $translate.instant('appmanager.eventtemplate-list.templatekey.lbl') },
                        { field: "EventType.Description", displayName: $translate.instant('appmanager.eventtemplate-list.eventtype.lbl') },
                        { field: "SmsTrigger", displayName: $translate.instant('appmanager.eventtemplate-list.smstrigger.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('appmanager.eventtemplate-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                        cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                   </div>',
           handleEvent: $scope.handleEvents,
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                         ]
                        }
                    ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
    $timeout(function () {
        removeFloatingNav();
    }, 100);

    function removeFloatingNav() {
        $rootScope.app.layout.isCollapsed = true;
    }
    
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [ 
                            { "Key": "Facility" },
                            { "Key": "EventType" },
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

eventTemplateListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();