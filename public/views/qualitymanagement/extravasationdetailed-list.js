(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExtravasationDetailedListController', ExtravasationDetailedListController);

    function ExtravasationDetailedListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            ExtravasationProformaTypeId: -1,
            ExtravasationProformastatusid: 2,
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
                    { Key: 6, Value: From },
                    { Key: 7, Value: To },
                    { Key: 5, Value: $scope.currentfilter.PatientNameMRN },
                    { Key: 3, Value: $scope.currentfilter.ExtravasationProformaTypeId },
                    { Key: 1, Value: $scope.currentfilter.ExtravasationProformastatusid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/ExtravasationProforma/GetExtravasationProformas',
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
                action: 'emr/ExtravasationProforma/DeleteExtravasationProforma',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.extravasationdetailed-form', { id: 0 });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.extravasationdetailed-form', { id: entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            } else if (actionType == 'view') {
                $state.go('app.extravasationdetailed-form', { id: entity.Id });
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
                field: "ExtravasationDateTime",
                displayName: $translate.instant('taskmanagement.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.ExtravasationDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "</div>"
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
            { field: "ExtravasationProformaType.Description", displayName: $translate.instant('taskmanagement.type.lbl') },
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
            { field: "ExtravasationProformaStatus.Description", displayName: $translate.instant('taskmanagement.status.lbl') },
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
                { "Key": "ExtravasationProformaStatus" },
                { "Key": "ExtravasationProformaType" },
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

    ExtravasationDetailedListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();