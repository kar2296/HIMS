(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CategoryChiefComplaintMapController', CategoryChiefComplaintMapController);

    function CategoryChiefComplaintMapController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            chiefComplaintId: -1,
            selectedCC: null,
            chiefComplaintList: []
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.categoryid = parseInt(modalConfig.params.categoryid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ChiefComplaint.ChiefComplaint", displayName: $translate.instant('clinicalmaster.categorychiefcomplaintmap.chiefcomplaint.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        //autosearch starts

        vm.chiefcomplaintconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'ChiefComplaint', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/chiefcomplaint/GetChiefComplaints',
            formatdisplay: formatselectedcc,
            presearch: presearchcc,
            postsearch: postsearchcc
        };

        function formatselectedcc() {
            var selectedItem = vm.chiefcomplaintconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ChiefComplaint].join('  ');
            }
            return result;
        }

        function presearchcc() {
            var query = vm.chiefcomplaintconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.chiefcomplaintconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.chiefcomplaintconfig.searchparams = inputData;
        }

        function postsearchcc() {
        }

        $scope.saveDataCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        function saveData(item) {
            if (item) {
                var options = {
                    action: 'clinicalmaster/ChiefComplaintCategoryMap/AddChiefComplaintCategoryMap',
                    data: { Data: item },
                    type: 'post',
                    onComplete: $scope.saveDataCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.chiefComplaintChange = function () {
            var item = {};
            var isExist = _.find($scope.currentcontext.chiefComplaintList, { 'ChiefComplaintId': $scope.currentcontext.selectedCC.Id });
            if (!isExist) {
                if ($scope.currentcontext.selectedCC) {
                    item = {
                        ChiefComplaintId: $scope.currentcontext.selectedCC.Id,
                        CategoryId: $scope.currentcontext.categoryid
                    };
                }
                saveData(item);
            }
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'clinicalmaster/ChiefComplaintCategoryMap/DeleteChiefComplaintCategoryMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.ChiefComplaint.ChiefComplaint);
            }
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.chiefComplaintList = res.Data;
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentcontext.categoryid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/ChiefComplaintCategoryMap/GetChiefComplaintCategoryMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getList();
    }

    CategoryChiefComplaintMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();