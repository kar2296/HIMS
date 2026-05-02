(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dispatchResultListController', dispatchResultListController);

    function dispatchResultListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        // $scope.currentfilter = {
        //     name: '',
        //     TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
        //     Ordereddate: utl.Formatter.getCurrentDate(),
        //     FromDate: utl.Formatter.getCurrentDate(),
        //     ToDate: utl.Formatter.getCurrentDate(),
        //     // OrderStatusId: '11,14'
        // };
        $scope.item = {};
        $scope.item.WithoutHeader = true;
        $scope.currentfilter = {
            uid: utl.Session.getCurrentUserId(),
            // Ordereddate: utl.Formatter.getCurrentDate(),
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            // WorkOrderStatusId: '8',  //Released
            EncounterTypeId: -1,
            WorkOrderdid: '',
            name: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.SubdeptDisable = true;
        $scope.disabledept = function() {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        }

        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.ColorStatus = item.WorkOrderStatusId;
                if (item.IsPrinted) {
                    item.ColorStatus = 10;
                }
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };
        $scope.getList = function () {
            if (!$scope.currentfilter.FromDate || !$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg($translate.instant('Please select any Date'));
                return;
            } else {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                if ($scope.currentfilter.OrderBillNo || $scope.currentfilter.PatWoNum) {
                    var From = null;
                    var To = null;
                    $scope.currentfilter.WorkOrderStatusId = null
                }
                if ($scope.currentfilter.PatWoNum == '') {
                    $scope.currentfilter.WorkOrderStatusId = 7
                }
                var inputData = {
                    Params: [{
                            Key: 3,
                            Value: $scope.currentfilter.WorkOrderStatusId
                        },
                        // { Key: 4, Value: 'true' },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.TestTypeId
                        },
                        {
                            Key: 28,
                            Value: $scope.currentfilter.OrderBillNo
                        },
                        {
                            Key: 32,
                            Value: $scope.currentfilter.PatWoNum
                        },
                        {
                            Key: 9,
                            Value: $scope.currentfilter.WorkOrderdid
                        },
                        {
                            Key: 13,
                            Value: $scope.currentfilter.DoctorId
                        },
                        {
                            Key: 16,
                            Value: $scope.currentfilter.EncounterTypeId
                        },
                        // { Key: 13, Value: $scope.advancedfilter.Orderedbyid },
                        // { Key: 30, Value: $scope.advancedfilter.PatientMRN },
                        // { Key: 3, Value: $scope.advancedfilter.WorkOrderStatusId },
                        // { Key: 14, Value: $scope.advancedfilter.Departmentid },
                        {
                            Key: 11,
                            Value: From
                        },
                        {
                            Key: 12,
                            Value: To
                        },
                        {
                            Key: 23,
                            Value: $scope.currentfilter.SubDepartmentId
                        },
                        // { Key: 11, Value: FromOrd },
                        // { Key: 12, Value: ToOrd },
                        {
                            Key: 29,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        // { Key: 30, Value: $scope.currentfilter.VisitIdentifier }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
                // if ($scope.currentfilter.PatientMRN) { // skip other coditions
                //     inputData.Params = [];
                //     inputData.Params.push({ Key: 8, Value: $scope.currentfilter.PatientMRN });
                //     inputData.Params.push({ Key: 6, Value: $scope.currentfilter.TestTypeId });
                //     if ($scope.currentfilter.SubDepartmentId > 0) {
                //         inputData.Params.push({ Key: 23, Value: $scope.currentfilter.SubDepartmentId });
                //     }
                // }
                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorders',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };


        function setDefaults() {
            //Setting default status filters starts
            var partiallycompleted = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Partially Completed');
            var completed = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Completed');
            var sendforapproval = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Send For Approval');
            var rejected = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Rejected');
            var approved = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Approved');
            var released = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Released');
            var partiallyreleased = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Partially Released');
            $scope.currentfilter.WorkOrderStatusId = approved;
            //Setting default status filters ends
        }
        //Grid Actions
        $scope.addNew = function () {
            $state.go('', {});
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: '',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'release') {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'ordermanagement.resultdispatch-list.cnfreleasemsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: releaseDispatch,
                    itemId: entity
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    }
                });
            } else if (actionType == 'print') {
                if (entity.TestTypeId == 1 && !entity.IsCulture) {
                    printBIO(entity);
                }
                if (entity.TestTypeId == 1 && entity.IsCulture) {
                    printHIS(entity);
                }
                if (entity.TestTypeId == 2) {
                    printRIS(entity);
                }
            } else if (actionType == 'prints') {
                printPath(entity);
            } else if (actionType == 'print1') {
                printHIS(entity);
            } else if (actionType == 'print2') {
                printMIC(entity);
            } else if (actionType == 'print3') {
                printRIS(entity);
            } else if (actionType == 'print4') {
                printEndo(entity);
            } else if (actionType == 'print5') {
                printERCP(entity);
            }  else if (actionType == 'ordertat') {
                utl.Modal.open('app.lisordertat', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.PatientOrder.Id,
                        testtypeid: entity.TestTypeId,
                    },
                    confirmCallback: $scope.onDetailSave
                });
            } else if (actionType == 'orderhistory') {
                utl.Modal.open('app.resultentryorderhistory', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.Id,
                        testtypeid: entity.TestTypeId,
                    },
                    confirmCallback: $scope.onDetailSave
                });
            } 
        }

        $scope.canDisableReleaseAction = function (entity) {
            var result = entity.ReleasedDate ? true : false;
            return result;
        }
        // var entitytpl = '<div ng-class="{\'released\':entity.WorkOrderStatusId==8 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-entity-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            // entityTemplate: entitytpl,
            background: {
                style: {
                    field: 'ColorStatus',
                    value: {
                        8: {
                            'background': '#e69dcf',
                            'color': '#fff'
                        },
                        10: {
                            'background': '#ff902b94',
                            'color': '#fff'
                        }
                    }
                }
            },
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "WorkOrderdid",
                    displayName: $translate.instant('ordermanagement.myresultapproval-list.workordernumber.lbl')
                },
                {
                    field: "OrderNumber",
                    displayName: $translate.instant('Order No/Bill No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.PatientOrder.BillNumber}}&nbsp;</span>" + "</div>"
                },
                // {
                //     field: "PatientOrder.OrderNumber",
                //     displayName: $translate.instant('ordermanagement.resultdispatch-list.ordernumber.lbl')
                // },
                {
                    field: "PatientOrder.OrderRequestDate",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.orderdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PatientOrder.OrderRequestDate'></ngformatdate>"
                },
                {
                    field: "OrderPriority.Description",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.priority.lbl')
                },
                {
                    field: "MRN",
                    displayName: $translate.instant('Patient ID'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
                },
                {
                    field: "PatientMRN",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.patientinfo.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/<span>" +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                // {
                //     field: "Encounter.VisitIdentifier",
                //     displayName: $translate.instant('patientemr.patientorder-list.opipno.lbl')
                // },
                {
                    field: "WorkOrderStatus.DisplayName",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.workorderstatus.lbl')
                },
                {
                    field: "SubDepartment.DepartmentName",
                    displayName: $translate.instant('Sub Department')
                },
                {
                    field: "ReleasedDate",
                    displayName: $translate.instant('ordermanagement.resultdispatch-list.releaseddate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReleasedDate'></ngformatdate>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <a class="grid-action" ng-class="{\'release-disabled\': handleEvents.canDisableReleaseAction(entity)}" ng-click="handleEvents(\'release\',entity)" ng-hide="entity.WorkOrderStatusId==8"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true" uib-tooltip="Release" tooltip-placement="bottom"></a>\
                                    <a class="grid-action"  ng-click="handleEvents(\'print\',entity)"><img class="drhms-edit-button" src="assets/svg/print-black.svg" style="width: 16px;" aria-hidden="true" uib-tooltip="print" tooltip-placement="bottom"></a>\
                                       <span class="grid-action" ng-click="handleEvents(\'ordertat\',entity)" ><i class="fas fa-book" uib-tooltip="Order TAT"></i></span>\
                      <span class="grid-action" ng-click="handleEvents(\'orderhistory\',entity)" ><i class="fas fa-notes-medical" uib-tooltip="Order History"></i></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function releaseDispatchCallback() {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        }

        function releaseDispatch(itemId) {
            var inputData = {
                Id: itemId.Id,
                Data: {
                    itemId,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            }
            var options = {
                action: 'lis/patientworkorder/DispatchResult',
                data: inputData,
                type: 'post',
                onComplete: releaseDispatchCallback
            };

            utl.Http.doAction(options);
        }

        function printBIO(entity) {
            var inputData = {
                Id: entity.Id,
                Data: {
                    isfrom: 'resultdispatch',
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorderWithoutheader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printPath(entity) {
            var inputData = {
                Id: entity.Id,
                Data: {
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'lis/patientworkorder/Printpathaology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printHIS(entity) {
            var inputData = {
                Id: entity.Id,
                Data: {
                    isfrom: 'resultdispatch',
                    withoutHeader: $scope.item.WithoutHeader,
                    ids: 1,
                }
            };
            var options = {
                action: 'lis/patientworkorder/PrintPatientWorkorderWithoutheader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printMIC(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printmicrobiology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printRIS(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/PrintExternalLab',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printEndo(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/Printpathaology',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        function printERCP(entity) {
            var inputData = {
                Id: entity.Id,
                Data: true
            };
            var options = {
                action: 'lis/patientworkorder/PrintERCP',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.getDateDiff = function () {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromDate,
                $scope.currentfilter.ToDate
            );
            if (!(resultInHours >= 0 && resultInHours <= 72)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
                $scope.currentfilter.FromDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                $scope.currentfilter.ToDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                return false;
            } else {
                $scope.getList();
            }
        }
        $scope.getDateDiffInHours = function (Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "WorkOrderStatus"
                },
                {
                    "Key": "EncounterType"
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Ward"
                }
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

    dispatchResultListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();