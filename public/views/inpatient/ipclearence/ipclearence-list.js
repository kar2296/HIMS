(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipclearenceListController', ipclearenceListController);

    function ipclearenceListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            IPClearenceDate: utl.Formatter.getCurrentDate(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.IPClearenceDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.IPClearenceDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.PatientName
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    { Key: 4, Value: From },
                    { Key: 5, Value: To },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.IPClearenceStatusId
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/IPClearence/GetIPClearences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $scope.openModal(0);
        }

        $scope.openModal = function (Id) {
            utl.Modal.open('app.ipclearenceform', {
                params: {
                    id: Id
                },
                confirmCallback: $scope.initLookup
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/BedTransfer/DeleteBedTransfer',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'view') {
                $scope.openModal(entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                // { field: "CreatedAt", displayName: $translate.instant('bedtransfer-list.requestedon.lbl') },
                {
                    field: "S.No", displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "IPClearenceDate",
                    displayName: $translate.instant('Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.IPClearenceDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.IPClearenceDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PatientMrn",
                    displayName: $translate.instant('UHID')
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('Patient Name')
                },
                // {
                //     field: "Patient",
                //     displayName: $translate.instant('medicalcertificate.dischargesummary-list.patientname.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>"
                //         // + '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} '
                //         // + '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom" >'
                //         +
                //         '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                //         "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                //         "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                //         "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                //         "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                //         "<span >/</span>" +
                //         "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                //         "<span >/<span>" +
                //         "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                //         "<span >/</span>" +
                //         "<span >{{entity.Patient.Gender.Description}}</span>" +
                //         "</a></div>",
                //     handleEvent: $scope.handleEvents
                // },
                {
                    field: "WardRoomMaster", displayName: $translate.instant('Ward/Rooms'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        + "<span >{{entity.WardMaster.WardName}}</span>"
                        + "<span >&nbsp;/&nbsp;{{entity.WardRoomMaster.RoomNo}}</span>"
                        + "<span >&nbsp;/&nbsp;{{entity.WardRoomBedMaster.BedNo}}</span>"
                        + "</div>"
                },
                {
                    field: "VisitNo",
                    displayName: $translate.instant('Visit No')
                },
                {
                    field: "Encounter.AdmissionStatus.Description",
                    displayName: $translate.instant('Admission Status')
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('Department Name')
                },
                {
                    field: "IPClearenceStatus.Description",
                    displayName: $translate.instant('Status')
                },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                        <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
            var inputData = [{
                "Key": "IPClearenceStatus"
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 14,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },

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

    ipclearenceListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();