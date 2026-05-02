(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('vitalListController', vitalListController);

function vitalListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        VitalName : "",
        VitalValueTypeId : -1,
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
                { Key: 1, Value: $scope.currentfilter.VitalName },
                { Key: 2, Value: $scope.currentfilter.VitalValueTypeId },
                { Key: 3, Value: $scope.currentfilter.ActiveStatusId }
            ],
            PageContext:{
            PageSize: vm.gridConfig.pagerObj.pageSize,
            PageNumber: vm.gridConfig.pagerObj.currentPage
        }
        };

        var options = {
            action: 'clinicalmaster/VitalMaster/GetVitalMasters',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
  $scope.openModal = function (Id) {
            utl.Modal.open('app.vitals', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }
    $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
    //Grid Actions
    // $scope.addNew = function() {
    //     $state.go('app.vital', { id:0 });
    // }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'clinicalmaster/VitalMaster/DeleteVitalMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

     $scope.handleEvents = function(actionType, entity) {
        
        if(actionType == 'edit') {
           $scope.openModal(entity.Id);
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.VitalName);                   
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "VitalName", displayName: $translate.instant('clinicalmaster.vital-list.vitalname.lbl') },
                        // { field: "Description", displayName: $translate.instant('clinicalmaster.vital-list.description.lbl') },
                        // { field: "GraphType.Description", displayName: $translate.instant('clinicalmaster.vital-list.graphtype.lbl') },
                        { field: "UOM", displayName: $translate.instant('clinicalmaster.vital-list.uom.lbl') },
                        // { field: "LoincCode", displayName: $translate.instant('clinicalmaster.vital-list.loinc.lbl') },
                        { field: "VitalValueType.Description", displayName: $translate.instant('clinicalmaster.vital-list.valuetype.lbl') },
                //         { field: "Range", displayName: $translate.instant('clinicalmaster.vital-list.range.lbl'),
                //       cellTemplate: "<div class='ui-grid-cell-contents'>"
                //     + "<span class='pl-3'>{{entity.ReferenceRangeFrom }}</span>"
                //     + "<span class='pl-3'>-</span>"
                //     + "<span class='pl-3'>{{entity.ReferenceRangeTo}}</span>"
                //     + "</div>"
                //  },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.vital-list.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
                            { "Key": "VitalValueType" },
                            { "Key": "ActiveStatus" }
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

vitalListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();