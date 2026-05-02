(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDiagnosisListController', patientDiagnosisListController);

    function patientDiagnosisListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookup = {};
        $scope.DiagnosisLoading = true;
        $scope.LastDiagnosis = {};
        $scope.Items = [];
        $scope.item = {
            ConditionTypeId: 1,
        };
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.currentfilter = {
            Name: '',
            ConditionTypeId: -1,
            ConditionStatusId: 1,
            IsPatientCondition: false,
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.DoctorName = $scope.currentcontext.encounter.DoctorName;
            $scope.item.OrderFromId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.currentcontext.userDepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.OrderToId = 8;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            if ($scope.currentcontext.encounter.EncounterTypeId == 2) {
                $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            }
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
            $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
            if ($scope.currentcontext.encounter.EncounterStatusId == 1) {
                $scope.EncounterStatus = 'CheckedIn'
            }
            if ($scope.currentcontext.encounter.EncounterStatusId == 2) {
                $scope.EncounterStatus = 'CheckedOut'
            }
        }

        if ($scope.item.EncounterTypeId == 1) {
            $scope.context = 'emr';
        } else if ($scope.item.EncounterTypeId == 2) {
            $scope.context = 'ipemr';
        }

        $scope.favconfig = {
            favoritetypeid: 4,
            selectedlist: [],
            selecteddetail: {}
        };

        $scope.addFavorite = function () {
            utl.Modal.open('patientemr.patientdiagnosisform', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    itemid: $scope.favconfig.selecteddetail.ItemId,
                    diagname: $scope.favconfig.selecteddetail.DisplayName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.diagnosis_history = function () {
            utl.Modal.open('patientemr.diagnosishistory', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };

        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };

        $scope.adddiagnosis = function () {
            $state.go('patientemr.diagnosistab.patientdiagnosiscurrentlist');
        };

        $scope.favoriteDiagnosis = function () {
            $state.go('patientemr.diagnosistab.favoritediagnosis', {
                pid: $scope.currentcontext.pid
            });
        };

        $scope.loadDiagnosisListCallback = function (scope, res, options, hasError) {
            $scope.lookup.Diagnosis = res.Data;
            $scope.saveFavorites();
        };

        $scope.loadDiagnosisList = function () {
            var DiagnosisId = [];
            $scope.lookup.Diagnosis = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                if (favitem.ItemId) {
                    DiagnosisId.push(favitem.ItemId);
                }
            }
            if (DiagnosisId && DiagnosisId.length > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: [DiagnosisId]
                    }],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
                var options = {
                    action: 'clinicalmaster/diagnosis/GetDiagnosiss',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadDiagnosisListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveFavoritesCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            //$scope.getList();
            $scope.patient_dashboard();
        };

        $scope.saveFavorites = function () {
            var list = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                var condition = utl.Lookup.getObject($scope.lookup.Diagnosis, favitem.ItemId);
                var details = '';
                if (condition && condition.Code) {
                    if (condition.DiagnosisCategory) details += '-' + condition.DiagnosisCategory.Description;
                    if (condition.DiagnosisType) details += '-' + condition.DiagnosisType.Description;
                    if (condition.Grade) details += '-' + condition.Grade.Description;
                    if (condition.Side) details += '-' + condition.Side.Description;
                    var item = {
                        PatientId: $scope.currentcontext.pid,
                        DiagnosisId: favitem.ItemId,
                        DiagnosisName: condition.DiagnosisName,
                        Code: condition.Code,
                        Description: condition.Description,
                        ConditionDate: utl.Formatter.getCurrentDate(),
                        EncounterId: utl.Session.getEncounterId(),
                        ConditionStatusId: 1,
                        IsPatientCondition: 0,
                        CategoryId: condition.CategoryId,
                        TypeId: condition.TypeId,
                        GradeId: condition.GradeId,
                        SideId: condition.SideId,
                        DiagnosisDetails: condition.Description + details
                    };
                    if (!checkExist(item)) {
                        list.push(item);
                    } else {
                        utl.Alert.showErrorMsg($translate.instant('Diagnosis is Already Added '));
                    }
                }
            }
            if (list.length > 0) {
                var options = {
                    action: 'emr/patientcondition/ManagePatientConditions',
                    data: {
                        Data: list
                    },
                    type: 'post',
                    onComplete: $scope.saveFavoritesCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkExist(item) {
            for (var idx in vm.gridConfig.data) {
                if ((item.DiagnosisId == vm.gridConfig.data[idx].DiagnosisId) && (vm.gridConfig.data[idx].Status == 1)) {
                    return true;
                }
            }
            return false;
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.Items = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            if (res.Data.length > 0) {
                var lastIndex = res.Data.length - 1;
                $scope.LastDiagnosis = res.Data[lastIndex];
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                },
                {
                    Key: 5,
                    Value: $scope.currentcontext.eid
                },
                // { Key: 3, Value: $scope.currentfilter.ConditionTypeId },
                {
                    Key: 7,
                    Value: $scope.currentfilter.IsPatientCondition
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientdiagnosisform', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientcondition/DeletePatientCondition',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDiagnosisByIdCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.id = data.Id;
        };
        $scope.getDiagnosisById = function (DiagnoseId) {
            // if (DiagnoseId && DiagnoseId > 0) {
            var options = {
                action: 'emr/patientcondition/GetPatientConditionById',
                data: {
                    Id: DiagnoseId
                },
                type: 'post',
                onComplete: $scope.getDiagnosisByIdCallback
            };
            utl.Http.doAction(options);
            // }
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.getDiagnosisById(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        $scope.saveItemCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.OtherDiagnosis = '';
            document.getElementById("item_form").reset();
            $scope.getList();
        };

        $scope.AddPatientCondition = function () {
            if ($scope.item.DiagnosisId) {
                if (getDiagnosis()) {
                    var actionName = 'emr/patientcondition/AddPatientCondition';
                    if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                        actionName = 'emr/patientcondition/UpdatePatientCondition';
                    }
                    $scope.item.DepartmentId = utl.Session.getCurrentDepartmentId();
                    // var actionName = 'emr/patientcondition/AddPatientCondition';
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.item
                        },
                        type: 'post',
                        onComplete: $scope.saveItemCallback
                    };
                    utl.Http.doAction(options);
                }
            } else if (!$scope.item.DiagnosisId && $scope.item.OtherDiagnosis) {
                $scope.item.PatientId = $scope.currentcontext.pid;
                $scope.item.EncounterId = utl.Session.getEncounterId();
                $scope.item.ConditionDate = utl.Formatter.getCurrentDate();
                $scope.item.DepartmentId = utl.Session.getCurrentDepartmentId();
                $scope.item.ConditionStatusId = 1;
                $scope.item.IsPatientCondition = 0;
                $scope.item.CategoryId = 0;
                $scope.item.TypeId = 0;
                $scope.item.GradeId = 0;
                $scope.item.SideId = 0;
                var actionName = 'emr/patientcondition/AddPatientCondition';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/patientcondition/UpdatePatientCondition';
                }
                // var actionName = 'emr/patientcondition/AddPatientCondition';
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            } else if (!$scope.item.DiagnosisId && !$scope.item.OtherDiagnosis) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Any Diagnosis'));
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },

                {
                    field: "OtherDiagnosis",
                    width: "40%",
                    displayName: $translate.instant('patientemr.patientdiagnosis-list.otherdiagnosis.lbl')
                },
                {
                    field: "ICD10",
                    width: "25%",
                    displayName: $translate.instant('patientemr.patientdiagnosis-list.icd.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >{{entity.DiagnosisName}}({{entity.Code}})</span>  </div>',
                },
                {
                    field: "ConditionType.Description",
                    displayName: $translate.instant('patientemr.patientcondition-list.conditiontype.lbl')
                },
                // {
                //     field: "ConditionStatus.Description",
                //     displayName: $translate.instant('inventory.purchaseorders.status.lbl')
                // },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                   <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }
                // {
                //     field: "Id",
                //     width: "10%",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [{
                //         actiontype: 'delete',
                //         display: 'common.deleteaction.lbl'
                //     }]
                // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        vm.diagnosiscontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'DiagnosisName',
                field: 'DiagnosisName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
                // {
                //     header: 'Version',
                //     field: 'Version',
                //     datatype: 'string',
                //     headercls: 'td-Version',
                //     fieldcls: 'td-Version'
                // },
                // {
                //     header: 'Speciality',
                //     field: 'Speciality',
                //     datatype: 'string',
                //     headercls: 'td-Speciality',
                //     fieldcls: 'td-Speciality'
                // },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/diagnosis/GetDiagnosiss',
            formatdisplay: formatselecteddiagnosis,
            presearch: presearchdiagnosis,
            postsearch: postsearchdiagnosis
        };

        function formatselecteddiagnosis() {
            var selectedItem = vm.diagnosiscontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.PatientId = $scope.currentcontext.pid;
                $scope.item.DiagnosisId = selectedItem.Id;
                $scope.item.DiagnosisName = selectedItem.DiagnosisName;
                $scope.item.Code = selectedItem.Code;
                $scope.item.Description = selectedItem.DiagnosisName;
                $scope.item.ConditionDate = utl.Formatter.getCurrentDate();
                $scope.item.EncounterId = utl.Session.getEncounterId();
                $scope.item.ConditionStatusId = 1;
                $scope.item.IsPatientCondition = 0;
                $scope.item.CategoryId = 0;
                $scope.item.TypeId = 0;
                $scope.item.GradeId = 0;
                $scope.item.SideId = 0;
                $scope.item.DiagnosisDetails = selectedItem.DiagnosisName;
                // $scope.AddPatientCondition();
                result = [selectedItem.DiagnosisName + '(' + selectedItem.Code + ')'].join('  ');
            } else if (vm.diagnosiscontrolconfig.rowdata) {
                result = [vm.diagnosiscontrolconfig.rowdata.Code, vm.diagnosiscontrolconfig.rowdata.DiagnosisName].join(' ');
            }
            return result;
        }

        function presearchdiagnosis() {
            var query = vm.diagnosiscontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.diagnosiscontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.diagnosiscontrolconfig.searchparams = inputData;
        }

        function postsearchdiagnosis() {
            for (var idx in vm.diagnosiscontrolconfig.result) {
                var item = vm.diagnosiscontrolconfig.result[idx];
                item.Code = item.Code;
                item.DiagnosisName = item.DiagnosisName;
            }
        }

        function getDiagnosis() {
            var DiagnosisId = $scope.item.selectedItem.Id;
            var Data = $scope.item;
            if (Data.Id == 0) {
                for (var idx in vm.gridConfig.data) {
                    if ((DiagnosisId == vm.gridConfig.data[idx].DiagnosisId) && (vm.gridConfig.data[idx].Status == 1)) {
                        utl.Alert.showErrorMsg($translate.instant('Diagnosis is Already Added '));
                        return false;
                    }
                }
            }
            return true;
        }


        $('.panel-title > a').click(function () {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.DiagnosisLoading = false;
            $scope.getList();
        };

        $scope.initLookup = function () {
            $scope.DiagnosisLoading = true;
            var inputData = [{
                "Key": "ConditionType"
            },
            {
                "Key": "ConditionStatus"
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

        $scope.initLookup();
    }

    patientDiagnosisListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();