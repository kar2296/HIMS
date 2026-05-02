(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('bedoccupancyHistoryController', bedoccupancyHistoryController);

    function bedoccupancyHistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function(scope, data, options, hasError) {
            vm.gridConfig.data = [];
            // for (var idx in data.Data) {
            //     var item = data.Data[idx];
            //     // if (item.AdmitStatusId != 6) {
            //         vm.gridConfig.data.push(item);
            //     // }
            // }
            vm.gridConfig.data = data.Data;
        };

        $scope.getList = function() {

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                utl.Modal.open('app.bedoccupancyhistory-form', {
                    params: {
                        id: entity.Id,
                        pid: $scope.currentcontext.patientid
                    },
                    confirmCallback: $scope.getList
                });
                //$state.go('app.patientguarantorform', { guarantorid: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GuarantorName);
            } else if (actionType == 'gl') {
                utl.Modal.open('app.bedoccupancyhistory-form', {
                    params: {
                        id: entity.Id,
                        pid: $scope.currentcontext.patientid,
                        gname: entity.GuarantorName,
                        gtypeid: entity.GuarantorTypeId,
                        gltrno: entity.GuarantorLetterNo,
                        gltrdate: entity.GuarantorLetterDate
                    },
                    confirmCallback: $scope.getList
                });
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "WardMaster.WardName",
                    displayName: $translate.instant('admissions.ward.lbl'),

                },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('admissions.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('admission.admissiondate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"

                },
                {
                    field: "DischargeDate",
                    displayName: $translate.instant('admission.dischargedate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DischargeDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.DischargeDate | date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "ServiceRateCategory.ServiceRateCategory",
                    displayName: $translate.instant('admission.serviceratecategory.lbl')
                },
                {
                    field: "BillingStartDate",
                    displayName: $translate.instant('admission.billstart.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillingStartDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillingStartDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "BillingEndDate",
                    displayName: $translate.instant('admission.billend.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.BillingEndDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.BillingEndDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                //{ field: "BillingAmount", displayName: $translate.instant('admission.billamount.lbl') },
                {
                    field: "IsDoubleOccupancy",
                    displayName: $translate.instant('admission.isdoubleoccupancy.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span  ng-if='entity.IsDoubleOccupancy'>Yes</span></div>"
                },
                {
                    field: "Created",
                    displayName: $translate.instant('admissions.admittedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.Created'>{{entity.Created.Title.Description }}</span>" +
                        "<span  ng-if='entity.Created'></span>" +
                        "<span  ng-if='entity.Created'>{{entity.Created.FirstName }}</span>" +
                        "<span  ng-if='entity.Created'></span>" +
                        "<span  ng-if='entity.Created'>{{entity.Created.LastName}}</span>" +
                        "</div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.OccupancyStatusId==1" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ]
        };
    }
    bedoccupancyHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();