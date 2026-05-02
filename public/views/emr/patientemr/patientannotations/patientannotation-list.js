(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAnnotationListController', patientAnnotationListController);

    function patientAnnotationListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({$scope: $scope}));
        $scope.currentfilter = {
            AnnotationTypeId: -1,
            PerformedBy: utl.Session.getCurrentUserId(),
            AnnotationStatusId: 2
        };
        $scope.currentcontext = {
            pid: parseInt(utl.Session.getEMRPatientId())
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.AnnotationTypeId },
                    { Key: 4, Value: $scope.currentfilter.AnnotationStatusId },
                    { Key: 5, Value: $scope.currentfilter.PerformedBy }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/patientannotation/GetPatientAnnotations',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientannotation', {
                params: { id: 0, pid: $scope.currentcontext.pid },
                confirmCallback: $scope.getList
            }
            );
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientannotation/DeletePatientAnnotation',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                utl.Modal.open('patientemr.patientannotation', {
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                });
                //$state.go('patientemr.patientannotation', { id: row.entity.Id });
            }
            else if (actionType == 'view') {
                utl.Modal.open('patientemr.patientannotation', {
                    params: { id: row.entity.Id, pid: $scope.currentcontext.pid },
                    confirmCallback: $scope.getList
                });
                //$state.go('patientemr.patientannotation', { id: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                {
                    field: "PerformedDate", displayName: $translate.instant('patientemr.patientannotation-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.PerformedDate'></ngformatdate>"
                },
                { field: "AnnotationType.Description", displayName: $translate.instant('patientemr.patientannotation-list.type.lbl') },
                {
                    field: "PerformedBy", displayName: $translate.instant('patientemr.patientannotation-list.capturedby.lbl'),
                    cellTemplate: "<displayuser user='row.entity.User'></displayuser>"
                },
                { field: "AnnotationStatus.Description", displayName: $translate.instant('patientemr.patientannotation-list.status.lbl') },
                { field: "IsPHR", displayName: $translate.instant('patientemr.patientannotation-list.phr.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.AnnotationStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)"ng-show="row.entity.AnnotationStatusId==2"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                     <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.AnnotationStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                </div>',
                    // cellTemplate : 'actionTemplate.html',
                    // actions : [ 
                    //             {actiontype: 'edit', display : 'common.editaction.lbl'},
                    //             {actiontype: 'delete', display : 'common.deleteaction.lbl'} 
                    //          ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AnnotationType" },
                { "Key": "AnnotationStatus" },
                { "Key": "User" }
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

    patientAnnotationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();