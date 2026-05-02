(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ABGParameterFormController', ABGParameterFormController);

    function ABGParameterFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
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
                    action: 'clinicalmaster/ABGParameters/GetABGParametersById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.addNew = function () {
            $state.go('app.allergies', { id: 0 });
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'clinicalmaster/ABGParameters/AddABGParameters';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'clinicalmaster/ABGParameters/UpdateABGParameters';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        // // ServiceItem autoSearch starts
        vm.serviceitemconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Department', field: 'Department', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/serviceitem/GetServiceItems',
            formatdisplay: formatselectedtest,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };
        function formatselectedtest() {
            var selectedItem = vm.serviceitemconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Name + '(' + selectedItem.ItemCode + ')'].join('  ');
            } else if (vm.serviceitemconfig.rowdata) {
                result = [vm.serviceitemconfig.rowdata.ItemCode, vm.serviceitemconfig.rowdata.Name].join(' ');
            }
            return result;
        }
        function presearchserviceitem() {
            var query = vm.serviceitemconfig.query;
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                    // { Key: 2, Value: $scope.item.DepartmentId },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.serviceitemconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }
            vm.serviceitemconfig.searchparams = inputData;
        }
        function postsearchserviceitem() {

            for (var idx in vm.serviceitemconfig.result) {
                var item = vm.serviceitemconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                item.Department = item.Department.DepartmentName;
            }
        };

        // $scope.ServiceItemChanged = function (idx, item) {
        //     var ServiceItemobj = item.SelectedItem;
        //     if (ServiceItemobj != null) {
        //         item.ItemCode = ServiceItemobj.ItemCode;
        //         item.ItemName = ServiceItemobj.Name;
        //         item.Description = ServiceItemobj.Description;
        //         var ServiceTraiffobj = $filter('filter')(ServiceItemobj.ServiceItemTariffDetails, true);
        //         if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
        //             item.OpTariff = ServiceTraiffobj[0].Rate;
        //             item.IpTariff = ServiceTraiffobj[1].Rate;
        //             item.InsuranceTariff = ServiceTraiffobj[8].Rate;
        //         }
        //     }
        // };
        // ServiceItem autoSearch ends
        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ParameterType" },
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

        $scope.initLookup();
    }

    ABGParameterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();