(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('researchProjectListController', researchProjectListController);

function researchProjectListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        ProjectName : "",
        FacilityId : -1,
        ProjectTypeId : -1,
        ActiveStatusId : 2,
        FacilityId:utl.Session.getCurrentFacilityId(),
        
    };
//  Start
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
               StartDate: '',
               EndDate: '',
               ProjectMember:'',
               IsIncharge:''
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [

                    { type: 'date', translate: 'generalmaster.researchproject-form.startdate.lbl', model: 'StartDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'generalmaster.researchproject-form.enddate.lbl', model: 'EndDate', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'generalmaster.researchprojectmember-list.projectmember.lbl', model: 'ProjectMember',  position: { r: 1, c: 0 } },
                    { type: 'checkbox', translate: 'generalmaster.researchprojectmember-list.isincharge.lbl', model: 'IsIncharge',  position: { r: 1, c: 1 } },

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
 //  End
    $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

    $scope.getList = function () {

        var inputData = { 
            Params :[
                { Key: 1, Value: $scope.currentfilter.ProjectName },
                { Key: 2, Value: $scope.currentfilter.FacilityId },
                { Key: 3, Value: $scope.currentfilter.ProjectTypeId },
                { Key: 4, Value: $scope.currentfilter.ActiveStatusId },  
            ],
            PageContext:{
            PageSize: vm.gridConfig.pagerObj.pageSize,
            PageNumber: vm.gridConfig.pagerObj.currentPage
        }
        };

        var options = {
            action: 'generalmaster/ResearchProject/GetResearchProjects',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.researchproject', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'generalmaster/ResearchProject/DeleteResearchProject',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, row) {
        
            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
               }

        else if(actionType == 'view') {
            $scope.openModal(row.entity.Id);
           }
    else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.ProjectName);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Facility.FacilityName", displayName: $translate.instant('generalmaster.researchproject-list.facility.lbl') },
                        { field: "ProjectType.Description", displayName: $translate.instant('generalmaster.researchproject-list.type.lbl') },
                        { field: "ProjectCode", displayName: $translate.instant('generalmaster.researchproject-list.code.lbl') },
                        { field: "ProjectName", displayName: $translate.instant('generalmaster.researchproject-list.projectname.lbl') },
                        { field: "StartDate", displayName: $translate.instant('generalmaster.researchproject-list.startdate.lbl'),
                                cellTemplate : "<ngformatdate date-val='row.entity.StartDate'></ngformatdate>" },
                        { field: "EndDate", displayName: $translate.instant('generalmaster.researchproject-list.enddate.lbl'),
                                cellTemplate : "<ngformatdate date-val='row.entity.EndDate'></ngformatdate>" },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.researchproject-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                        cellTemplate: '<div class="ui-grid-cell-contents">\
                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.ActiveStatusId==2||row.entity.ActiveStatusId==3||row.entity.ActiveStatusId==4||row.entity.ActiveStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                        <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                         \</div>',
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
        initDynamicForm();
        $scope.getList();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                { "Key" : "Facility" },
                { "Key" : "ProjectType" },
                { "Key" : "ActiveStatus" }
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

researchProjectListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();