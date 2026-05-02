(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AdverseDrugReactionListController', AdverseDrugReactionListController);

    function AdverseDrugReactionListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            AdverseDrugReactionTypeId: -1,
            adversedrugreactionstatusid: 2,
            FromDate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), -7),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 7, Value: From },
                    { Key: 8, Value: To },
                    { Key: 6, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 3, Value: $scope.currentfilter.AdverseDrugReactionTypeId },
                    { Key: 1, Value: $scope.currentfilter.adversedrugreactionstatusid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/AdverseDrugReaction/GetAdverseDrugReactions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/AdverseDrugReaction/DeleteAdverseDrugReaction',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.adversedrugreaction-form', { id: 0 });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.adversedrugreaction-form', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'view') {
                $state.go('app.adversedrugreaction-form', { id: entity.Id });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "AdverseDateTime",
                displayName: $translate.instant('taskmanagement.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AdverseDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "</div>"
            },
            { field: "PatientId", displayName: $translate.instant('Patient Id') },
            {
                field: "Name",
                displayName: $translate.instant('registration.checkedinpatients.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                    '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)" >' +
                    "{{entity.Patient.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.Patient.FirstName}}&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>",
                handleEvent: $scope.handleEvents
            },
            { field: "AdverseDrugReactionType.Description", displayName: $translate.instant('taskmanagement.type.lbl') },
            { field: "DiagnosisName", displayName: $translate.instant('Diagnosis') },
            {
                field: "Name",
                displayName: $translate.instant('Created By'),
                cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                    '<p class="grid-action">' +
                    "{{entity.CreatedUser.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" +
                    "<span ><b>{{entity.CreatedUser.LastName}}</b>&nbsp;</span>" +
                    "</p></div>",
            },
            {
                field: "Name",
                displayName: $translate.instant('Approved By'),
                cellTemplate: "<div class='ui-grid-cell-contents ptname'>" +
                    '<p class="grid-action">' +
                    "{{entity.ApprovedUser.Title.Description}}&nbsp;</span>" +
                    "<span >{{entity.ApprovedUser.FirstName}}&nbsp;</span>" +
                    "<span ><b>{{entity.ApprovedUser.LastName}}</b>&nbsp;</span>" +
                    "</p></div>",
            },
            { field: "AdverseDrugReactionStatus.Description", displayName: $translate.instant('taskmanagement.status.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AdverseDrugReactionStatus" },
                { "Key": "AdverseDrugReactionType" },
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

    AdverseDrugReactionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();