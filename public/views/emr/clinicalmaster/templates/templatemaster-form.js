(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('templatemasterFormController', templatemasterFormController);

    function templatemasterFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        vm.gridConfig = {};
        vm.druggridConfig = {};
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.gridDataExist = {};
        $scope.item = {
            IsActive: true,
            IsAllFacility: false,
            IsAllUser: false,
            IsAllDepartment: false,
            paneldetailid: -1,
            AccessibleTypeId: 1,
            // UserId: utl.Session.getCurrentUserId(),
            // DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };
        $scope.item.DurationPeriodId = 1;
        $scope.item.Duration = 1;
        $scope.item.Dosage = 1;
        $scope.item.Morning = 1;
        $scope.item.Noon = 1;
        $scope.item.Night = 1;
        $scope.item.Quantity = 1;
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.gridData = [];
        $scope.selectediteminfo = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.item.TemplateTypeId = parseInt(modalConfig.params.templatetypeid);
            $scope.item.DepartmentId = parseInt(modalConfig.params.deptid);
            $scope.item.UserId = parseInt(modalConfig.params.userid);
            if (modalConfig.params.advice) {
                $scope.item.DrugAdvice = modalConfig.params.advice;
            }
            $scope.gridData = modalConfig.params.items;
            //vm.gridConfig.data = $scope.gridData;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }
        $scope.item.UserId = utl.Session.getCurrentUserId();
        $scope.item.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId());

        $scope.adddetail = function () {
            if ($scope.selectediteminfo.Id > 0) {
                if (!$scope.gridDataExist[$scope.selectediteminfo.Id]) {
                    $scope.gridDataExist[$scope.selectediteminfo.Id] = $scope.selectediteminfo.Id;
                    var item = {
                        Id: 0,
                        PanelMasterId: $scope.item.Id,
                        TemplateTypeId: $scope.item.TemplateTypeId,
                        ItemId: $scope.selectediteminfo.Id,
                        DrugId: 0,
                        TestmasterId: 0,
                        DisplayName: $scope.selectediteminfo.Text,
                        Duration: 0,
                        Dosage: 0,
                        Morning: 0,
                        Noon: 0,
                        Night: 0,
                        DurationPeriodId: -1,
                        DurationPeriod: '',
                        Quantity: '',
                        IseMAR: 0,
                        InjectionRoomId: -1,
                        DrugInstructionId: -1,
                        Comments: '',
                        Status: 1
                    };
                    if ($scope.item.TemplateTypeId == 4) {
                        item.DrugName = $scope.selectediteminfo.Text;
                        item.DrugCode = $scope.selectediteminfo.Code;
                        item.DrugId = $scope.selectediteminfo.Id;
                        item.Dosage = $scope.item.Dosage;
                        item.Morning = $scope.item.Morning;
                        item.Noon = $scope.item.Noon;
                        item.Night = $scope.item.Night;
                        item.Dosage = $scope.item.Dosage;
                        item.Duration = $scope.item.Duration;
                        item.Quantity = $scope.item.Quantity;
                        item.DurationPeriodId = $scope.item.DurationPeriodId;
                        item.DurationPeriod = $scope.item.DurationPeriod || 'Days';
                        item.IseMAR = $scope.item.IseMAR;
                        if ($scope.item.IseMAR) {
                            item.InjectionRoomId = $scope.item.InjectionRoomId;
                        } else {
                            item.DrugInstructionId = $scope.item.DrugInstructionId;
                        }
                    } else if ($scope.item.TemplateTypeId == 3) {
                        item.TestmasterId = $scope.selectediteminfo.Id;
                        item.TestName = $scope.selectediteminfo.Text;
                        item.TestCode = $scope.selectediteminfo.Code;
                        item.TestTypeId = $scope.selectediteminfo.TestTypeId;
                        item.IsDirectBill = $scope.selectediteminfo.IsDirectBill;
                        item.Quantity = $scope.item.Quantity;
                        item.TestInstruction = $scope.item.TestInstruction;
                        item.ClinicalData = $scope.item.ClinicalData;
                        item.Duration = $scope.item.Duration;
                        item.DurationPeriodId = $scope.item.DurationPeriodId;
                        item.DurationPeriod = $scope.item.DurationPeriod || 'Days';
                    } else if ($scope.item.TemplateTypeId == 1) {
                        item.ServiceName = $scope.selectediteminfo.Text;
                        item.ServiceCode = $scope.selectediteminfo.Code;
                        item.ServiceCategoryId = $scope.selectediteminfo.ServiceCategoryId;
                        item.Quantity = $scope.item.Quantity;
                    }
                    if (item.ItemId > 0) {
                        if ($scope.item.TemplateTypeId == 4) {
                            if (parseInt(item.Duration) <= 0) {
                                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.ticksheet-form.durationalert.lbl'));
                                return false;
                            } else if (item.DurationPeriodId <= 0) {
                                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.ticksheet-form.durationperiodalert.lbl'));
                                return false;
                            } else if (!item.IseMAR && item.DrugInstructionId <= 0) {
                                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.ticksheet-form.instructionalert.lbl'));
                                return false;
                            } else if (item.IseMAR && item.InjectionRoomId <= 0) {
                                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.ticksheet-form.instructionalert.lbl'));
                                return false;
                            } else if (parseInt(item.Quantity) <= 0) {
                                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.ticksheet-form.quantityalert.lbl'));
                                return false;
                            } else {
                                $scope.gridData.push(item);
                            }
                        } else {
                            $scope.gridData.push(item);
                        }
                    }
                } else {
                    utl.Alert.showErrorMsg("Item Already Exist   " + $scope.selectediteminfo.Id + ' - ' + $scope.selectediteminfo.Text);
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.ticksheet-form.dataalert.lbl'));
            }
            $scope.applyFilter();
            $scope.item.Dosage = 1;
            $scope.item.Morning = 1;
            $scope.item.Noon = 1;
            $scope.item.Night = 1;
            $scope.item.Duration = 1;
            $scope.item.Duration = 1;
            $scope.item.Quantity = 1;
            $scope.item.DurationPeriodId = 1;
        };
        $scope.onDurPeriodSelected = function (selectedItem) {
            $scope.item.DurationPeriod = selectedItem.Text;
            $scope.computeQuantity($scope.item);
        };

        $scope.computeQuantity = function (item) {
            var totalDays = 0;
            var noOfTimes = 0;
            if (item.DurationPeriodId == 1) { //Days
                totalDays = item.Duration * 1;
            } else if (item.DurationPeriodId == 2) { //Weeks
                totalDays = item.Duration * 7;
            } else if (item.DurationPeriodId == 3) { //Months
                totalDays = item.Duration * 30;
            }
            if (item.Morning > 0) {

                noOfTimes = noOfTimes + item.Morning;
            }
            if (item.Noon > 0) {
                noOfTimes = noOfTimes + item.Noon;
            }
            if (item.Night > 0) {
                noOfTimes = noOfTimes + item.Night;
            }
            item.Quantity = noOfTimes * totalDays;
        }

        $scope.applyFilter = function () {
            //             document.getElementById("TemplateTypeId").value = '';
            $scope.filteredgridData = $filter('filterArrayItems')($scope.gridData, [{
                search: 1,
                fields: ['Status']
            }]);
            vm.druggridConfig.data = [];
            $scope.gridDataExist = {};
            for (var idx in $scope.filteredgridData) {
                var tclist = $scope.filteredgridData[idx];
                if (!$scope.gridDataExist[tclist.ItemId]) {
                    $scope.gridDataExist[tclist.ItemId] = tclist.ItemId;
                }
            }
            if ($scope.item.TemplateTypeId == 4) {
                for (var idx in $scope.filteredgridData) {
                    if ($scope.filteredgridData[idx].DurationPeriod) {
                        var DurationPeriod = '';
                        if ($scope.filteredgridData[idx].Id > 0) {
                            DurationPeriod = $scope.filteredgridData[idx].DurationPeriod.Description;
                        } else {
                            DurationPeriod = $scope.filteredgridData[idx].DurationPeriod;
                        }
                    }
                    var item = {
                        Id: $scope.filteredgridData[idx].Id,
                        ItemId: $scope.filteredgridData[idx].ItemId,
                        DisplayName: $scope.filteredgridData[idx].DisplayName,
                        Dosage: $scope.filteredgridData[idx].Dosage,
                        Morning: $scope.filteredgridData[idx].Morning,
                        Noon: $scope.filteredgridData[idx].Noon,
                        Night: $scope.filteredgridData[idx].Night,
                        Duration: $scope.filteredgridData[idx].Duration,
                        DurationPeriodId: $scope.filteredgridData[idx].DurationPeriodId,
                        DurationPeriod: DurationPeriod,
                        Quantity: $scope.filteredgridData[idx].Quantity,
                        Comments: $scope.filteredgridData[idx].Comments
                    }
                    vm.druggridConfig.data.push(item);
                }
            }
            if ($scope.item.TemplateTypeId == 3) {
                for (var idx in $scope.filteredgridData) {
                    if ($scope.filteredgridData[idx].DurationPeriod) {
                        var DurationPeriod = '';
                        if ($scope.filteredgridData[idx].Id > 0) {
                            DurationPeriod = $scope.filteredgridData[idx].DurationPeriod.Description;
                        } else {
                            DurationPeriod = $scope.filteredgridData[idx].DurationPeriod;
                        }
                    }
                    var item = {
                        Id: $scope.filteredgridData[idx].Id,
                        ItemId: $scope.filteredgridData[idx].ItemId,
                        DisplayName: $scope.filteredgridData[idx].DisplayName,
                        TestInstruction: $scope.filteredgridData[idx].TestInstruction,
                        ClinicalData: $scope.filteredgridData[idx].ClinicalData,
                        Duration: $scope.filteredgridData[idx].Duration,
                        DurationPeriodId: $scope.filteredgridData[idx].DurationPeriodId,
                        DurationPeriod: DurationPeriod,
                        Quantity: $scope.filteredgridData[idx].Quantity,
                        Comments: $scope.filteredgridData[idx].Comments
                    }
                    vm.druggridConfig.data.push(item);
                }
            } else if ($scope.item.TemplateTypeId != 4 && $scope.item.TemplateTypeId != 3) {
                vm.gridConfig.data = $scope.filteredgridData;
            }
        };

        //getDetails
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            vm.druggridConfig.data = [];
            $scope.gridData = res.Data;
            $scope.gridDataExist = {};
            for (var idx in $scope.gridData) {
                var tclist = $scope.gridData[idx];
                if (!$scope.gridDataExist[tclist.ItemId]) {
                    $scope.gridDataExist[tclist.ItemId] = tclist.ItemId;
                    $scope.gridDataExist[tclist.ItemId] = tclist.ItemId;
                    $scope.item.ItemId = tclist.ItemId;
                    $scope.item.Dosage = tclist.Dosage;
                    $scope.item.Duration = tclist.Duration;
                    $scope.item.Morning = tclist.Morning;
                    $scope.item.Night = tclist.Night;
                    $scope.item.Noon = tclist.Noon;
                    $scope.item.Quantity = tclist.Quantity;
                    $scope.item.DrugInstructionId = tclist.DrugInstructionId;
                    $scope.item.Notes = tclist.Notes;
                    // if(tclist.DurationPeriod)
                    // $scope.item.DurationPeriod = tclist.DurationPeriod.Description;
                }
            }
            if ($scope.item.TemplateTypeId == 4) {
                for (var idx in res.Data) {
                    if (res.Data[idx].DurationPeriod) {
                        var DurationPeriod = res.Data[idx].DurationPeriod.Description;
                    }
                    var item = {
                        ItemId: res.Data[idx].ItemId,
                        DisplayName: res.Data[idx].DisplayName,
                        Dosage: res.Data[idx].Dosage,
                        Morning: res.Data[idx].Morning,
                        Noon: res.Data[idx].Noon,
                        Night: res.Data[idx].Night,
                        Duration: res.Data[idx].Duration,
                        DurationPeriodId: res.Data[idx].DurationPeriodId,
                        DurationPeriod: DurationPeriod,
                        Quantity: res.Data[idx].Quantity,
                        Comments: res.Data[idx].Comments,
                        DrugInstructionId: res.Data[idx].DrugInstructionId,
                        Notes: res.Data[idx].Notes,
                    }
                    vm.druggridConfig.data.push(item);
                }
            } else if ($scope.item.TemplateTypeId != 4) {
                vm.gridConfig.data = $scope.gridData;
            }
        };

        $scope.getDetails = function () {
            if ($scope.item.Id && $scope.item.Id > 0) {

                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.Id
                    },]
                };

                var options = {
                    action: 'clinicalmaster/TemplateMasterDetail/GetTemplateMasterDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };


        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.TickSheetMasterTypeId == 1) {
                $scope.item.Dosage = 1;
                $scope.item.Morning = 1;
                $scope.item.Noon = 1;
                $scope.item.Night = 1;
                // $scope.item.DurationPeriod = $scope.item.DurationPeriod.Description;
            }
            $scope.getDetails();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/TemplateMaster/GetTemplateMasterById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.templatemasters');
            }
        }

        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback({
                    PanelItem: $scope.item,
                    PanelData: $scope.gridData
                });
            } else {
                if ($scope.currentcontext.id == 0) {
                    $scope.currentcontext.id = data;
                }
                $scope.getItem();
                $scope.backToList();
            }
            // 13-02-17
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.AccessibleTypeId == 1) {
                if (!$scope.item.DepartmentId || !$scope.item.UserId) {
                    utl.Alert.showErrorMsg($translate.instant('clinicalmaster.favoritemaster-form.requiredmsg.lbl'));
                    return;
                }
            }

            var actionName = 'clinicalmaster/TemplateMaster/AddTemplateMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/TemplateMaster/UpdateTemplateMaster';
            }
            if ($scope.currentcontext.id == 0) {
                if ($scope.currentcontext.ismodal == true) {
                    var inputData = {
                        Header: $scope.item,
                        Details: $scope.gridData
                    };
                } else {
                    var inputData = {
                        Header: $scope.item,
                        Details: $scope.filteredgridData
                    };
                }
            }
            if ($scope.currentcontext.id > 0) {
                var inputData = {
                    Header: $scope.item,
                    Details: $scope.gridData
                };
            }
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onDeleteConfirmed = function (itemName) {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.DisplayName == itemName) {
                    item.Status = 2;
                }
            }
            $scope.applyFilter();
        }

        $scope.Isallfacility = function () {
            if ($scope.item.IsAllFacility = true) {
                $scope.item.FacilityId = -1;
            } else {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
        };

        $scope.Isalluser = function () {
            if ($scope.item.IsAllUser = true) {
                $scope.item.UserId = -1;
            } else {
                $scope.item.UserId = utl.Session.getCurrentUserId();
            }
        };

        $scope.Isalldepartment = function () {
            if ($scope.item.IsAllDepartment = true) {
                $scope.item.DepartmentId = -1;
            } else {
                $scope.item.DepartmentId = utl.Session.getCurrentDepartmentId();
            }
        };

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.DisplayName, entity.DisplayName);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                field: "DisplayName",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.displayname.lbl')
            },
            {
                field: "Comments",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.standardcommants.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='entity.Comments' class='form-control' />\
                                          </div>"
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                       </div>',
                handleEvent: $scope.handleEvents,
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            data: $scope.gridData
        };

        vm.ordergridConfig = {
            columnDefs: [{
                field: "DisplayName",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.displayname.lbl')
            },
            {
                field: "TestInstruction",
                displayName: $translate.instant('Instruction'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='entity.TestInstruction' class='form-control' />\
                                          </div>"
            },
            {
                field: "ClinicalData",
                displayName: $translate.instant('Clinical Data'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='entity.ClinicalData' class='form-control' />\
                                          </div>"
            },
            {
                field: "ClinicalData",
                displayName: $translate.instant('Test TakenOn'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<b>{{entity.Duration}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.DurationPeriod}}</b>&nbsp;</span>" +
                    "</div>"
            },
            {
                field: "Comments",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.standardcommants.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='entity.Comments' class='form-control' />\
                                          </div>"
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                       </div>',
                handleEvent: $scope.handleEvents,
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            data: $scope.gridData
        };

        vm.druggridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "DisplayName",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.displayname.lbl')
            },
            {
                field: "Dosage",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.dosage.lbl'),
            },
            {
                field: "Morning",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.morning.lbl'),
            },
            {
                field: "Noon",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.noon.lbl'),
            },
            {
                field: "Night",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.night.lbl'),
            },

            {
                field: "Duration",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.duration.lbl'),
            },
            {
                field: "DurationPeriod",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.durationperiod.lbl'),
            },
            {
                field: "Quantity",
                displayName: $translate.instant('clinicalmaster.panelmaster-form.quantity.lbl'),
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                         </div>',
                handleEvent: $scope.handleEvents,
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            },
            data: $scope.gridData
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "TemplateType"
            },
            {
                "Key": "DrugRoute"
            },
            {
                "Key": "DrugFrequency"
            },
            {
                "Key": "DurationPeriod"
            },
            {
                "Key": "DrugInstruction",
                Default: false
            },
            {
                "Key": 'Department',
                Request: {
                    Params: [{
                        Key: 5,
                        Value: 2
                    }]

                }
            },
            // {
            //     "Key": 'User',
            //     Request: {
            //         Params: [{
            //             Key: 5,
            //             Value: 2
            //         }]

            //     }
            // },
            {
                "Key": 'AccessibleType'
            },
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

    templatemasterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();