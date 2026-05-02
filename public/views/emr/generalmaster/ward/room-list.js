(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('wardmasterroomFormController', wardmasterroomFormController);

    function wardmasterroomFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            roomtypeid: -1,
            activestatusid: 2,
        };
        $scope.currentcontext = {};
        $scope.currentcontext.wardid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentcontext.wardid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentfilter.roomtypeid },
                        { Key: 2, Value: $scope.currentcontext.wardid },
                        { Key: 5, Value: $scope.currentfilter.activestatusid }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'generalmaster/wardroommaster/GetWardRoomMasters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            } else {
                $state.go('app.wardtab.detail', { id: 0 });
            }
        };

        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.wardtab.formroomdetail', { roomdetailid: 0 });
            $scope.openModal('app.wardtab.formroomdetail', { roomdetailid: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
 $scope.backToList = function () {
            $state.go('app.wardtab.detail');
        };
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/wardroommaster/DeleteWardRoomMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.initLookup
            });
        }
        
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                //  $state.go('app.wardtab.formroomdetail', { roomdetailid: entity.Id });
                $scope.openModal('app.wardtab.formroomdetail', { roomdetailid: entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.RoomNo);
            }
            else if (actionType == 'service') {
                // $state.go('app.wardtab.servicedetail', { roomdetailid: entity.Id });
                $scope.openModal('app.wardtab.servicedetail', { roomdetailid: entity.Id });
            }
            else if (actionType == 'bed') {
                // $state.go('app.wardtab.beddetail', { roomdetailid: entity.Id });                
                $scope.openModal('app.wardtab.beddetail', { roomdetailid: entity.Id });
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "RoomNo", displayName: $translate.instant('generalmaster.wardmastertab.roomno.lbl') },
                { field: "RoomTypeMaster.RoomTypeName", displayName: $translate.instant('generalmaster.wardmastertab.roomtype.lbl') },
                // { field: "ServiceRateCategory.ServiceRateCategory", displayName: $translate.instant('generalmaster.wardmastertab.serviceratecategory.lbl') },
                { field: "GracePeriod", displayName: $translate.instant('generalmaster.wardmastertab.graceperiod.lbl') },
                { field: "NoOfBed", displayName: $translate.instant('generalmaster.wardmastertab.beds.lbl') },
                // { field: "HalfDay", displayName: $translate.instant('generalmaster.wardmastertab.halfday.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant(' generalmaster.wardmastertab.status.lbl') },

                   {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
       <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1 || entity.ActiveStatusId==2 || entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                <span class="grid-action" title="Bed Details" ng-click="handleEvents(\'bed\',entity)"ng-show=" entity.ActiveStatusId==2"> <i class="fas fa-bed"></i></span>\
                          <span class="grid-action" title="Service Details" ng-click="handleEvents(\'service\',entity)"ng-show=" entity.ActiveStatusId==2"><i class="fas fa-business-time"></i></span>\
                                </div>',
                                handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
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
                { "Key": "RoomClassificationType" },
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

    wardmasterroomFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();