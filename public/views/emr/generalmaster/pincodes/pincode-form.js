(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pincodeFormController', pincodeFormController);

    function pincodeFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            isDisabled: false,
        };
        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'generalmaster/PincodeMaster/GetPincodeMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
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

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }


        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'generalmaster/PincodeMaster/AddPincodeMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'generalmaster/PincodeMaster/UpdatePincodeMaster';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Country" },
                // { "Key": "State" },
                // { "Key": "District" },
                // { "Key": "City" },
             { "Key": "ActiveStatus" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // REACT BRIDGE (GeneralMaster / Pincode Master add-edit modal):
        // hollow-controller pattern -- real logic above (getItem/getItemCallback's
        // real GetPincodeMasterById call, saveandApprove()/saveItem()'s real
        // utl.Validator.validate + AddPincodeMaster/UpdatePincodeMaster calls,
        // backToList's real $uibModalInstance.close via confirmCallback, and
        // $scope.cancelCallback = $uibModalInstance.dismiss set above) is
        // completely untouched. Only getItemCallback needs wrapping -- unlike
        // City/State/District Master's forms, this screen's City/District/
        // State/Country fields are independent AutosearchSelect widgets that
        // resolve their own display name directly from their own real master
        // APIs, not from this controller's $scope.lookup (which only ever
        // fetches ActiveStatus, unused by this form's UI).
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: $scope.item
            };
        };

        var _origGetItemCallback = $scope.getItemCallback;
        $scope.getItemCallback = function (scope, data, options, hasError) {
            _origGetItemCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'fieldChange') {
                angular.extend($scope.item, payload);
                $scope.refreshReactProps();
                $scope.$applyAsync();
                return;
            }
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    pincodeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();