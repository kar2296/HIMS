(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DocumentsListController', DocumentsListController);

    function DocumentsListController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {

        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2,
            DocumentStatusId: -1,
            showFilterTab: false,
            EmployeeId: utl.Session.getCurrentEmployeeId(),
            DepartmentId: utl.Session.getCurrentDepartmentId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: utl.Session.getCurrentOrgId(),
            StartDate: utl.Formatter.getCurrentDate(),
            EndDate: utl.Formatter.getCurrentDate(),
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.openFilterTab = function () {
            if ($scope.currentfilter.showFilterTab === true) {
                $scope.currentfilter.showFilterTab = false;
            } else {
                $scope.currentfilter.showFilterTab = true;
            }
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            console.log("API Response:", res); // Log full response
            console.log("Total Records:", res.PageContext.TotalRecords);
            console.log("First Record:", res.Data[0]); // Check if data is duplicated
            angular.forEach(res.Data, function (data, index) {
                res.Data[index].rowIndex = index + 1;
            })
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            console.log("getList triggered");
            var From = $filter('date')($scope.currentfilter.StartDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.EndDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 3, Value: $scope.currentfilter.FacilityId },
                    { Key: 4, Value: $scope.currentfilter.DocumentStatusId },
                    { Key: 8, Value: From },
                    { Key: 9, Value: To }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/Document/GetDocuments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.documentsform', { id: 0, isViewMode: false });
        }
        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('File downloaded successfully...');
        };

        $scope.downloadFile = function (entity) {
            var inputData = { DocumentPath: entity.DocumentPath };
            var options = {
                action: 'emr/Document/GetDocumentFile',
                data: { Data: inputData },
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/Document/DeleteDocument',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity, index) {
            if (actionType == 'firstClick') {
                document.getElementById("myDropdown" + index).classList.toggle("show");
            }
            else if (actionType == 'employeeinfo') {
                utl.Modal.open("app.documentsform", {
                    params: {
                        eid: entity.EmployeeId, Type: actionType
                    },
                });
            } else if (actionType == 'download') {
                $scope.downloadFile(entity);
                // $state.go('app.documentform', { id: entity.Id, isViewMode: true });
            } else if (actionType == 'edit') {
                $state.go('app.documentsform', { id: entity.Id, isViewMode: false });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        window.onclick = function (event) {
            if (!event.target.matches('.dropbtn')) {
                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "rowIndex", displayName: $translate.instant('S.No') },
                { field: "DocumentAttachmentType.Description", displayName: $translate.instant('Document Type') },
                { field: "DocumentName", displayName: $translate.instant('Document Name') },
                {
                    field: "DocumentDate",
                    displayName: $translate.instant('Created Date'),
                    cellTemplate: "<ngformatdate date-val='entity.DocumentDate'></ngformatdate>"
                },
                {
                    field: "ExpiryDate",
                    displayName: $translate.instant('Expiry Date'),
                    cellTemplate: "<ngformatdate date-val='entity.ExpiryDate'></ngformatdate>"
                },
                { field: "Comments", displayName: $translate.instant('Description') },
                { field: "DocumentPath", displayName: $translate.instant('View Document') },
                {
                    field: "CreatedUser",
                    displayName: $translate.instant('Created By'),
                    cellTemplate: '<div class="ui-grid-cell-contents">{{entity.CreatedUser.Title.Description}} {{entity.CreatedUser.FirstName}} {{entity.CreatedUser.LastName}}</div>'
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('Status') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" data-ng-click="handleEvents(\'download\',entity, entity.rowIndex)"><i class="fa fa-download"></i></span>\
                    <span class="grid-action" data-ng-click="handleEvents(\'edit\',entity, entity.rowIndex)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><i class="icofont-ui-delete" aria-hidden="true"uib-tooltip="Delete" tooltip-placement="bottom"></i></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'download', display: 'common.editaction.lbl' },
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        console.log(vm.gridConfig);

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ActiveStatus" },
                { "Key": "AnnouncementStatus" },
                { "Key": "DocumentStatus" }
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

    DocumentsListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();