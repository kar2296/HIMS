(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testmasterDianosisMapsListController', testmasterDianosisMapsListController);

    function testmasterDianosisMapsListController($scope, $stateParams, $state, $translate, utl) {
       var vm = this;
    
    $scope.Items = [];
    $scope.currentfilter= {
        name : '',
        codemnemonicsnamedesc : '',
        DiagnosistypeId: -1,
        DiagnosisId: -1,
        ActiveStatusId : -1,
        loincname: ''
    };
    var testmasterid = parseInt($stateParams.id);
    //console.log(testmasterid);
    $scope.getListCallback = function (scope, res, options, hasError) {
         vm.gridConfig.data = res.Data;
         vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function (pageNo) {

        var inputData = { 
            Params :[ 
              { Key: 1, Value: testmasterid}, 
              { Key: 2, Value: $scope.currentfilter.DiagnosistypeId}, 
              { Key: 3, Value: $scope.currentfilter.DiagnosisId},
              { Key: 4, Value: $scope.currentfilter.ActiveStatusId} 
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

            var options = {
                action: 'lis/testmaster/GetTestdiagnosismappings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.testmastertab.testdiagnosismapping', { tstdiagnosisid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/testmaster/DeleteTestdiagnosismapping',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.testmastertab.testdiagnosismapping', { tstdiagnosisid: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }


        vm.gridConfig = {
            columnDefs: [
                { field: "DiagnosisCodeScheme.Description", displayName: $translate.instant('lis.testdiagnosismappings.diagnosistype.lbl') },
                { field: "Diagnosis.DiagnosisName", displayName: $translate.instant('lis.testdiagnosismappings.diagnosisname.lbl') },
                { field: "Comments", displayName: $translate.instant('lis.testdiagnosismappings.comments.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('lis.testdiagnosismappings.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
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
                { "Key": "DiagnosisCodeScheme" },
                { "Key": "Diagnosis" },
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

    testmasterDianosisMapsListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();