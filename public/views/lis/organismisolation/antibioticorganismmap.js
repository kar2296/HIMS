(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('AntibioticOrganismMapController', AntibioticOrganismMapController);

    function AntibioticOrganismMapController($scope, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;

        $scope.Items = []; // saved for bulk items
        $scope.item = {}; // saved for individual item

        var organismId = parseInt($stateParams.id);

        //getlist
        $scope.getListCallback = function(scope, res, options, hasError) {
            console.log(res.Data);
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function(pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: organismId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'lis/AntibioticMaster/GetAntibioticOrganismMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //autosearch related code starts for Organism
        vm.antibioticcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'AntibioticName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
            ],
            searchparams: {},
            result: {},
            api: 'lis/AntibioticMaster/GetAntibioticMasters',
            formatdisplay: formatselectedorganism,
            presearch: presearchorganism,
            postsearch: postsearchorganism
        };

        function formatselectedorganism() {
            var selectedItem = vm.antibioticcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.AntibioticName].join('  ');
            } else if (vm.antibioticcontrolconfig.rowdata) {
                result = [vm.antibioticcontrolconfig.rowdata.Code, vm.antibioticcontrolconfig.rowdata.OrgIsolationName].join(' ');
            }
            $scope.item.AntibioticName = result;

            return result;
        }

        function presearchorganism() {
            var query = vm.antibioticcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            if (vm.antibioticcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 2, Value: query });
            }

            vm.antibioticcontrolconfig.searchparams = inputData;
        }

        function postsearchorganism() {
            for (var idx in vm.antibioticcontrolconfig.result) {
                var item = vm.antibioticcontrolconfig.result[idx];
                item.Code = item.Code;
                item.AntibioticName = item.AntibioticName;
            }
        }
        //autosearch related code ends for Organism

        $scope.onOrganismSelected = function(selectedItem) {
            $scope.getinfo();
        }

        $scope.getInfoCallback = function(scope, res, options, hasError) {
            $scope.OrganismMap = res.Data || [];
            var orgmap = [];
            for (var idx in $scope.OrganismMap) {
                if ($scope.item.OrganismMapId == $scope.OrganismMap[idx].OrganismMapId) {
                    utl.Alert.showErrorMsg($translate.instant('Already Mapped'));
                    document.getElementById("item_form").reset();
                }
            }
        };
        $scope.getinfo = function() {
            var inputData = {
                Params: [
                    { Key: 2, Value: organismId }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'lis/AntibioticMaster/GetAntibioticOrganismMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInfoCallback
            };
            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'lis/AntibioticOrganismMap/DeleteAntibioticOrganismMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item = {};
            document.getElementById("item_form").reset();
            $scope.getList();
        };

        $scope.saveItem = function() {
            if (!$scope.item.AntibioticMasterId) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Any Antibiotics'));
                return;
            }

            $scope.item.OrganismMapId = organismId;
            var actionName = 'lis/AntibioticMaster/AddAntibioticOrganismMap';
            if ($scope.item.Id && $scope.item.Id > 0) {
                actionName = 'lis/AntibioticMaster/UpdateAntibioticOrganismMap';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "AntibioticMaster.Code",
                    displayName: $translate.instant('lis.analyzer.code.lbl')
                },
                {
                    field: "AntibioticMaster.AntibioticName",
                    displayName: $translate.instant('lis.analyzer.name.lbl')
                },
                {
                    field: "AntibioticMaster.DisplayOrder",
                    displayName: $translate.instant('lis.testmasteranalytemap.display.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                     <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                      </div>',
                    handleEvent: $scope.handleEvents,
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' },
                    //     { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    // ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [

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

    AntibioticOrganismMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();