(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('costFormController', costFormController);

    function costFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        var vm = this;
        $scope.item = {
            DepartmentId: utl.Session.getCurrentDepartmentId(),
			 FacilityId:  utl.Session.getCurrentFacilityId(),
    

        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        //getitem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'CostManagement/CostDetail/GetCostDetailById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $state.go('app.costs');
        };
        $scope.addNew = function () {
            $state.go('app.costtab.details', { id: 0 });
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
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "boolean") {
                if (options && options.data != null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            }
            else if (typeof (data) == "number") {
                $state.go('app.costtab.details', { id: data });
            }
            else {
                $scope.backToList(); // Safer side added
            }
        };
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'CostManagement/CostDetail/AddCostDetail';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'CostManagement/CostDetail/UpdateCostDetail';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.clear = function () {
            $scope.item = {};
        };
        /* calculation starts */
        $scope.computetotalAmount = function (item) {
            item.TotalCost = item.FilmCost + item.StationaryCost + item.ConsumablesCost + item.OtherCost + item.MedicineCost;
        }
        $scope.computeAmount = function (item) {
            item.TotalStationedFixedCost = item.StationedFixedCost + item.StationedAMCCost + item.NotionalRent +
                item.Casette;
            item.TotalMobileFixedCost = item.MobileFixedCost + item.MobileAMCCost + item.NotionalRent + item.Casette;
        }

        $scope.computelabourAmount = function (item) {
            item.TotalLabourCost = item.TechnicianCost + item.NurseCost + item.DoctorCost + item.ExternalDoctorCost;
        }

        $scope.computetotalstationedAmount = function (item) {
            item.TotalStationedCost = item.TotalLabourCost + item.FilmCost + item.TotalStationedFixedCost + item.StationedPowerCost;
            item.StationedVariableCost = item.TotalLabourCost + item.FilmCost + item.StationedPowerCost;
        }
        $scope.computetotalmobileAmount = function (item) {
            item.TotalMobileCost = item.TotalLabourCost + item.FilmCost + item.MobileFixedCost + item.MobileAMCCost + item.NotionalRent + item.Casette + item.MobilePowerCost;
            item.MobileVariableCost = item.TotalLabourCost + item.TotalFilmCost + item.MobilePowerCost;
        }

        /* calculatien end */

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
        $scope.ServiceItemChanged = function (idx, item) {


            var ServiceItemobj = item.SelectedItem;
            if (ServiceItemobj != null) {
                item.ItemCode = ServiceItemobj.ItemCode;
                item.ItemName = ServiceItemobj.Name;
                item.Description = ServiceItemobj.Description;
                var ServiceTraiffobj = $filter('filter')(ServiceItemobj.ServiceItemTariffDetails, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.OpTariff = ServiceTraiffobj[0].Rate;
                    item.IpTariff = ServiceTraiffobj[1].Rate;
                    item.InsuranceTariff = ServiceTraiffobj[8].Rate;
                }
            }
        };
        // ServiceItem autoSearch ends
        function calculatetotalAmount() {
            for (var idx in $scope.purchaseorderDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.purchaseorderDetails[idx].GrossAmount).toFixed(2));
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "User" },
                { "Key": "CostType" },
                { "Key": "ActiveStatus" },

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
    costFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();