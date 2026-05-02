(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('rolePrivilegeListController', rolePrivilegeListController);

function rolePrivilegeListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.item = {};
    $scope.item.roleid = parseInt($stateParams.id);
    $scope.item.code = $stateParams.code;

    $scope.currentfilter = {
        RoleId: $scope.item.roleid,
        FacilityId: utl.Session.getCurrentFacilityId(),
        AccessObjectTypeId: -1
    };

    $scope.currentcontext = {};

    $scope.getListCallback = function (scope, res, options, hasError) {
        $scope.currentcontext.items = res.Data;
        groupData();
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {
        vm.gridConfig.data = [];
        vm.gridConfig.pagerObj.totalItems = 0;
        var inputData = {
            Params: [
                { Key: 1, Value: $scope.currentfilter.RoleId },
                { Key: 3, Value: $scope.currentfilter.AccessObjectTypeId },
                { Key: 4, Value: $scope.currentfilter.FacilityId },
            ],
            PageContext: {
                    PageSize: 100,
                    PageNumber: 1
            }
        };

        var options = {
            action: 'SystemSettings/roleprivilege/GetRolePrivileges',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function () {
        utl.Modal.open('app.roleprivilegeform', {
                params: { roleid: $scope.item.roleid, code: $scope.item.code,privilegeid:-1, isEdit: false },
                confirmCallback: $scope.getList
            }
        );
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function (deleteId) {
        var options = {
            action: 'SystemSettings/roleprivilege/DeleteRolePrivilege',
            data: { Id: deleteId },
            type: 'post',
            onComplete: $scope.deleteItemCallback
        };
        utl.Http.doAction(options);
    };

    $scope.handleEvents = function (actionType, entity) {
        if (actionType == 'edit') {
            utl.Modal.open('app.roleprivilegeform', {
                params: { roleid: $scope.item.roleid, code: $scope.item.code,privilegeid: entity.AccessObjectTypeId, isEdit: true },
                confirmCallback: $scope.getList
            }
        );
        } else if (actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RoleName);
        }
    }

    function groupData() {
        var items = $scope.currentcontext.items;
        var groupedData = _.groupBy(items, 'AccessObjectType');
        var keys = _.keys(groupedData);
            for (var idx in keys) {
                var key = keys[idx];
                var details = groupedData[key];
                var actions = [];
                for (var jdx in details) {
                    var detail = details[jdx];
                    actions.push( detail.AccessAction + ' : ' + detail.Access);
                }
            var item = { Facility: details[0].Facility.FacilityName, FacilityId: details[0].FacilityId, AccessObjectTypeId: details[0].AccessObjectTypeId,
                        PrivilegeType: details[0].AccessObjectType, AccessAction: actions.join(', ') }
            vm.gridConfig.data.push(item);
            }
    }

    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
            // { field: "Facility", displayName: $translate.instant('appmanager.roleprivilege-list.facility.lbl') },
            { field: "PrivilegeType", displayName: $translate.instant('appmanager.roleprivilege-list.type.lbl') },
            { field: "AccessAction", displayName: $translate.instant('appmanager.roleprivilege-list.action.lbl') },
            { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                    actions : [
                                {actiontype: 'edit', display : 'common.editaction.lbl'}
                                ]
            }
        ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 100 }
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;

        $scope.getList();
    }
    $scope.initLookup = function () {
        var inputData = [
            { "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    } },
            { "Key": "AccessAction" },
            { "Key": "AccessObjectType" }
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

rolePrivilegeListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();

// (function () {
//     'use strict';

//     angular
//         .module('app.pages')
//         .controller('rolePrivilegeListController', rolePrivilegeListController);

//     function rolePrivilegeListController($scope, $stateParams, $state, $translate, utl) {
//         var vm = this;

//         $scope.item = {};
//         $scope.item.roleid = parseInt($stateParams.id);
//         $scope.item.code = $stateParams.code;

//         $scope.currentfilter = {
//             RoleId: $scope.item.roleid,
//             FacilityId: utl.Session.getCurrentFacilityId(),
//             AccessObjectTypeId: -1
//         };

//         $scope.currentcontext = {};

//         $scope.getListCallback = function (scope, res, options, hasError) {
//             $scope.currentcontext.items = res.Data;
//             groupData();
//             vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
//         };

//         $scope.getList = function () {
//             vm.gridConfig.data = [];
//             vm.gridConfig.pagerObj.totalItems = 0;
//             var inputData = {
//                 Params: [{
//                         Key: 1,
//                         Value: $scope.currentfilter.RoleId
//                     },
//                     {
//                         Key: 3,
//                         Value: $scope.currentfilter.AccessObjectTypeId
//                     },
//                     {
//                         Key: 4,
//                         Value: $scope.currentfilter.FacilityId
//                     },
//                 ],
//                 PageContext: {
//                     PageSize: 100,
//                     PageNumber: 1
//                 }
//             };

//             var options = {
//                 action: 'SystemSettings/roleprivilege/GetRolePrivileges',
//                 data: inputData,
//                 type: 'post',
//                 onComplete: $scope.getListCallback
//             };

//             utl.Http.doAction(options);
//         };

//         //Grid Actions
//         $scope.addNew = function () {
//             utl.Modal.open('app.roleprivilegeform', {
//                 params: {
//                     roleid: $scope.item.roleid,
//                     code: $scope.item.code,
//                     privilegeid: -1,
//                     isEdit: false
//                 },
//                 confirmCallback: $scope.getList
//             });
//         }

//         $scope.deleteItemCallback = function (scope, data, options, hasError) {
//             utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
//             $scope.getList();
//         };

//         $scope.onDeleteConfirmed = function (deleteId) {
//             var options = {
//                 action: 'SystemSettings/roleprivilege/DeleteRolePrivilege',
//                 data: {
//                     Id: deleteId
//                 },
//                 type: 'post',
//                 onComplete: $scope.deleteItemCallback
//             };
//             utl.Http.doAction(options);
//         };

//         $scope.handleEvents = function (actionType, entity) {
//             if (actionType == 'edit') {
//                 utl.Modal.open('app.roleprivilegeform', {
//                     params: {
//                         roleid: $scope.item.roleid,
//                         code: $scope.item.code,
//                         privilegeid: entity.AccessObjectTypeId,
//                         isEdit: true
//                     },
//                     confirmCallback: $scope.getList
//                 });
//             } else if (actionType == 'delete') {
//                 utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RoleName);
//             } else if (actionType == 'view') {
//                 utl.Modal.open('app.roleprivilegeform', {
//                     params: {
//                         roleid: $scope.item.roleid,
//                         code: $scope.item.code,
//                         privilegeid: -1,
//                         isEdit: false
//                     },
//                     confirmCallback: $scope.getList
//                 });
//             }
//         }

//         function groupData() {
//             var items = $scope.currentcontext.items;
//             var groupedData = _.groupBy(items, 'AccessObjectType');
//             var keys = _.keys(groupedData);
//             for (var idx in keys) {
//                 var key = keys[idx];
//                 var details = groupedData[key];
//                 var actions = [];
//                 for (var jdx in details) {
//                     var detail = details[jdx];
//                     actions.push(detail.AccessAction + ' : ' + detail.Access);
//                 }
//                 var item = {
//                     Facility: details[0].Facility.FacilityName,
//                     FacilityId: details[0].FacilityId,
//                     AccessObjectTypeId: details[0].AccessObjectTypeId,
//                     PrivilegeType: details[0].AccessObjectType,
//                     AccessAction: actions.join(', ')
//                 }
//                 vm.gridConfig.data.push(item);
//             }
//         }

//         vm.gridConfig = {
//             enableColumnResizing: true,
//             columnDefs: [{
//                     field: "AccessObjectType",
//                     displayName: $translate.instant('appmanager.roleprivilege-list.type.lbl')
//                 },
//                 {
//                     field: "AccessAction",
//                     displayName: $translate.instant('appmanager.roleprivilege-list.action.lbl')
//                 },
//                 {
//                     field: "Id",
//                     displayName: $translate.instant('common.actions_col.lbl'),
//                     cellTemplate: '<div class="ui-grid-cell-contents">\
//                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
//                                 </div>',
//                     handleEvent: $scope.handleEvents,
//                     actions: [{
//                         actiontype: 'edit',
//                         display: 'common.editaction.lbl'
//                     }]
//                 }
//             ],
//             pagerObj: {
//                 totalItems: 0,
//                 currentPage: 1,
//                 startIndex: 0,
//                 pageSize: 100
//             }
//         };

//         $scope.lookupCallback = function (scope, data, options, hasError) {
//             $scope.lookup = hasError ? {} : data;

//             $scope.getList();
//         }
//         $scope.initLookup = function () {
//             var inputData = [{
//                     "Key": "Facility"
//                 },
//                 {
//                     "Key": "AccessAction"
//                 },
//                 {
//                     "Key": "AccessObjectType"
//                 }
//             ]
//             var options = {
//                 action: 'General/Options/getoptions',
//                 data: inputData,
//                 type: 'post',
//                 onComplete: $scope.lookupCallback
//             };
//             utl.Http.doAction(options);
//         }

//         $scope.initLookup();

//     }

//     rolePrivilegeListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
// })();