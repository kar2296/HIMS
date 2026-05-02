(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('OrderFavoritesFormController', OrderFavoritesFormController);

    function OrderFavoritesFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;
        vm.gridConfig = {};
        vm.druggridConfig = {};
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));
        $scope.gridDataExist = {};
        $scope.item = {
            IsActive: true,
            TickSheetTypeId: 1,
            AccessibleTypeId: 1,
            ticksheetmasterdetailid: -1,
            UserId: utl.Session.getCurrentUserId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId())
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.item.DurationPeriodId = 1;
        $scope.item.Duration = 1;
        $scope.item.Dosage = 1;
        $scope.item.Morning = 1;
        $scope.item.Noon = 1;
        $scope.item.Night = 1;
        $scope.item.Quantity = 1;

        $scope.gridData = [];
        $scope.selectediteminfo = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            candisabletype: false,
            fromtxn: false
        };

        if (modalConfig && modalConfig.params) {

            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.item.TickSheetMasterTypeId = parseInt(modalConfig.params.ticksheettypeid);
            $scope.currentcontext.candisabletype = (modalConfig.params.parent == 'txn' ? true : false);
            $scope.currentcontext.fromtxn = (modalConfig.params.parent == 'txn' ? true : false);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }

        $scope.adddetail = function() {
            console.log($scope.selectediteminfo);
            if ($scope.selectediteminfo.Id > 0) {
                if (!$scope.gridDataExist[$scope.selectediteminfo.Id]) {
                    $scope.gridDataExist[$scope.selectediteminfo.Id] = $scope.selectediteminfo.Id;
                    var item = {
                        TickSheetMasterId: $scope.currentcontext.id,
                        TickSheetMasterTypeId: $scope.item.TickSheetMasterTypeId,
                        ItemId: $scope.selectediteminfo.Id,
                        ItemName: $scope.selectediteminfo.Text,
                        GroupName: $scope.item.GroupName,
                        Status: 1,
                        Duration: 0,
                        Dosage: 0,
                        Morning: 0,
                        Noon: 0,
                        Night: 0,
                        DurationPeriodId: -1,
                        DrugInstructionId: -1,
                        DurationPeriod: '',
                        Notes: '',
                        Quantity: '',
                        IseMAR: 0,
                        InjectionRoomId: -1,
                        DrugInstructionId: -1,
                    };
                    if ($scope.item.TickSheetMasterTypeId == 1) {
                        if ($scope.item.DurationPeriodId == 1) {
                            $scope.item.DurationPeriod = 'Days'
                        }
                        item.DrugId = $scope.selectediteminfo.Id;
                        item.DrugCode = $scope.selectediteminfo.Code;
                        item.DrugName = $scope.selectediteminfo.Text;
                        item.Dosage = $scope.item.Dosage;
                        item.Morning = $scope.item.Morning;
                        item.Noon = $scope.item.Noon;
                        item.Night = $scope.item.Night;
                        item.Dosage = $scope.item.Dosage;
                        item.Duration = $scope.item.Duration;
                        item.Quantity = $scope.item.Quantity;
                        item.DurationPeriodId = $scope.item.DurationPeriodId;
                        item.DrugInstructionId = $scope.item.DrugInstructionId;
                        item.DurationPeriod = $scope.item.DurationPeriod;
                        item.Notes = $scope.item.Notes;
                        item.IseMAR = $scope.item.IseMAR;
                        if ($scope.item.IseMAR) {
                            item.InjectionRoomId = $scope.item.InjectionRoomId;
                        } else {
                            item.DrugInstructionId = $scope.item.DrugInstructionId;
                        }
                    } else if ($scope.item.TickSheetMasterTypeId == 2) {
                        item.TestmasterId = $scope.selectediteminfo.Id;
                        item.TestName = $scope.selectediteminfo.Text;
                        item.TestCode = $scope.selectediteminfo.Code;
                        item.TestTypeId = $scope.selectediteminfo.TestTypeId;
                        item.IsDirectBill = $scope.selectediteminfo.IsDirectBill;
                        item.Quantity = $scope.item.Quantity;
                    } else if ($scope.item.TickSheetMasterTypeId == 3) {
                        item.ServiceId = $scope.selectediteminfo.Id;
                        item.ServiceName = $scope.selectediteminfo.Text;
                        item.ServiceCode = $scope.selectediteminfo.Code;
                        item.ServiceCategoryId = $scope.selectediteminfo.ServiceCategoryId;
                        item.Quantity = $scope.item.Quantity;
                    } else if ($scope.item.TickSheetMasterTypeId == 4) {
                        item.ServiceId = $scope.selectediteminfo.Id;
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

        $scope.onDurPeriodSelected = function(selectedItem) {
            $scope.item.DurationPeriod = selectedItem.Text;
            $scope.computeQuantity($scope.item);
        };

        $scope.drugchanged = function(item) {
            $scope.computeQuantity(item);
        };

        $scope.computeQuantity = function(item) {
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

        // $scope.applyFilter = function () {
        //     vm.gridConfig.data = $filter('filterArrayItems')($scope.gridData, [{
        //         search: 1,
        //         fields: ['Status']
        //     }]);
        // }

        $scope.applyFilter = function() {
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
            if ($scope.item.TickSheetMasterTypeId == 1) {
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
                        ItemName: $scope.filteredgridData[idx].ItemName,
                        Dosage: $scope.filteredgridData[idx].Dosage,
                        Morning: $scope.filteredgridData[idx].Morning,
                        Noon: $scope.filteredgridData[idx].Noon,
                        Night: $scope.filteredgridData[idx].Night,
                        Duration: $scope.filteredgridData[idx].Duration,
                        DurationPeriodId: $scope.filteredgridData[idx].DurationPeriodId,
                        DrugInstructionId: $scope.filteredgridData[idx].DrugInstructionId,
                        Notes: $scope.filteredgridData[idx].Notes,
                        DurationPeriod: DurationPeriod,
                        Quantity: $scope.filteredgridData[idx].Quantity,
                        Comments: $scope.filteredgridData[idx].Comments
                    }
                    vm.druggridConfig.data.push(item);
                }
            } else if ($scope.item.TickSheetMasterTypeId != 1) {
                vm.gridConfig.data = $scope.filteredgridData;
            }
        }

        //getDetails
        $scope.getDetailsCallback = function(scope, res, options, hasError) {
            vm.druggridConfig.data = [];
            $scope.gridData = res.Data;
            $scope.gridDataExist = {};
            for (var idx in $scope.gridData) {
                var tclist = $scope.gridData[idx];
                if (!$scope.gridDataExist[tclist.ItemId]) {
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
                    // $scope.item.DurationPeriod = tclist.DurationPeriod.Description;
                }
            }
            if ($scope.item.TickSheetMasterTypeId == 1) {
                for (var idx in res.Data) {
                    if (res.Data[idx].DurationPeriod) {
                        var DurationPeriod = res.Data[idx].DurationPeriod.Description;
                    }
                    var item = {
                        ItemId: res.Data[idx].ItemId,
                        ItemName: res.Data[idx].ItemName,
                        Dosage: res.Data[idx].Dosage,
                        Morning: res.Data[idx].Morning,
                        Noon: res.Data[idx].Noon,
                        Night: res.Data[idx].Night,
                        Duration: res.Data[idx].Duration,
                        DurationPeriodId: res.Data[idx].DurationPeriodId,
                        DrugInstructionId: res.Data[idx].DrugInstructionId,
                        Notes: res.Data[idx].Notes,
                        DurationPeriod: res.Data[idx].DurationPeriod.Description,
                        // DurationPeriod: DurationPeriod,
                        Quantity: res.Data[idx].Quantity,
                        Comments: res.Data[idx].Comments,
                    }
                    vm.druggridConfig.data.push(item);
                }
            } else if ($scope.item.TickSheetMasterTypeId != 1) {
                vm.gridConfig.data = $scope.gridData;
            }
        };

        $scope.getDetails = function() {
            if ($scope.item.Id && $scope.item.Id > 0) {

                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.Id
                    }, ]
                };

                var options = {
                    action: 'clinicalmaster/TickSheetMasterDetail/GetTickSheetMasterDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveAndApprove = function() {
            if ($scope.item.IsActive == true) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3
            }
            $scope.saveItem();
        }


        //getItem
        $scope.getItemCallback = function(scope, data, options, hasError) {
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

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'clinicalmaster/TickSheetMaster/GetTickSheetMasterById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.clear = function() {
            $scope.item = {};
        }
        $scope.backToList = function(fromSaveCallback) {
            if ($scope.currentcontext.ismodal) {
                if (fromSaveCallback) {
                    $scope.confirmCallback();
                } else {
                    $scope.cancelCallback();
                }
            } else {
                $state.go('app.orderfavorites');
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


        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.currentcontext.id == 0) {
                $scope.currentcontext.id = data;
            }
            //$scope.getItem();
            $scope.backToList(true);
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.AccessibleTypeId == 1) {
                if (!$scope.item.DepartmentId || !$scope.item.UserId) {
                    utl.Alert.showErrorMsg($translate.instant('clinicalmaster.favoritemaster-form.requiredmsg.lbl'));
                    return;
                }
            }

            // if (vm.gridConfig.data.length == 0) {
            //     utl.Alert.showErrorMsg($translate.instant('clinicalmaster.ticksheet-form.dataalert.lbl'));
            //     return false;
            // }
            var actionName = 'clinicalmaster/TickSheetMaster/AddTickSheetMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/TickSheetMaster/UpdateTickSheetMaster';
            }

            if ($scope.currentcontext.id == 0) {
                var inputData = {
                    Header: $scope.item,
                    Details: $scope.filteredgridData
                };
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

        $scope.onDeleteConfirmed = function(itemName) {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.ItemName == itemName) {
                    item.Status = 2;
                }
            }
            $scope.applyFilter();
        }

        $scope.handleEvents = function(actionType, entity) {

            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.ItemName, entity.ItemName);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "ItemName",
                    displayName: $translate.instant('clinicalmaster.ticksheet-form.itemname.lbl')
                },
                {
                    field: "GroupName",
                    displayName: $translate.instant('clinicalmaster.ticksheet-form.groupname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='text' ng-model='entity.GroupName' class='form-control' />\
                                          </div>"
                },
                {
                    field: "DisplayOrder",
                    displayName: $translate.instant('clinicalmaster.ticksheet-form.displayorder.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                            <input type='number' ng-model='entity.DisplayOrder' class='form-control' />\
                                          </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
               </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                        actiontype: 'delete',
                        display: 'common.deleteaction.lbl'
                    }]
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
                    field: "ItemName",
                    displayName: $translate.instant('clinicalmaster.ticksheet-form.itemname.lbl')
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

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "TickSheetType"
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "DurationPeriod",
                    Default: false
                },
                {
                    "Key": "DrugInstruction",
                    Default: false
                },
                {
                    "Key": "TickSheetMasterType"
                },
                {
                    "Key": "Facility"
                },
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

    OrderFavoritesFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();