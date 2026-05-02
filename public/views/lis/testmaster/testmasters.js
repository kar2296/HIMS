(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testMastersListController', testMastersListController);

    function testMastersListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            dept: -1,
            subdept: -1,
            type: -1,
            codemnemonicsnamedesc: '',
            ActiveStatusId: 2,
            code: '',
            name: '',
            FacilityId: -1
            // FacilityId: utl.Session.getCurrentFacilityId()
        };
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DiagnosisId: -1,
                FacilityId: utl.Session.getCurrentFacilityId(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'checkbox', translate: 'lis.testmaster.isProfile.lbl', model: 'IsProfile', position: { r: 0, c: 0 } },
                    { type: 'checkbox', translate: 'lis.testmaster.isseparateworkorder.lbl', model: 'IsSeparateWorkOrder', position: { r: 0, c: 1 } },
                    { type: 'checkbox', translate: 'lis.testmaster.isdirectbill.lbl', model: 'IsDirectBill', position: { r: 1, c: 0 } },
                    { type: 'checkbox', translate: 'lis.testmaster.isseparatesampleid.lbl', model: 'IsSeparateSampleId', position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'lis.testmaster.Methodology.lbl', model: 'Methodology', position: { r: 2, c: 0 } },
                    { position: { r: 2, c: 1 } },
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
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.codemnemonicsnamedesc },
                    { Key: 3, Value: $scope.currentfilter.type },
                    { Key: 4, Value: $scope.currentfilter.dept },
                    { Key: 5, Value: $scope.currentfilter.subdept },
                    { Key: 15, Value: $scope.currentfilter.FacilityId },
                    { Key: 6, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 2, Value: $scope.advancedfilter.IsProfile },
                    { Key: 10, Value: $scope.advancedfilter.IsSeparateWorkOrder },
                    { Key: 11, Value: $scope.advancedfilter.IsDirectBill },
                    { Key: 12, Value: $scope.advancedfilter.IsSeparateSampleId },
                    { Key: 13, Value: $scope.advancedfilter.Methodology },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/testmaster/GetTestmasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.testmastertab.testmaster', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'lis/testmaster/DeleteTestmaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.testmastertab.testmaster', { id: entity.Id, IsProfile: entity.IsProfile, TestName: entity.Code + ' - ' + entity.Name, TestCode: entity.Code });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.Name);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Code", displayName: $translate.instant('lis.testmasters.code.lbl') },
                { field: "Name", displayName: $translate.instant('lis.testmasters.name.lbl') },
                { field: "Sampletype.Name", displayName: $translate.instant('lis.testmasters.sampletypeId.lbl') },
                { field: "Methodology", displayName: $translate.instant('lis.testmasters.methodology.lbl') },
                { field: "TESTMASTERTYP.Description", displayName: $translate.instant('lis.testmasters.type.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('lis.testmasters.departmentId.lbl') },
                { field: "SubDepartment.DepartmentName", displayName: $translate.instant('lis.testmasters.subDepartmentId.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('lis.testmasters.status.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"  ng-show="entity.ActiveStatusId == 1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    handleEvent: $scope.handleEvents,
                    // actions: 'ActiveStatusId' == 1 ? [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                    //     { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    // ] : [{ actiontype: 'edit', display: 'common.editaction.lbl' }]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Organization" },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "TESTMASTERTYP" },
                { "Key": "Department" },
                { "Key": "SubDepartment" },
                { "Key": "LOCATION" },
                {
                    "Key": "SampleMaster",
                    Request: {
                        Params: [{ Key: 3, Value: 2 }]
                    }
                },
                { "Key": "SAMPLEVOLUME" },
                { "Key": "TATGROUP" },
                { "Key": "TATGROUP" },
                { "Key": "ActiveStatus" }
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

    testMastersListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();