(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('lensprescriptionController', lensprescriptionController);

    function lensprescriptionController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            LensPrescriptionStatusId: 2,
        };
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        $scope.currentfilter.DoctorId = $scope.currentcontext.encounter.DoctorId;


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.LensPrescriptionDate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.LensPrescriptionDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.LensPrescriptionStatusId
                    },
                    {
                        Key: 5,
                        Value: FrmDate
                    },
                    {
                        Key: 6,
                        Value: ToDate
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DoctorId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/LensPrescription/GetLensPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
        }
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        //Grid Actions
        $scope.addNew = function () {
            if ($scope.currentcontext.encounter.IsBillLock == false) {
                $state.go('patientemr.lensprescriptionform', {
                    id: 0,
                    pid: $scope.currentcontext.pid
                });
            } else
                utl.Alert.showErrorMsg(" Bill is Locked");
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/LensPrescription/DeleteLensPrescription',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit' || actionType == 'view') {
                $state.go('patientemr.lensprescriptionform', {
                    id: entity.Id,
                    pid: $scope.currentcontext.pid
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [{
                    field: "FirstName",
                    displayName: $translate.instant('Doctor Name'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{entity.Doctor.Title.Description}} {{entity.Doctor.FirstName}} {{entity.Doctor.LastName}}</div>'
                },
                {
                    field: "Department.DepartmentName",
                    displayName: $translate.instant('appmanager.dept.departmentname.lbl')
                },
                {
                    field: "LensIdentifier",
                    displayName: $translate.instant('Lens Identifier')
                },
                {
                    field: "LensPrescriptionStatus.Description",
                    displayName: $translate.instant('appmanager.users.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                 <span class="grid-action" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                 <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-hide="entity.LensPrescriptionStatusId==2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "LensPrescriptionStatus"
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

    lensprescriptionController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();