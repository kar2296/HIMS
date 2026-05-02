(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DispenseWorkListController', DispenseWorkListController);

    function DispenseWorkListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            PatientRequestStatusId: 2,
            WardId: -1,
            PatientRequestPriorityId: -1,
            PatientRequestNumber: '',
            PatientName: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            // GuarantorTypeId: -1,
            // GuarantorId: -1
        };

        $scope.advancedfilter = {
            From: '',
            To: '',
            FacilityId: 1
        };

        function initDynamicForm() {
            $scope.advancedfilterDefault = {
                Facility: utl.Session.getCurrentUserId()
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'date',
                    translate: 'inventory.grn.fromdate.lbl',
                    model: 'From',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'inventory.grn.todate.lbl',
                    model: 'To',
                    position: {
                        r: 0,
                        c: 1
                    }
                }
                    /*
                    { type: 'text', translate: 'inventory.grn.gpno.lbl', model: 'GpNumber', position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'inventory.grn.createdby.lbl', model: 'CreatedBy', options: $scope.lookup.CreatedUser, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'inventory.grn.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'inventory.grn.facility.lbl', model: 'FacilityId', options: $scope.lookup.Facility, position: { r: 3, c: 1 } }
                    */
                ],
                actions: [{
                    type: 'apply',
                    translate: 'common.applyaction.lbl',
                    cls: 'btn-success'
                },
                {
                    type: 'reset',
                    translate: 'common.resetaction.lbl',
                    cls: 'btn-danger'
                }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };

        //Guarantor List
        // vm.guarantorcontrolconfig = {
        //     query: '',
        //     searchbyid: false,
        //     options: [
        //         {
        //             header: 'Guarantor Code',
        //             field: 'Code',
        //             datatype: 'string',
        //             headercls: 'td-type',
        //             fieldcls: 'td-type'
        //         }, {
        //             header: 'Guarantor Name',
        //             field: 'GuarantorName',
        //             datatype: 'string',
        //             headercls: 'td-name',
        //             fieldcls: 'td-name'
        //         },

        //     ],
        //     searchparams: {},
        //     result: {},
        //     api: 'generalmaster/Guarantor/GetGuarantors',
        //     formatdisplay: formatselectedguarantor,
        //     presearch: presearchguarantor,
        //     postsearch: postsearchguarantor
        // };

        // function formatselectedguarantor() {
        //     var selectedItem = vm.guarantorcontrolconfig.selected;
        //     var result = '';
        //     if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //         $scope.item.GuarantorId = selectedItem.Id;
        //         $scope.item.GuarantorName = selectedItem.GuarantorName;
        //         result = [selectedItem.GuarantorName].join(' ');
        //     } else if (vm.guarantorcontrolconfig.rowdata) {
        //         result = [vm.guarantorcontrolconfig.rowdata.GuarantorName].join(' ');
        //     }
        //     return result;
        // }

        // function presearchguarantor() {
        //     var query = vm.guarantorcontrolconfig.query;
        //     var inputData = {
        //         Params: [{
        //             Key: 7,
        //             Value: [-1, utl.Session.getCurrentFacilityId()]
        //         }],
        //         PageContext: {
        //             PageSize: -1,
        //             PageNumber: 1
        //         }
        //     };


        //     if (vm.guarantorcontrolconfig.searchbyid === true) {
        //         inputData.Params.push({
        //             Key: 0,
        //             Value: query
        //         });
        //     } else if (query && query.length > 2) {
        //         inputData.Params.push({
        //             Key: 1,
        //             Value: query
        //         });
        //     }

        //     vm.guarantorcontrolconfig.searchparams = inputData;
        // }

        // function postsearchguarantor() {
        //     for (var idx in vm.guarantorcontrolconfig.result) {
        //         var item = vm.guarantorcontrolconfig.result[idx];
        //         item.GuarantorName = item.GuarantorName;
        //         item.GuarantorCode = item.GuarantorCode;
        //         $scope.currentcontext.GuarantorTypeId = item.GuarantorTypeId;
        //         $scope.item.TpaId = item.TPAId;
        //         $scope.currentfilter.ServiceRateCategoryId = item.ServiceRateCategoryId;
        //         // if (item.RemarkType) {
        //         //     item.RemarkType = item.RemarkType.Description;
        //         // }
        //     }
        // }

        // $scope.getInsurancelookup = function () {
        //     var inputData = [{
        //         "Key": "Guarantor",
        //         Request: {
        //             Params: [{
        //                 Key: 7,
        //                 Value: [-1, utl.Session.getCurrentFacilityId()]
        //             }, {
        //                 Key: 2,
        //                 Value: $scope.currentfilter.GuarantorTypeId
        //             }]
        //         }
        //     }];
        //     $scope.getLookUp(inputData);
        // };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            // var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            if (!$scope.currentfilter.FromDate || !$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg('Please Select Req.Date');
                return false;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.PatientRequestNumber
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.WardId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.Patientname
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.PatientRequestPriorityId
                },
                {
                    Key: 24,
                    Value: From
                },
                {
                    Key: 25,
                    Value: To
                },
                // { Key: 14, Value: FromReq },
                // { Key: 15, Value: ToReq },
                {
                    Key: 4,
                    Value: $scope.currentfilter.PatientRequestStatusId
                },
                {
                    Key: 23,
                    Value: false
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            // if($scope.currentfilter.GuarantorId > 0) {
            //     inputData.Params.push({
            //         Key: 19,
            //         Value: $scope.currentfilter.GuarantorId
            //     });
            // }
            // if($scope.currentfilter.GuarantorTypeId > 0) {
            //     inputData.Params.push({
            //         Key: 26,
            //         Value: $scope.currentfilter.GuarantorId
            //     });
            // }
            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientWorkLists',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNewRequest = function () {
            $state.go('app.patient-request');
            /*
            utl.Modal.open('app.patient-request', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
            */
        };

        $scope.filter = function () {
            $state.go('app.stockrequests.admissionfilter', {
                admissionfilterid: 0
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/PatientStockRequests/DeletePatientRequest',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'issue') {
                $state.go('app.patientdispense-form', {
                    id: entity.Id,
                    PatientStockRequestId: entity.Id,
                    StoreMasterId: entity.ToStoreId,
                    PatientRequestStatusId: entity.PatientRequestStatusId,
                    GuarantorId: entity.GuarantorId,
                    issurgery: entity.IsSurgery
                });
            } else if (actionType == 'view') {
                $state.go('app.patientdispense-view', {
                    id: entity.Id,
                    PatientDispenseId: entity.Id,
                    StoreMasterId: entity.ToStoreId,
                    PatientRequestStatusId: entity.PatientRequestStatusId,
                    GuarantorId: entity.GuarantorId
                });
            }
        };

        var rowtpl = '<div ng-class="{\'priority\':entity.PatientRequestPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-entity-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                field: "PatientRequestDateTime",
                displayName: $translate.instant('billing.dispenseworklists.requestdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientRequestNumber",
                displayName: $translate.instant('billing.dispenseworklists.patientrequestnumber.lbl')
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('billing.dispenseworklists.patientmrn.lbl')
            },
            //{ field: "PatientName", displayName: $translate.instant('billing.dispenseworklists.patientname.lbl') },
            {
                field: "Patient",
                displayName: $translate.instant('admissions.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                    '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}} | ' + '{{entity.Doctor.Title.Description}} {{entity.Doctor.FirstName}} {{entity.Doctor.LastName}}" tooltip-placement="bottom">'
                    // + '<a ng-click="handleEvents(\'patientinfo\',entity)">'
                    +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}&nbsp;</span>" +
                    "</a></div>"
            },
            {
                field: "ToStore.StoreName",
                displayName: $translate.instant('billing.dispenseworklists.mystore.lbl')
            },
            {
                field: "WardRoomMaster",
                displayName: $translate.instant('mrd.room.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName }}</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}/</span>" +
                    "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomBedMaster.BedNo }}</span>" +
                    "</div>"
            },
            // {
            //     field: "Encounter.GuarantorType.Description",
            //     displayName: $translate.instant('billing.dispenseworklists.gtype.lbl')
            // },
            // {
            //     field: "Encounter.Guarantor.GuarantorName",
            //     displayName: $translate.instant('billing.dispenseworklists.gname.lbl')
            // },
            {
                field: "PatientRequestPriority.Description",
                displayName: $translate.instant('billing.dispenseworklists.priority.lbl')
            },
            {
                field: "RequestedUser",
                displayName: $translate.instant('billing.dispenseworklists.requestedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.RequestedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "PatientRequestStatus.Description",
                displayName: $translate.instant('billing.dispenseworklists.patientrequeststatus.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'issue\',entity)" ng-show="entity.PatientRequestStatusId==2||entity.PatientRequestStatusId==3||entity.PatientRequestStatusId==4||entity.PatientRequestStatusId==8"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.PatientRequestStatusId==5||entity.PatientRequestStatusId==6||entity.PatientRequestStatusId==7"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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

        function setDefaults() {
            var RequestedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Requested');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Authorized');
            var PartiallyDispensedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Partially Dispensed');
            $scope.currentfilter.PatientRequestStatusId = RequestedId + "," + AuthorizedId + "," + PartiallyDispensedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "PatientRequestStatus",
                Default: false
            },
            {
                "Key": "Ward"
            },
            {
                "Key": "PatientRequestPriority"
            },
            {
                "Key": "UserStores",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId(),
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                },
                Default: false
            },
            // {
            //     "Key": "GuarantorType"
            // }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.initLookup();
    }

    DispenseWorkListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();