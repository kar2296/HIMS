(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugAdministerController', drugAdministerController);

    function drugAdministerController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.CanShowSaveApprove = false;
        $scope.CanShowHold = false;
        $scope.CanShowDiscontinue = false;
        $scope.CanDisable = false;

        $scope.currentcontext.Id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.lookup = {};

        $scope.item = {};
        $scope.item.Id = 0;
        $scope.item.PrescriptionId = 0;
        $scope.item.DrugId = 0;
        $scope.item.DrugCode = '';
        $scope.item.DrugName = '';

        $scope.item.ItemMasterId = 0;
        $scope.item.ItemCode = '';
        $scope.item.ItemName = '';

        $scope.item.Dosage = 0;
        $scope.item.Frequency = '';
        $scope.item.Duration = 0;
        $scope.item.DurationInfo = '';

        $scope.item.CreatedAt = null;
        $scope.item.PrescribedDate = null;
        $scope.item.PrescribedBy = '';
        $scope.item.AdministeredStatus = '';
        $scope.item.BillingStatus = '';

        $scope.item.Route = '';
        $scope.item.Remarks = '';
        $scope.item.AdministerDate = utl.Formatter.getCurrentDate();
        $scope.item.AdministeredDate = utl.Formatter.getCurrentDate();
        $scope.item.AdministerInstructions = '';
        $scope.item.CurrentUser = utl.Session.getCurrentUserName();
        $scope.item.AdministerTypeId = 1;
        $scope.item.AdministeredBy = utl.Session.getCurrentUserId();

        $scope.saveAndApprove = function () {
            var msg = 'Are you Sure.! Do you Want To Administer..!';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnSaveApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OnSaveApproveConfirmed = function () {
            $scope.item.AdministeredQuantity = parseInt($scope.item.AdministerQuantity);
            $scope.item.AdministerStatusId = 1;
            $scope.item.AdministeredBy = utl.Session.getCurrentUserId();
            $scope.item.AdministeredDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.hold = function () {
            var msg = 'Are you Sure.! Do you Want To Hold..!';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnholdConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OnholdConfirmed = function () {
            $scope.item.AdministeredQuantity = parseInt($scope.item.AdministerQuantity);
            $scope.item.AdministerStatusId = 6;
            $scope.item.AdministeredBy = utl.Session.getCurrentUserId();
            $scope.item.AdministeredDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.clinicalmanifestration = function () {
            var msg = 'Are you Sure.! Do you Want To Clinical Manifestration..!';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnclinicalmanifestrationConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OnclinicalmanifestrationConfirmed = function () {
            $scope.item.AdministeredQuantity = parseInt($scope.item.AdministerQuantity);
            $scope.item.AdministerStatusId = 7;
            $scope.item.AdministeredBy = utl.Session.getCurrentUserId();
            $scope.item.AdministeredDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.refusal = function () {
            var msg = 'Are you Sure.! Do you Want To Refusal..!';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnrefusalConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OnrefusalConfirmed = function () {
            $scope.item.AdministeredQuantity = parseInt($scope.item.AdministerQuantity);
            $scope.item.AdministerStatusId = 8;
            $scope.item.AdministeredBy = utl.Session.getCurrentUserId();
            $scope.item.AdministeredDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.discontinued = function () {
            var msg = 'Are you Sure.! Do you Want To Discontinued..!';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OndiscontinuedConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.OndiscontinuedConfirmed = function () {
            $scope.item.AdministeredQuantity = parseInt($scope.item.AdministerQuantity);
            $scope.item.AdministerStatusId = 5;
            $scope.item.AdministeredBy = utl.Session.getCurrentUserId();
            $scope.item.AdministeredDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.CheckAdministerQty = function (item) {
            if (parseInt(item.AdministerQuantity) > 0) {
                if (parseInt(item.PrescribedQuantity) < (parseInt(item.AdministredQuantity) + parseInt(item.AdministerQuantity))) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.prescribedqtycheck.lbl'));
                    item.AdministerQuantity = 0;
                }
            }
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
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
                $scope.item.UserTypeId = selectedItem.UserTypeId;
                result = [selectedItem.FirstName +' '+selectedItem.LastName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.FirstName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12]
                }, { Key: 5, Value: 2 }],
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
                if (item.Title)
                    item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.item.PrintBillId = data;
            $scope.confirmCallback();
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.saveItem = function () {
            var actionName = 'emr/Emar/AdministerPrescribedInjection';
            $scope.item.Id = $scope.currentcontext.Id;
            $scope.item.PrescriptionDetailId = $scope.item.PrescriptionDetailId;

            // var inputData = $scope.item;
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPrescribedInjectionCallback = function (scope, res, options, hasError) {
            var InjectionInfo = {};
            if (res.Data.length > 0) {
                InjectionInfo = res.Data[0];

                $scope.item.InjectionRoomId = InjectionInfo.InjectionRoomId;
                    if(InjectionInfo.AdministeredDate){
                $scope.item.AdministeredDate = InjectionInfo.AdministeredDate;}
                $scope.item.AdministeredBy = InjectionInfo.AdministeredBy;
                $scope.item.AdministerDosage = InjectionInfo.AdministerDosage;
                // $scope.item.AdministerInstructions = InjectionInfo.AdministerInstructions;
                $scope.item.AdministerInstructions = InjectionInfo.AdministerInstructions;
                $scope.item.AdministerStatusId = InjectionInfo.AdministerStatusId;
                $scope.item.AdministeredQuantity = InjectionInfo.AdministeredQuantity;

                $scope.item.Id = InjectionInfo.Id;
                $scope.item.PrescriptionId = InjectionInfo.PrescriptionId;
                $scope.item.DrugId = InjectionInfo.DrugId;
                $scope.item.DrugCode = InjectionInfo.DrugCode;
                $scope.item.DrugName = InjectionInfo.DrugName;

                $scope.item.ItemMasterId = InjectionInfo.ItemMasterId;
                $scope.item.ItemCode = InjectionInfo.ItemCode;
                $scope.item.ItemName = InjectionInfo.ItemName;

                $scope.item.Dosage = InjectionInfo.Dosage;
                $scope.item.Frequency = '';
                if (InjectionInfo.Morning) {
                    $scope.item.Frequency = 'Morning';
                }
                if (InjectionInfo.Noon) {
                    $scope.item.Frequency = 'Noon';
                }
                if (InjectionInfo.Night) {
                    $scope.item.Frequency = 'Night';
                }
                $scope.item.Duration = InjectionInfo.Duration;
                $scope.item.DurationInfo = '';
                if (InjectionInfo.DurationPeriod) {
                    $scope.item.DurationInfo = $scope.item.Duration + ' ' + InjectionInfo.DurationPeriod.Description;
                }

                $scope.item.Instructions = InjectionInfo.DrugInstruction.Description;

                $scope.item.CreatedAt = InjectionInfo.CreatedAt;
                $scope.item.PrescribedDate = InjectionInfo.CreatedAt;
                $scope.item.PrescribedBy = '';
                if (InjectionInfo.CreatedUser) {
                    $scope.item.PrescribedBy = InjectionInfo.CreatedUser.Title.Description + ' ' + InjectionInfo.CreatedUser.FirstName;
                }
                $scope.item.AdministeredStatus = '';
                if (InjectionInfo.AdministerStatus) {
                    $scope.item.AdministeredStatus = InjectionInfo.AdministerStatus.Description;
                }
                $scope.item.BillingStatus = 'N/A';

                $scope.item.Route = '';
                if (InjectionInfo.DrugRoute) {
                    $scope.item.Route = InjectionInfo.DrugRoute.Description;
                }
                $scope.item.Remarks = '';
                // $scope.item.AdministerDate = utl.Formatter.getCurrentDate();
                // $scope.item.AdministerInstructions = '';
                $scope.item.CurrentUser = utl.Session.getCurrentUserName();
                $scope.item.AdministerTypeId = 1;

                $scope.item.PrescribedQuantity = InjectionInfo.Quantity;
                $scope.item.AdministeredQuantity = InjectionInfo.AdministeredQuantity;
                $scope.item.AdministerQuantity = InjectionInfo.AdministeredQuantity;
                // $scope.item.AvailableQty = 0;
                if (InjectionInfo.ItemMaster) {
                    if (InjectionInfo.ItemMaster.StockItem) {
                        $scope.item.StockItemId = InjectionInfo.ItemMaster.StockItem.Id;
                        $scope.item.AvailableQty = InjectionInfo.ItemMaster.StockItem.Quantity;
                        if (InjectionInfo.ItemMaster.StockItem.StockSerialItems) {
                            $scope.item.StockSerialItemId = InjectionInfo.ItemMaster.StockItem.StockSerialItems[0].Id;
                            $scope.item.BatchId = InjectionInfo.ItemMaster.StockItem.StockSerialItems[0].BatchId;
                            $scope.item.BatchQty = InjectionInfo.ItemMaster.StockItem.StockSerialItems[0].Quantity;
                        }
                    }
                }
                if (InjectionInfo.Quantity > InjectionInfo.AdministeredQuantity) {
                    $scope.CanShowSaveApprove = true;
                }
                if (InjectionInfo.AdministerStatusId == 5) {
                    $scope.CanShowSaveApprove = false;
                    $scope.CanShowHold = false;
                    $scope.CanShowDiscontinue = false;
                    $scope.CanShowClinicalMainfestation = false;
                    $scope.CanShowRefusal = false;
                }
                if (InjectionInfo.AdministerStatusId == 3) {
                    $scope.CanShowSaveApprove = true;
                    $scope.CanShowHold = true;
                    $scope.CanShowDiscontinue = true;
                    $scope.CanShowClinicalMainfestation = true;
                    $scope.CanShowRefusal = true;
                }
                if (InjectionInfo.AdministerStatusId == 4) {
                    $scope.CanShowSaveApprove = true;
                    $scope.CanShowHold = true;
                    $scope.CanShowDiscontinue = true;
                    $scope.CanShowClinicalMainfestation = true;
                    $scope.CanShowRefusal = true;
                }
                if (InjectionInfo.AdministerStatusId == 1) {
                    $scope.CanShowSaveApprove = false;
                    $scope.CanShowHold = false;
                    $scope.CanShowDiscontinue = false;
                    $scope.CanShowClinicalMainfestation = false;
                    $scope.CanShowRefusal = false;
                }
                if (InjectionInfo.AdministerStatusId == 6) {
                    $scope.CanShowSaveApprove = true;
                    $scope.CanShowHold = false;
                    $scope.CanShowDiscontinue = true;
                    $scope.CanShowClinicalMainfestation = false;
                    $scope.CanShowRefusal = false;
                }
                if (InjectionInfo.AdministerStatusId == 7) {
                    $scope.CanShowSaveApprove = true;
                    $scope.CanShowHold = false;
                    $scope.CanShowDiscontinue = false;
                    $scope.CanShowClinicalMainfestation = false;
                    $scope.CanShowRefusal = false;
                }
                if (InjectionInfo.AdministerStatusId == 8) {
                    $scope.CanShowSaveApprove = false;
                    $scope.CanShowHold = false;
                    $scope.CanShowDiscontinue = false;
                    $scope.CanShowClinicalMainfestation = false;
                    $scope.CanShowRefusal = false;
                }
                if (InjectionInfo.AdministeredQuantity >= InjectionInfo.Quantity) {
                    $scope.CanDisable = true;
                }
            }
        };

        $scope.getPrescribedInjectionById = function () {
            var inputData = {};
            if ($scope.currentcontext.Id > 0) {
                inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.Id },
                        // { Key: 4, Value: $scope.currentcontext.InjectionRoomId }
                    ]
                };

                var options = {
                    action: 'emr/Emar/GetEmars',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPrescribedInjectionCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                /*
                if (key == 'InjectionRoom' && $scope.currentcontext.InjectionRoomId === 0) {
                    if (value.length > 0) {
                        $scope.currentcontext.InjectionRoomId = value[0].Id;
                    } else {
                        $scope.currentcontext.InjectionRoomId = -1;
                    }
                }
                */
            });
            $scope.getPrescribedInjectionById();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "DrugType" },
                { "Key": "AdministerType" },
                {
                    "Key": "InjectionRoom",
                    Request: {
                        Params: [
                            { Key: 2, Value: 1 },
                            { Key: 3, Value: 7 },
                            { Key: 6, Value: utl.Session.getCurrentFacilityId() },
                            { Key: 7, Value: 2 }
                        ]
                    },
                    Default: false
                }
            ]
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

    drugAdministerController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();