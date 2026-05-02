(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReturnWorkListController', ReturnWorkListController);

    function ReturnWorkListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            PatientReturnStatusId: 2,
            WardId: -1,
            PatientReturnPriorityId: -1,
            PatientReturnNumber: '',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };

        $scope.advancedfilter = {
            FromDate: null,
            ToDate: null
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                RemarkId: -1,
                LocationId: -1,
                PatientReturnTypeId: -1,
                DoctorId: -1,
                PatientId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'date',
                    translate: 'patientreturns.fromdate.lbl',
                    model: 'From',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'patientreturns.todate.lbl',
                    model: 'To',
                    position: {
                        r: 0,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'patientreturns.returnedby.lbl',
                    model: 'ReturnedBy',
                    options: $scope.lookup.ReturnedUser,
                    position: {
                        r: 1,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'patientreturns.approvedby.lbl',
                    model: 'ApprovedBy',
                    options: $scope.lookup.ApprovedUser,
                    position: {
                        r: 1,
                        c: 1
                    }
                },
                ],
                actions: [{
                    type: 'apply',
                    translate: 'common.applyaction.lbl',
                    cls: 'btn-primary'
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
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];

                item.TotalNetAmount = parseFloat(item.TotalNetAmount).toFixed(2);
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {
            // var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            if (!$scope.currentfilter.FromDate||!$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg('Please Select Ret.Date');
                return false;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.PatientReturnNumber
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.Facility
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.PatientReturnPriorityId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.PatientReturnStatusId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.PatientName
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
                        Key: 14,
                        Value: From
                    },
                    {
                        Key: 15,
                        Value: To
                    },
                    // {
                    //     Key: 14,
                    //     Value: FromReq
                    // },
                    // {
                    //     Key: 15,
                    //     Value: ToReq
                    // },
                    // {
                    //     Key: 12,
                    //     Value: $scope.advancedfilter.RequestedBy
                    // },
                    // {
                    //     Key: 13,
                    //     Value: $scope.advancedfilter.ApprovedBy
                    // },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNewReturn = function () {
            $state.go('app.patient-return');
            /*
            utl.Modal.open('app.patient-return', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
            */
        };

        $scope.filter = function () {
            $state.go('app.stockreturns.admissionfilter', {
                admissionfilterid: 0
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/PatientStockReturns/DeletePatientReturn',
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
                $state.go('app.returnreceive-form', {
                    id: entity.Id,
                    PatientStockReturnId: entity.Id,
                    StoreMasterId: entity.ToStoreId,
                    PatientReturnStatusId: entity.PatientReturnStatusId
                });
            } else if (actionType == 'view') {
                $state.go('app.returnrequest-view', {
                    id: entity.Id,
                    PatientStockReturnId: entity.Id,
                    PatientReturnStatusId: entity.PatientReturnStatusId,
                    StoreMasterId: entity.ToStoreId
                });
            }
        };

        var rowtpl = '<div ng-class="{\'priority\':entity.PatientReturnPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [{
                field: "PatientReturnDateTime",
                displayName: $translate.instant('billing.returnworklists.returndate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientReturnDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PatientReturnDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "PatientReturnNumber",
                displayName: $translate.instant('billing.returnworklists.patientreturnnumber.lbl')
            },
            {
                field: "Patient.MRN",
                displayName: $translate.instant('billing.returnworklists.patientmrn.lbl')
            },
            {
                field: "PatientName",
                displayName: $translate.instant('billing.patientreturns.patientname.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Patient.Title.Description}}&nbsp;</span><span>{{entity.Patient.FirstName}}&nbsp;</span><span>{{entity.Patient.LastName}}&nbsp;</span>' + '</div>'
            }, // { field: "PatientName", displayName: $translate.instant('billing.returnworklists.patientname.lbl') },
            {
                field: "ToStore.StoreName",
                displayName: $translate.instant('billing.returnworklists.mystore.lbl')
            },
            {
                field: "PatientReturnPriority.Description",
                displayName: $translate.instant('billing.returnworklists.priority.lbl')
            },
            {
                field: "ReturnedUser",
                displayName: $translate.instant('billing.returnworklists.returnedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReturnedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.ReturnedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "PatientReturnStatus.Description",
                displayName: $translate.instant('billing.returnworklists.patientreturnstatus.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'issue\',entity)" ng-show="entity.PatientReturnStatusId==2||entity.PatientReturnStatusId==3||entity.PatientReturnStatusId==4"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                            <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.PatientReturnStatusId==5||entity.PatientReturnStatusId==6"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
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
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.PatientReturnStatus, 'Returned');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PatientReturnStatus, 'Authorized');
            var PartiallyReceivedId = utl.Lookup.getDefault($scope.lookup.PatientReturnStatus, 'PartiallyReceived');
            $scope.currentfilter.PatientReturnStatusId = ApprovedId + "," + AuthorizedId + "," + PartiallyReceivedId;
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
                "Key": "PatientReturnStatus",
                Default: false
            },
            {
                "Key": "PatientReturnPriority"
            },
            {
                "Key": "Ward"
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

    ReturnWorkListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();