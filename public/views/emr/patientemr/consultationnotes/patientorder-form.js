(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientOrderListsController', patientOrderListsController);

    function patientOrderListsController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: -1
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            attachmentcount: 0
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.option = 'detail';
        $scope.currentcontext.userDepartmentId = -1;
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.details = [];
        $scope.options = [
            { key: 'detail', name: $translate.instant('patientemr.patientorder-form.neworders.lbl') },
            { key: 'ticksheet', name: $translate.instant('patientemr.patientorder-form.ticksheet.lbl') }
        ]

        $scope.addNewLineItem = function () {
            var detail = {
                Id: 0,
                PatientId: $scope.currentcontext.pid,
                TestId: -1,
                Quantity: 1,
                TestPrice: 10,
                Discount: 0,
                TaxCost: 0,
                OrderPriorityId: $scope.item.OrderPriorityId,
                NetAmount: 10,
                OrderStatusId: $scope.item.OrderStatusId,
                RequestDate: $scope.item.OrderRequestDate,
                ScheduleDate: $scope.item.OrderScheduleDate,
                Status: 1,
            };

            if ($scope.currentcontext.id > 0) {
                detail.PatientOrderId = $scope.currentcontext.id;
            }
            $scope.details.push(detail);
        }

        //Visibility handling starts

        $scope.canShowCancelBtn = function () {
            return $scope.item.OrderStatusId == utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
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
        $scope.loadTickSheet = function () {
            var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
            if (userObj) {
                $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
            }

            $scope.ticksheetconfig = {
                ticksheetmastertypeid: 2,
                selectedlist: [],
                selecteddetail: {},
                departmentid: $scope.currentcontext.userDepartmentId
            };
        }

        function checkExist(item) {
            for (var idx in $scope.details) {
                if ((item.TestId == $scope.details[idx].TestId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        $scope.saveTickSheets = function () {
            $scope.details.splice(-1, 1);
            for (var idx in $scope.ticksheetconfig.selectedlist) {
                var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
                var item = {
                    TestId: ticksheetitem.ItemId, TestName: ticksheetitem.ItemName, Quantity: 1, TestPrice: 10, Discount: 0, TaxCost: 0,
                    OrderPriorityId: $scope.item.OrderPriorityId, NetAmount: 10, OrderStatusId: $scope.item.OrderStatusId,
                    RequestDate: $scope.item.OrderRequestDate, ScheduleDate: $scope.item.OrderScheduleDate, Status: 1
                }
                if (!checkExist(item)) {
                    $scope.details.push(item);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.addTickSheet = function () {
            utl.Modal.open('patientemr.patientorderdetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, itemid: $scope.ticksheetconfig.selecteddetail.ItemId },
                confirmCallback: $scope.onDetailSave
            }
            );
        }

        // TickSheet area ends

        $scope.addNew = function () {
            utl.Modal.open('patientemr.patientorderdetail', {
                params: { id: 0, pid: $scope.currentcontext.pid },
                confirmCallback: $scope.onDetailSave
            }
            );
        }
        $scope.print = function () {
            utl.Modal.open('app.appointmentprint', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }

        $scope.historypage = function () {
            utl.Modal.open('app.appointmenthistory', {
                params: { id: 0, pid: $scope.currentcontext.pid },
                confirmCallback: $scope.onDetailSave
            }
            );
        }
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
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
                    itemFromModal.PatientOrderId = $scope.currentcontext.id;
                }
                if (!checkExist(itemFromModal) && (itemFromModal.TestId)) {
                    $scope.details.push(itemFromModal);
                }
            }
            $scope.addNewLineItem();
            $scope.currentcontext.option = 'detail';
        }

        $scope.editDetail = function (item) {
            item.currenteditable = true;

            utl.Modal.open('patientemr.patientorderdetail', {
                params: { id: 0, pid: $scope.currentcontext.pid, current_item: item },
                confirmCallback: $scope.onDetailSave
            }
            );
        }

        $scope.previousorders = function () {
            utl.Modal.open('patientemr.previousorders', {
                params: { id: 0, pid: $scope.currentcontext.pid }
            }
            );
        }


        $scope.patientallergy = function () {
            utl.Modal.open('patientemr.patientallergies', {
                params: { pid: $scope.currentcontext.pid }
            }
            );
        }

        $scope.vital = function () {
            utl.Modal.open('patientemr.patientvitals', {
                params: { pid: $scope.currentcontext.pid }
            }
            );
        }

        $scope.clear = function () {
            $scope.details = [];
            $scope.addNewLineItem();
        }


        //computeNetAmount
        $scope.computeNetAmount = function (item) {
            if (item.TestPrice && item.Quantity) {
                item.NetAmount = item.TestPrice * item.Quantity;
            }
        }

        $scope.testChanged = function (idx, item) {
            $scope.computeNetAmount(item);

            var lastIndex = $scope.details.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        }


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
            $scope.details = res.Data || [];
            $scope.addNewLineItem();
        };
        $scope.getDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var inputData = {
                    Params: [
                        { Key: 2, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };


                var options = {
                    action: 'emr/patientorderdetail/GetPatientOrderDetails',
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
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientorder/GetPatientOrderById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
            else {
                //Set Order by value for Doctor login
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, utl.Session.getCurrentUserId());
                if (doctorObj) {
                    $scope.item.DoctorId = doctorObj.Id;
                    $scope.item.OrderFromId = doctorObj.DepartmentId;
                }
            }
        };

        //Actions

        $scope.backToList = function () {
            $state.go('patientemr.patientorders');
        }

        $scope.saveDraft = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'DRAFT');
            $scope.saveItem();
        }

        $scope.createOrder = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED');
            $scope.saveItem();
        }

        $scope.doctorChange = function () {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            if (doctorObj) {
                $scope.item.OrderFromId = doctorObj.DepartmentId;
            }
        }

        $scope.onCancelConfirmed = function () {
            $scope.item.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CANCELLED');;
            $scope.saveItem();
        }

        $scope.openattachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: { pid: $scope.item.PatientId, itemid: $scope.item.Id, objecttypeid: 3 },
                confirmCallback: $scope.getPatientAttachments,
                cancelCallback: $scope.getPatientAttachments
            });
        }

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }
        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.item.PatientId }],
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
                messageKey: 'patientemr.patientorder-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            //Check Mandatory values
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'emr/patientorder/AddPatientOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'emr/patientorder/UpdatePatientOrder';
                } else
                    $scope.item.BillingStatusId = 1;

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
            var activeRecords = $filter('filterArrayItems')($scope.details, [
                { search: 1, fields: ['Status'] }
            ]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.TestId > -1 && (item.Quantity <= 0 || item.TestPrice <= 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
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
                item.PatientId = $scope.currentcontext.pid;
                if (item.TestId > -1) {
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
            $scope.loadTickSheet();
        }

        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "User" },
                { "Key": "OrderPriority" },
                { "Key": "Department" },
                { "Key": "OrderStatus" },
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

    patientOrderListsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig'];

})();