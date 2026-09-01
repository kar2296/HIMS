(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('promotionalSchemeFormController', promotionalSchemeFormController);

    function promotionalSchemeFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;
        uibButtonConfig.activeClass = "opt-selected";
        $scope.item = {
            GuarantorId: -1,
            PromotionSchemeId: -1,
            PromotionSchemeTypeId: -1,
            PromotionSchemeCode: '',
            PromotionSchemeName: '',
            ActiveFrom: utl.Formatter.getCurrentDate(),
            IsActive: true
        };

        $scope.Item = [];
        $scope.Details = [];
        $scope.ItemDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.option = 'category';
        $scope.options = [{
                key: 'category',
                name: $translate.instant('Category Type')
            },
            {
                key: 'item',
                name: $translate.instant('Item Type')
            }
        ]


        $scope.canShowCategoryList = function() {
            return $scope.currentcontext.option == 'category';
        };

        $scope.canShowItemList = function() {
            return $scope.currentcontext.option == 'item';
        };

        $scope.addDetail = function() {
            var serviceData = {
                Id: 0,
                ServiceItemId: 0,
                DiscountModeId: 2,
                Discount: 0,
                Status: 1,
            }
            $scope.ItemDetails.push(serviceData);
        }


        $scope.onPromotionalSchemeSelected = function(selecteditem) {
            $scope.item.PromotionSchemeCode = selecteditem.Code;
            $scope.item.PromotionSchemeName = selecteditem.Text;
        };
        $scope.selectAllItems = function() {
            for (var idx in $scope.Details) {
                var item = $scope.Details[idx];
                // if (!item.IsReadOnly) {
                item.IsSelected = $scope.currentcontext.selectall;
                item.IsAllOrderSelected = $scope.currentcontext.selectall;
                // }
            }
        }
        $scope.IsAllOrderSelectedChange = function(list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (item.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                } else if (!item.IsAllOrderSelected && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                    item.Discount = 0;
                }
            }
        }
        $scope.Populate = function() {
            if ($scope.item.DiscountModeId > 0) {
                var items = [];
                var items = $scope.Details[cidx];
                for (var cidx in $scope.Details) {
                    var items = $scope.Details[cidx];
                    items.ServiceCategoryId = items.ServiceCategoryId;
                    items.DiscountModeId = $scope.item.DiscountModeId;
                    items.Discount = Number($scope.item.Discount);
                    // items.IsAllOrderSelected = true;
                    items.Status = 1;
                    // $scope.Details.push(items);
                }
            }
            // $scope.selectAllItems();
        };

        $scope.getServiceCategorysCallback = function(scope, res, options, hasError) {
            var item = [];
            if (res.Data.length > 0) {
                res.Data.forEach((v, i) => {
                    var item = {
                        ServiceCategoryId: v.Id,
                        ServiceCategoryCode: v.ServiceCategoryCode,
                        ServiceCategoryName: v.ServiceCategoryName,
                        DiscountModeId: 2,
                        Discount: 0,
                        Status: 1,
                        IsAllOrderSelected: true,
                        // DiscountModeId:v.DiscountModeId,
                        // Discount: v.Discount,
                    };
                    $scope.Details.push(item);
                });
            }
        };
        $scope.backtoList = function() {
            $state.go('app.promotionalschemes');
        }
        $scope.getServiceCategorys = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    {
                        Key: 5,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 250,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/servicecategory/GetServiceCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getServiceCategorysCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getGuarantorPromotionalSchemeCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                var guarantorPromotionalScheme = res.Data[0];
                $scope.item.Id = guarantorPromotionalScheme.Id;
                $scope.item.GuarantorId = guarantorPromotionalScheme.GuarantorId;
                $scope.item.PromotionSchemeId = guarantorPromotionalScheme.PromotionSchemeId;
                $scope.item.PromotionSchemeTypeId = guarantorPromotionalScheme.PromotionSchemeTypeId;
                $scope.item.PromotionSchemeCode = guarantorPromotionalScheme.PromotionSchemeCode;
                $scope.item.PromotionSchemeName = guarantorPromotionalScheme.PromotionSchemeName;
                $scope.item.ActiveFrom = guarantorPromotionalScheme.ActiveFrom;
                $scope.item.ActiveTo = guarantorPromotionalScheme.ActiveTo;
                $scope.item.IsActive = guarantorPromotionalScheme.IsActive;
                $scope.item.Status = guarantorPromotionalScheme.Status;
                $scope.item.DiscountModeId = guarantorPromotionalScheme.DiscountModeId;
                $scope.item.Discount = guarantorPromotionalScheme.Discount;
                if (guarantorPromotionalScheme.GuarantorPromotionalSchemeDetails) {
                    for (var gpsdidx in guarantorPromotionalScheme.GuarantorPromotionalSchemeDetails) {
                        var gpsditem = guarantorPromotionalScheme.GuarantorPromotionalSchemeDetails[gpsdidx];
                        if (gpsditem.ServiceCategoryId > 0) {
                            $scope.Details.push(gpsditem);
                        }
                        if (gpsditem.ServiceItemId > 0) {
                            $scope.ItemDetails.push(gpsditem);
                        }
                    }
                }
            }
            $scope.getPromotionalSchemedetail();
        };

        $scope.getGuarantorPromotionalSchemes = function() {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }],
            };

            var options = {
                action: 'billing/PromotionalScheme/GetPromotionalSchemes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGuarantorPromotionalSchemeCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPromotionalSchemedetailCallback = function(scope, res, options, hasError) {
            for (var pdx in res.Data) {
                var schemeInfo = res.Data[pdx];
                if (schemeInfo.ServiceCategoryId > 0) {
                    $scope.Details.push(schemeInfo);
                }
                if (schemeInfo.ServiceItemId > 0) {
                    $scope.ItemDetails.push(schemeInfo);
                }
            }
        };

        $scope.getPromotionalSchemedetail = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    }, ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'billing/PromotionalSchemeDetail/GetPromotionalSchemeDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPromotionalSchemedetailCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.backToList = function () {
        //     $scope.confirmCallback();
        // };

        $scope.numberonly = function(e) {
            if ($.inArray(e.keyCode, [8, 9, 27, 13]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.clear = function() {
            $scope.ServiceCategoryDetails = [];
            $scope.item = {};
        };

        $scope.ServiceItemChanged = function(idx, item) {
            var ServiceItemobj = item.SelectedItem;
            item.ServiceItemCode = ServiceItemobj.ItemCode;
            item.ServiceItemName = ServiceItemobj.Name;
        }


        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Service Code',
                    field: 'ServiceCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Service Name',
                    field: 'ServiceName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },

            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        };

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
                Value: utl.Session.getCurrentFacilityId()
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                // if (otherservicemiddlesearch) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
                // }
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        };

        function postsearchserviceitem() {
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
            }
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
            $scope.backtoList();
        };

        $scope.saveItem = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var servicecategorys = [];
            var servicecategorys = getLinesForSave();

            var actionName = 'billing/PromotionalScheme/AddPromotionalScheme';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'billing/PromotionalScheme/UpdatePromotionalScheme';
            }

            $scope.item.GuarantorId = 1;

            var inputData = {
                Header: $scope.item,
                Details: servicecategorys
            };

            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            if ($scope.currentcontext.option == 'category') {
                for (var idx in $scope.Details) {
                    var item = $scope.Details[idx];
                    item.Status = 1;
                    if (item.Id > 0) {
                        if (item.ServiceCategoryId > 0) {
                            result.push(item);
                        }
                    } else {
                        if (item.ServiceCategoryId > 0 && item.Status == 1) {
                            result.push(item);
                        }
                    }
                }
            }
            if ($scope.currentcontext.option == 'item') {
                for (var idx in $scope.ItemDetails) {
                    var item = $scope.ItemDetails[idx];
                    item.Status = 1;
                    if (item.Id > 0) {
                        if (item.ServiceItemId > 0) {
                            result.push(item);
                        }
                    } else {
                        if (item.ServiceItemId > 0 && item.Status == 1) {
                            result.push(item);
                        }
                    }
                }
            }
            return result;
        }

        //React bridge: the four <ui-select> controls (Promotion Scheme Type and
        //three Discount Type selects) render through the shared
        //BridgeLookupSelectScreen. None had ng-change or ng-disabled in the
        //original. PRE-EXISTING QUIRK preserved: the three Discount Type
        //selects are all bound to the SAME model, item.DiscountModeId, so they
        //stay in lockstep exactly as they do today -- separate mounts, one
        //shared value.
        $scope.handleSchemeTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.PromotionSchemeTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleDiscountMode1Action = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.DiscountModeId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleDiscountMode2Action = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.DiscountModeId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleDiscountMode3Action = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.DiscountModeId = payload.id;
                $scope.refreshReactProps();
            }
        };

        $scope.refreshReactProps = function () {
            var lk = $scope.lookup || {};
            $scope.reactPropsSchemeTypeContainer = {
                reactProps: { options: lk.PromotionSchemeType || [], value: $scope.item.PromotionSchemeTypeId },
                onAction: $scope.handleSchemeTypeAction
            };
            $scope.reactPropsDiscountMode1Container = {
                reactProps: { options: lk.DiscountMode || [], value: $scope.item.DiscountModeId },
                onAction: $scope.handleDiscountMode1Action
            };
            $scope.reactPropsDiscountMode2Container = {
                reactProps: { options: lk.DiscountMode || [], value: $scope.item.DiscountModeId },
                onAction: $scope.handleDiscountMode2Action
            };
            $scope.reactPropsDiscountMode3Container = {
                reactProps: { options: lk.DiscountMode || [], value: $scope.item.DiscountModeId },
                onAction: $scope.handleDiscountMode3Action
            };
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            if ($scope.currentcontext.id > 0) {
                $scope.getGuarantorPromotionalSchemes();
            } else {
                $scope.getServiceCategorys();
            }
            $scope.refreshReactProps();
        };

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "ServiceCategory"
                },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "PromotionSchemeType"
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.refreshReactProps();
        $scope.initLookup();
    }

    promotionalSchemeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig'];

})();