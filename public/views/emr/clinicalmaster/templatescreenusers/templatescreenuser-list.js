(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatescreenuserListController', templatescreenuserListController);

function templatescreenuserListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        FacilityId : utl.Session.getCurrentFacilityId(),
        DepartmentId : -1,
        UserId : -1
    };

    $scope.currentcontext = {};

    $scope.currentcontext = {
        profileid : $stateParams.id,
        name : $stateParams.name
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = {
            Params :[
              { Key: 2, Value: $scope.currentcontext.profileid },
              { Key: 3, Value: $scope.currentfilter.FacilityId },
              { Key: 4, Value: $scope.currentfilter.DepartmentId },
              { Key: 5, Value: $scope.currentfilter.UserId }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'clinicalmaster/ProfileUser/GetProfileUsers',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        utl.Modal.open('app.templatescreenuser', {
            params: { id: 0, pid : $scope.currentcontext.profileid },
            confirmCallback: $scope.getList
        }
        );
    }
    
    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };
    $scope.backtodashboard = function () {
        $state.go('app.medicalmasterdashboard');
    }
    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/ProfileUser/DeleteProfileUser',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);
    }

     $scope.handleEvents = function(actionType, entity) {

        if(actionType == 'edit') {
            utl.Modal.open('app.templatescreenuser', {
                params: { id: entity.Id, pid : $scope.currentcontext.profileid },
                confirmCallback: $scope.getList
            }
            );
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
        }
    }

    vm.gridConfig = {
        columnDefs: [
                        // { field: "Facility.FacilityName", displayName: $translate.instant('clinicalmaster.profileuser-list.facility.lbl') },
                        // { field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.profileuser-list.department.lbl') },
                        { field: "User.FirstName", displayName: $translate.instant('clinicalmaster.profileuser-list.user.lbl'),
                                cellTemplate: "<displayuser user='entity.User'></displayuser>"
                        },
                        { field: "VisitType.Description", displayName: $translate.instant('clinicalmaster.profileuser-list.visittype.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
    $scope.profilelist = function () {
        $state.go('app.profiles');
    }

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [
                            { "Key": "Department" },
                            { "Key": "Facility" },
                            { "Key": "User" },
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

templatescreenuserListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();