(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SuccessStoryListController', SuccessStoryListController);

    function SuccessStoryListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            categorycode: '',
            FacilityId: utl.Session.getCurrentFacilityId(),

            categoryname: '',
            ActiveStatusId: 2
        };

        /* autosearch starts */
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Employee Name',
                field: 'UserName',
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
                header: 'Department',
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
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
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
                item.UserId = item.Id;
                item.UserName = item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        /* autosearch End */

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    // { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 1, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.CategoryId },
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.CreatedBy },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action:  'VirtualHealthcare/SuccessStory/GetSuccessStorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.successstoryform', { id: 0 });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action:  'VirtualHealthcare/SuccessStory/DeleteSuccessStory',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.successstoryform', { id: entity.Id });
            }
            else if
            (actionType == 'view') {
                $state.go('app.successstoryform', { id: entity.Id });
            }

            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.CategoryName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "SuccessCategory.Description",
                displayName: $translate.instant('virtualhealth.successstory.category.lbl')
            },
            {
                field: "CreatedDate",
                displayName: $translate.instant('virtualhealth.successstory.date.lbl'),
                cellTemplate: "<ngformatdate date-val='entity.CreatedDate'></ngformatdate>"
            },
            {
                field: "Title",
                displayName: $translate.instant('virtualhealth.successstory.title.lbl')
            },
            {
                field: "CreatedUser",
                displayName: $translate.instant('virtualhealth.successstory.createdby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.CreatedUser.FirstName}}&nbsp;</span>" + "<span >{{entity.CreatedUser.LastName}}</span>" + "</div>"
            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('virtualhealth.successstory.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"><i class="fa fa-pencil-square-o" aria-hidden="true"uib-tooltip="Edit" tooltip-placement="bottom"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><i class="icofont-ui-delete" aria-hidden="true"uib-tooltip="Delete" tooltip-placement="bottom"></i></span>\
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
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" },
                { "Key": "SuccessCategory" }
            ]
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

    SuccessStoryListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})(); 