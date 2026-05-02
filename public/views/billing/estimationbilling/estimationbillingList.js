(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('estimationbillingListController', estimationbillingListController);

    function estimationbillingListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            // FacilityId: utl.Session.getCurrentFacilityId(),
            SaveTypeId: 2
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function () {
            var SaveTypeId = $scope.currentfilter.SaveTypeId || null;
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: SaveTypeId
                    },
                    {
                        Key: 2,
                        Value: From
                    },
                    {
                        Key: 3,
                        Value: To
                    },
                    
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
              
            };

            var options = {
                action: 'BillingMaster/PatientEstimation/GetPatientEstimation',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            $state.go('app.estimationbillingForm',{ id: 0 });
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
   
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'BillingMaster/PatientEstimation/DeletePatientEstimation',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.estimationbillingForm',{ id: entity.Id});
            } else if (actionType == 'view') {
                $state.go('app.estimationbillingForm', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "EstimationDate",
                    displayName: $translate.instant('Date')
                },
                {
                    field: "Patient.FirstName",
                    displayName: $translate.instant('Patient Name')
                },
                {
                    field: "Patient.Age",
                    displayName: $translate.instant('Age')
                },
                {
                    field: "Gender.Description",
                    displayName: $translate.instant('Gender')
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('Doctor Name')
                },
                {
                    field: "BedType.Description",
                    displayName: $translate.instant('Bed Type')
                },
                {
                    field: "GuarantorType.Description",
                    displayName: $translate.instant('Sponser')
                },
                {
                    field: "SaveType.Description",
                    displayName: $translate.instant('Save Type')
                },
                {
                    field: "ContactDetails",
                    displayName: $translate.instant('Contact Details')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"  ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                 <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "SaveType" }
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

    estimationbillingListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();