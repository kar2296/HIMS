(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemPriceController', itemPriceController);

    function itemPriceController($scope, $stateParams, $state, $translate, utl,$uibModalInstance, modalConfig) {
        var vm = this;

         $scope.lookup = {};

        $scope.currentcontext = {
           
            ismodal: modalConfig && modalConfig.params ? true : false
        };
         if (modalConfig && modalConfig.params) {
              $scope.currentcontext.id = modalConfig.params.id

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
       


        $scope.item = {
            IsActive: true,
            ActiveFrom: utl.Formatter.getCurrentDate(),
            PurchaseUomId: 1,
            RankId: 1
        };

        $scope.currentcontext = {};
        // $scope.currentcontext.itemmasterid = parseInt($stateParams.id);
        // $scope.currentcontext.id = parseInt($stateParams.itemvendormapid);
        // $scope.item.ItemCode = $state.params.ItemCode;
        // $scope.item.ItemName = $state.params.ItemName;
        // $scope.item.GstId = $state.params.GstId;
        // $scope.item.InGstId = $state.params.InGstId;
        // $scope.item.CGstId = $state.params.CGstId;
        // $scope.item.SGstId = $state.params.SGstId;
        // $scope.item.RDODiscountMode = false;
        // $scope.item.RDODiscount = true;
        // $scope.item.GstDisable = true;
        // var IsProfile = $state.params.IsProfile;
        // var ItemCode = $state.params.ItemCode;
        // var ItemName = $state.params.ItemName;
        // var GstId = $state.params.GstId;

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            // $scope.item.InGstId = $state.params.InGstId;
            // $scope.item.CGstId = $state.params.CGstId;
            // $scope.item.SGstId = $state.params.SGstId;
            $scope.item.GstDisable = true;
        };

        $scope.OnSelectGst = function(selectedItem) {
            $scope.item.GstCode = selectedItem.GstCode;
            $scope.item.GstName = selectedItem.Text;
            $scope.item.GstPercentage = selectedItem.GstPercentage;
        };

        $scope.OnSelectPurchaseUOM = function(selectedItem) {
            $scope.item.PurchaseUomCode = selectedItem.UomCode;
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/itemmaster/GetItemVendorMapById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function() {
            $state.go('app.itemmastertab.itemmastervendormappings');
        };

        

        $scope.save = function() {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function() {

            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            $scope.item.ItemMasterId = $scope.currentcontext.itemmasterid;
            var actionName = 'pharmacy/itemmaster/AddItemVendorMap';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/itemmaster/UpdateItemVendorMap';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);


        };
        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [
                { header: 'Vendor Code', field: 'VendorCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Vendor Name', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Vendor Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.VendorName;
                $scope.item.VendorCode = selectedItem.VendorCode;
                $scope.item.VendorName = selectedItem.VendorName;
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 1 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {

                var item = vm.vendorcontrolconfig.result[idx];

                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.VendorMaster = IsProfile ? $scope.lookup.VendorMaster : $scope.lookup.VendorMaster;
            $scope.getItem();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "UomMaster"
                },
                {
                    "Key": "GstMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "STATUS"
                },
                {
                    "Key": "Rank"
                },
                {
                    "Key": "DiscountMode"
                },
                { "Key": "VendorMaster", Request: { Params: [{ Key: 3, Value: 1 }] } }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onVendorSelected = function(selectedItem) {
            if (IsProfile) {
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.VendorCode = selectedItem.VendorCode;
            } else {
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.VendorCode = selectedItem.VendorCode;
            }
        };

        $scope.OnSelectDiscountMode = function(selecteditem) {
            if (selecteditem.Id > 0) {
                $scope.item.DiscountModeCode = selecteditem.Text;
                $scope.item.RDODiscount = false;
                selecteditem.RDODiscountMode = true;
            } else {
                $scope.item.DiscountModeCode = selecteditem.Text;
                $scope.item.RDODiscount = true;
                selecteditem.RDODiscountMode = false;
            }
        };

        $scope.initLookup();
    }

    itemPriceController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();