(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientDietOrderFormController', patientDietOrderFormController);

    function patientDietOrderFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: -1,

        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.item.UserId = utl.Session.getCurrentUserId()
        $scope.lookup = {};
        $scope.IsApproved = false;
        $scope.currentcontext = {
            attachmentcount: 0,
            testtype: -1,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($stateParams.eid)
            $scope.item.EncounterId = parseInt($stateParams.eid);
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.item.PatientId = parseInt($stateParams.pid);
        $scope.currentcontext.option = 'detail';
        $scope.currentcontext.userDepartmentId = -1;
        var parentState = isMainContext() ? 'app.patientdietorders' : 'patientemr.patientdietorders';
        $scope.IsDisabled = false;
        $scope.DisableCancelBtn = true;
        $scope.details = [];
        $scope.options = [{
                key: 'detail',
                name: $translate.instant('patientemr.patientdietorder-form.detail.lbl')
            },
            {
                key: 'ticksheet',
                name: $translate.instant('Menu')
            }
        ];

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.EncounterId = modalConfig.params.eid;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.currentcontext.context = modalConfig.params.context;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.PatientId = $scope.currentcontext.encounter.PatientId;
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
            $scope.item.DoctorName = $scope.currentcontext.encounter.DoctorName;
            $scope.item.OrderFromId = $scope.currentcontext.encounter.LocationId;
            $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.currentcontext.userDepartmentId = $scope.currentcontext.encounter.DepartmentId;
            $scope.item.OrderToId = 8;
            $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            if ($scope.currentcontext.encounter.EncounterTypeId == 2) {
                $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
            }
            $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            $scope.item.GuarantorId = $scope.currentcontext.encounter.GuarantorId;
            $scope.item.PatientGuarantorId = $scope.currentcontext.encounter.PatientGuarantorId;
            $scope.item.EncounterTypeId = $scope.currentcontext.encounter.EncounterTypeId;
            $scope.item.AppointmentId = $scope.currentcontext.encounter.AppointmentId;
            $scope.IsBillLocked = $scope.currentcontext.encounter.IsBillLock;
            if ($scope.currentcontext.encounter.EncounterStatusId == 1) {
                $scope.EncounterStatus = 'CheckedIn'
            }
            if ($scope.currentcontext.encounter.EncounterStatusId == 2) {
                $scope.EncounterStatus = 'CheckedOut'
            }
        }
        loadTickSheet();
        if (!isMainContext()) {
            $scope.currentcontext.encounter = utl.Session.getPatientEncounter();

            if ($scope.currentcontext.encounter) {
                //Setting defaults from current encounter  -
                //CAUTION : This defaulting is mandatory to load ticksheets based on serviceratecategory
                $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
                $scope.item.OrderFromId = $scope.currentcontext.encounter.LocationId;
                $scope.item.RoomId = $scope.currentcontext.encounter.RoomId
                $scope.item.BedId = $scope.currentcontext.encounter.BedId
                $scope.item.OrderToId = 45;
                // $scope.item.ServiceRateCategoryId = 1;
                // if ($scope.currentcontext.encounter.EncounterTypeId == 2) {
                $scope.item.ServiceRateCategoryId = $scope.currentcontext.encounter.ServiceRateCategoryId;
                // }
                $scope.item.EncounterId = $scope.currentcontext.encounter.Id;
            }
            loadTickSheet();
        }
        $scope.canShowPrint = function () {
            return $scope.IsDisabled || $scope.item.OrderStatusId == 3 || $scope.item.OrderStatusId == 4 || $scope.item.OrderStatusId == 5 ||
                $scope.item.OrderStatusId == 6 || $scope.item.OrderStatusId == 7 || $scope.item.OrderStatusId == 8 || $scope.item.OrderStatusId == 9;
        }

        //Visibility rules ends
        $scope.setIndexforTableIndex = function () {
            for (var idx in $scope.details) {
                if ($scope.details[idx].Status == 1) {
                    $scope.details[idx].itemidxdesc = 'desc' + idx;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var detail = getNewItem();

            if ($scope.currentcontext.id > 0) {
                detail.PatientDietOrderId = $scope.currentcontext.id;
            }

            $scope.details.push(detail);
            $scope.setIndexforTableIndex();
        }

        function getNewItem() {
            var detail = {
                Id: 0,
                PatientId: $scope.item.PatientId,
                IsDirectBill: false,
                DietItemId: -1,
                itemidxdesc: null,
                Quantity: 1,
                DietName: '',
                DietItemCode: '',
                DietCategoryId: '',
                DietFrequencyId: '',
                DietItemTypeId: '',
                Description: '',
                OrderPriorityId: $scope.item.OrderPriorityId,
                OrderStatusId: $scope.item.OrderStatusId,
                RequestDate: $scope.item.OrderRequestDate,
                ScheduleDate: $scope.item.OrderScheduleDate,
                Status: 1,
            };
            detail.autoSearchName = getAutoSearchName();
            return detail;
        }

        function getAutoSearchName() {
            return 'diet_' + getRandomNumber();
        }

        function getRandomNumber() {
            var uniqId = Math.floor((Math.random() * 10000) + 1);
            return uniqId;
        }
        //Visibility handling starts

        $scope.canShowCancelBtn = function () {
            return $scope.item.OrderStatusId == utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
        }

        function isMainContext() {
            return $scope.currentcontext.context == 'main';
        }

        $scope.canShowPatientControl = function () {
            return isMainContext();
        }

        $scope.canShowPatientBanner = function () {
            if (isMainContext() && this.item.PatientId > 0) {
                return true;
            }
            return false;
        }
        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        $scope.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }
        $scope.canShowClearBtn = function () {
            return $scope.item.OrderStatusId == utl.Lookup.getDefault($scope.lookup.OrderStatus, 'DRAFT');
        }
        //Visibility handling ends

        //Tab selection
        $scope.canShowOrdersArea = function () {
            return $scope.currentcontext.option == 'detail';
        }

        $scope.canShowTickSheetArea = function () {
            return $scope.currentcontext.option == 'ticksheet';
        }

        //TickSheet area begins
        function loadTickSheet() {
            var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            if (userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
            }

            $scope.ticksheetconfig = {
                ticksheetmastertypeid: 3,
                selectedlist: [],
                selecteddetail: {},
                departmentid: $scope.currentcontext.userDepartmentId
            };
        }

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.DietItemId == $scope.details[idx].DietItemId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        $scope.saveTickSheets = function () {
            $scope.details.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var qty = 0;
                var price = 0;
                if (ticksheetitem) {
                    qty = ticksheetitem.Quantity;
                }
                if (ticksheetitem.DietItemMaster) {
                    if (ticksheetitem.DietItemMaster.ServiceItem) {
                        if (ticksheetitem.DietItemMaster.ServiceItem.ServiceItemTariffDetails.length > 0) {
                            for (var sdx in ticksheetitem.DietItemMaster.ServiceItem.ServiceItemTariffDetails) {
                                var tariff = ticksheetitem.DietItemMaster.ServiceItem.ServiceItemTariffDetails[sdx];
                                if ($scope.item.ServiceRateCategoryId == tariff.ServiceRateCategoryId) {
                                    if (tariff.Rate) {
                                        price = tariff.Rate;
                                    } else {
                                        price = 0;
                                    }

                                }
                            }
                        }
                    }
                }
                var item = {
                    OrderPriorityId: $scope.item.OrderPriorityId,
                    OrderStatusId: $scope.item.OrderStatusId,
                    RequestDate: $scope.item.OrderRequestDate,
                    ScheduleDate: $scope.item.OrderScheduleDate,
                    Quantity: qty,
                    Price: $scope.item.Price,
                    Status: 1,
                    price: price,
                    DietItemId: ticksheetitem.ItemId
                }
                if (!checkExist(item)) {
                    item.autoSearchName = item.autoSearchName || getAutoSearchName();
                    $scope.details.push(item);
                    computeTestData(item, ticksheetitem.DietItemMaster);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        // $scope.addTickSheet = function () {
        //     var dietmaster = $scope.ticksheetconfig.selecteddetail.DietItemMaster;

        //     var currentItem = getNewItem();
        //     currentItem.DietItemId = $scope.ticksheetconfig.selecteddetail.ItemId;

        //     utl.Modal.open('patientemr.patientdietorderdetail', {
        //         params: { id: 0, pid: $scope.item.PatientId, current_item: currentItem },
        //         confirmCallback: $scope.onDetailSave
        //     }
        //     );
        // }
        $scope.addTickSheet = function () {
            var dietmaster = $scope.ticksheetconfig.selecteddetail.DietItemMaster;

            var currentItem = getNewItem();
            currentItem.DietItemId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.DietName = dietmaster.DietName;
            currentItem.DietItemCode = dietmaster.DietItemCode;
            currentItem.Description = dietmaster.Description;
            currentItem.DietItemTypeId = dietmaster.DietItemTypeId;
            currentItem.DietCategoryId = dietmaster.DietCategoryId;
            currentItem.DietFrequencyId = dietmaster.DietFrequencyId;

            utl.Modal.open('patientemr.patientdietorderdetail', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    current_item: currentItem
                },
                confirmCallback: $scope.onDetailSave
            });
        }
        // TickSheet area ends

        $scope.addNew = function () {
            // utl.Modal.open('patientemr.patientorderdetail', {
            //     params: { id: 0, pid: $scope.item.PatientId },
            //     confirmCallback: $scope.onDetailSave
            // }
            // );
        }

        $scope.originalprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'emr/patientdietorder/PrintPatientDietOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/patientdietorder/PrintPatientDietOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.historypage = function () {
            utl.Modal.open('app.appointmenthistory', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            $scope.details.splice(-1, 1);
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.PatientDietOrderId = $scope.currentcontext.id;
                }
                if (!checkExist(itemFromModal) && (itemFromModal.DietItemId)) {
                    itemFromModal.autoSearchName = itemFromModal.autoSearchName || getAutoSearchName();
                    $scope.details.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.editDetail = function (item) {
            if (item == 0) {
                $scope.clear();
            } else {
                item.currenteditable = true;
                item.IsDisabled = $scope.IsDisabled;
                utl.Modal.open('patientemr.patientdietorderdetail', {
                    params: {
                        id: 0,
                        pid: $scope.item.PatientId,
                        current_item: item
                    },
                    confirmCallback: $scope.onDetailSave
                });
            }
        }

        $scope.dietorders = function () {
            utl.Modal.open('app.patientdietorders', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId
                }
            });
        }

        $scope.patientallergy = function () {
            utl.Modal.open('patientemr.patientallergies', {
                params: {
                    pid: $scope.item.PatientId
                }
            });
        }

        $scope.vital = function () {
            utl.Modal.open('patientemr.patientvitals', {
                params: {
                    pid: $scope.item.PatientId
                }
            });
        }

        $scope.clear = function () {
            $scope.IsDisabled = false;
            $scope.details = [];
            $scope.item.OrderTotal = 0;
            $scope.addNewLineItem();
        }


        $scope.dietChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.details, {
                pivotkey: 'DietItemId',
                displaykey: 'DietName'
            });
            if (isDuplicate) {
                item.DietName = '';
                item.DietItemId = '';
                return;
            }
            computeTestData(item, item.SelectedItem);

            item.DietCategoryId = item.SelectedItem.DietCategoryId;
            item.DietFrequencyId = item.SelectedItem.DietFrequencyId;
            item.DietItemTypeId = item.SelectedItem.DietItemTypeId;
            item.DietItemCode = item.SelectedItem.DietItemCode;
            item.DietName = item.SelectedItem.DietName;
            item.Description = item.SelectedItem.Description;

            var lastIndex = $scope.details.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        }

        function computeTestData(item, dietmaster) {
            //Set department id
            item.DietItemCode = dietmaster.DietItemCode;
            item.DietName = dietmaster.DietName;
            item.Description = dietmaster.Description;
            item.DietItemTypeId = dietmaster.DietItemTypeId;
            item.DietCategoryId = dietmaster.DietCategoryId;
            item.IsDirectBill = dietmaster.IsDirectBill;
            item.DietFrequencyId = dietmaster.DietFrequencyId;
            var Tariff = {
                Rate: 0,
                DoctorShare: 0
            };
            var ServiceItem = dietmaster.ServiceItem;
            if (ServiceItem && ServiceItem.Id > 0 &&
                ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                Tariff = ServiceItem.ServiceItemTariffDetails[0];
            }

            item.Price = Tariff.Rate;
            $scope.computeNetAmount(item);
        }
        $scope.computeNetAmount = function (item) {
            if (item.Price && item.Quantity) {
                item.NetAmount = item.Price * item.Quantity;
                // $scope.BillCalc(item);
            }
        }
        $scope.BillCalc = function (item) {
            $scope.BillAmount = 0;
            $scope.BillDiscount = 0;
            $scope.item.OrderTotal = 0;
            $scope.details.forEach((item, idx) => {
                $scope.BillAmount += parseFloat(item.Quantity) * parseFloat(item.Price);
                $scope.BillDiscount += parseFloat(item.Discount);
                item.Rate = item.Price;
                item.Quantity = item.Quantity;
                item.Amount = parseFloat(item.Quantity) * parseFloat(item.Price);
                item.GrossAmount = parseFloat(item.Quantity) * parseFloat(item.Price);
                item.DiscountAmount = parseFloat(item.Discount);
                item.NetAmount = (parseFloat(item.Quantity) * parseFloat(item.Price)) - parseFloat(item.Discount);
                $scope.item.OrderTotal += item.NetAmount;
            });
        };

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        }

        $scope.deleteDetail = function (idx, item) {
            var name = item.TestName || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        //getDetails
        $scope.getDetailsCallback = function (scope, res, options, hasError) {
            var result = [];
            $scope.item.OrderTotal = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.autoSearchName = getAutoSearchName();
                $scope.item.OrderTotal += item.NetAmount
                result.push(item);
            }
            $scope.details = result;
            // $scope.addNewLineItem();
        };
        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'emr/patientdietorderdetail/GetPatientDietOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };


        //getItem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if ($scope.item.OrderStatusId == 1 || $scope.item.OrderStatusId == 2) {
                $scope.IsDisabled = true;
                $scope.DisableCancelBtn = false;
            }
            if ($scope.item.OrderStatusId == 2) {
                $scope.DisableCancelBtn = true;
            }
            loadTickSheet();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientdietorder/GetPatientDietOrderById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                //Set Order by value for Doctor login
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, utl.Session.getCurrentUserId());
                if (doctorObj) {
                    $scope.item.DoctorId = doctorObj.Id;
                }
            }
        };

        //Actions

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            }
            // else
            //     $state.go(parentState, { tp: $scope.currentcontext.testtype });
            if (isMainContext) {
                $state.go('app.patientdietorders');
            }
            if ($scope.Context == 'ipemr' || !$scope.Context) {
                $state.go('patientemr.patientdietorders');
            }
            if ($scope.Context == 'surgery') {
                $state.go('surgeryentry.patientdietorders');
            }
        }

        $scope.saveDraft = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'DRAFT');
            $scope.saveItem();
        }

        $scope.createOrder = function () {
            $scope.item.OrderStatusId = 1;
            // $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
            $scope.completeOrder();
        }

        $scope.canceorder = function () {
            $scope.item.OrderStatusId = 2;
            // $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CANCELLED')
            $scope.saveCancelled();
        }

        // $scope.onCancelConfirmed = function () {
        //     $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CANCELLED')
        //     $scope.saveItem();
        // }

        $scope.openattachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: {
                    pid: $scope.item.PatientId,
                    itemid: $scope.item.Id,
                    objecttypeid: 3
                },
                confirmCallback: $scope.getPatientAttachments,
                cancelCallback: $scope.getPatientAttachments
            });
        }

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }
        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.PatientId
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        }


        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientdietorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.completeOrder = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientdietorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        function removeLastEntryBeforeSave() {
            var item = $scope.details[$scope.details.length - 1];
            if (!item.DietItemId || item.DietItemId == -1) {
                $scope.details.splice(-1, 1);
            }
        }

        //Save item callback
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            loadData();
        };

        $scope.saveItem = function () {

            //removeLastEntryBeforeSave();

            // TODO : Patient edit check
            if ($scope.item.OrderStatusId != 2 && !utl.Validator.validate($scope)) {
                return;
            }
            $scope.IsApproved = true;
            //Check Mandatory values
            if (checkMandatoryFields()) {

                var lines = getLinesForSave();
                var actionName = 'emr/patientdietorder/AddPatientDietOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/patientdietorder/UpdatePatientDietOrder';
                }
                if ($scope.item.OrderStatusId == 1 && $scope.Encounter) {
                    $scope.item.EncounterId = $scope.Encounter.Id;
                    $scope.item.WardId = $scope.Encounter.WardId;
                    $scope.item.RoomId = $scope.Encounter.RoomId;
                    $scope.item.BedId = $scope.Encounter.BedId;
                    if ($scope.Encounter.EncounterTypeId == 2)
                        $scope.item.BillingStatusId = 2;
                }

                if (!$scope.item.EncounterTypeId && $scope.item.Encounter &&
                    $scope.item.Encounter.EncounterTypeId == 2)
                    $scope.item.EncounterTypeId = 2;

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
            var activeRecords = $filter('filterArrayItems')($scope.details, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (!item.DietItemId) {
                    utl.Alert.showErrorMsg($translate.instant(item.DietName + ' Delete and try again...'));
                    return false;
                }
                if (item.DietItemId > -1 && item.Quantity <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
                if (item.SelectedItem && !item.SelectedItem.ServiceItem && item.IsDirectBill) {
                    utl.Alert.showErrorMsg(item.Description + " Direct Bill Item is Not Mapped with Service Item");
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var ordertotal = 0;
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                item.PatientId = $scope.item.PatientId;
                item.OrderStatusId = $scope.item.OrderStatusId;

                if (item.DietItemId > -1 && item.Status == 1) {
                    result.push(item);
                    ordertotal += item.NetAmount;
                }
            }
            $scope.item.OrderTotal = ordertotal;
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getDetails();
            $scope.getPatientAttachments();
            if (!isMainContext()) {
                $timeout(function () {
                    $('#desc0').focus();
                }, 1000);
            }
        }
        $scope.doctor_dashboard = function () {
            if ($scope.Context == 'ipemr' || !$scope.Context) {
                $state.go('app.doctordashboard');
            }
            if ($scope.Context == 'surgery') {
                $state.go('app.surgerydashboard');
            }
        }
        // DietItemMaster AutoSearch
        vm.dietcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Code',
                    field: 'DietItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'DietName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Price',
                    field: 'Price',
                    datatype: 'string',
                    headercls: 'td-price',
                    fieldcls: 'td-price'
                },
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DietItemMaster/GetDietItemMasters',
            formatdisplay: formatselecteddiet,
            presearch: presearchdiet,
            postsearch: postsearchdiet
        };

        function formatselecteddiet() {
            var selectedItem = vm.dietcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DietName + '(' + selectedItem.DietItemCode + ')'].join('  ');
                $scope.item.DietItemTypeId = selectedItem.DietItemTypeId;
                $scope.item.DietCategoryId = selectedItem.DietCategoryId;
                $scope.item.DietFrequencyId = selectedItem.DietFrequencyId;
                $scope.item.DietName = result;
            } else if (vm.dietcontrolconfig.rowdata) {
                result = [vm.dietcontrolconfig.rowdata.DietName, vm.dietcontrolconfig.rowdata.DietItemCode, ].join(' ');
                $scope.item.DietName = result;
            }

            return result;
        }

        function presearchdiet() {

            var query = vm.dietcontrolconfig.query;

            var inputData = {
                Params: [

                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: {
                            'ServiceRateCategoryId': $scope.item.ServiceRateCategoryId
                        }
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 4,
                    Value: query
                });
            }

            vm.dietcontrolconfig.searchparams = inputData;
        }

        function postsearchdiet() {
            for (var idx in vm.dietcontrolconfig.result) {
                var item = vm.dietcontrolconfig.result[idx];
                var Tariff = {
                    Rate: 0,
                    DoctorShare: 0
                };
                var ServiceItem = item.ServiceItem;
                if (ServiceItem && ServiceItem.Id > 0 &&
                    ServiceItem.ServiceItemTariffDetails && ServiceItem.ServiceItemTariffDetails.length > 0) {
                    Tariff = ServiceItem.ServiceItemTariffDetails[0];
                }
                item.Tariff = Tariff;
                item.Price = Tariff.Rate;
                if (item.DietItemTypeId > 0) {
                    item.DietName = item.DietName
                    item.DietItemTypeId = item.DietItemTypeId;
                    item.DietCategoryId = item.DietCategoryId;
                    item.DietFrequencyId = item.DietFrequencyId;
                }
            }
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
                // { header: 'ServiceItem Rate', field: 'ItemCost', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
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
                    },
                    {
                        Key: 15,
                        Value: 1
                    },
                    {
                        Key: 9,
                        Value: 3
                    }
                ],
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
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        };

        function postsearchserviceitem() {
            if ($scope.Encounter) {
                for (var idx in vm.serviceitemcontrolconfig.result) {
                    var item = vm.serviceitemcontrolconfig.result[idx];
                    item.ServiceCode = item.ItemCode;
                    item.ServiceName = item.Name;
                    var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                        ServiceRateCategoryId: $scope.item.ServiceRateCategoryId
                    }, true);
                    if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                        item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                        item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                    }
                    var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.Encounter.GuarantorId);
                    if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                        var ServiceItemAliasobj = $filter('filter')(item.ServiceItemAliases, {
                            ExternalProviderId: selectedGuarantor.GuarantorId
                        }, true);
                        if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                            item.AliasId = ServiceItemAliasobj[0].AliasId;
                            item.AliasName = ServiceItemAliasobj[0].AliasName;
                        }
                    }
                }
            }
        };
        vm.patientcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Title',
                    field: 'Title',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Name',
                    field: 'PatientName',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Age/Gender',
                    field: 'Age',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'DOB',
                    field: 'DOB',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'MRN',
                    field: 'MRN',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Visit#',
                    field: 'VisitIdentifier',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Ward/Room/Bed',
                    field: 'WardDetail',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
            ],
            searchparams: {},
            result: {},
            api: 'Visit/Visit/GetEncounters',
            presearch: presearchEncounter,
            formatdisplay: formatselectedEncounter,
            postsearch: postsearchEncounter
        };

        function formatselectedEncounter() {
            var selectedItem = vm.patientcontrolconfig.selected;
            var result = '';
            if (selectedItem) {
                var strTitle = selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            }
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                var strTitle = selectedItem.Patient && selectedItem.Patient.Title ? selectedItem.Patient.Title.Description : '';
                result = [strTitle, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            }
            if (vm.patientcontrolconfig.selected)
                $scope.patientChanged();
            return result;
        }

        $scope.patientChanged = function () {
            $scope.Encounter = $scope.item.SelectedItem;
            var selectedItem = $scope.item.SelectedItem;

            $scope.item.DoctorId = selectedItem.DoctorId;
            $scope.item.OrderFromId = selectedItem.LocationId;
            $scope.item.RoomId = selectedItem.RoomId
            $scope.item.BedId = selectedItem.BedId
            $scope.item.OrderToId = 45;
            $scope.item.PatientId = selectedItem.PatientId;
            $scope.item.PatientName = [selectedItem.Patient.Title.Description, selectedItem.Patient.FirstName, selectedItem.Patient.LastName].join(' ');
            if (selectedItem.EncounterTypeId == 2) {
                $scope.item.EncounterTypeId = 2;
                $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategoryId;
            } else
                $scope.item.ServiceRateCategoryId = 1;
            $scope.item.EncounterId = selectedItem.Id;

            $scope.refreshBanner();
            loadTickSheet();
        }

        function presearchEncounter() {
            var query = vm.patientcontrolconfig.query;

            //Only ip encounter
            var inputData = {
                Params: [

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.id == 0) {
                inputData.Params.push({
                    Key: 3,
                    Value: 2 || 3 || 4
                }, {
                    Key: 15,
                    Value: 2
                })
            }

            if (vm.patientcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 11,
                    Value: query
                });
            }

            vm.patientcontrolconfig.searchparams = inputData;
        }

        function postsearchEncounter() {
            for (var idx in vm.patientcontrolconfig.result) {
                var item = vm.patientcontrolconfig.result[idx];
                item.Title = item.Patient.Title ? item.Patient.Title.Description : '';
                item.PatientName = [item.Patient.FirstName, item.Patient.LastName].join(' ');
                item.Age = item.Patient.Age + ' / ' + item.Patient.Gender.Description;
                item.DOB = $filter('date')(item.Patient.DOB, 'yyyy-MMM-dd');
                item.MRN = item.Patient.MRN;
                item.VisitIdentifier = item.VisitIdentifier;
                if (item.WardMaster) {
                    item.WardDetail = item.WardMaster.WardName;
                }
                if (item.WardRoomMaster) {
                    item.WardDetail += ' / ' + item.WardRoomMaster.RoomNo;
                }
                if (item.WardRoomBedMaster) {
                    item.WardDetail += ' / ' + item.WardRoomBedMaster.BedNo;
                }
            }
        }

        function checkFoodAllergyCallback(scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.currentcontext.isPatientHasAllergy = true;
            }
        }

        function checkFoodAllergy() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 3,
                        Value: 2
                    }, //Food
                    {
                        Key: 4,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientallergy/GetPatientAllergys',
                data: inputData,
                type: 'post',
                onComplete: checkFoodAllergyCallback
            };

            utl.Http.doAction(options);
        }
        $scope.getpendingorder = function (data) {
            $scope.currentcontext.id = data.id;
            $scope.getItem();
            $scope.getDetails();
        }
        $scope.pendingOrder = function () {
            utl.Modal.open('app.pendingdietorder', {
                params: {
                    id: $scope.item.PatientId,
                    eid: $scope.item.EncounterId
                },
                confirmCallback: $scope.getpendingorder
            });
        }

        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 113 && !$scope.IsApproved) { // F2  - SaveDraft
                $scope.completeBill($scope.saveDraft);
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
            checkFoodAllergy();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Room"
                },
                {
                    "Key": "Bed"
                },
                {
                    Key: 'User',
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: 2
                        }]

                    }
                },
                {
                    "Key": "DietCategory"
                },
                {
                    "Key": "DietFrequency"
                },
                {
                    "Key": "DietItemType"
                },
                {
                    "Key": "OrderPriority"
                },
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                            Key: 13,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "OrderStatus",
                    Default: false
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

    patientDietOrderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig', '$timeout'];

})();