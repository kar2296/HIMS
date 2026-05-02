(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LinenStockEntryFormController', LinenStockEntryFormController);

    function LinenStockEntryFormController($scope, $stateParams, $state, $translate, utl, $filter, Upload) {
        var vm = this;

        $scope.item = {
            // FromFacilityId: utl.Session.getCurrentFacilityId(),
            // ToFacilityId: utl.Session.getCurrentFacilityId(),
            ApprovedBy: utl.Session.getCurrentUserId(),
            EnteredBy: utl.Session.getCurrentUserId(),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            EnteredDate: utl.Formatter.getCurrentDate(),

        };

        $scope.currentcontext = {};

        $scope.currentcontext.LinenStockEntryid = parseInt($stateParams.id);
        $scope.stockentryDetails = [];
        $scope.stockentryInfo = [];

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                SNo: 0,
                LinenItemMasterId: 0,
                LinenItemName: '',
                LinenType: '',
                Quantity: 0,
                Price: 0,
                Amount: 0,
                Status: 1,
            };

            $scope.stockentryDetails.push(lineItem);
            $scope.setIndexforTableIndex();
        };

        $scope.getstockentryInfo = function () {
            if ($scope.currentcontext.LinenStockEntryid && $scope.currentcontext.LinenStockEntryid > 0) {
                var options = {
                    action: 'LinenAndLaundry/LinenStockEntry/GetLinenStockEntryById',
                    data: {
                        Id: $scope.currentcontext.LinenStockEntryid
                    },
                    type: 'post',
                    onComplete: $scope.getstockentryInfoCallback
                };
                utl.Http.doAction(options);
            }
            else {
                $scope.applyVisibilityRules();
            }
        };


        $scope.getstockentryInfoCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.LinenStockEntryStatusId == 1) {
                $scope.isDisabled = false;
            }
            if ($scope.item.LinenStockEntryStatusId == 2) {
                $scope.isDisabled = true;
            }
            if ($scope.item.LinenStockEntryStatusId == 3) {
                $scope.isDisabled = true;
            }
            $scope.applyVisibilityRules();
        };
        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.stockentryDetails) {
                if ($scope.stockentryDetails[idx].Status == 1) {
                    $scope.stockentryDetails[idx].SNo = SNo;
                    SNo++;
                }
            }
        };

        $scope.getstockentryDetailCallback = function (scope, res, options, hasError) {
            $scope.stockentryDetails = res.Data || [];
            $scope.addNewLineItem();
            $scope.setIndexforTableIndex();

        };

        $scope.getstockentryDetail = function () {
            if ($scope.currentcontext.LinenStockEntryid && $scope.currentcontext.LinenStockEntryid > 0) {
                var inputData = {
                    Params: [{ Key: 1, Value: $scope.currentcontext.LinenStockEntryid }],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'LinenAndLaundry/LinenStockEntryDetail/GetLinenStockEntryDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getstockentryDetailCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.computeAmount = function (item) {
            if (parseInt(item.Quantity) > 0) {
                item.TotalQuantity = parseInt(item.Quantity);
                item.Amount = parseFloat((parseFloat(item.Price) * parseInt(item.Quantity)).toFixed(4));
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
            item.LinenItemName = Itemobj.Name;
            item.LinenType = Itemobj.LinenType.Description;

            item.Status = 1;
            var lastIndex = $scope.stockentryDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };


        $scope.clear = function () {
            $scope.stockentryDetails = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            $state.go('app.linenstockentryform', { id: 0 });
        };
        $scope.linendashboard = function () {
            $state.go('app.linendashboard');
        };

        $scope.LoadData = function () {
            $scope.getstockentryInfo();
            $scope.getstockentryDetail();
        };


        $scope.onSaveConfirmed = function () {
            $scope.item.LinenStockEntryStatusId = 1;
            $scope.saveItem();
        };

        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'linenandlaundry.linenstockentry.save.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.onsaveandapproveConfirmed = function () {
            $scope.item.LinenStockEntryStatusId = 2;
            $scope.saveItem();
        };
        $scope.saveandapprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'linenandlaundry.linenstockentry.saveandapprove.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onsaveandapproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.onsaveandauthorizedConfirmed = function () {
            $scope.item.LinenStockEntryStatusId = 3;
            $scope.saveItem();
        };
        $scope.saveandauthorized = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'linenandlaundry.linenstockentry.saveandauthorized.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onsaveandauthorizedConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.LinenStockEntryid = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.LinenStockEntryid = data;
            }
            $scope.LoadData();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'LinenAndLaundry/LinenStockEntry/AddLinenStockEntry';
                if ($scope.currentcontext.LinenStockEntryid && $scope.currentcontext.LinenStockEntryid > 0) {
                    actionName = 'LinenAndLaundry/LinenStockEntry/UpdateLinenStockEntry';
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

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.LinenStockEntryStatusId != 1 || $scope.item.LinenStockEntryStatusId != 2 || $scope.item.LinenStockEntryStatusId != 3 || $scope.item.LinenStockEntryStatusId != 4) {
                $scope.canShowsaveBtn = true;
                $scope.canShowsaveandapprovedBtn = true;
                $scope.canShowsaveandauthorizedBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;


            }
            if ($scope.item.LinenStockEntryStatusId == 1) {
                $scope.canShowsaveBtn = false;
                $scope.canShowsaveandapprovedBtn = true;
                $scope.canShowsaveandauthorizedBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.LinenStockEntryStatusId == 2) {
                $scope.canShowsaveBtn = false;
                $scope.canShowsaveandapprovedBtn = false;
                $scope.canShowsaveandauthorizedBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            if ($scope.item.LinenStockEntryStatusId == 3) {
                $scope.canShowsaveBtn = false;
                $scope.canShowsaveandapprovedBtn = false;
                $scope.canShowsaveandauthorizedBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
        }

        function checkMandatoryFields() {
            for (var iddx in $scope.stockentryDetails) {
                var iddxitem = $scope.stockentryDetails[iddx];
                if (iddxitem.LinenItemMasterId > 0) {
                    if (iddxitem.LinenItemMasterId > 0 && iddxitem.Quantity == '') {
                        utl.Alert.showErrorMsg($translate.instant('linenandlaundry.linenstockentry.plsselectquantity.lbl'));
                        return false;
                    }
                }
                else {
                    utl.Alert.showErrorMsg($translate.instant('linenandlaundry.linenstockentry.pleaseselectatleastone.lbl'));
                    return false;
                }
                return true;
            }
        }

        $scope.deletestockentryDetail = function (SelectedItem, idx) {
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
            $state.go('app.linenstockentry');
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.stockentryDetails) {
                var item = $scope.stockentryDetails[idx];
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
            // if ($scope.currentcontext.LinenStockEntryid && $scope.currentcontext.LinenStockEntryid > 0) {
            //     $scope.getstockentryInfo();
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
                { "Key": "StockEntryStatus" },
                { "Key": "LinenType" },

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

    LinenStockEntryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'Upload'];

})();