(function () {
    'use strict';
    angular
        .module('app.pages')
        .controller('generaldisplayListController', generaldisplayListController);
    function generaldisplayListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
            Displaydate: "",
            LOCATIONId: -1,
            DisplayNoId: -1,
            GeneralDisplayStatusId: 1,
            // Displaydate: utl.Formatter.getCurrentDate()
        };
       
        $scope.currentfilter.Displaydate = new Date();

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // $scope.currentfilter.FromDisplaydate = $filter('date')($scope.item.Displaydate, 'yyyy-MM-dd 00:00:00');
            // $scope.currentfilter.ToDisplaydate= $filter('date')($scope.item.Displaydate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    //  { Key: 1, Value: $scope.currentfilter.Displaydate },
                    // { Key: 1, Value: [$scope.currentfilter.FromDisplaydate, $scope.currentfilter.ToDisplaydate] },

                    { Key: 2, Value: $scope.currentfilter.LOCATIONId },
                    { Key: 3, Value: $scope.currentfilter.DisplayNoId },
                    { Key: 4, Value: $scope.currentfilter.GeneralDisplayStatusId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Appointment/GeneralDisplay/GetGeneralDisplays',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.generaldisplay', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Appointment/GeneralDisplay/DeleteGeneralDisplay',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.updateCallback = function (scope, data, options, hasError) {
            $scope.getList();
        };
        $scope.Update = function (DisplayId, GeneralDisplayStatusId) {
            var options = {
                action: 'Appointment/GeneralDisplay/UpdateGeneralDisplay',
                data: { Data: { Id: DisplayId, GeneralDisplayStatusId: GeneralDisplayStatusId } },
                type: 'post',
                onComplete: $scope.updateCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
            }
            else if (actionType == 'display') {
                $scope.Update(row.entity.Id, 2);
            }
            else if (actionType == 'cancel') {
                $scope.Update(row.entity.Id, 3);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.DisplayText);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "Displaydate", displayName: $translate.instant('appointment.generaldisplay-list.date.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.Displaydate '></ngformatdate>"
                },
                { field: "LOCATION.Description", displayName: $translate.instant('appointment.generaldisplay-list.location.lbl') },
                { field: "DisplayNo.Description", displayName: $translate.instant('appointment.generaldisplay-list.displayno.lbl') },
                { field: "DisplayText", displayName: $translate.instant('appointment.generaldisplay-list.displaycontent.lbl') },
                { field: "GeneralDisplayStatus.Description", displayName: $translate.instant('appointment.generaldisplay-list.status.lbl') },
                {
                    field: "DisplayTypeId", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-hide="row.entity.GeneralDisplayStatusId == 4||row.entity.GeneralDisplayStatusId == 5"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\                            <span class="grid-action" ng-click="grid.appScope.handleEvents(\'display\',row)"  ng-hide="row.entity.GeneralDisplayStatusId == 4||row.entity.GeneralDisplayStatusId == 5"><i class="btn btn-success btn-rounded fa fa-book "  uib-tooltip="Display" tooltip-placement="bottom"> </i></span>\
                                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-hide="row.entity.GeneralDisplayStatusId == 4||row.entity.GeneralDisplayStatusId == 5"><i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"></i></span>\
                                                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-hide="row.entity.GeneralDisplayStatusId == 4||row.entity.GeneralDisplayStatusId == 5"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                             </div>',
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
                { "Key": "DisplayNo" },
                { "Key": "GeneralDisplayStatus" },
                { "Key": "LOCATION" },
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

    generaldisplayListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();