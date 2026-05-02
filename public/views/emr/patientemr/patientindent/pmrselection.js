(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PmrSelectionController', PmrSelectionController);

    function PmrSelectionController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.PMRInfo = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.item = {};
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.storemasterid = modalConfig.params.storemasterid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.close = function() {
            $scope.confirmCallback();
        }

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.PMRInfo = res.Data || [];
            if ($scope.PMRInfo && $scope.PMRInfo.length > 0) {
                $scope.PMRInfo.forEach(pmr => {
                    $scope.item.Id = pmr.Id;
                    $scope.item.PMRId = pmr.Id;
                    $scope.item.PMRCode = pmr.PMRCode;
                    $scope.item.PMRName = pmr.PMRName;
                    $scope.item.PMRCategoryId = pmr.PMRCategoryId;
                    $scope.item.ProcedureId = pmr.ProcedureId;
                    $scope.item.ProcedureName = pmr.ProcedureName;
                    $scope.item.SpecialityId = pmr.SpecialityId;
                    $scope.item.FacilityId = pmr.FacilityId;
                    $scope.item.ActiveStatusId = pmr.ActiveStatusId;
                    $scope.item.IsActive = pmr.IsActive;
                    $scope.item.Status = pmr.Status;

                    $scope.pmrDetails = [];
                    $scope.pmrDetails = pmr.PMRDetails;
                    for (var pmridx in $scope.pmrDetails) {
                        var pmritem = $scope.pmrDetails[pmridx];
                        pmritem.ItemInfo = '';
                        if (pmritem.ItemMasterId > 0) {
                            if (pmritem.ItemMaster) {
                                pmritem.GenericName = pmritem.ItemMaster.GenericName;
                            }
                            if (pmritem.ItemMaster) {
                                pmritem.ItemInfo = pmritem.ItemMaster.ItemName + '(' + pmritem.ItemMaster.ItemCode + ')';
                            }
                            if (pmritem.ProductType) {
                                pmritem.ProductType = pmritem.ProductType.ProductTypeName;
                            }
                            if (pmritem.Quantity) {
                                pmritem.Quantity = parseInt(pmritem.Quantity);
                            }
                        }
                    }
                });
            }
        };

        $scope.getList = function(pageNo) {
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.currentfilter.PMRId
                    },
                    // {
                    //     Key: 6,
                    //     Value: $scope.currentcontext.storemasterid
                    // }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            }
            var options = {
                action: 'pharmacy/PMR/GetPMRs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.Load = function() {
            var selectedlines = $scope.pmrDetails;
            if (selectedlines.length > 0) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'pickdispenselist.confirmloadmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onLoadConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        $scope.onLoadConfirmed = function() {
            $scope.SelectedPmrlines = [];
            for (var idx in $scope.pmrDetails) {
                var item = $scope.pmrDetails[idx];
                if (item.Quantity > 0) {
                    $scope.SelectedPmrlines.push(item);
                }
            }
            var indentlines = $scope.SelectedPmrlines;

            $scope.confirmCallback({
                IndentData: indentlines
            });
        };

        $scope.getpmrCallback = function(scope, data, options, hasError) {
            $scope.lookup.PMR = data.PMR;
        }

        $scope.getpmrs = function() {
            var inputData = [{
                "Key": "PMR",
                Request: {
                    Params: [{
                            Key: 8,
                            Value: $scope.currentfilter.SpecialityId
                        }, {
                            Key: 4,
                            Value: 2
                        },
                        {
                            Key: 9,
                            Value: utl.Session.getCurrentFacilityId()
                        }
                    ]
                }
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpmrCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        };
        $scope.initLookup = function() {
            var inputData = [{
                "Key": "Department"
            }, {
                "Key": "PMR"
            }];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    PmrSelectionController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$uibModalInstance', 'modalConfig'];

})();