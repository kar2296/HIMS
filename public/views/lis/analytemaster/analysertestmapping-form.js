(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AnalyserTestMappingFormController', AnalyserTestMappingFormController);

    function AnalyserTestMappingFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AnalyteCode: null,
            AnalyteName: null,
        };

        $scope.currentcontext = {};
        $scope.currentcontext.analyteid = parseInt($stateParams.id);
        $scope.item.AnalyteId = parseInt($stateParams.id);
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.lookup = {};
        $scope.lookup.SelectedAnalyzerTestName = [];


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getanalysename();
            if (data.ActiveStatusId == 2)
                $scope.item.isRequested = true;
            $state.params.AnalyteName = $scope.item.AnalyteCode + ' - ' + $scope.item.AnalyteName;
            presearchanalyte();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'lis/AnalyzerAnalyteMap/GetAnalyzerAnalyteMapById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.getAnalyteTitle = function (Seleted) {
        //     if (Seleted && Seleted.Text) {
        //         $state.params.AnalyteName = Seleted.Code + ' - ' + Seleted.Text;
        //         $scope.item.AnalyteCode = Seleted.Code;
        //         $scope.item.AnalyteName = Seleted.Text;
        //     }
        // };

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

        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'lis/AnalyzerAnalyteMap/AddAnalyzerAnalyteMap';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'lis/AnalyzerAnalyteMap/UpdateAnalyzerAnalyteMap';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getAnalyzerTestInfoCallback = function (scope, data, options, hasError) {
            if (data) {
                $scope.item.Code = data.Code;
                $scope.item.Name = data.Name;
                $scope.item.Description = data.Description;
                $scope.item.IsActive = true;
            } else {
                $scope.item.Code = "";
                $scope.item.Name = "";
                $scope.item.Description = "";
                $scope.item.IsActive = false;
            }
        };

        $scope.getAnalyzerTestInfo = function () {
            if ($scope.item.AnalyzerTestMasterId) {
                var options = {
                    action: 'lis/AnalyzerTest/GetAnalyzerTestById',
                    data: { Id: $scope.item.AnalyzerTestMasterId },
                    type: 'post',
                    onComplete: $scope.getAnalyzerTestInfoCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getanalysenameCallback = function (scope, data, options, hasError) {
            $scope.lookup.SelectedAnalyzerTestName = [];
            if (data && data.Data) {
                for (var idx in data.Data) {
                    for (var atidx in $scope.lookup.AnalyzerTestName) {
                        if ($scope.lookup.AnalyzerTestName[atidx].Id == data.Data[idx].Id) {
                            $scope.lookup.SelectedAnalyzerTestName.push($scope.lookup.AnalyzerTestName[atidx]);
                        }
                    }
                }
            }
        };
        $scope.getanalysename = function () {
            if ($scope.item.AssetId) {
                var inputData = {
                    Params: [
                        { Key: 4, Value: $scope.item.AssetId }
                    ]
                };
                var options = {
                    action: 'lis/AnalyzerTest/GetAnalyzerTests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getanalysenameCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getEquipmentCallback = function (scope, data, options, hasError) {
            $scope.item.AssetName = data.AssetName;
            $scope.item.AssetTypeId = data.AssetTypeId;
            $scope.getanalysename();
        }

        $scope.getEquipment = function () {
            $scope.item.AnalyzerTestMasterId = -1;
            $scope.item.Code = "";
            $scope.item.Name = "";
            $scope.item.Description = "";
            $scope.item.IsActive = false;
            if ($scope.item.AssetId && $scope.item.AssetId > 0) {
                var options = {
                    action: 'AssetManagement/Asset/GetAssetById',
                    data: { Id: $scope.item.AssetId },
                    type: 'post',
                    onComplete: $scope.getEquipmentCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.item.AssetName = "";
                $scope.item.AssetTypeId = -1;
            }
        }

        //AnalyteMaster related code starts
        vm.analytecontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'Code', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'Name', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Methodology', field: 'Methodology', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'lis/analytemaster/GetAnalytemasters',
            formatdisplay: formatselectedanalyte,
            presearch: presearchanalyte,
            postsearch: postsearchanalyte
        };

        function formatselectedanalyte() {
            var selectedItem = vm.analytecontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.Name;
                $state.params.AnalyteName = selectedItem.Code + ' - ' + selectedItem.Name;
                $scope.item.AnalyteCode = selectedItem.Code;
                $scope.item.AnalyteName = selectedItem.Name;

            } else if (vm.analytecontrolconfig.rowdata) {
                result = vm.analytecontrolconfig.rowdata.Name;
            }

            return result;
        }

        function presearchanalyte() {
            var query = vm.analytecontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.item.AnalyteId)
                inputData.Params.push({ Key: 0, Value: $scope.item.AnalyteId });

            if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.analytecontrolconfig.searchparams = inputData;
        }

        function postsearchanalyte() {
            for (var idx in vm.analytecontrolconfig.result) {
                var item = vm.analytecontrolconfig.result[idx];
                item.AnalyteId = item.Id;
                item.Code = item.Code;
                item.Name = item.Name;
                item.Methodology = item.Methodology;
            }
        }



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.AnalyteMaster = [];
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                { "Key": "AssetType" },
                // { "Key": "AnalyteMaster" },
                { "Key": "AnalyzerTestName" },
                {
                    "Key": "AssetName",
                    Request: {
                        Params: [
                            { Key: 16, Value: true }
                        ]
                    }
                },

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

    AnalyserTestMappingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();