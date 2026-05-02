(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentCategoryListController', appointmentcategoryListController);

function appointmentcategoryListController($rootScope,$scope, $stateParams, $state, $translate, utl, $timeout) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        FacilityId : utl.Session.getCurrentFacilityId(),
        AppointmentCategoryTypeId : -1,
        ActiveStatusId : 2
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
             { Key: 2, Value: $scope.currentfilter.FacilityId },
             { Key: 3, Value: $scope.currentfilter.AppointmentCategoryTypeId },
             { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'appointment/AppointmentCategory/GetAppointmentCategorys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.appointmentcategory', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };
    $timeout(function () {
        removeFloatingNav();
    }, 100);

    function removeFloatingNav() {
        $rootScope.app.layout.isCollapsed = true;
    }
    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'appointment/AppointmentCategory/DeleteAppointmentCategory',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, entity) {
        
        if(actionType == 'edit') {
            $state.go('app.appointmentcategory', { id:entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Name", displayName: $translate.instant('appointment.appointmentcategory-list.name.lbl') },
                        { field: "Color", displayName: $translate.instant('appointment.appointmentcategory-list.color.lbl'),
                                cellTemplate:"<div class='ui-grid-cell-contents'>\
                                                    <div style='height:20px;width:20px;background:{{entity.Color}}' class='col-sm-2'></div>\
                                                &nbsp;<span>{{entity.Color}}</span>\
                                            </div>" },
                        { field: "AppointmentCategoryType.Description", displayName: $translate.instant('appointment.appointmentcategory-list.appointmentcategorytype.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('appointment.appointmentcategory-list.status.lbl') },
                        // { field: "Description", displayName: $translate.instant('appointment.appointmentcategory-list.description.lbl') },
                        // { field: "Facility.FacilityName", displayName: $translate.instant('appointment.appointmentcategory-list.facility.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                    //                      ]
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
                            {"Key" : "Facility"},
                            {"Key" : "AppointmentCategoryType"},
                            {"Key" : "ActiveStatus"}
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

appointmentcategoryListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();