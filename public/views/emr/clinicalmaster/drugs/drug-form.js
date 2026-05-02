(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugFormController', drugFormController);

    function drugFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            IsCalculateFrequencyQty: true
        };

        $scope.currentcontext = {
            file: null
        };

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getdrugLogoCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Logo = data.Logo;
        };

        $scope.getdrugLogo = function () {
            if ($scope.item.LogoPath) {
                var inputData = { Id: $scope.item.Id, LogoPath: $scope.item.LogoPath };
                var options = {
                    action: 'clinicalmaster/DrugMaster/GetDrugLogo',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getdrugLogoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getdrugLogo();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'clinicalmaster/DrugMaster/GetDrugMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.drugs');
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'ALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('clinicalmaster.drug-form.excode.lbl'));
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $state.go('app.drugtab.details', { id: data });
            } else {
                $scope.backToList();
            }
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'clinicalmaster/DrugMaster/AddDrugMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/DrugMaster/UpdateDrugMaster';
            }
            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) {
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.backToList();
                },
                    function (resp) {
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        vm.genericcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Generic Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Allergen Type',
                field: 'AllergenType',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedgeneric,
            presearch: presearchgeneric,
            postsearch: postsearchgeneric
        };

        function formatselectedgeneric() {
            var selectedItem = vm.genericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.GenericId = selectedItem.Id;
                $scope.item.GenericCode = selectedItem.Code;
                $scope.item.GenericName = selectedItem.GenericName;
                $scope.item.ScheduleTypeId = selectedItem.ScheduleTypeId;
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('    ');
            } else if (vm.genericcontrolconfig.rowdata) {
                result = [vm.genericcontrolconfig.rowdata.GenericName, vm.genericcontrolconfig.rowdata.GenericCode].join(' ');
            }
            return result;
        }

        function presearchgeneric() {
            var query = vm.genericcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.genericcontrolconfig.searchbyid === true) {
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
            vm.genericcontrolconfig.searchparams = inputData;
        }

        function postsearchgeneric() {
            for (var idx in vm.genericcontrolconfig.result) {
                var item = vm.genericcontrolconfig.result[idx];
                item.Code = item.Code;
                item.GenericName = item.GenericName;
                if (item.AllergenType)
                    item.AllergenType = item.AllergenType.Description;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
            $scope.getMaxId();
        };

        $scope.getMaxId = function () {
            $scope.drugmasterclinicalcode =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'drugmasterclinicalcode');
            if ($scope.drugmasterclinicalcode && !$scope.currentcontext.id) {
                var options = {
                    action: 'clinicalmaster/DrugMaster/GetMaxId',
                    data: {
                        Id: 0
                    },
                    type: 'post',
                    onComplete: $scope.getMaxIdCallback
                };
                utl.Http.doAction(options);
            }
        };

        function ZeroPadding(num, size) {
            var s = num + "";
            while (s.length < size) s = "0" + s;
            return s;
        }

        $scope.getMaxIdCallback = function (scope, data, options, hasError) {
            var StartingNr = '0001';

            if (data)
                StartingNr = ZeroPadding(data, 4);

            $scope.drugmasterclinicalcodeprefix =
                utl.FacilitySetting.getFacilitySettingValue('autogenerationcode', 'drugmasterclinicalcodeprefix');
            if ($scope.drugmasterclinicalcodeprefix) {
                StartingNr = $scope.drugmasterclinicalcodeprefix + '' + StartingNr;
            }

            if (StartingNr)
                $scope.item.DrugCode = StartingNr;
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DrugType" },
                { "Key": "DrugTrade" },
                { "Key": "DrugForm" },
                { "Key": "DrugFrequency" },
                { "Key": "DrugRoute" },
                { "Key": "DrugGroup" },
                { "Key": "DrugSubGroup" },
                { "Key": "AuthenticationLevel" },
                { "Key": "DrugInstruction" },
                { "Key": "DurationPeriod" },
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
        $scope.item.ActiveFrom = utl.Formatter.getCurrentDate();
    }

    drugFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();