(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('threewayMatchingListController', threewayMatchingListController);

    function threewayMatchingListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            date: utl.Formatter.getCurrentDate(),
            PrTypeId: -1,
            DoctorId: -1,
            AdjustmentStatusId: -1,
            VendorId: -1
        };

        $scope.getListCallback = function (scope, data, options, hasError) {

            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    //{ Key: 1, Value: $scope.currentfilter.PrTypeId }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/threewaymatching/Getthreewaymatching',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.addNew = function () {
            $state.go('app.threewaymatching', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'doctorinvoice/DoctorInvoice/DeleteDoctorInvoice',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "RequestDate", displayName: $translate.instant('inventory.threewaymatching-list.invoice.lbl'),
                    // cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "PatientRequest", displayName: $translate.instant('inventory.threewaymatching-list.vendorname.lbl') },
                {
                    field: "Patient.PatientName", displayName: $translate.instant('inventory.threewaymatching-list.store.lbl'),
                    //    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.Patient.FirstName}}&nbsp;</span>" + "<span class='pl-3'>{{row.entity.Patient.LastName}}</span>" + "</div>"
                },
                { field: "WardMaster.WardName", displayName: $translate.instant('inventory.threewaymatching-list.invoicedate.lbl') },
                { field: "WardRoomMaster.RoomNo", displayName: $translate.instant('inventory.threewaymatching-list.amount.lbl') },
                { field: "s", displayName: $translate.instant('inventory.threewaymatching-list.roundoff.lbl') },
                { field: "s", displayName: $translate.instant('inventory.threewaymatching-list.taxamount.lbl') },
                { field: "s", displayName: $translate.instant('inventory.threewaymatching-list.verifieddate.lbl') },
                { field: "PatientRequestStatus.Description", displayName: $translate.instant('doctorinvoice-list.status.lbl') },
                {
                    field: "I", displayName: $translate.instant('common.actions_col.lbl'),
                    // cellTemplate: '<div class="ui-grid-cell-contents">\
                    //                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.PatientRequestStatusId==2||row.entity.PatientRequestStatusId==3||row.entity.PatientRequestStatusId==4||row.entity.PatientRequestStatusId==5"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                    //                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.PatientRequestStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    //                                 <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.PatientRequestStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                    //                             </div>',
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
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "PrType" },
                { "Key": "AdjustmentStatus" },
                { "Key": "VendorMaster" }
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
    threewayMatchingListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();