(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('WorkOrderFormController', WorkOrderFormController);

    function WorkOrderFormController($scope, $stateParams, $state, $translate, utl, $filter, Upload) {
        var vm = this;

        $scope.item = {
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            InvWorkorderDate: utl.Formatter.getCurrentDate(),
            RaisedBy: utl.Session.getCurrentUserId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,

        };
        $scope.data = {};
        $scope.lookup = {};
        $scope.isDisabled = false;
        $scope.currentcontext = {};
        $scope.currentcontext.InvWorkorderid = parseInt($stateParams.id);
        $scope.invworkorderDetails = [];
        $scope.invworkorderInfo = [];

        $scope.onHeadSelected = function (selectedItem) {
            console.log($scope.item.ParticularId);
            for (var idx in $scope.invworkorderDetails) {
                // if ($scope.item.ParticularId == 2) {
                //     $scope.invworkorderDetails[idx].ParticularId = $scope.item.ParticularId;
                // }
                $scope.invworkorderDetails[idx].ParticularId = $scope.item.ParticularId;
            }
        };
        $scope.OnSelectGsttransportcharges = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.TransportChargesGstId = gstitem.Id;
            item.TransportChargesGstPercentage = gstitem.GstPercentage;
            $scope.computeTransportGstAmountCharges(item);
        };
        $scope.computeTransportGstAmountCharges = function (item) {
            $scope.TransportCharges = 0;
            $scope.TransportGstAmount = 0;
            if (item.TransportChargesGstId > 0) {
                item.TransportChargesGstId = item.TransportChargesGstId;
                item.OtherChargesGstPercentage = parseFloat(item.OtherChargesGstPercentage);
            }
            if (parseFloat(item.TransportCharges) > 0)
                $scope.TransportCharges = parseFloat(item.TransportCharges || 0);
            $scope.TransportGstAmount = (parseFloat(item.TransportCharges || 0) / 100) * parseFloat(item.TransportChargesGstPercentage || 0).toFixed(2);
            $scope.item.TransportChargesGstAmount = $scope.TransportGstAmount;
            $scope.TransportCharges = (parseFloat($scope.item.TransportChargesGstAmount) + parseInt(item.TransportCharges));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            // $scope.item.OtherChargesGstAmount = 0
            $scope.calculatetotalamt();
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
            // $scope.item.TotalAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
        };
        $scope.OnSelectGst = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.GstId = gstitem.Id;
            item.GstName = gstitem.Text;
            item.GstPercentage = gstitem.GstPercentage;
            if (gstitem.ChildGstId) {
                item.CGstId = gstitem.ChildGstId;
                item.CGstPercentage = gstitem.ChildGst.GstPercentage;
                item.SGstId = gstitem.ChildGstId;
                item.SGstPercentage = gstitem.ChildGst.GstPercentage;
            }
            $scope.calculatetotalAmount(item);
        };
        $scope.addNewLineItem = function () {
            var WorkorderItem = {
                Id: 0,
                SNo: 0,
                ParticularId: $scope.item.ParticularId,
                Particulars: '',
                Quantity: '',
                SACCode: '',
                Amount: '',
                DiscountModeId: 2,
                Discount: 0,
                NetAmount: '',
                Remarks: '',
                Status: 1,
            };

            $scope.invworkorderDetails.push(WorkorderItem);
            // $scope.setIndexforTableIndex();
        };
        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.grn.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.InvWorkorderStatusId = 6;
            $scope.saveItem();
        };

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Vendor Code',
                    field: 'VendorCode',
                    datatype: 'string',
                    headercls: 'td-vendorcode',
                    fieldcls: 'td-vendorcode'
                },
                {
                    header: 'Vendor Name',
                    field: 'VendorName',
                    datatype: 'string',
                    headercls: 'td-vendorname',
                    fieldcls: 'td-vendorname'
                }
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
                $scope.item.VendorId = selectedItem.VendorMasterId;
                $scope.item.VendorCode = selectedItem.VendorCode;
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.MobileNumber = selectedItem.MobileNumber;
                $scope.item.EmailAddress = selectedItem.EmailAddress;
                $scope.item.PaymentTermsId = selectedItem.PaymentTermsId;
                $scope.item.PANNo = selectedItem.PANNo;
                $scope.item.GSTNo = selectedItem.GSTNo;
                $scope.item.TANNo = selectedItem.TANNo;
                $scope.item.AddressLine1 = selectedItem.AddressLine1;
                $scope.item.AddressLine2 = selectedItem.AddressLine2;
                $scope.item.AddressLine3 = selectedItem.AddressLine3;
                result = [selectedItem.VendorName + '(' + selectedItem.VendorCode + ')'].join('    ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
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
            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.VendorId
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
            }
        }

        $scope.getinvworkorderInfo = function () {
            if ($scope.currentcontext.InvWorkorderid && $scope.currentcontext.InvWorkorderid > 0) {
                var options = {
                    action: 'pharmacy/InvWorkorder/GetInvWorkorderById',
                    data: {
                        Id: $scope.currentcontext.InvWorkorderid
                    },
                    type: 'post',
                    onComplete: $scope.getinvworkorderInfoCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getinvworkorderInfoCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.ParticularId = $scope.item.ParticularId;
            if ($scope.item.InvWorkorderStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.isDisabled = false;
                $scope.item.DisplayRequestStatus = 'Draft';
            }
            if ($scope.item.InvWorkorderStatusId == 2) {
                $scope.item.isDisabled = false;
                $scope.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Ordered';
            }
            if ($scope.item.InvWorkorderStatusId == 3) {
                $scope.item.isDisabled = false;
                $scope.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Approved';
            }
            $scope.calculatetotalAmount(item);
        };
        $scope.calculatetotalAmount = function (item) {

            if (item.Particulars != '' && parseInt(item.Quantity) > 0 && item.Status == 1) {
                if (item.DiscountModeId == 1) {
                    item.DiscountAmount = item.Discount;
                }
                if (item.DiscountModeId == 2) {
                    item.DiscountAmount = (parseFloat(item.Amount) / 100) * parseFloat(item.Discount);
                }
                item.GrossAmount = parseFloat(item.Amount) * parseInt(item.Quantity);
                // item.TaxAmount = (parseFloat(item.Amount) / 100) * parseFloat(item.GstPercentage || 0).toFixed(2);
                // item.GstAmount = (parseFloat(item.TaxAmount) * parseInt(item.Quantity));
                item.DisAmount = (parseFloat(item.DiscountAmount || 0) * parseInt(item.Quantity));
                item.AfterdiscountAmount = parseFloat(item.GrossAmount) - parseInt(item.DisAmount || 0);
                item.TaxAmount = (parseFloat(item.AfterdiscountAmount) / 100) * parseFloat(item.GstPercentage || 0).toFixed(2);
                item.GstAmount = (parseFloat(item.TaxAmount) * parseInt(item.Quantity));
                item.NetAmount = parseFloat(item.GrossAmount) + parseFloat(item.TaxAmount || 0) - parseFloat(item.DisAmount || 0);
                // item.NetAmount = parseFloat(item.AfterdiscountAmount) + parseFloat(item.GstAmount || 0);

                $scope.TotalGrossAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalNetAmount = 0;
                // if (!item.Amount) {
                //     $scope.AddNewRow();
                // }
                $scope.calculatetotalamt();
            }
        }

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }
        $scope.calculatetotalamt = function () {
            if ($scope.item.OtherCharges) {
                $scope.OtherCharges = $scope.item.OtherCharges;
            } else {
                $scope.OtherCharges = 0;
            }
            if ($scope.item.TransportCharges) {
                $scope.TransportCharges = $scope.item.TransportCharges;
            } else {
                $scope.TransportCharges = 0;
            }
            if ($scope.item.OtherChargesGstAmount > 0) {
                $scope.OtherChargesGstAmount = $scope.item.OtherChargesGstAmount;
            } else {
                $scope.OtherChargesGstAmount = 0
            }
            if ($scope.item.TransportChargesGstAmount > 0) {
                $scope.TransportChargesGstAmount = $scope.item.TransportChargesGstAmount;
            } else {
                $scope.TransportChargesGstAmount = 0
            }
            // if ($scope.item.RoundOff === '-' || $scope.item.RoundOff === '') {
            //     $scope.RoundOff = 0;
            // } else {
            //     $scope.RoundOff = parseFloat($scope.item.RoundOff);
            // }
            for (var idx in $scope.invworkorderDetails) {
                var activeitem = $scope.invworkorderDetails[idx];
                if (activeitem.ParticularId > 0 && parseFloat(activeitem.Quantity) > 0 && activeitem.Status == 1) {
                    if ($scope.TotalGrossAmount === null) {
                        $scope.TotalGrossAmount = 0;
                    }
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeitem.GrossAmount).toFixed(2));
                    if ($scope.TotalGstAmount === null) {
                        $scope.TotalGstAmount = 0;
                    }
                    // $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + (activeitem.TaxAmount * activeitem.Quantity)).toFixed(2));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + (activeitem.TaxAmount)).toFixed(2));
                    if ($scope.TotalDiscountAmount === null) {
                        $scope.TotalDiscountAmount = 0;
                    }
                    $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + (activeitem.DiscountAmount * activeitem.Quantity)).toFixed(2));
                    if ($scope.TotalNetAmount === null) {
                        $scope.TotalNetAmount = 0;
                    }
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + (activeitem.NetAmount)).toFixed(2));
                    $scope.TotalNetAmounts = $scope.TotalNetAmount + ($scope.OtherCharges || 0) + ($scope.OtherChargesGstAmount || 0) + ($scope.TransportCharges || 0) + ($scope.TransportChargesGstAmount || 0);

                    //Auto RoundOff
                    $scope.currentcontext.TotNetAmount = parseFloat($scope.TotalNetAmounts);

                    var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
                    var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
                    var NetRoundOffValue = 0;
                    if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                        $scope.currentcontext.TotNetAmount = NetNaturalValue;
                        NetRoundOffValue = -1 * (NetDecimalValue / 100);
                        $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                    } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                        $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                        NetRoundOffValue = (100 - NetDecimalValue) / 100;
                        $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                    } else {
                        NetRoundOffValue = 0;
                        $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                    }
                    $scope.RoundOff = $scope.item.TotRndoffAmt;
                    $scope.TotalNetAmounts = $scope.TotalNetAmounts + $scope.RoundOff;
                    //Auto RoundOff
                }
                $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
                $scope.item.TotalGstAmount = $scope.TotalGstAmount;
                $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount;
                $scope.item.TotalNetAmount = $scope.TotalNetAmounts;
                $scope.item.TotalAmount = $scope.TotalNetAmounts;
            }

        }
        $scope.computeforgivenDiscount = function (item) {
            if (item.DiscountModeId == 1) {
                item.DiscountAmount = item.Discount;
            }
            if (item.DiscountModeId == 2) {
                item.DiscountAmount = (parseFloat(item.Amount) / 100) * parseFloat(item.Discount);
            }
            $scope.calculatetotalAmount(item);

        };
        $scope.OnSelectGstothercharges = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.OtherChargesGstId = gstitem.Id;
            item.OtherChargesGstPercentage = gstitem.GstPercentage;
            $scope.computeOtherGstAmountCharges(item);
        };
        $scope.computeOtherGstAmountCharges = function (item) {
            $scope.OtherCharges = 0;
            $scope.OCGstAmount = 0;
            if (item.OtherChargesGstId > 0) {
                item.OtherChargesGstId = item.OtherChargesGstId;
                item.OtherChargesGstPercentage = parseFloat(item.OtherChargesGstPercentage);
            }
            if (parseFloat(item.OtherCharges) > 0)
                $scope.OtherCharges = parseFloat(item.OtherCharges || 0);
            $scope.OCGstAmount = (parseFloat(item.OtherCharges || 0) / 100) * parseFloat(item.OtherChargesGstPercentage || 0).toFixed(2);
            $scope.item.OtherChargesGstAmount = $scope.OCGstAmount;
            $scope.OtherCharges = (parseFloat($scope.item.OtherChargesGstAmount) + parseInt(item.OtherCharges));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            // $scope.item.OtherChargesGstAmount = 0
            $scope.calculatetotalamt();
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
            // $scope.item.TotalAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
        };
        $scope.computeOtherCharges = function (item) {
            // $scope.OtherCharges = 0;
            // $scope.OCGstAmount = 0;
            // if (parseFloat(item.OtherCharges) > 0)
            //     $scope.OtherCharges = parseFloat(item.OtherCharges);
            // $scope.item.OtherChargesGstAmount = (parseFloat(item.OtherCharges) / 100) * parseFloat(item.OtherChargesGstPercentage || 0).toFixed(2);
            // $scope.OtherCharges = (parseFloat($scope.item.OtherChargesGstAmount) + parseInt(item.OtherCharges));

            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + $scope.OtherCharges;
            // $scope.item.TotalAmount = $scope.TotalNetAmount + $scope.OtherCharges;
            if (item.OtherCharges === undefined || item.OtherCharges === null)
                $scope.item.OtherCharges = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            // $scope.RoundOff = 0;
            $scope.calculatetotalamt();
        };
        $scope.computeOtherGstAmountCharges = function (item) {
            $scope.OtherCharges = 0;
            $scope.OCGstAmount = 0;
            if (item.OtherChargesGstId > 0) {
                item.OtherChargesGstId = item.OtherChargesGstId;
                item.OtherChargesGstPercentage = parseFloat(item.OtherChargesGstPercentage);
            }
            if (parseFloat(item.OtherCharges) > 0)
                $scope.OtherCharges = parseFloat(item.OtherCharges || 0);
            $scope.OCGstAmount = (parseFloat(item.OtherCharges || 0) / 100) * parseFloat(item.OtherChargesGstPercentage || 0).toFixed(2);
            $scope.item.OtherChargesGstAmount = $scope.OCGstAmount;
            $scope.OtherCharges = (parseFloat($scope.item.OtherChargesGstAmount) + parseInt(item.OtherCharges));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            // $scope.RoundOff = 0;
            // $scope.item.OtherChargesGstAmount = 0
            $scope.calculatetotalamt();
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
            // $scope.item.TotalAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
        };
        // $scope.computeRoundoff = function (item) {
        //     $scope.RoundOff = 0;
        //     if (parseFloat(item.RoundOff) > 0)
        //         $scope.RoundOff = parseFloat(item.RoundOff);

        //     $scope.item.TotalNetAmount = $scope.TotalNetAmount + $scope.RoundOff;
        //     $scope.item.TotalAmount = $scope.TotalNetAmount + $scope.RoundOff;
        // };
        $scope.computeRoundOff = function (item) {
            if (item.RoundOff === undefined || item.RoundOff === null) {
                $scope.item.RoundOff = 0;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            $scope.calculatetotalamt();
        };
        $scope.computeTransportCharges = function (item) {
            // $scope.TransportCharges = 0;
            // if (parseFloat(item.TransportCharges) > 0)
            //     $scope.TransportCharges = parseFloat(item.TransportCharges);

            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + $scope.TransportCharges;
            // $scope.item.TotalAmount = $scope.TotalNetAmount + $scope.TransportCharges;
            if (item.TransportCharges === undefined || item.TransportCharges === null)
                $scope.item.TransportCharges = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.calculatetotalamt();
        };

        $scope.getinvworkorderDetailCallback = function (scope, res, options, hasError) {
            $scope.invworkorderDetails = res.Data || [];
            $scope.addNewLineItem();
            // $scope.setIndexforTableIndex();

        };

        $scope.getinvworkorderDetail = function () {
            if ($scope.currentcontext.InvWorkorderid && $scope.currentcontext.InvWorkorderid > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.InvWorkorderid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'pharmacy/InvWorkorderDetail/GetInvWorkorderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getinvworkorderDetailCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.AddNewRow = function () {
            for (var idx in $scope.invworkorderDetails) {
                if ($scope.invworkorderDetails[idx].ParticularId > 0) {
                    $scope.addNewLineItem();
                }
            }
        };


        $scope.clear = function () {
            $scope.invworkorderDetails = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            $state.go('app.invworkorderform', {
                id: 0
            });
        };

        $scope.LoadData = function () {
            $scope.getinvworkorderInfo();
            $scope.getinvworkorderDetail();
        };


        $scope.save = function () {
            $scope.item.InvWorkorderStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandapprove = function () {
            if (!$scope.item.VendorMasterId) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Supplier'));
                return false;
            }
            $scope.item.InvWorkorderStatusId = 3;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backtolist();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'pharmacy/InvWorkorder/AddInvWorkorder';
                if ($scope.currentcontext.InvWorkorderid && $scope.currentcontext.InvWorkorderid > 0) {
                    actionName = 'pharmacy/InvWorkorder/UpdateInvWorkorder';
                }

                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            for (var iddx in $scope.invworkorderDetails) {
                var iddxitem = $scope.invworkorderDetails[iddx];
                if (iddxitem.Particulars == '') {
                    utl.Alert.showErrorMsg($translate.instant('Please Select Particulars...'));
                    return false;
                }

                return true;
            }
        }

        $scope.deleteinvworkorderDetail = function (SelectedItem, idx) {
            if (SelectedItem.Particulars != '') {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, SelectedItem, name);
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            $scope.RoundOff = 0;
            $scope.item.OtherChargesGstAmount = 0;
            $scope.calculatetotalamt();
            // else {
            //     utl.Alert.showErrorMsg('This one is Empty Row..');
            // }
        };



        $scope.backtolist = function () {
            $state.go('app.invworkorderlist');
        };

        $scope.numberwithdecimal = function (e) {
            if ((e.charCode >= 48 && e.charCode <= 57) || (e.charCode == 46)) {
                return;
            } else
                e.preventDefault();
        }

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.invworkorderDetails) {
                var item = $scope.invworkorderDetails[idx];
                //if (item.Id > 0) {
                if (item.Particulars != '') {
                    result.push(item);
                }
                //}
            }

            return result;
        };

        /*autosearch starts */
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'UserId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'UserName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
                    vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        /*autosearch starts */

        $scope.withheaderprintInventoryWorkorder = function () {
            var inputData = {
                Id: $scope.currentcontext.InvWorkorderid
            };
            var options = {
                action: 'pharmacy/InvWorkorder/PrintInvWorkOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };
        $scope.withoutheaderprintInventoryWorkorder = function () {
            var inputData = {
                Id: $scope.currentcontext.InvWorkorderid
            };
            var options = {
                action: 'pharmacy/InvWorkorder/PrintwithoutInvWorkOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //    
        //     // if ($scope.currentcontext.InvWorkorderid && $scope.currentcontext.InvWorkorderid > 0) {
        //     //     $scope.getinvworkorderInfo();
        //     // } else {
        //     //     $scope.addNewLineItem();
        //     // }
        //     //$scope.LoadData();
        // }; $scope.LoadData();
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                }
            });
            $scope.LoadData();
        };
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Department"
                },
                {
                    "Key": "InvWorkorderStatus"
                },
                {
                    "Key": "InvWorkorderType"
                },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                                Key: 1,
                                Value: utl.Session.getCurrentUserId()
                            },
                            {
                                Key: 2,
                                Value: $scope.item.FacilityId
                            },
                            {
                                Key: 5,
                                Value: 2
                            }
                        ]
                    },
                    Default: false
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "Particular"
                },
                {
                    "Key": "PaymentTerms"
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
                            },
                            // { Key: 8, Value: true }
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
        };

        $scope.initLookup();
    }

    WorkOrderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'Upload'];

})();