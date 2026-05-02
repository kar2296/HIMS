(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityListController', facilityListController);

function facilityListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        facilityname : '',
        facilitycode : '',
        ActiveStatusId : 2
    };
    //  Start
//Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                OrganizationId: '',
                IsGSTRegistered:''
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'select', translate: 'appmanager.facility.orgname.lbl', model: 'OrganizationId', options: $scope.lookup.Organization, position: { r: 0, c: 0 } },
                    { type: 'checkbox', translate: 'appmanager.facility.isgstregistered.lbl', model: 'IsGstRegistered',  position: { r: 0, c: 1 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        //Dynamic form  ends

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };
    $timeout(function () {
        removeFloatingNav();
    }, 100);

    function removeFloatingNav() {
        $rootScope.app.layout.isCollapsed = true;
    }

    $scope.getList = function () {

        var inputData = {
            Params :[
             { Key: 1, Value: $scope.currentfilter.facilityname },
             { Key: 2, Value: $scope.currentfilter.facilitycode },
             { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
             { Key: 4, Value: true }
             //{ Key: 4, Value: $scope.advancedfilter.OrganizationId },
             //{ Key: 5, Value: $scope.advancedfilter.IsGSTRegistered }
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'SystemSettings/facility/GetFacilitys',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.facilitytab.general', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'SystemSettings/facility/DeleteFacility',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);
    }

    $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.facilitytab.general', { id: entity.Id, FacilityName: entity.FacilityCode + ' - ' + entity.FacilityName });
            }
           else if (actionType == 'view') {
                $state.go('app.facilitytab.general', { id: entity.Id, FacilityName: entity.FacilityCode + ' - ' + entity.FacilityName });
            }
            else if(actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.FacilityName);
            }
            else if(actionType == 'setting') {
                utl.Modal.open('app.facilitysetting', {
                    params: { id:entity.Id },
                    //confirmCallback: $scope.getList
                }
            );
        }
    }

    vm.gridConfig = {
            enableColumnResizing: true,
        columnDefs: [
                        { field: "FacilityCode", displayName: $translate.instant('appmanager.facilitys.facilitycode.lbl') },
                        { field: "FacilityName", displayName: $translate.instant('appmanager.facilitys.facilityname.lbl') },
                        { field: "Organization.OrgName", displayName: $translate.instant('appmanager.facilitys.orgname.lbl') },
                        { field: "Address", displayName: $translate.instant('appmanager.facilitys.address.lbl'),
                            cellTemplate: '<div class="ui-grid-cell-contents" title="{{entity.AddressLine1}} {{entity.AddressLine2}} {{entity.PincodeMaster.Pincode}}">{{entity.AddressLine1}} {{entity.AddressLine2}} {{entity.PincodeMaster.Pincode}}</div>' },
                        // { field: "FacilityType.Description", displayName: $translate.instant('appmanager.facilitys.type.lbl') },
                        // { field: "GstNumber", displayName: $translate.instant('appmanager.facilitys.gst.lbl') },
                        /*{ field: "ActiveFrom", displayName: $translate.instant('appmanager.facilitys.activefrom.lbl'),
                                cellTemplate : "<ngformatdate date-val='entity.ActiveFrom'></ngformatdate>" },*/
                        { field: "ActiveStatus.Description", displayName: $translate.instant('appmanager.facilitys.status.lbl') },
                        // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                        //         cellTemplate : 'actionTemplate.html',
                        //         actions : [
                        //                     {actiontype: 'edit', display : 'common.editaction.lbl'},
                        //                     {actiontype: 'delete', display : 'common.deleteaction.lbl'},
                        //                     {actiontype: 'setting', display : 'appmanager.facilitys.setting.lbl'}
                        //                  ]
                        // }
                        {
                            field: "Id",
                            displayName: $translate.instant('common.actions_col.lbl'),
                            cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                     </div>',
                        handleEvent: $scope.handleEvents,
                            actions: []
                        }
                    ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };

    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        initDynamicForm();
        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [
                            { "Key": "ActiveStatus" },
                            { "Key": "Organization" }
                        ]
        var options = {
            action: 'General/Options/getoptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.lookupCallback
        };
        utl.Http.doAction(options);
        //$scope.getList();
    }

    $scope.initLookup();

}

facilityListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();