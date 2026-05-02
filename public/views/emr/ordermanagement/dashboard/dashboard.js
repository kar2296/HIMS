(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('DashboardController', DashboardController);

function DashboardController($scope, $stateParams, $state, $translate, $filter, utl) {
    var vm = this;

    $scope.DeptId =  62;   //RADIOLOGY

    $scope.rows= [];
    $scope.row = { cols: []};
    $scope.headerRow = { cols:[] }; 


    
    
    $scope.Items = {
        AllSupDept: {},
        AllOrdStatus: {}
    };

    $scope.Items.RISStockRequestCount = '0';
    $scope.Items.RISStockReceivedCount = '0';    
    $scope.Items.RISInventoryItemsCount = '0';
    $scope.Items.RISAlertsCount = '0';  
    $scope.Items.PACSCount = '0';
    $scope.Items.RISScheduleCount = '0';

    $scope.Items.RISPatientOrderACKCount = '0';  
    $scope.Items.RISPatientOrderCount = '0'; 
    $scope.Items.RISResultNotApprovalCount = '0'; 
    $scope.Items.RISRejectedOrderProcessCount = '0'; 
    $scope.Items.RISResultNotReleaseCount = '0'; 
    $scope.Items.RISNotOrderProcessCount = '0';
    $scope.Items.RISSampleCollectionCount = '0';
    $scope.Items.RISSampleReviewCount = '0';


    
    $scope.currentcontext = {
        FacilityId: utl.Session.getCurrentFacilityId(),
        FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
        ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        Testtypeid: 2,
        SubDepartmentId: [],
        OrderStatusId: []
    };
    $scope.currentfilter= {
        name : '',
        codemnemonicsnamedesc: '',
        code : '',
        ActiveStatusId : 2,
        CONTAINTYPId : -1,
        COLORId : -1,
        mnemonics : ''        
    };

    $scope.getLABDeptListCallBack = function (scope, res, options, hasError) {
        for (var idx in res.Data) {
            $scope.currentcontext.SubDepartmentId.push(res.Data[idx].Id);                
            var id = res.Data[idx].Id;
            var name = res.Data[idx].DepartmentName; 
            $scope.Items.AllSupDept[id] = name; 
        }
        $scope.getOrderStatusList();
    }

    $scope.getLABDeptList = function () {
        var inputData = {
            Params: [
                { Key: 6, Value: $scope.DeptId }
            ],
            PageContext: {
                PageSize: 1000,
                PageNumber: 1
            }
        };

        var options = {
            action: 'SystemSettings/department/GetDepartments',
            data: inputData,
            type: 'post',
            onComplete: $scope.getLABDeptListCallBack
        };
        utl.Http.doAction(options);
    };

    $scope.getOrderStatusListCallBack = function (scope, res, options, hasError) {
        for (var idx in res.Data) {
            $scope.currentcontext.OrderStatusId.push(res.Data[idx].Id);
            var id = res.Data[idx].Id;
            var name = res.Data[idx].DisplayName;
            $scope.Items.AllOrdStatus[id] = name;
        }
        $scope.getList();
    }


    $scope.getOrderStatusList = function () {
        var inputData = {
            Params: [],
            PageContext: {
                PageSize: 1000,
                PageNumber: 1
            }
        };

        var options = {
            action: 'LIS/OrderStatus/GetOrderStatuss',
            data: inputData,
            type: 'post',
            onComplete: $scope.getOrderStatusListCallBack
        };
        utl.Http.doAction(options);
    };


    $scope.GetLISDashboardHeadingCallBack = function (scope, res, options, hasError) {

        $scope.Items.RISPatientOrderACKCount = res.patientorderbo.LABPatientOrderACKCount;
        $scope.Items.RISPatientOrderCount = res.patientorderbo.LABPatientOrderCount;
        $scope.Items.RISResultNotApprovalCount = res.patientworkorderbo.LABResultNotApprovalCount;
        $scope.Items.RISRejectedOrderProcessCount = res.patientworkorderbo.LABRejectedOrderProcessCount;
        $scope.Items.RISResultNotReleaseCount = res.patientworkorderbo.LABResultNotReleaseCount;
        $scope.Items.RISNotOrderProcessCount = res.patientworkorderbo.LABNotOrderProcessCount;
       
        $scope.Items.RISStockRequestCount = '0';
        $scope.Items.RISStockReveivedCount = '0';
        $scope.Items.RISInventoryItemsCount = '0';
        $scope.Items.RISAlertsCount = '0';

        if (!$scope.Items.RISPatientOrderACKCount)
            $scope.ItemsRISPatientOrderACKCount = '0';
        if (!$scope.Items.RISPatientOrderCount)
            $scope.Items.RISPatientOrderCount = '0';
        if (!$scope.Items.RISResultNotApprovalCount)
            $scope.Items.RISResultNotApprovalCount = '0';
        if (!$scope.Items.RISRejectedOrderProcessCount)
            $scope.Items.RISRejectedOrderProcessCount = '0';
        if (!$scope.Items.RISResultNotReleaseCount)
            $scope.Items.RISResultNotReleaseCount = '0';
        if (!$scope.Items.RISNotOrderProcessCount)
            $scope.Items.RISNotOrderProcessCount = '0';

        
        $scope.getSubDeptList();

    };

    $scope.getList = function () { 
        var inputData = {
            Data: {
                Keys: [{ Key: 'patientorderbo' }, 
                { Key: 'patientworkorderbo' }]
            },
            Attributes: $scope.currentcontext
        };

        var options = {
            action: 'LIS/LABDashboard/GetLABDashboardOptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.GetLISDashboardHeadingCallBack
        };
        utl.Http.doAction(options);
    };

    var groupByMulti = function (obj, values, context) {
        if (!values.length)
            return obj;
        var byFirst = _.groupBy(obj, values[0], context),
            rest = values.slice(1);
        for (var prop in byFirst) {
            byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
        }
        return byFirst;
    }; 

    var getDeptLabel = function(key){
        var deptname = $scope.Items.AllSupDept[key] || "";
        return deptname;
    };
    
    var getOrderStatusLabel = function(key){
        var ordsts = $scope.Items.AllOrdStatus[key] || key;
        return ordsts;
    };
    var fillEmptyCols = function(colIndexes, cols){
        for(var cIndex = cols.length; cIndex < colIndexes.length; cIndex++){
            cols.push({text: ''});
        }
    };
    
    var constructTable = function(gItems) {
        var colIndexes = ['Department', 'Total'];
        $scope.rows = [];
    
        for(var sdKey in gItems){
            $scope.row = { cols: []};
            fillEmptyCols(colIndexes, $scope.row.cols);
            //0 - subdepartment name
            $scope.row.cols[0] = { text: getDeptLabel(sdKey) };
            
            //1 - compute overall total
            var total = 0;
            for(var osKey in gItems[sdKey]){
                var osIndex = colIndexes.indexOf(osKey);
                var osTotal = gItems[sdKey][osKey].length;
                if(osIndex === -1){
                    colIndexes.push(osKey);
                    osIndex = colIndexes.indexOf(osKey);
                    fillEmptyCols(colIndexes, $scope.row.cols);
                }
                $scope.row.cols[osIndex] = { text: osTotal };    
                total += osTotal;
            }
            $scope.row.cols[1] = { text: total };
    
            $scope.rows.push($scope.row);
       }
    
       $scope.headerRow = { cols:[] };
       for(var cIndex=0;cIndex < colIndexes.length; cIndex++){
        $scope.headerRow.cols.push({ text: getOrderStatusLabel(colIndexes[cIndex]) });
       }
       //$scope.rows.splice(0,0, $scope.headerRow);
    
       for(var rIndex=0; rIndex<$scope.rows.length; rIndex++) {
         fillEmptyCols(colIndexes, $scope.rows[rIndex].cols);
       }
    
       return $scope.rows;
    }; 

    $scope.GetLISDashboardSubDeptCallBack = function (scope, res, options, hasError) { 
        
        var sourceData = res.patientorderdetailbo.LisSubDeptTotaldata; 
        var groupedItems = groupByMulti(sourceData, ['SubDepartmentId', 'OrderStatusId']); 
        var table = constructTable(groupedItems); 
        //console.log(JSON.stringify(table));

    };

    $scope.getSubDeptList = function () {
        var inputData = {
            Data: {
                Keys: [{ Key: 'patientorderdetailbo' }]
            },
            Attributes: $scope.currentcontext
        };

        var options = {
            action: 'LIS/LABDashboard/GetLABDashboardOptions',
            data: inputData,
            type: 'post',
            onComplete: $scope.GetLISDashboardSubDeptCallBack
        };
        utl.Http.doAction(options);
    };
 

    $scope.handleEvents = function(actionType, row) {
        
        if(actionType == 'edit') {
            $state.go('app.containertype', { id:row.entity.Id });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, '<br/>'+row.entity.Name);                               
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                        { field: "Code", displayName: $translate.instant('lis.containertypes.code.lbl') },
                        { field: "Name", displayName: $translate.instant('lis.containertypes.name.lbl') },
                        { field: "CONTAINTYP.Description", displayName: $translate.instant('lis.containertypes.type.lbl') },
                        { field: "Mnemonics", displayName: $translate.instant('lis.containertypes.Mnemonics.lbl') },
                        { field: "Height", displayName: $translate.instant('lis.containertypes.Height.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Height}} {{row.entity.HEIGHTUNITS.Description}}  </div>' },
                        { field: "Diameter", displayName: $translate.instant('lis.containertypes.Diameter.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents" > {{row.entity.Diameter}} {{row.entity.DIAMETERUNITS.Description}}  </div>' },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('lis.containertypes.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'), 
                                cellTemplate : 'actionTemplate.html',
                                actions : [ 
                                            {actiontype: 'edit', display : 'common.editaction.lbl'},
                                            {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                                          ]
                        }
                    ],
                    pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
    
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getLABDeptList();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
                          
                        ]
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

DashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();