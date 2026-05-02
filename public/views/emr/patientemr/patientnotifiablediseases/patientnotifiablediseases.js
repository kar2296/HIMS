(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientnotifiablediseasesListController', patientnotifiablediseasesListController);

    function patientnotifiablediseasesListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookup = {};
        $scope.item = {
            NotifiableDiseaseTypeId: 1,
            IsActive: true,
            PerformedDate: utl.Formatter.getCurrentDate(),
            CreatedBy: utl.Session.getCurrentUserId()
        };
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.currentfilter = {
            Name: '',
            NotifiableDiseaseTypeId: -1,
            NotifiableDiseaseId: -1
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
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
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

        $scope.doctor_dashboard = function() {
            $state.go('app.doctordashboard');
        };

        $scope.checkedinpatients = function() {
            $state.go('app.oppatienttab.mycheckin');
        };


        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentcontext.eid
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/PatientNotifiableDisease/GetPatientNotifiableDiseases',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.SelectedDisease = function(selectedItem) {
            $scope.item.NotifiableDiseaseName = selectedItem.Text;
        };

        $scope.getNotifyDiseaseByIdCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.id = data.Id;
        };
        $scope.getNotifyDiseaseById = function(DiagnoseId) {
            // if (DiagnoseId && DiagnoseId > 0) {
            var options = {
                action: 'emr/PatientNotifiableDisease/GetPatientNotifiableDiseaseById',
                data: {
                    Id: DiagnoseId
                },
                type: 'post',
                onComplete: $scope.getNotifyDiseaseByIdCallback
            };
            utl.Http.doAction(options);
            // }
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'edit') {
                $scope.getNotifyDiseaseById(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        $scope.saveItemCallback = function(scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.Notes = '';
            $scope.item.NotifiableDiseaseId = -1;
            $scope.item.NotifiableDiseaseTypeId = 1;
            $scope.getList();
        };

        $scope.saveItem = function() {
            var actionName = 'emr/PatientNotifiableDisease/AddPatientNotifiableDisease';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PatientNotifiableDisease/UpdatePatientNotifiableDisease';
            }
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
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
                    field: "PerformedDate",
                    displayName: $translate.instant('Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PerformedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.PerformedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "NotifiableDiseaseType.Description",
                    width: "40%",
                    displayName: $translate.instant('Type')
                },
                {
                    field: "NotifiableDisease.Description",
                    width: "25%",
                    displayName: $translate.instant('NotifiableDisease')
                },
                {
                    field: "Notes",
                    displayName: $translate.instant('Notes')
                },
                {
                    field: "CreatedUser.FirstName",
                    displayName: $translate.instant('Created By')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                </div>',
                    handleEvent: $scope.handleEvents,
                }

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


        $('.panel-title > a').click(function() {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "NotifiableDiseaseType"
                },
                {
                    "Key": "NotifiableDisease"
                },
                {
                    "Key": "User"
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

    patientnotifiablediseasesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();