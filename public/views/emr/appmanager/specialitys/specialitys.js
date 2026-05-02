(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('specialityListController', specialityListController);

function specialityListController($scope, $stateParams, $state, $translate, utl) {

    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        specialityname : '',
        facilityid : utl.Session.getCurrentFacilityId(),
        specialitytypeid : -1,
        ActiveStatusId : 2
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = {
            Params :[
              { Key: 1, Value: $scope.currentfilter.specialityname },
              { Key: 2, Value: $scope.currentfilter.facilityid },
              { Key: 3, Value: $scope.currentfilter.specialitytypeid },
              { Key: 4, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'SystemSettings/speciality/GetSpecialitys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.speciality', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
            action: 'SystemSettings/speciality/DeleteSpeciality',
            data: { Id: deleteId },
            type: 'post',
            onComplete: $scope.deleteItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.handleEvents = function(actionType, row) {

            if(actionType == 'edit') {
                $state.go('app.speciality', { id:row.entity.Id });
            }
            else if(actionType == 'view') {
                $state.go('app.speciality', { id:row.entity.Id });
            }
            else if(actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.SpecialityName);
            }
    }


    vm.gridConfig = {
            enableColumnResizing: true,
    columnDefs: [
                    { field: "Facility.FacilityName", displayName: $translate.instant('appmanager.specialitys.facility.lbl') },
                    { field: "SpecialityCode", displayName: $translate.instant('appmanager.specialitys.specialitycode.lbl') },
                    { field: "SpecialityName", displayName: $translate.instant('appmanager.specialitys.specialityname.lbl') },
                    //{ field: "Description", displayName: $translate.instant('appmanager.specialitys.description.lbl') },
                    { field: "SpecialityType.Description", displayName: $translate.instant('appmanager.specialitys.type.lbl') },
                    { field: "ParentSpeciality.SpecialityName", displayName: $translate.instant('appmanager.specialitys.parentspeciality.lbl') },
                    { field: "ActiveStatus.Description", displayName: $translate.instant('appmanager.specialitys.status.lbl') },
                    // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                    //             cellTemplate : 'actionTemplate.html',
                    //             actions : [
                    //                         {actiontype: 'edit', display : 'common.editaction.lbl'},
                    //                         {actiontype: 'delete', display : 'common.deleteaction.lbl'}
                    //                      ]
                    // }
                    {
                        field: "Id",
                        displayName: $translate.instant('common.actions_col.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.ActiveStatusId==2||row.entity.ActiveStatusId==3||row.entity.ActiveStatusId==4||row.entity.ActiveStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                    </div>',
                        actions: []
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
                            { "Key": "Facility" },
                            //{ "Key": "Status" },
                            { "Key": "SpecialityType" },
                            { "Key": "ActiveStatus" }
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

specialityListController.$inject = ['$scope', '$stateParams', '$state', '$translate','utl'];

})();