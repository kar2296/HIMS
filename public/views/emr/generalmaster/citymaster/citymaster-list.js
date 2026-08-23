(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cityMasterListController', cityMasterListController);

    function cityMasterListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            CountryId: -1,
            StateId: -1,
            CityId: -1,
            ActiveStatusId: 2,
        };


         //City Autosearch Start
         vm.citycontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'CityId', field: 'CityId', datatype: 'integer', headercls: 'td-id', fieldcls: 'td-id' },
                { header: 'City Name', field: 'CityName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/CityMaster/GetCityMasters',
            formatdisplay: formatselectedcity,
            presearch: presearchcity,
            postsearch: postsearchcity
        };

        function formatselectedcity() {
            var selectedItem = vm.citycontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.CityId = selectedItem.Id;
                $scope.item.CityName = selectedItem.CityName;
                result = [selectedItem.CityName].join(' ');
            } else if (vm.citycontrolconfig.rowdata) {
                result = [vm.citycontrolconfig.rowdata.cityName].join(' ');
            }
            return result;
        }

        function presearchcity() {
            var query = vm.citycontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.citycontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: $scope.item.CityId });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 4, Value: query });
            }

            vm.citycontrolconfig.searchparams = inputData;
        }

        function postsearchcity() {
            for (var idx in vm.citycontrolconfig.result) {
                var item = vm.citycontrolconfig.result[idx];
                item.CityId = item.Id;
                item.CityName = item.CityName;
            }
        }
        $scope.getCitys = function () {
            $scope.Citys = $scope.item.SelectedItem;
            $scope.item.CityName = $scope.citymasters.CityName;
        };
        //City Autosearch End


        //District Autosearch Start
        vm.districtcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'DistrictId', field: 'DistrictId', datatype: 'integer', headercls: 'td-id', fieldcls: 'td-id' },
                { header: 'District Name', field: 'DistrictName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/DistrictMaster/GetDistrictMasters',
            formatdisplay: formatselecteddistrict,
            presearch: presearchdistrict,
            postsearch: postsearchdistrict
        };

        function formatselecteddistrict() {
            var selectedItem = vm.districtcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.DistrictId = selectedItem.Id;
                $scope.item.DistrictName = selectedItem.DistrictName;
                result = [selectedItem.DistrictName].join(' ');
            } else if (vm.districtcontrolconfig.rowdata) {
                result = [vm.districtcontrolconfig.rowdata.DistrictName].join(' ');
            }
            return result;
        }

        function presearchdistrict() {
            var query = vm.districtcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            if (vm.districtcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: $scope.item.DistrictId });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 4, Value: query });
            }

            vm.districtcontrolconfig.searchparams = inputData;
        }

        function postsearchdistrict() {
            for (var idx in vm.districtcontrolconfig.result) {
                var item = vm.districtcontrolconfig.result[idx];
                item.DistrictId = item.Id;
                item.DistrictName = item.DistrictName;
            }
        }
        $scope.getDistricts = function () {
            $scope.getDistricts = $scope.item.SelectedItem;
            $scope.item.DistrictName = $scope.districtmasters.DistrictName;
        };
        //District Autosearch End



        //State Autosearch Start
        vm.statecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'StateId', field: 'StateId', datatype: 'integer', headercls: 'td-id', fieldcls: 'td-id' },
                { header: 'State Name ', field: 'StateName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/StateMaster/GetStateMasters',
            formatdisplay: formatselectedstate,
            presearch: presearchstate,
            postsearch: postsearchstate
        };

        function formatselectedstate() {
            var selectedItem = vm.statecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.StateId = selectedItem.Id;
                $scope.item.StateName = selectedItem.StateName;
                result = [selectedItem.StateName].join(' ');
            } else if (vm.statecontrolconfig.rowdata) {
                result = [vm.statecontrolconfig.rowdata.StateName].join(' ');
            }
            return result;
        }

        function presearchstate() {
            var query = vm.statecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            if (vm.statecontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: $scope.item.StateId });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 4, Value: query });
            }

            vm.statecontrolconfig.searchparams = inputData;
        }

        function postsearchstate() {
            for (var idx in vm.statecontrolconfig.result) {
                var item = vm.statecontrolconfig.result[idx];
                item.StateId = item.Id;
                item.StateName = item.StateName;
            }
        }
        $scope.getStates = function () {
            $scope.getStates = $scope.item.SelectedItem;
            $scope.item.StateName = $scope.countrymasters.StateName;
        };
        //State Autosearch End



        //Country Autosearch Start
        vm.countrycontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'CountryId', field: 'CountryId', datatype: 'integer', headercls: 'td-id', fieldcls: 'td-id' },
                { header: 'Country Name ', field: 'CountryName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/CountryMaster/GetCountryMasters',
            formatdisplay: formatselectedcountry,
            presearch: presearchcountry,
            postsearch: postsearchcountry
        };

        function formatselectedcountry() {
            var selectedItem = vm.countrycontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.CountryId = selectedItem.Id;
                $scope.item.CountryName = selectedItem.CountryName;
                result = [selectedItem.CountryName].join(' ');
            } else if (vm.countrycontrolconfig.rowdata) {
                result = [vm.countrycontrolconfig.rowdata.CountryName].join(' ');
            }
            return result;
        }

        function presearchcountry() {
            var query = vm.countrycontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            if (vm.countrycontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: $scope.item.CountryId });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 3, Value: query });
            }

            vm.countrycontrolconfig.searchparams = inputData;
        }

        function postsearchcountry() {
            for (var idx in vm.countrycontrolconfig.result) {
                var item = vm.countrycontrolconfig.result[idx];
                item.CountryId = item.Id;
                item.CountryName = item.CountryName;
            }
        }
        $scope.getStates = function () {
            $scope.getStates = $scope.item.SelectedItem;
            $scope.item.CountryName = $scope.countrymasters.CountryName;
        };
        //Country Autosearch End


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentfilter.CityName },
                    { Key: 2, Value: $scope.currentfilter.StateId },
                    { Key: 5, Value: $scope.currentfilter.CountryId },
                    { Key: 3, Value: $scope.currentfilter.DistrictId },
                    { Key: 6, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 7, Value: $scope.currentfilter.CityCode },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/CityMaster/GetCityMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.citymasters', {
                params: { id: Id }, confirmCallback: $scope.initLookup
            }
            );
        }

        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }
        $scope.backtoList = function () {
            $state.go('app.commondashboard');
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/CityMaster/DeleteCityMaster',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.CityName);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [

                {
                    field: "CityCode", displayName: $translate.instant('generalmaster.districtmaster-list.citycode.lbl'),

                },
                {
                    field: "CityName", displayName: $translate.instant('generalmaster.districtmaster-list.cityname.lbl'),

                },
                {
                    field: "DistrictMaster.DistrictName", displayName: $translate.instant('generalmaster.districtmaster-list.districtname.lbl'),

                },
                {
                    field: "StateMaster.StateName", displayName: $translate.instant('generalmaster.districtmaster-list.statename.lbl'),

                },
                {
                    field: "CountryMaster.CountryName", displayName: $translate.instant('generalmaster.countrymaster-list.countryname.lbl'),

                },
                {
                    field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.countrymaster-list.status.lbl'),

                },

                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1||entity.ActiveStatusId==3"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
               </div>',
   handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
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
                { "Key": "ActiveStatus" },
                // { "Key": "State" },
                // { "Key": "City" },
                // { "Key": "Country" },
                // { "Key": "District" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }


        // UI-MODERNIZATION RETROFIT: hollowed bridge for the React port of this
        // list screen (<react-component name="CityMasterListScreen">). All real logic
        // above (getList/getListCallback's real paginated GetCityMasters call,
        // openModal/addNew/handleEvents' real utl.Modal.open('app.citymasters', ...)
        // add/edit flow, onDeleteConfirmed's real DeleteCityMaster call behind
        // utl.Dialog.confirmDelete, and the district/state/country/city autosearch
        // configs) is completely untouched. React owns presentational rendering only
        // and forwards interactions back here by action name via handleReactAction.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                pagerObj: vm.gridConfig.pagerObj,
                currentfilter: $scope.currentfilter,
                lookup: {
                    ActiveStatus: ($scope.lookup && $scope.lookup.ActiveStatus) || []
                }
            };
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'search') {
                $scope.currentfilter.CityCode = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'locationFilterChange') {
                angular.extend($scope.currentfilter, payload);
                $scope.getList();
            } else if (actionName === 'statusFilterChange') {
                $scope.currentfilter.ActiveStatusId = payload && payload.value;
                $scope.getList();
            } else if (actionName === 'pageChange') {
                vm.gridConfig.pagerObj.currentPage = payload && payload.page;
                $scope.getList();
            } else if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'edit') {
                $scope.handleEvents('edit', payload);
            } else if (actionName === 'delete') {
                $scope.handleEvents('delete', payload);
            } else if (actionName === 'backToList') {
                $scope.backtoList();
            } else if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };
        $scope.initLookup();
    }

    cityMasterListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();