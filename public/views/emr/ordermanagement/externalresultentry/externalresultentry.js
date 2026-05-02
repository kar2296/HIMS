(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExternalResultEntryController', ExternalResultEntryController);

    function ExternalResultEntryController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            uid: utl.Session.getCurrentUserId(),
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            WorkOrderStatusId: -1,
            EncounterTypeId: -1,
            Ordereddate: utl.Formatter.getCurrentDate(),
            WorkOrderdid: '',
            LabAssignTypeId: 1,
            ExternalProviderId: -1,
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.context = $stateParams.context
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        }
        $scope.currentcontext = {};
        if ($scope.currentfilter.TestTypeId == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentfilter.TestTypeId == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentfilter.TestTypeId == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentfilter.WorkOrderStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.TestTypeId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.PatientMRN
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.WorkOrderdid
                    },
                    {
                        Key: 11,
                        Value: From
                    },
                    {
                        Key: 12,
                        Value: To
                    },
                    {
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 32,
                        Value: true
                    },
                    // { Key: 10, Value: utl.Formatter.getFilterDate($scope.currentfilter.WorkOrderDate) },
                    // { Key: 16, Value: $scope.currentfilter.EncounterTypeId },
                    // {
                    //     Key: 17,
                    //     Value: $scope.advancedfilter.LabAssignTypeId
                    // },
                    // {
                    //     Key: 18,
                    //     Value: $scope.currentfilter.ExternalProviderId
                    // },
                    // {
                    //     Key: 23,
                    //     Value: $scope.currentfilter.SubDepartmentId
                    // },
                    // {
                    //     Key: 30,
                    //     Value: $scope.currentfilter.VisitIdentifier
                    // },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if ($scope.currentfilter.PatientMRN && From && To) { // skip other coditions
            //     inputData.Params = [];
            //     inputData.Params.push({
            //         Key: 8,
            //         Value: $scope.currentfilter.PatientMRN
            //     });
            //     inputData.Params.push({
            //         Key: 6,
            //         Value: $scope.currentfilter.TestTypeId
            //     });
            //     inputData.Params.push({
            //         Key: 11,
            //         Value: From
            //     });
            //     inputData.Params.push({
            //         Key: 12,
            //         Value: To
            //     });
            //     if ($scope.currentfilter.SubDepartmentId) {
            //         inputData.Params.push({
            //             Key: 23,
            //             Value: $scope.currentfilter.SubDepartmentId
            //         });
            //     }
            // }
            var options = {
                action: 'lis/patientworkorder/GetPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        function setDefaults() {
            //Setting default status filters starts
            var createdStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Created');
            var assignedStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Assigned & In-progress');
            var partiallycompletedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Partially Completed');
            var rejectedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Rejected');
            $scope.currentfilter.WorkOrderStatusId = createdStatusId + "," + assignedStatusId + "," + partiallycompletedStautsId + "," + rejectedStautsId;
            //Setting default status filters ends
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.AssignOrderByIdCallback = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.resultentry', {
                id: $scope.currentcontext.WorkOrderId
            });
        };
        $scope.assignOrder = function (workorderId) {
            $scope.currentcontext.WorkOrderId = workorderId;

            var options = {
                action: 'lis/patientworkorder/AssignOrderById',
                data: {
                    Id: workorderId
                },
                type: 'post',
                onComplete: $scope.AssignOrderByIdCallback
            };
            utl.Http.doAction(options);
        };

        $scope.attendOrder = function (entity) {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.assignOrder,
                itemId: entity.Id
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.canShowAction = function (actionType, entity) {
            if (actionType == 'edit') {
                if (entity.UserId == utl.Session.getCurrentUserId()) {
                    return true;
                }
                return false;
            }
            if (actionType == 'attend') {
                if (entity.UserId == utl.Session.getCurrentUserId()) {
                    return false;
                }
                return true;
            }
            return true;
        }


        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.resultentry', {
                    id: entity.Id,
                    testtypeid: entity.TestTypeId,
                    filter_orderdate: $scope.currentfilter.Ordereddate,
                    filter_patientname: $scope.currentfilter.PatientMRN,
                    filter_wostatus: $scope.currentfilter.WorkOrderStatusId,
                    filter_subdept: $scope.currentfilter.SubDepartmentId,
                    context: $scope.context
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            } else if (actionType == 'attend') {
                $scope.attendOrder(entity);
            }

            if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    }
                });
            } else if (actionType == 'amend') {
                $state.go('app.amendresultentry', {
                    id: entity.Id,
                    pt: 'myapproval'
                });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.Id
                    },
                    confirmCallback: $scope.onDetailSave
                });
            } else if (actionType == 'worksheet') {
                $scope.printWorkSheet(entity.PatientId, entity.Id);
            }

        }

        $scope.printWorkSheet = function (PatientId, WorkOrderId) {
            var inputData = {
                Id: WorkOrderId
            };
            var options = {
                action: 'lis/patientworkorder/printWorkSheet',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "WorkOrderdid",
                    displayName: $translate.instant('ordermanagement.myorderprocess-list.workordernumber.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\<div style='color: #4407ff;class='col-sm-2'><span>{{entity.WorkOrderdid}}</span></div>\
                       &nbsp;\</div>"
                },
                {
                    field: "PatientOrder.OrderNumber",
                    displayName: $translate.instant('ordermanagement.myorderprocess-list.ordernumber.lbl')
                },
                {
                    field: "Ordereddate",
                    displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.Ordereddate'></ngformatdate>"
                },
                //{ field: "OrderPriority.Description", displayName: $translate.instant('ordermanagement.myorderprocess-list.priority.lbl') },
                {
                    field: "PatientMRN",
                    displayName: $translate.instant('ordermanagement.orderassignment-list.patientinfo.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                // {
                //     field: "Encounter.EncounterType.Description",
                //     displayName: $translate.instant('ordermanagement.myorderprocess-list.visittype.lbl')
                // },
                {
                    field: "FromFacility.FacilityName",
                    displayName: $translate.instant('ordermanagement.myorderprocess-list.fromhsptl.lbl')
                },
                {
                    field: "WorkOrderStatus.DisplayName",
                    displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderstatus.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    // cellTemplate: 'conditionActionTemplate.html',
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" title="Edit" ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pencil btn btn-success btn-rounded" aria-hidden="true"></i></span>\
                    <span class="grid-action" title="Amend" ng-click="handleEvents(\'amend\',entity)"><i class="btn btn-danger btn-rounded fa fa-refresh" aria-hidden="true" ng-show="entity.WorkOrderStatusId==7"></i></span>\
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



        /*$scope.lookupCallback = function (scope, data, options, hasError) {
                $scope.lookup = hasError ? {} : data;
                $scope.getList();
            }

            $scope.initLookup = function () {
                var inputData = [
                                ];

                var options = {
                    action: '',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.lookupCallback
                };
                utl.Http.doAction(options);
            }

            $scope.initLookup();*/
        $('#patientname').focus();
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.Ordereddate = $stateParams.filter_orderdate,
                    $scope.currentfilter.PatientMRN = $stateParams.filter_patientname,
                    $scope.currentfilter.WorkOrderStatusId = $stateParams.filter_wostatus,
                    $scope.currentfilter.SubDepartmentId = $stateParams.filter_subdept,
                    $scope.getList();
            } else {
                $scope.getList();
            }
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "WorkOrderStatus",
                Default: false
            }];

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
    ExternalResultEntryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();