(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDocumentListController', patientDocumentListController);

function patientDocumentListController($scope, $stateParams, $state, $translate, utl) {
    var vm = this;
    
    $scope.currentfilter= {
        pid : parseInt(utl.Session.getEMRPatientId())
    };
    angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));

    $scope.getListCallback = function (scope, res, options, hasError) {
        vm.gridConfig.data = res.Data;
        vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
    };

    $scope.getList = function () {

        var inputData = { 
            Params :[
              { Key: 2, Value: $scope.currentfilter.pid } 
            ],
            PageContext:{
                PageSize: vm.gridConfig.pagerObj.pageSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };

        var options = {
            action: 'emr/ClinicalDocument/GetClinicalDocuments',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };
 //back
    $scope.doctor_dashboard = function () {
        $state.go('app.doctordashboard');
    }
    $scope.patient_dashboard = function () {
        $state.go('patientemr.emrdashboard');
    }
    //Grid Actions
    $scope.addNew = function() {
        utl.Modal.open('patientemr.patientdocument', {
                    params: { id: 0 },
                    confirmCallback: $scope.getList
                }
            );
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'emr/patientdocument/DeletePatientDocument',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);  
    }

    //Download File
    $scope.downloadFileCallback = function (scope, data, options, hasError) {
        console.log('File downloaded successfully...');
    };

    $scope.downloadFile = function (row) {
        var inputData = { FilePath: row.entity.FilePath };
        var options = {
            action: 'emr/ClinicalDocument/GetDocumentFile',
            data: { Data: inputData },
            onComplete: $scope.downloadFileCallback
        };
        utl.Http.doDownload(options);
    }

     $scope.handleEvents = function(actionType, row) {
         if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);                   
        } else if (actionType == 'download') {
            $scope.downloadFile(row);
        }
    }
    
    vm.gridConfig = {
        enableColumnResizing: true,
        columnDefs: [
                {
                    field: "CreatedDate", displayName: $translate.instant('patientemr.patientdocument-list.createddate.lbl'),
                   cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.CreatedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                        { field: "DocumentType.Description", displayName: $translate.instant('patientemr.patientdocument-list.type.lbl') },
                        { field: "Name", displayName: $translate.instant('patientemr.patientdocument-list.name.lbl') },
                        { field: "YesNo.Description", displayName: $translate.instant('patientemr.patientdocument-list.releasetopatient.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'download\',row)" ><i class="fas fa-eye" aria-hidden="true"></i></span>\                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                        }
                    ],
        pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };

     $scope.dashboard = function () {
       $state.go('patientemr.patientdashboard');
    }
    
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        $scope.getList();
    }
    
    $scope.initLookup = function () {
        var inputData = [ 
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

patientDocumentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();