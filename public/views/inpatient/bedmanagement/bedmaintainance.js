(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BedMaintenanceController', BedMaintenanceController);

    function BedMaintenanceController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.BedInfo = modalConfig.params.bedinfo;
        $scope.item = {
            BedId: $scope.BedInfo.Id,
            WardId: $scope.BedInfo.WardId,
            RoomId: $scope.BedInfo.RoomId,
            FacilityId: $scope.BedInfo.FacilityId
        };
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.Data.length;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if (item.ReleaseStatusId == 2) // Maintenance
                    $scope.item = item;
            }
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.BedInfo.Id },
                    { Key: 2, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/BedReservationDetail/GetBedReservationDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions


        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.Confirm = function (bedstatus) {

            if ($scope.BedInfo.BedStatusId == 1) {
                if (!utl.Validator.validate($scope)) {
                    return;
                }
            }

           var msg = 'bedmaintenance.maintenance.lbl';
  
            if (bedstatus == 1)
               msg = 'bedmaintenance.releasebed.lbl';
              var confirmOptions = {
                itemId: bedstatus,
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveItem = function (bedstatus) { // => Status To bed Changed
            $scope.item.BedStatusId = bedstatus;
            if (bedstatus == 1) {
                $scope.item.ReleaseStatusId = 3; // Release Bed
                $scope.item.ReleasedOn = utl.Formatter.getCurrentDate();
                $scope.item.ReleasedById = utl.Session.getCurrentUserId();
            }
            else
                $scope.item.ReleaseStatusId = 2; // Reserve Bed
            $scope.item.ReserveMaintenanceTypeId = 2; // For Reservation Type
            var ActionName = 'IPManagement/BedReservationDetail/AddBedReservationDetail';
            if ($scope.item.Id && $scope.item.Id > 0)
                ActionName = 'IPManagement/BedReservationDetail/UpdateBedReservationDetail';
            var options = {
                action: ActionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('', { opbillingid: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "BedMaintenanceType.Description", displayName: $translate.instant('bedmaintenance.maintenancetype.lbl')
                },
                {
                    field: "FromDate", displayName: $translate.instant('bedmaintenance.fromdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.FromDate '></ngformatdate>"
                },
                {
                    field: "ToDate", displayName: $translate.instant('bedmaintenance.todate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.ToDate '></ngformatdate>"
                },
                {
                    field: "Details", displayName: $translate.instant('bedmaintenance.maintenancedetails.lbl')
                },
                {
                    field: "ReservedBy.FirstName", displayName: $translate.instant('bedmaintenance.reservedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.FirstName}}" tooltip-placement="left" >' +
                    "<span >{{row.entity.ReservedBy.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.ReservedBy.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.ReservedBy.LastName}}&nbsp;</span>" +
                    "</a></div>"
                },
                {
                    field: "ReleasedOn", displayName: $translate.instant('bedmaintenance.releasedon.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.ReleasedOn '></ngformatdate>"
                },
                {
                    field: "ReleasedBy.FirstName", displayName: $translate.instant('bedmaintenance.releasedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.FirstName}}" tooltip-placement="left" >' +
                    "<span >{{row.entity.ReleasedBy.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.ReleasedBy.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.ReleasedBy.LastName}}&nbsp;</span>" +
                    "</a></div>"
                },
                { field: "ReleaseStatus.Description", displayName: $translate.instant('bedmaintenance.status.lbl') },
                // { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                //         cellTemplate : 'actionTemplate.html',
                //         actions : [ 
                //                     {actiontype: 'edit', display : 'common.editaction.lbl'},
                //                     {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                //                  ]
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "BedMaintenanceType" }
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

    BedMaintenanceController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();