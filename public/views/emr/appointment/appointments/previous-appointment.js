(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousappointmentController', previousappointmentController);

    function previousappointmentController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {
            facilityid: utl.Session.getCurrentFacilityId()
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var i = 0; i < res.Data.length; i++) {
                    var item = res.Data[i];
                    item.BillAmount = 0;
                    for (var j = 0; j < item.IsRegCumBill.length; j++) {
                        var itemregcum = item.IsRegCumBill[j];
                        item.BillAmount = itemregcum.BillAmount;
                    }
                }
                vm.gridConfig.data = res.Data;
            }
            updateReactProps();
        };



        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
                    { Key: 49, Value: $scope.currentcontext.pid }  // IsRegCumBill --> true
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'encounter') {
                utl.Session.setEMRPatientId(entity.PatientId);
                var encounterId = entity ? entity.Id : 0;
                if (encounterId == 0)
                    encounterId = entity ? (entity.length > 0 ? entity[0].Id : 0) : 0;
                $state.go('patientemr.patientdashboard', { eid: encounterId });
                // $state.go('patientemr.patientdashboard', { encounter: row.entity });
                $scope.confirmCallback();
            } else if (actionType == 'print') {
                printVisitSlip(entity);                
            }
        }
        function printVisitSlip(entity) {
            var inputData = {
                Id: entity.Id,
                facilityid:$scope.currentcontext.facilityid,
                Data: {
                    isfrom: 'previousVisit',
                }
            };
            var options = {
                action: 'Visit/Visit/PrintPreviuosSlip',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "VisitIdentifier", displayName: $translate.instant('patientemr.pastvisit-list.visitidentifier.lbl') },
                {
                    field: "DoctorName", displayName: $translate.instant('patientemr.pastvisit-list.doctor.lbl'),
                    cellTemplate: "<displayuser user='entity.Doctor'></displayuser>"
                },
                {
                    field: "AdmissionDate", displayName: $translate.instant('patientemr.pastvisit-list.admissiondate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.AdmissionDate'></ngformatdate>"
                },
                { field: "ReferralType.Description", displayName: $translate.instant('Source Type') },
                { field: "Referral.ReferralName", displayName: $translate.instant('Referral Name') },
                {
                    field: "DischargeDate", displayName: $translate.instant('patientemr.pastvisit-list.dishcargedate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.AdmissionDate'></ngformatdate>"
                },
                { field: "EncounterType.Description", displayName: $translate.instant('patientemr.pastvisit-list.encountertype.lbl') },
                {
                    field: "IsNoBill", displayName: $translate.instant('patientemr.pastvisit-list.nobill.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.IsNoBill==true'>Yes</span>" +
                        "<span  ng-if='entity.IsNoBill==false'>No</span>" +
                        "</div>"
                },
                {
                    field: "IsPaidvisit", displayName: $translate.instant('patientemr.pastvisit-list.paidvisit.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.IsPaidVisit==true'>Yes</span>" +
                        "<span  ng-if='entity.IsPaidVisit==false'>No</span>" +
                        "</div>"
                },
                {
                    field: "FreeVisit",
                    displayName: $translate.instant('patientemr.pastvisit-list.freevisit.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.FreeVisit}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('patientemr.pastvisit-list.amount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.BillAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <a class="grid-action"  ng-click="handleEvents(\'print\',entity)"><img class="drhms-edit-button" src="assets/svg/print-black.svg" style="width: 16px;" aria-hidden="true" uib-tooltip="print" tooltip-placement="bottom"></a>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }
                // { field: "FreeVisit", displayName: $translate.instant('patientemr.pastvisit-list.freevisit.lbl') },
                // { field: "BillAmount", displayName: $translate.instant('patientemr.pastvisit-list.amount.lbl') },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'encounter', display: 'common.editaction.lbl', icon: 'fa-eye' }
                //     ]
                // }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getList();
        // }
        // $scope.initLookup = function () {
        //     var inputData = [
        //     ];
        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     utl.Http.doAction(options);
        // }
        // //$scope.initLookup();

        $scope.getList();

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to PreviousAppointmentModal.tsx).
        // All API calls/business logic above are untouched.
        // ---------------------------------------------------------------
        function updateReactProps() {
            $scope.reactProps = {
                pid: $scope.currentcontext.pid,
                rows: vm.gridConfig.data || []
            };
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'print':
                    $scope.handleEvents('print', payload.entity);
                    break;
                case 'cancel':
                    $scope.cancelCallback();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        updateReactProps();
    }
    previousappointmentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();
