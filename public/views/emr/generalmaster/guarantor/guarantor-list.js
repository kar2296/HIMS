(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorListController', guarantorListController);

function guarantorListController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
    var vm = this;

    $scope.Items = [];
    $scope.currentfilter= {
        FacilityId: utl.Session.getCurrentFacilityId(),
        GuarantorName : '',
        GuarantorTypeId : -1,
        TPAId : -1,
        ActiveStatusId : 2
    };
// Start
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
               ServiceCategoryId:'',
               ContractDate:'',
               ExpiryDate:'',
               MobileNo:'',
               CityId:'',
               CountryId:'',
               PincodeId:'',
               CreditAccountNo:'',
               DebitAccountNo:'',
            };


            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [

                    { type: 'date', translate: 'generalmaster.guarantor-form.contractdate.lbl', model: 'ContractDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'generalmaster.guarantor-form.contractexpirydate.lbl', model: 'ExpiryDate', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'generalmaster.guarantor-form.serviceratecategory.lbl', model: 'ServiceCategoryId',  position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'generalmaster.guarantor-form.phone.lbl', model: 'MobileNo',  position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'generalmaster.guarantor-form.pincode.lbl', model: 'PincodeId',  position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'generalmaster.guarantor-form.country.lbl', model: 'CountryId',  position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'generalmaster.guarantor-form.city.lbl', model: 'CityId',  position: { r: 3, c: 0 } },
                    { type: 'text', translate: 'generalmaster.guarantor-form.creditaccountno.lbl', model: 'CreditAccountNo',  position: { r: 3, c: 1 } },
                    { type: 'text', translate: 'generalmaster.guarantor-form.debitaccountno.lbl', model: 'DebitAccountNo',  position: { r: 4, c: 0 } },

                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
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
        //Dynamic form  ends
 // End
    $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

    $scope.getList = function () {
        var inputData = {
            Params :[
                 { Key: 1, Value: $scope.currentfilter.GuarantorName },
                 { Key: 2, Value: $scope.currentfilter.GuarantorTypeId },
                 { Key: 4, Value: $scope.currentfilter.TPAId },
                 { Key: 5, Value: $scope.currentfilter.ActiveStatusId },
                //  { Key: 7, Value: $scope.currentfilter.FacilityId },
                 { Key: 11, Value: [-1, $scope.currentfilter.FacilityId] }
            ],
            PageContext:{
            PageSize: vm.gridConfig.pagerObj.pageSize,
            PageNumber: vm.gridConfig.pagerObj.currentPage
        }
        };

        var options = {
            action: 'generalmaster/guarantor/GetGuarantors',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };

        utl.Http.doAction(options);
    };

    //Grid Actions
    $scope.addNew = function() {
        $state.go('app.guarantortab.general', { id:0 });
    }

    $scope.deleteItemCallback = function (scope, data, options, hasError) {
        // utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        $scope.getList();
    };

    $scope.onDeleteConfirmed = function(deleteId) {
        var options = {
                action: 'generalmaster/guarantor/DeleteGuarantor',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
        utl.Http.doAction(options);
    }

     $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.guarantortab.general', { gid: entity.Id, GuarantorName: entity.Code + ' - ' + entity.GuarantorName });
        }
        else if(actionType == 'delete') {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.GuarantorName);
        } else if (actionType == 'view') {
            $state.go('app.guarantortab.general', {  gid: entity.Id, GuarantorName: entity.Code + ' - ' + entity.GuarantorName });
           }
    }

    vm.gridConfig = {
enableColumnResizing: true,
        columnDefs: [
                        { field: "Code", displayName: $translate.instant('generalmaster.guarantor-list.code.lbl') },
                        { field: "GuarantorName", displayName: $translate.instant('generalmaster.guarantor-list.guarantorname.lbl') },
                        { field: "GuarantorType.Description", displayName: $translate.instant('generalmaster.guarantor-list.type.lbl') },
                        { field: "ContractDate", displayName: $translate.instant('generalmaster.guarantor-list.contractdate.lbl'),
                            cellTemplate : "<ngformatdate date-val='entity.ContractDate'></ngformatdate>"
                        },
                        { field: "ContractExpiryDate", displayName: $translate.instant('generalmaster.guarantor-list.expirydate.lbl'),
                            cellTemplate : "<ngformatdate date-val='entity.ContractExpiryDate'></ngformatdate>"
                        },
                        // { field: "TPA.Description", displayName: $translate.instant('generalmaster.guarantor-list.tpa.lbl') },
                        { field: "CreditLimit", displayName: $translate.instant('generalmaster.guarantor-list.creditlimit.lbl') },
                        // { field: "AvailableLimit", displayName: $translate.instant('generalmaster.guarantor-list.availablelimit.lbl') },
                        { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.guarantor-list.status.lbl') },
                        { field : "Id", displayName : $translate.instant('common.actions_col.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents">\
                                           <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                           <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                           <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                       </div>',
                                       handleEvent: $scope.handleEvents,
                                actions : []
                        }
                    ],
                    pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
    };
    $timeout(function () {
        removeFloatingNav();
    }, 100);

    function removeFloatingNav() {
        $rootScope.app.layout.isCollapsed = true;
    }
    $scope.lookupCallback = function (scope, data, options, hasError) {
        $scope.lookup = hasError ? {} : data;
        initDynamicForm();
        $scope.getList();
    }

    $scope.initLookup = function () {
        var inputData = [
                            {'Key' : 'GuarantorType'},
                            {'Key' : 'TPA'},
                            {'Key': 'ActiveStatus' }
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

guarantorListController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];

})();