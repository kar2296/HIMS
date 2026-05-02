(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDietplanListController', patientDietplanListController);

    function patientDietplanListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.currentfilter = {
            PatientVitalStatusId: 1
        };

        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount()
        };

        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.addNew = function () {
            $state.go('app.billingcounter-form', { id: 0, userbillingcounterid: $scope.currentcontext.userbillingcounterid });
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientdietplan/DeletePatientDietPlan',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, item) {
            if (actionType == 'edit') {
                utl.Modal.open('patientemr.dietplanassessment', {
                    params: {
                        id: 0,
                        pid: $scope.currentcontext.pid
                    },
                    confirmCallback: $scope.getList
                });
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            // vm.gridConfig.data = [];
            // $scope.items = $filter('sortArrayItems')(res.Data, [{
            //     name: 'Id',
            //     direction: 'desc',
            //     priority: 1,
            //     type: 'int',
            // }]);
            // vm.gridConfig.data.push($scope.items);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientdietplan/GetPatientDietPlans',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            // rowTemplate: rowtpl,
            columnDefs: [
                { field: "DietType.Description", displayName: $translate.instant('Diet Type') },
                { field: "DietPreferrence.Description", displayName: $translate.instant('Diet Preferrence') },
                { field: "FoodPreference.Description", displayName: $translate.instant('Food Preference') },
                { field: "TherapeuticDiet.Description", displayName: $translate.instant('Therapeutic Diet') },
                { field: "Comments", displayName: $translate.instant('Remarks') },
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents">\
                //     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //     </div>',
                //     actions: []
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.getList();
    }

    patientDietplanListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();