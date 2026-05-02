(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('kitchenworkListController', kitchenworkListController);

    function kitchenworkListController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentfilter = {
            Id: 0,
            orderpriorityid: -1,
            OrderStatusId: 1,
            patient: '',
            VisitTypeId: 2,
            WardId: -1,
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            DietFrequencyId: -1,
            // fromdate: utl.Formatter.getCurrentDate(),
            // todate: utl.Formatter.getCurrentDate(),
        };
        $scope.DietOrders = [];
        $scope.SelectedRows = [];
        $scope.advancedfilter = {
            From: '',
            To: '',
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {

                // To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'patientemr.patientorder-list.from.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'patientemr.patientorder-list.to.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },

                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderto.lbl',
                        model: 'OrderToId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.filter_priority.lbl',
                        model: 'orderpriorityid',
                        options: $scope.lookup.OrderPriority,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderedby.lbl',
                        model: 'UserId',
                        options: $scope.lookup.User,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'patientemr.patientorder-list.number.lbl',
                        model: 'OrderNumber',
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
                ]
            };
        }

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        $scope.IsDisabled = false;

        $scope.dashboard = function () {
            $state.go('patientemr.patientdashboard');
        }


        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.pid = isMainContext() ? 0 : parseInt(utl.Session.getEMRPatientId());
        // if ($stateParams.tp) {
        //     $scope.currentfilter.TestTypeId = $stateParams.tp;
        // }
        var formState = isMainContext() ? 'app.kitchenworkform' : 'patientemr.patientdietorderform';


        function isMainContext() {
            return $scope.currentcontext.context == 'main';
        }

        $scope.canShowPatientFilter = function () {
            return isMainContext();
        }

        //get list
        $scope.custom_sort = function (a, b) {
            return new Date(b.OrderRequestDate).getTime() - new Date(a.OrderRequestDate).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.DietOrders = [];
            for (var idx in res.Data) {
                var diet = res.Data[idx];
                if (diet.PatientDietOrderDetails) {
                    diet.OrderStatus = diet.OrderStatus.DisplayName;
                    diet.DietName = diet.PatientDietOrderDetails[0].DietName;
                }
                $scope.DietOrders.push(diet);

            }
            $scope.applyVisibilityRules();
        };

        $scope.getList = function () {

            // var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 5,
                        Value: $scope.currentfilter.patient
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.orderpriorityid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.OrderStatusId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.OrderNumber
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.WardId
                    },
                    // { Key: 3, Value: $scope.advancedfilter.orderpriorityid },
                    // { Key: 4, Value: $scope.advancedfilter.OrderStatusId },
                    // { Key: 9, Value: $scope.advancedfilter.OrderNumber },
                    {
                        Key: 7,
                        Value: From
                    },
                    {
                        Key: 8,
                        Value: To
                    },
                    // { Key: 7, Value: FromReq },
                    // { Key: 8, Value: ToReq },
                    // { Key: 10, Value: $scope.advancedfilter.OrderToId },
                    // { Key: 11, Value: $scope.advancedfilter.UserId },
                    {
                        Key: 15,
                        Value: $scope.currentfilter.DietFrequencyId
                    },
                ],
                //                 PageContext: {
                //                     PageSize: vm.gridConfig.pagerObj.pageSize,
                //                     PageNumber: vm.gridConfig.pagerObj.currentPage
                //                 }
            };
            // if (!isMainContext()) {
            //     inputData.Params.push({ Key: 2, Value: $scope.currentcontext.pid });
            // }

            // if (isMainContext()) {
            //     inputData.Params.push({ Key: 5, Value: $scope.currentfilter.patient });
            //     inputData.Params.push({ Key: 6, Value: $scope.currentfilter.WardId });
            //     // inputData.Params.push({ Key: 16, Value: 2 });
            //     // inputData.Params.push({ Key: 7, Value: fromdate })

            //     // inputData.Params.push({ Key: 8, Value: todate })
            // }
            var options = {
                action: 'emr/patientdietorder/GetPatientDietOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.selectAllItems = function () {
            for (var idx in $scope.DietOrders) {
                var item = $scope.DietOrders[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSelected = $scope.currentcontext.selectall;
                }
            }
        }

        $scope.SelectionChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                $scope.item = detail;
                if (detail.IsAllSelected) {
                    detail.IsSelected = true;
                } else if (!detail.IsAllSelected) {
                    detail.IsSelected = false;
                }
            }
        }

        $scope.getkitchenListCallback = function (scope, res, options, hasError) {
            $scope.DietOrders = [];
            for (var idx in res.Data) {
                var diet = res.Data[idx];
                // var DietName = '';
                // if (diet.PatientDietOrderDetails) {
                //     DietName = diet.PatientDietOrderDetails[0].DietName;
                // }
                $scope.DietOrders.push(diet);

            }
        };

        // $scope.getkitchenList = function () {

        //     var inputData = {
        //         Params: [
        //         ],
        //     };
        //     var options = {
        //         action: 'emr/patientdietorder/GetPatientDietOrders',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getkitchenListCallback
        //     };

        //     utl.Http.doAction(options);
        // };


        $scope.print = function () {

            var From = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                        Key: 5,
                        Value: $scope.currentfilter.patient
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.orderpriorityid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.OrderStatusId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.OrderNumber
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 7,
                        Value: From
                    },
                    {
                        Key: 8,
                        Value: To
                    },
                    {
                        Key: 15,
                        Value: $scope.currentfilter.DietFrequencyId
                    },
                ],

            };
            var options = {
                action: 'emr/patientdietorder/PrintKitchenworklist',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.applyVisibilityRules = function () {
            // Draft

            if ($scope.currentcontext.id <= 0) {

                $scope.canShowexcuteBtn = true;
                $scope.canShowcompleteBtn = true;
                $scope.canShowcancelBtn = true;


            } else {
                $scope.canShowSaveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;

                if ($scope.currentfilter.OrderStatusId == 1) {
                    $scope.canShowexcuteBtn = true;
                    $scope.canShowcompleteBtn = false;
                    $scope.canShowcancelBtn = true;

                }
                // Bill Completed
                if ($scope.currentfilter.OrderStatusId == 2) {
                    $scope.canShowexcuteBtn = false;
                    $scope.canShowcompleteBtn = false;
                    $scope.canShowcancelBtn = false;
                    // $scope.canShowViewReceipt = true;
                }
                // Bill Cancelled
                if ($scope.currentfilter.OrderStatusId == 11) {
                    $scope.canShowexcuteBtn = false;
                    $scope.canShowcompleteBtn = false;
                    $scope.canShowcancelBtn = false;
                }

                if ($scope.currentfilter.OrderStatusId == 16) {
                    $scope.canShowexcuteBtn = false;
                    $scope.canShowcompleteBtn = true;
                    $scope.canShowcancelBtn = false;
                }
            }
        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();

        $scope.addNewOrder = function () {
            $state.go(formState, {
                id: 0,
                pid: $scope.currentcontext.pid
            });
        };


        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'kitchenworklist.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.Cancelled,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.cancelorderCallback = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.Cancelled = function () {

            // if ($scope.currentfilter.MRDFileStatusId == 2) {
            //     utl.Alert.showErrorMsg(" Cannot change the status");
            //     return;
            // }
            if ($scope.currentfilter.OrderStatusId == 1 || $scope.currentfilter.OrderStatusId == 16 || $scope.currentfilter.OrderStatusId == 11) {
                $scope.item.OrderStatusId = 2;
            }

            var inputData = {
                Header: $scope.item
            };
            var inputArr = getDetailsForCancel(true);
            var options = {
                action: 'emr/patientdietorder/UpdatePatientDietOrder',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.cancelorderCallback
            };
            utl.Http.doAction(options);

        };

        function getDetailsForCancel() {
            var inputArr = [];
            var selectedRows = $scope.getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }
        $scope.completedorderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.completed = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'kitchenworklist.comletemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.CompletedOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.CompletedOrder = function () {

            // if ($scope.currentfilter.OrderStatusId == 16) {
            //     utl.Alert.showErrorMsg(" Cannot change the status");
            //     return;
            // }
            if ($scope.currentfilter.OrderStatusId == 16) {
                $scope.item.OrderStatusId = 11;
            }
            // if ($scope.currentfilter.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED')) {
            //     $scope.currentfilter.OrderStatusId =  utl.Lookup.getDefault($scope.lookup.OrderStatus, 'COMPLETED');
            // }
            var inputData = {
                Header: $scope.item
            };
            var inputArr = getDetailsForOrder(true);
            var options = {
                action: 'emr/patientdietorder/UpdatePatientDietOrder',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.completedorderCallback
            };
            utl.Http.doAction(options);

        };

        function getDetailsForOrder() {
            var inputArr = [];
            var selectedRows = $scope.getSelectionRows();
            if (selectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }

        $scope.excuteorderCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };
        $scope.excute = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'kitchenworklist.executemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.ExcutedOrder,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.ExcutedOrder = function () {

            // if ($scope.currentfilter.OrderStatusId == 16) {
            //     utl.Alert.showErrorMsg(" Cannot change the status");
            //     return;
            // }
            // if ($scope.currentfilter.OrderStatusId == 1) {
            //     $scope.currentfilter.OrderStatusId = 16;
            // }
            // if ($scope.currentfilter.OrderStatusId = utl.Lookup.getDefault($scope.lookup.OrderStatus, 'CREATED')) {
            //     $scope.currentfilter.OrderStatusId =  utl.Lookup.getDefault($scope.lookup.OrderStatus, 'COMPLETED');
            // }
            // var inputData = { Header: $scope.currentfilter };
            // var inputArr = getDetailsForExcute(true);

            // $scope.DietOrders = $scope.getSelectionRows();
            // if ($scope.SelectedRows.length > 0) {

            // } else {
            //     utl.Alert.showErrorMsg('Please Select Any Bill');
            // }
            var lines = $scope.getSelectionRows();
            // $scope.DietOrders = [];
            var options = {
                action: 'emr/patientdietorder/ManagePatientDietOrders',
                data: {
                    Data: lines
                },
                type: 'post',
                onComplete: $scope.excuteorderCallback
            };

            utl.Http.doAction(options);

        };

        function getDetailsForExcute() {
            var inputArr = [];
            $scope.DietOrders = $scope.getSelectionRows();
            if ($scope.SelectedRows.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('kitchenworklist.noselection.lbl'));
                return;
            }
            return inputArr;
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };


        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientdietorder/DeletePatientDietOrder',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getSelectionRows = function () {
            var selectedRows = [];
            for (var idx in $scope.DietOrders) {
                var item = $scope.DietOrders[idx];
                if (item.IsSelected == true && item.OrderStatusId == 1) {
                    item.OrderStatusId = 16;
                    selectedRows.push(item);
                }
            }
            return selectedRows;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "OrderPriority"
                },
                {
                    "Key": "OrderStatus",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: true
                        }],
                    }
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "OrderType"
                },
                {
                    "Key": "User"
                },
                {
                    "Key": "Ward"
                },
                {
                    "Key": "DietItemType"
                },
                {
                    "Key": "DietFrequency"
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

        $scope.initLookup();
    }

    kitchenworkListController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();