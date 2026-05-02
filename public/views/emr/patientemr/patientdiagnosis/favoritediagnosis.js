(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FavoriteDiagnosisController', FavoriteDiagnosisController);

    function FavoriteDiagnosisController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.lookup = {};
        $scope.item = [];
        $scope.LastDiagnosis = {};
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
        $scope.item.PatientId = $stateParams.pid;

        $scope.item.EncounterId = utl.Session.getEncounterId();
        $scope.currentcontext.GuarantorId = 0;
        $scope.currentcontext.MasterDiagnosisCount = 0;
        $scope.currentcontext.CurrentDiagnosisCount = 0;
        $scope.PatientDiagnosisDetails = [];
        $scope.item.ClaimProcessId = 0;
        $scope.item.ClaimNumber = '';

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.Items = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            if (res.Data.length > 0) {
                var lastIndex = res.Data.length - 1;
                $scope.LastDiagnosis = res.Data[lastIndex];
            }
        };

        //Favorite area starts
        $scope.favconfig = {
            favoritetypeid: 2,
            selectedlist: [],
            selecteddetail: {}
        };

        $scope.addFavorite = function () {
            utl.Modal.open('patientemr.patientdiagnosisform', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid,
                    itemid: $scope.favconfig.selecteddetail.ItemId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.diagnosis_history = function () {
            utl.Modal.open('patientemr.diagnosishistory', {
                params: {
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.adddiagnosis = function () {
            $state.go('patientemr.diagnosistab.patientdiagnosiscurrentlist', {
                pid: $scope.currentcontext.pid
            });
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
                    }, ],
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
            $scope.getList();
            $scope.getEncounterDetails();
        };
        $scope.saveFavorites = function () {
            if ($scope.currentcontext.CurrentDiagnosisCount == $scope.currentcontext.MasterDiagnosisCount ||
                $scope.currentcontext.CurrentDiagnosisCount > $scope.currentcontext.MasterDiagnosisCount) {
                utl.Alert.showErrorMsg($translate.instant('You have to add ' + $scope.currentcontext.MasterDiagnosisCount + ' Diagnosis only for this Guarantor'));
                return;
            }
            var list = [];
            for (var idx in $scope.favconfig.selectedlist) {
                var favitem = $scope.favconfig.selectedlist[idx];
                var condition = utl.Lookup.getObject($scope.lookup.Diagnosis, favitem.ItemId);
                var details = '';
                if (condition.DiagnosisCategory) details += '-' + condition.DiagnosisCategory.Description;
                if (condition.DiagnosisType) details += '-' + condition.DiagnosisType.Description;
                if (condition.Grade) details += '-' + condition.Grade.Description;
                if (condition.Side) details += '-' + condition.Side.Description;
                var item = {
                    PatientId: $scope.currentcontext.pid,
                    DiagnosisId: favitem.ItemId,
                    DiagnosisName: condition.DiagnosisName,
                    Code: condition.Code,
                    ConditionTypeId: 1,
                    Description: condition.Description,
                    ConditionDate: utl.Formatter.getCurrentDate(),
                    EncounterId: utl.Session.getEncounterId(),
                    ClaimNumber: $scope.item.ClaimNumber,
                    ClaimProcessId: $scope.item.ClaimProcessId,
                    ConditionStatusId: 1,
                    IsPatientCondition: 0,
                    CategoryId: condition.CategoryId,
                    TypeId: condition.TypeId,
                    GradeId: condition.GradeId,
                    SideId: condition.SideId,
                    DiagnosisDetails: condition.Description + details
                };
                list.push(item);
            }

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

        //Favorite area ends

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.Name
                    },
                    {
                        Key: 2,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ConditionTypeId
                    },
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

        //Grid Actions
        $scope.addNew = function () {
            if ($scope.currentcontext.CurrentDiagnosisCount == $scope.currentcontext.MasterDiagnosisCount ||
                $scope.currentcontext.CurrentDiagnosisCount > $scope.currentcontext.MasterDiagnosisCount) {
                utl.Alert.showErrorMsg($translate.instant('You have to add ' + $scope.currentcontext.MasterDiagnosisCount + ' Diagnosis only for this Guarantor'));
                return;
            }
            utl.Modal.open('patientemr.patientdiagnosisform', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.pid
                },
                confirmCallback: $scope.getList
            });
        }

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
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientdiagnosisform', {
                    params: {
                        id: row.entity.Id,
                        pid: $scope.currentcontext.pid
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ConditionType.Description",
                    displayName: $translate.instant('patientemr.patientcondition-list.conditiontype.lbl')
                },
                {
                    field: "DiagnosisName",
                    displayName: $translate.instant('patientemr.patientcondition-list.diagnosisname.lbl')
                },
                {
                    field: "Code",
                    displayName: $translate.instant('patientemr.patientcondition-list.code.lbl')
                },
                {
                    field: "DiagnosisDetails",
                    displayName: $translate.instant('patientemr.patientcondition-list.details.lbl')
                },
                {
                    field: "Side.Description",
                    displayName: $translate.instant('lis.testmaster.side.lbl')
                },
                {
                    field: "ConditionStatus.Description",
                    displayName: $translate.instant('patientemr.patientcondition-list.conditionstatus.lbl')
                },
                {
                    field: "ConditionDate",
                    displayName: $translate.instant('patientemr.patientcondition-list.conditiondate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.ConditionDate'></ngformatdate>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        },
                        {
                            actiontype: 'delete',
                            display: 'common.deleteaction.lbl'
                        }
                    ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.getPatientDiagnosisDetailsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.PatientDiagnosisDetails = res.Data;
                var DiagnosisCount = 0;
                for (var idx in $scope.PatientDiagnosisDetails) {
                    DiagnosisCount++;
                }
                $scope.currentcontext.CurrentDiagnosisCount = DiagnosisCount;
            }
        };

        $scope.getPatientDiagnosisDetails = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 8,
                        Value: $scope.item.ClaimProcessId
                    }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/PatientCondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientDiagnosisDetailsCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getGuarantorDetailsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.GuarantorDetails = res.Data[0];
                $scope.currentcontext.MasterDiagnosisCount = res.Data[0].DiagnosisCount;
            }
        };

        $scope.getGuarantorDetails = function (GuarantorId) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: GuarantorId
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/Guarantor/GetGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGuarantorDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getEncounterDetailsCallback = function (scope, data, options, hasError) {
            $scope.PatientEncounterDetails = data;
            $scope.currentcontext.GuarantorId = data.GuarantorId;
            $scope.item.ClaimProcessId = data.ClaimProcessId;
            $scope.item.ClaimNumber = data.ClaimNumber;
            if ($scope.currentcontext.GuarantorId > 0) {
                $scope.getGuarantorDetails($scope.currentcontext.GuarantorId);
            }
            if ($scope.item.ClaimProcessId > 0) {
                $scope.getPatientDiagnosisDetails();
            }
        };

        $scope.getEncounterDetails = function () {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.item.EncounterId
                },
                type: 'post',
                onComplete: $scope.getEncounterDetailsCallback
            };
            utl.Http.doAction(options);
        };

        $('.panel-title > a').click(function () {
            $(this).find('i').toggleClass('fa-plus fa-minus')
                .closest('panel').siblings('panel')
                .find('i')
                .removeClass('fa-minus').addClass('fa-plus');
            $("#collapseOne").toggle();
        });

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            //$scope.lookup.Diagnosis = [];
            //$scope.getDiagnosis();
            $scope.getList();
            $scope.getEncounterDetails();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "ConditionType"
                },
                //{
                //    "Key": "Diagnosis", Request: {
                //        Params: [{ Key: 5, Value: 2 },],
                //        PageContext: { PageSize: -1, PageNumber: 1 }
                //    }
                //},
                {
                    "Key": "ConditionStatus"
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

    FavoriteDiagnosisController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();