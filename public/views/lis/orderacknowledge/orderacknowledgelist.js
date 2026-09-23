(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderacknowledgelistController', orderacknowledgelistController);

    function orderacknowledgelistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            OrdDeptId: -1,
            OrderReqDate: '',
            FrmOrderReqDate: '',
            ToOrderReqDate: '',
            code: '',
            type: '',
            mnemonics: '',
            ordernumber: '',
            orderstatusid: -1,
            prioritystatusid: -1
        };

        var parentdeptid = $state.params.parentdeptid;
        $scope.currentfilter.OrdDeptId = parentdeptid;
        //console.log("parentdeptid" + parentdeptid);
        //console.log(" OrdDeptId "+$scope.currentfilter.OrdDeptId);
        $scope.currentfilter.OrderReqDate = new Date();


        $scope.searchdt = function () {
            if ($scope.currentfilter.OrderReqDate == null)
                $scope.currentfilter.OrderReqDate = new Date(); 

            $scope.getList();
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            $scope.currentfilter.FrmOrderReqDate = $filter('date')($scope.currentfilter.OrderReqDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentfilter.ToOrderReqDate = $filter('date')($scope.currentfilter.OrderReqDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 1, Value: parentdeptid },
                    { Key: 2, Value: [$scope.currentfilter.FrmOrderReqDate, $scope.currentfilter.ToOrderReqDate] },
                    { Key: 3, Value: $scope.currentfilter.orderstatusid },
                    { Key: 4, Value: $scope.currentfilter.ordernumber != '' ? $scope.currentfilter.ordernumber : -1 },
                    { Key: 5, Value: $scope.currentfilter.prioritystatusid }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/patientOrders/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: '',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'billing') { 
            var confirmOptions = {
                headingKey : 'common.confirm-modal-header.lbl',
                messageKey : 'billing',
                yesKey : 'common.yeskey.lbl',
                noKey : 'common.nokey.lbl',
                onSuccessMethod : '',
            };
            utl.Dialog.confirmMessage(confirmOptions); 

            }
            else if (actionType == 'token') {
                utl.Dialog.confirmDelete(null, 'token ' + row.Id);
            }
            else if (actionType == 'patientinfo') {
                // $scope.patientprofiledetails(entity.Patient.Id);
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: row.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            }
            else if (actionType == 'action') { // call the child operations.
                /*
                    $state.go('app.orderdetaillist',
                    {
                        orddeptid: $scope.currentfilter.OrdDeptId,
                        encorderid: row.Id,
                        patname: (row.Patient.FirstName ? (row.Patient.FirstName) : '') + (row.Patient.LastName ? (row.Patient.LastName) : ''),
                        patmrn: row.Patient.MRN,
                        ordnr: row.Ordernumber,
                        orddt: row.Orderrequestdate,
                        billingdt: row.Billdate,
                        billingid:row.Billingid
                    });
                    */
                utl.Modal.open('app.orderdetaillist', 
                {
                    params: {                         
                        orddeptid: $scope.currentfilter.OrdDeptId,
                        encorderid: row.Id,
                        patname: (row.Patient.FirstName ? (row.Patient.FirstName) : '') + (row.Patient.LastName ? (row.Patient.LastName) : ''),
                        patmrn: row.Patient.MRN,
                        ordnr: row.Ordernumber,
                        orddt: row.Orderrequestdate,
                        billingdt: row.Billdate,
                        billingid:row.Billingid },
                    confirmCallback: $scope.getList
                }); 
            }
            else if (actionType == 'history')
            { 
                utl.Modal.open('app.patientorderstatus', 
                {
                    params: {                         
                        orddeptid: $scope.currentfilter.OrdDeptId,
                        encorderid: row.Id,
                        patname: (row.Patient.FirstName ? (row.Patient.FirstName) : '') + (row.Patient.LastName ? (row.Patient.LastName) : ''),
                        patmrn: row.Patient.MRN,
                        ordnr: row.Ordernumber,
                        orddt: row.Orderrequestdate,
                        billingdt: row.Billdate,
                        billingid:row.Billingid },
                    confirmCallback: $scope.getList
                }); 
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [ 
                {
                    field: "OrderReq", width: "15%",displayName: $translate.instant('lis.orderacknowledges.orderreqdate.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Orderrequestdate ? (entity.Orderrequestdate | date : "dd/MM/yyyy HH:mm:ss") : "N/A"}} </div>'
                },
                {
                    field: "Order#", width: "10%", displayName: $translate.instant('lis.orderacknowledges.ordernr.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.Ordernumber}} </div>'
                },               
                {
                    field: "patientname", width: "15%", displayName: $translate.instant('lis.orderacknowledges.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >\
                    <a class="grid-action" href="" ng-click="handleEvents(\'patientinfo\',entity)"> {{entity.Patient.MRN}} </a>\
                    {{entity.Patient.Title.Description}} {{entity.Patient.FirstName}} {{entity.Patient.LastName}} | {{entity.Patient.Gender.Description}}  </div>',
                    handleEvent: $scope.handleEvents
                }, 
                {
                    field: "DoctorName", width: "15%", displayName: $translate.instant('lis.orderacknowledges.doctorname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.DoctorName}} </div>'
                },
                {
                    field: "testname", width: "15%",displayName: $translate.instant('lis.orderacknowledges.testname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.PatientOrderdetails.Testname}} </div>'
                },
                {
                    field: "priority", width: "10%", displayName: $translate.instant('lis.orderacknowledges.prioritystatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.PriorityStatus.DisplayName}} </div>'
                },
                {
                    field: "Orderstatus", width: "10%", displayName: $translate.instant('lis.orderacknowledges.orderstatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.OrderStatus.DisplayName}} </div>'
                },
                {
                    field: "Id", width: "10%", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<a class="lnk-action" ng-click="handleEvents(\'action\',entity)"><img src="app/ico/16-16/action.png" alt="Image" class="block-center img-rounded" /></a> &nbsp;&nbsp;| ' +
                    '<a class="lnk-action" ng-click="handleEvents(\'billing\',entity)">B</a> &nbsp;&nbsp;| ' +
                    '<a class="lnk-action" ng-click="handleEvents(\'token\',entity)">T</a> &nbsp;&nbsp;| ' +                    
                    '<a class="lnk-action" ng-click="handleEvents(\'history\',entity)"><img src="app/ico/16-16/info.png" alt="Image" class="block-center img-rounded" /></a>',
                    handleEvent: $scope.handleEvents
                }
  
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderStatus" },
                { "Key": "PriorityStatus" },
                { "Key": "Department" },
                { "Key": "SubDepartment" }
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

    orderacknowledgelistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();