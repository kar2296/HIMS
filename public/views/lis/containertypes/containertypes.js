(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('containerTypesListController', containerTypesListController);

function containerTypesListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        name : '',
        codemnemonicsnamedesc: '',
        code : '',
        ActiveStatusId : 2,
        CONTAINTYPId : -1,
        COLORId : -1,
        mnemonics : ''
    };

    $scope.getListCallback = function (scope, res, options, hasError) {
           vm.gridConfig.data = res.Data;
           vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = {
            Params :[
                { Key: 1, Value: $scope.currentfilter.codemnemonicsnamedesc },
                { Key: 2, Value: $scope.currentfilter.CONTAINTYPId },
                { Key: 3, Value: $scope.currentfilter.COLORId },
                { Key: 4, Value: $scope.currentfilter.ActiveStatusId}
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'LIS/Containertype/GetContainertypes',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.containertype', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'lis/containertype/DeleteContainertype',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);
    }

     $scope.handleEvents = function(actionType, entity) {

        if(actionType == 'edit') {
            $state.go('app.containertype', { id:entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, '<br/>'+entity.Name);
        }
    }

    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Code", displayName: $translate.instant('lis.containertypes.code.lbl') },
                        { field: "Name", displayName: $translate.instant('lis.containertypes.name.lbl') },
                        { field: "CONTAINTYP.Description", displayName: $translate.instant('lis.containertypes.type.lbl') },
                        { field: "Mnemonics", displayName: $translate.instant('lis.containertypes.Mnemonics.lbl') },
                        { field: "Height", displayName: $translate.instant('lis.containertypes.Height.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Height}} {{entity.HEIGHTUNITS.Description}}  </div>' },
                        { field: "Diameter", displayName: $translate.instant('lis.containertypes.Diameter.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Diameter}} {{entity.DIAMETERUNITS.Description}}  </div>' },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('lis.containertypes.status.lbl') },
                        {
                            field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                            cellTemplate: '<div class="ui-grid-cell-contents">\
                                                           \
                                                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                            \
                                                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                           \
                                                        </div>',
                                                        handleEvent: $scope.handleEvents,
                            actions: [

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
                            {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                            { "Key": "CONTAINTYP" },
                            { "Key": "COLOR" },
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

containerTypesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();