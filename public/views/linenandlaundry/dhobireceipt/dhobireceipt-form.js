(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DhobiReceiptFormController', DhobiReceiptFormController);

    function DhobiReceiptFormController($scope, $stateParams, $state, $translate, utl, $filter, Upload) {
        var vm = this;

        $scope.item = {
            FromFacilityId: utl.Session.getCurrentFacilityId(),
            ToFacilityId: utl.Session.getCurrentFacilityId(),
            IssuedById: utl.Session.getCurrentUserId(),
            FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            // ToDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            LinenStockTransferDate: utl.Formatter.getCurrentDate(),
            ReceivedDate: utl.Formatter.getCurrentDate(),

        };

        $scope.currentcontext = {};

        $scope.currentcontext.linenstocktransferid = parseInt($stateParams.id);
        $scope.issuebookDetails = [];
        $scope.issuebookInfo = [];

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                SNo: 0,
                LinenItemMasterId: 0,
                LinenItemName: '',
                LinenItemCode: '',
                IssuedQuantity: 0,
                RequestedQuantity: 0,
                AvailableQuantity: 0,
                ReceivedQuantity: 0,
                Status: 1,
            };

            $scope.issuebookDetails.push(lineItem);
            $scope.setIndexforTableIndex();
        };

        $scope.getDhobiissuebookInfo = function () {
            if ($scope.currentcontext.linenstocktransferid && $scope.currentcontext.linenstocktransferid > 0) {
                var options = {
                    action: 'LinenAndLaundry/LinenStockTransfer/GetLinenStockTransferById',
                    data: {
                        Id: $scope.currentcontext.linenstocktransferid
                    },
                    type: 'post',
                    onComplete: $scope.getDhobiissuebookInfoCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getDhobiissuebookInfoCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.ReceivedDate = utl.Formatter.getCurrentDate();
            if ($scope.item.LinenStockTransferStatusId == 1) {
                $scope.isDisabled = false;
            }
            if ($scope.item.LinenStockTransferStatusId == 2) {
                $scope.isDisabled = false;
            }
            if ($scope.item.LinenStockTransferStatusId == 3) {
                $scope.isDisabled = false;
            }
            if ($scope.item.LinenStockTransferStatusId == 4) {
                $scope.isDisabled = false;
            }
            if ($scope.item.LinenStockTransferStatusId == 5) {
                $scope.isDisabled = true;
            }
            if ($scope.item.LinenStockTransferStatusId == 6) {
                $scope.isDisabled = true;
            }
        };
        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.issuebookDetails) {
                if ($scope.issuebookDetails[idx].Status == 1) {
                    $scope.issuebookDetails[idx].SNo = SNo;
                    SNo++;
                }
            }
        };

        $scope.getdhobiissuebookDetailCallback = function (scope, res, options, hasError) {
            $scope.issueDetails = res.Data || [];
            for (var iddxitem in $scope.issueDetails) {
                var issuedqty = $scope.issueDetails[iddxitem];
                if (issuedqty.IssuedQuantity) {
                    issuedqty.ReceivedQuantity = issuedqty.IssuedQuantity;
                    $scope.issuebookDetails.push(issuedqty);
                }
            }

            $scope.addNewLineItem();
            $scope.setIndexforTableIndex();

        };

        $scope.getdhobiissuebookDetail = function () {
            if ($scope.currentcontext.linenstocktransferid && $scope.currentcontext.linenstocktransferid > 0) {
                var inputData = {
                    Params: [{ Key: 1, Value: $scope.currentcontext.linenstocktransferid }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'LinenAndLaundry/LinenStockTransferDetail/GetLinenStockTransferDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getdhobiissuebookDetailCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };



        //  LinenItemMaster Autosearch Start
        vm.linenitemmastercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'LinenItemMasterId', field: 'LinenItemMasterId', datatype: 'string', headercls: 'td-id', fieldcls: 'td-id' },
                { header: 'Code', field: 'LinenItemCode', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },
                { header: 'Name', field: 'LinenItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-code' },

            ],
            searchparams: {},
            result: {},
            api: 'linenandlaundry/linenitemmaster/GetLinenItemMaster',
            formatdisplay: formatselectedlinenitemmaster,
            presearch: presearchlinenitemmaster,
            postsearch: postsearchbincode
        };

        function formatselectedlinenitemmaster() {
            var selectedItem = vm.linenitemmastercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.LinenItemMasterId = selectedItem.Id;
                $scope.item.LinenItemCode = selectedItem.Code;
                $scope.item.LinenItemName = selectedItem.Name;
                // $scope.item.Code = selectedItem.Name;
                result = [selectedItem.LinenItemName].join(' ');
            } else if (vm.linenitemmastercontrolconfig.rowdata) {
                result = [vm.linenitemmastercontrolconfig.rowdata.LinenItemName].join(' ');
            }
            return result;
        }


        function presearchlinenitemmaster() {
            var query = vm.linenitemmastercontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            if (vm.linenitemmastercontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.linenitemmastercontrolconfig.searchparams = inputData;
        }

        function postsearchbincode() {
            for (var idx in vm.linenitemmastercontrolconfig.result) {
                var item = vm.linenitemmastercontrolconfig.result[idx];
                item.LinenItemMasterId = item.Id;
                item.LinenItemCode = item.Code;
                item.LinenItemName = item.Name;
            }
        }

        // LinenItemMaster Autosearch End


        /*autosearch starts */
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Doctor Id', field: 'UserId', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Doctor Name', field: 'UserName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Qualification', field: 'Qualification', datatype: 'string', headercls: 'td-Qualification', fieldcls: 'td-Qualification' },
                { header: 'Speciality', field: 'Speciality', datatype: 'string', headercls: 'td-dept', fieldcls: 'td-dept' },
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
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
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




        $scope.OnItemselected = function (idx, item) {
            var Itemobj = item.SelectedItem;
            item.LinenItemMasterId = Itemobj.Id;
            item.LinenItemCode = Itemobj.Code;
            item.LinenItemName = Itemobj.Name;
            item.Status = 1;
            var lastIndex = $scope.issuebookDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };


        $scope.clear = function () {
            $scope.issuebookDetails = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            $state.go('app.dhobireceiptform', { id: 0 });
        };
        $scope.linendashboard = function () {
            $state.go('app.linendashboard');
        };

        $scope.LoadData = function () {
            $scope.getDhobiissuebookInfo();
            $scope.getdhobiissuebookDetail();
        };


        $scope.receive = function () {
            $scope.item.LinenStockTransferStatusId = 5;
            $scope.saveItem();
        };
        $scope.cancel = function () {
            $scope.item.LinenStockTransferStatusId = 6;
            $scope.saveItem();
        };

        // $scope.saveandapprove = function () {
        //     $scope.item.LinenStockTransferStatusId = 5;
        //     $scope.saveItem();
        // };

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

                var actionName = 'LinenAndLaundry/LinenStockTransfer/AddLinenStockTransfer';
                if ($scope.currentcontext.linenstocktransferid && $scope.currentcontext.linenstocktransferid > 0) {
                    actionName = 'LinenAndLaundry/LinenStockTransfer/UpdateLinenStockTransfer';
                }

                var inputData = { Header: $scope.item, Details: lines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            for (var iddx in $scope.issuebookDetails) {
                var iddxitem = $scope.issuebookDetails[iddx];
                if (iddxitem.LinenItemMasterId > 0) {
                    if (iddxitem.LinenItemMasterId > 0 && iddxitem.IssuedQuantity == '') {
                        utl.Alert.showErrorMsg($translate.instant('linenandlaundry.dhobiissuebook.issueequantity.lbl'));
                        return false;
                    }
                }
                else {
                    utl.Alert.showErrorMsg($translate.instant('linenandlaundry.dhobiissuebook.pleaseselectatleastone.lbl'));
                    return false;
                }
                return true;
            }
        }

        $scope.deletedhobiissuebookDetail = function (SelectedItem, idx) {
            if (SelectedItem.LinenItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, SelectedItem, name);
            } else {
                utl.Alert.showErrorMsg('This one is Empty Row..');
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.setIndexforTableIndex();
        };



        $scope.backtolist = function () {
            $state.go('app.dhobireceipt');
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.issuebookDetails) {
                var item = $scope.issuebookDetails[idx];
                if (item.Id > 0) {
                    if (item.LinenItemMasterId > 0) {
                        result.push(item);
                    }
                } else {
                    if (item.LinenItemMasterId > 0 && item.Status == 1) {
                        result.push(item);
                    }
                }
            }

            return result;
        };



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.LoadData();
            // if ($scope.currentcontext.linenstocktransferid && $scope.currentcontext.linenstocktransferid > 0) {
            //     $scope.getDhobiissuebookInfo();
            // } else {
            //     $scope.addNewLineItem();
            // }
            //$scope.LoadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "Department" },
                { "Key": "ToFacility" },
                { "Key": "ToDepartment" },
                { "Key": "LinenStockTransferStatus" },
                // {
                //     "Key": "Department",
                //     Request: {
                //         Params: [
                //             { Key: 9, Value: true }
                //         ]
                //     }
                // },

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

    DhobiReceiptFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'Upload'];

})();