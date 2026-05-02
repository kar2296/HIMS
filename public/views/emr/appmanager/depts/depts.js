(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('deptListController', deptListController);

    function deptListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            DepartmentName: '',
            departmentcode: '',
            departmenttypeid: -1,
            ActiveStatusId: 2,
            FacilityId: -1
        };
        // 01-02-2017
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                SpecialityId: -1,
                PhoneNo: '',
                IsEmergency: '',
                IsAdmittingDept: '',
                IncludeMRDRequired: '',
                IsPatientFlowMandatory: '',
                CostCenterId: -1,
                ParentDepartmentId: -1,

            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'select',
                    translate: 'appmanager.dept.speciality.lbl',
                    model: 'SpecialityId',
                    options: $scope.lookup.Speciality,
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'text',
                    translate: 'appmanager.dept.phoneno.lbl',
                    model: 'PhoneNo',
                    position: {
                        r: 0,
                        c: 1
                    }
                },
                {
                    type: 'checkbox',
                    translate: 'appmanager.dept.isemergency.lbl',
                    model: 'IsEmergency',
                    position: {
                        r: 1,
                        c: 0
                    }
                },
                {
                    type: 'checkbox',
                    translate: 'appmanager.dept.isadmittingdept.lbl',
                    model: 'IsAdmittingDept',
                    position: {
                        r: 1,
                        c: 1
                    }
                },
                {
                    type: 'checkbox',
                    translate: 'appmanager.dept.includemrdreq.lbl',
                    model: 'IncludeMRDRequired',
                    position: {
                        r: 2,
                        c: 0
                    }
                },
                {
                    type: 'checkbox',
                    translate: 'appmanager.dept.patientflowmandatory.lbl',
                    model: 'IsPatientFlowMandatory',
                    position: {
                        r: 2,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'appmanager.dept.costcenter.lbl',
                    model: 'CostCenterId',
                    options: $scope.lookup.CostCenter,
                    position: {
                        r: 3,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'appmanager.dept.isparentdepartment.lbl',
                    model: 'IsParentDepartment',
                    options: $scope.lookup.Department,
                    position: {
                        r: 3,
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
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
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
        // 01-02-2017
        //Dynamic form  ends
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.CodeName
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.departmentcode
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.departmenttypeid
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                {
                    Key: 6,
                    Value: $scope.advancedfilter.SpecialityId
                },
                {
                    Key: 7,
                    Value: $scope.advancedfilter.PhoneNo
                },
                //   { Key: 8, Value: $scope.advancedfilter.SpecialityId },
                //   { Key: 9, Value: $scope.advancedfilter.SpecialityId },
                //   { Key: 10, Value: $scope.advancedfilter.SpecialityId },
                // //   { Key: 11, Value: $scope.advancedfilter.SpecialityId },
                {
                    Key: 12,
                    Value: $scope.advancedfilter.CostCenterId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.ParentDepartmentId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.FacilityId
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/department/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.dept', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'SystemSettings/department/DeleteDepartment',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.dept', {
                    id: entity.Id
                });
            } else if (actionType == 'view') {
                $state.go('app.dept', {
                    id: entity.Id
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.DepartmentName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "DepartmentCode",
                displayName: $translate.instant('appmanager.depts.code.lbl')
            },
            {
                field: "DepartmentName",
                displayName: $translate.instant('appmanager.depts.name.lbl')
            },
            {
                field: "ParentDepartment.DepartmentName",
                displayName: $translate.instant('appmanager.dept.parentdepartment.lbl')
            },
            {
                field: "Facility.FacilityName",
                displayName: $translate.instant('Facility')
            },
            {
                field: "DepartmentType.Description",
                displayName: $translate.instant('appmanager.depts.type.lbl')
            },
            // {
            //     field: "CostCenter.Description",
            //     displayName: $translate.instant('appmanager.depts.costcenter.lbl')
            // },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('appmanager.depts.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)"   ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"   ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "DepartmentType"
            },
            {
                "Key": "ActiveStatus"
            },
            {
                "Key": "Speciality"
            },
            {
                "Key": "CostCenter"
            },
            // {
            //     "Key": "Department"
            // },
            {
                Key: 'Facility',
                Request: {
                    Params: [{ Key: 12, Value: utl.Session.getCurrentOrgId() }]
                }
            },
            {
                Key: 'Department',
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            }
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

    deptListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();