(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('sampleTypesListController', sampleTypesListController);

function sampleTypesListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        name : '',
        codemnemonicsnamedesc: '',
        code : '',
        ActiveStatusId : 2,
        type : -1,
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
                { Key: 2, Value: $scope.currentfilter.type },
                { Key: 3, Value: $scope.currentfilter.ActiveStatusId}
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'lis/sampletype/GetSampletypes',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };


    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.sampletype', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'lis/sampletype/DeleteSampletype',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);
    }

     $scope.handleEvents = function(actionType, entity) {

        if(actionType == 'edit') {
            $state.go('app.sampletype', { id:entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id,entity.Name);
        }
        else if (actionType == 'view') {
            $state.go('app.sampletype', { id:0 });
                   }
    }

    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Code", displayName: $translate.instant('lis.sampletypes.code.lbl') },
                        { field: "Name", displayName: $translate.instant('lis.sampletypes.name.lbl') },
                        { field: "SAMPLETYP.Description", displayName: $translate.instant('lis.sampletypes.stype_e.lbl') },
                        { field: "Mnemonics", displayName: $translate.instant('lis.sampletypes.mnemonics.lbl') },
                        { field: "Volume", displayName: $translate.instant('lis.sampletypes.volume.lbl') ,
                         cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Volume}} {{entity.SampleUnits.Description}}  </div>' },
                        { field: "CollectionSite.Description", displayName: $translate.instant('lis.sampletypes.collectionsiteid.lbl') },
                        { field: "ExpDys", displayName: $translate.instant('lis.sampletypes.expdys.lbl' ),
                         cellTemplate: '<div class="ui-grid-cell-contents" ng-show="entity.ExpDys != null && entity.ExpDys <= 1" > {{entity.ExpDys}} Day </div> <div class="ui-grid-cell-contents" ng-show="entity.ExpDys > 1" > {{entity.ExpDys}} Days </div>' },
                        { field: "CollectionRoute.Description", displayName: $translate.instant('lis.sampletypes.collectionrouteid.lbl') },
                        { field: "CollectionMethod.Description", displayName: $translate.instant('lis.sampletypes.collectionmethodid.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('lis.sampletypes.status.lbl') },
                        {
                            field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                            cellTemplate: '<div class="ui-grid-cell-contents">\
                                                           \
                                                            <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',entity)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                            \
                                                            <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
                            { "Key": "Organization" },
                            {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                            { "Key": "SAMPLETYP" },
                            { "Key": "ActiveStatus" },
                            { "Key": "GENERICIND" }
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

sampleTypesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();