(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('samplereviewlistController', samplereviewlistController);

    function samplereviewlistController($scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        var defaultFrom = new Date();
        defaultFrom.setDate(defaultFrom.getDate() - 7);

        $scope.Items = [];

        $scope.currentfilter = {
            OrdDeptId: -1,
            PatNameOrderNo: '',
            ordernrbillnr: '',
            namemrn: '',
            FromDate: defaultFrom,
            ToDate: utl.Formatter.getCurrentDate(),
            OrderRequestDate: defaultFrom,
            orderstatusid: -1,
            patienttypeid: -1,
            samplestatusid: -1,
            SubDepartmentId: -1,
            VisitIdentifier: '',
            WorkOrderdid: ''
        };

        if (utl.Session.getCurrentSubDepartmentId()) {
            var sDept = parseInt(utl.Session.getCurrentSubDepartmentId());
            if (!isNaN(sDept) && sDept > 0) {
                $scope.currentfilter.SubDepartmentId = sDept;
            }
        }

        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        };

        $scope.currentcontext = {
            deptcode: 8 // LIS Department ID
        };

        $scope.dashboard = function () {
            $state.go('app.lisdashboard');
        };

        // Grid Config
        vm.gridConfig = {
            data: [],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        // React Bridge Props
        $scope.refreshReactProps = function () {
            var dataList = vm.gridConfig.data || [];
            var pager = vm.gridConfig.pagerObj || { totalItems: 0, currentPage: 1, pageSize: 25 };

            $scope.reactProps = {
                rows: dataList,
                items: dataList,
                totalItems: pager.totalItems || dataList.length,
                currentPage: pager.currentPage || 1,
                pageSize: pager.pageSize || 25,
                pagerObj: {
                    totalItems: pager.totalItems || dataList.length,
                    currentPage: pager.currentPage || 1,
                    pageSize: pager.pageSize || 25,
                    startIndex: ((pager.currentPage || 1) - 1) * (pager.pageSize || 25)
                },
                currentfilter: angular.copy($scope.currentfilter),
                lookup: angular.copy($scope.lookup || {}),
                facilityName: utl.Session.getCurrentFacilityName ? utl.Session.getCurrentFacilityName() : 'SHUVADARSINI HOSPITAL',
                facilityId: utl.Session.getCurrentFacilityId ? utl.Session.getCurrentFacilityId() : 1
            };
            $scope.$applyAsync();
        };

        // Handle Actions from React Component
        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'edit':
                case 'view':
                    if (payload && payload.Id) {
                        $state.go('app.samplereview', { id: payload.Id });
                    }
                    break;

                case 'patientinfo':
                    if (payload && payload.PatientId) {
                        utl.Modal.open('registration.patientprofile', {
                            params: { pid: payload.PatientId }
                        });
                    }
                    break;

                case 'ordertat':
                    if (payload) {
                        var patientId = payload.PatientId;
                        var orderId = payload.PatientOrderId || payload.Id;
                        utl.Modal.open('app.tatdetails', {
                            params: {
                                pid: patientId,
                                oid: orderId
                            },
                            confirmCallback: $scope.getList
                        });
                    }
                    break;

                case 'dashboard':
                    $state.go('app.lisdashboard');
                    break;

                case 'orderack':
                    $state.go('app.orderacknowledgementlist');
                    break;

                case 'samplecollect':
                    $state.go('app.samplecollectionlist');
                    break;

                case 'search':
                    if (payload) {
                        if (payload.PatNameOrderNo !== undefined) $scope.currentfilter.PatNameOrderNo = payload.PatNameOrderNo;
                        if (payload.ordernrbillnr !== undefined) $scope.currentfilter.ordernrbillnr = payload.ordernrbillnr;
                        if (payload.namemrn !== undefined) $scope.currentfilter.namemrn = payload.namemrn;
                        if (payload.FromDate !== undefined) $scope.currentfilter.FromDate = payload.FromDate;
                        if (payload.ToDate !== undefined) $scope.currentfilter.ToDate = payload.ToDate;
                        if (payload.patienttypeid !== undefined) $scope.currentfilter.patienttypeid = payload.patienttypeid;
                        else if (payload.EncounterTypeId !== undefined) $scope.currentfilter.patienttypeid = payload.EncounterTypeId;
                        if (payload.SubDepartmentId !== undefined) $scope.currentfilter.SubDepartmentId = payload.SubDepartmentId;
                        if (payload.samplestatusid !== undefined) $scope.currentfilter.samplestatusid = payload.samplestatusid;
                        if (payload.orderstatusid !== undefined) $scope.currentfilter.orderstatusid = payload.orderstatusid;
                        if (payload.VisitIdentifier !== undefined) $scope.currentfilter.VisitIdentifier = payload.VisitIdentifier;
                    }
                    vm.gridConfig.pagerObj.currentPage = 1;
                    $scope.getList();
                    break;

                case 'resetFilters':
                    var resetFrom = new Date();
                    resetFrom.setDate(resetFrom.getDate() - 7);
                    $scope.currentfilter.PatNameOrderNo = '';
                    $scope.currentfilter.ordernrbillnr = '';
                    $scope.currentfilter.namemrn = '';
                    $scope.currentfilter.FromDate = resetFrom;
                    $scope.currentfilter.ToDate = utl.Formatter.getCurrentDate();
                    $scope.currentfilter.patienttypeid = -1;
                    $scope.currentfilter.SubDepartmentId = -1;
                    $scope.currentfilter.samplestatusid = -1;
                    $scope.currentfilter.orderstatusid = -1;
                    $scope.currentfilter.VisitIdentifier = '';
                    vm.gridConfig.pagerObj.currentPage = 1;
                    $scope.getList();
                    break;

                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload && payload.page ? payload.page : 1;
                    $scope.getList();
                    break;

                case 'pageSizeChange':
                    vm.gridConfig.pagerObj.pageSize = payload && payload.pageSize ? payload.pageSize : 25;
                    vm.gridConfig.pagerObj.currentPage = 1;
                    $scope.getList();
                    break;

                default:
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (hasError || !res) {
                vm.gridConfig.data = [];
                vm.gridConfig.pagerObj.totalItems = 0;
            } else {
                vm.gridConfig.data = res.Data || [];
                vm.gridConfig.pagerObj.totalItems = (res.PageContext && res.PageContext.TotalRecords !== undefined)
                    ? res.PageContext.TotalRecords
                    : (res.Data ? res.Data.length : 0);
            }
            $scope.disabledept();
            $scope.refreshReactProps();
        };

        $scope.getList = function (pageNo) {
            if (pageNo) {
                vm.gridConfig.pagerObj.currentPage = pageNo;
            }

            var fromDateStr = null;
            var toDateStr = null;

            if ($scope.currentfilter.FromDate) {
                fromDateStr = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            }
            if ($scope.currentfilter.ToDate) {
                toDateStr = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            }

            var searchVal = $scope.currentfilter.PatNameOrderNo ||
                $scope.currentfilter.ordernrbillnr ||
                $scope.currentfilter.namemrn ||
                '';

            var params = [
                {
                    Key: 17, // FacilityId
                    Value: utl.Session.getCurrentFacilityId ? utl.Session.getCurrentFacilityId() : 1
                }
            ];

            if (fromDateStr) {
                params.push({ Key: 10, Value: fromDateStr }); // From
            }
            if (toDateStr) {
                params.push({ Key: 11, Value: toDateStr }); // To
            }
            if (searchVal && searchVal.trim() !== '') {
                params.push({ Key: 20, Value: searchVal.trim() }); // PatNameOrderNo
            }
            if ($scope.currentfilter.patienttypeid && $scope.currentfilter.patienttypeid != -1) {
                params.push({ Key: 3, Value: $scope.currentfilter.patienttypeid }); // PatientType
            }
            if ($scope.currentfilter.SubDepartmentId && $scope.currentfilter.SubDepartmentId != -1) {
                params.push({ Key: 15, Value: $scope.currentfilter.SubDepartmentId }); // SubDepartmentId
            }
            if ($scope.currentfilter.samplestatusid && $scope.currentfilter.samplestatusid != -1 && $scope.currentfilter.samplestatusid !== '') {
                params.push({ Key: 21, Value: $scope.currentfilter.samplestatusid }); // MultiSampleStatus
            }
            if ($scope.currentfilter.orderstatusid && $scope.currentfilter.orderstatusid != -1 && $scope.currentfilter.orderstatusid !== '') {
                params.push({ Key: 7, Value: $scope.currentfilter.orderstatusid }); // OrderStatus
            }
            if ($scope.currentfilter.VisitIdentifier && $scope.currentfilter.VisitIdentifier.trim() !== '') {
                params.push({ Key: 18, Value: $scope.currentfilter.VisitIdentifier.trim() }); // VisitIdentifier
            }
            if ($scope.currentfilter.WorkOrderdid && $scope.currentfilter.WorkOrderdid.trim() !== '') {
                params.push({ Key: 16, Value: $scope.currentfilter.WorkOrderdid.trim() }); // WorkOrderdid
            }

            var inputData = {
                Params: params,
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize || 25,
                    PageNumber: vm.gridConfig.pagerObj.currentPage || 1
                }
            };

            var options = {
                action: 'lis/workordersample/GetWorkOrderSamples',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // Backward compatibility handlers
        $scope.handleEvents = function (actionType, entity) {
            $scope.handleReactAction(actionType, entity);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderStatus" },
                { "Key": "SampleStatus" },
                { "Key": "EncounterType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId ? utl.Session.getCurrentFacilityId() : 1]
                        }]
                    }
                },
                { "Key": "Department" },
                { "Key": "Ward" },
                {
                    "Key": "SubDepartment",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentcontext.deptcode }
                        ]
                    }
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    samplereviewlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();