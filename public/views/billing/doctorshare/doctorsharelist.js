(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorShareListController', doctorShareListController);

    function doctorShareListController($scope, $stateParams, $state, $filter, $translate, utl) {
        var vm = this;

        $scope.currentfilter= {
            DoctorClassId : -1,
            ShareTypeId : -1,
            ActiveStatusId : 2,
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DoctorClassId },
                    { Key: 3, Value: $scope.currentfilter.ShareTypeId },
                    { Key: 7, Value: $scope.currentfilter.ActiveStatusId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/doctorshare/GetDoctorShare',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.drfeemappingform', { id: 0 });
        }


        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.drfeemappingform', { id: row.entity.Id });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "DoctorClass.Description", displayName: $translate.instant('billing.doctorshare.drclass.lbl') },
                { field: "ShareType.Description", displayName: $translate.instant('billing.doctorshare.feetype.lbl') },
                {
                    field: "ActiveFrom", displayName: $translate.instant('billing.doctorshare.activefrom.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.ActiveFrom'></ngformatdate>"
                },
                {
                    field: "ActiveTo", displayName: $translate.instant('billing.doctorshare.activeto.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.ActiveTo'></ngformatdate>"
                },
                { field: "EncounterType.Description", displayName: $translate.instant('billing.doctorshare.visittype.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('billing.doctorshare.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    </div>',
                    actions: [ ]
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
                { "Key": "DoctorClass" },
                { "Key": "ShareType" },
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

    doctorShareListController.$inject = ['$scope', '$stateParams', '$state', '$filter', '$translate', 'utl'];

})();