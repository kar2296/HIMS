// (function () {
//     'use strict';

//     angular
//         .module('app.pages')
//         .controller('dietorderFormController', dietorderFormController);

//     function dietorderFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
//         var vm = this;
//         $scope.item = {};

//         $scope.currentcontext = {
//             ismodal: modalConfig && modalConfig.params ? true : false,
//             file: null
//         };

//         if (modalConfig && modalConfig.params) {
//             $scope.currentcontext.id = parseInt(modalConfig.params.id);
//             $scope.confirmCallback = $uibModalInstance.close;
//             $scope.cancelCallback = $uibModalInstance.dismiss;
//         }

//         $scope.item.PatientId = $scope.currentcontext.pid;

//         $scope.getItemCallback = function (scope, data, options, hasError) {
//             $scope.item = data;
//         };
//         $scope.backToList = function () {
//             $scope.confirmCallback();
//         }

//         vm.selectedPatient = {};
//         $scope.patientChange = function () {
//             $scope.item.EncounterId = vm.selectedPatient.EncounterId || 0;
//         }

//         //Patient contro related code ends


//         //Visibility rules starts

//         function isMainContext() {
//             return $scope.currentcontext.context == 'main';
//         }

//         $scope.canShowPatientControl = function () {
//             return isMainContext();
//         }

//         $scope.loadTickSheet = function () {
//             var userObj = utl.Lookup.getObject($scope.lookup.User, utl.Session.getCurrentUserId());
//             if (userObj) {
//                 $scope.currentcontext.userDepartmentId = userObj.DepartmentId;
//             }

//             $scope.ticksheetconfig = {
//                 ticksheetmastertypeid: 2,
//                 selectedlist: [],
//                 selecteddetail: {},
//                 departmentid: $scope.currentcontext.userDepartmentId
//             };
//         }

//         function checkExist(item) {
//             for (var idx in $scope.details) {
//                 if ((item.TestId == $scope.details[idx].TestId) && ($scope.details[idx].Status == 1)) {
//                     return true;
//                 }
//             }
//             return false
//         }

//         $scope.saveTickSheets = function () {
//             $scope.details.splice(-1, 1);
//             for (var idx in $scope.ticksheetconfig.selectedlist) {
//                 var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
//                 var item = {
//                     Quantity: 1, TestPrice: 10, Discount: 0, TaxCost: 0,
//                     OrderPriorityId: $scope.item.OrderPriorityId, NetAmount: 10, OrderStatusId: $scope.item.OrderStatusId,
//                     RequestDate: $scope.item.OrderRequestDate, ScheduleDate: $scope.item.OrderScheduleDate, Status: 1,
//                     TestId: ticksheetitem.ItemId,
//                     TestName: ticksheetitem.Testmaster.Name,
//                     TestTypeId: ticksheetitem.Testmaster.TESTMASTERTYPId,
//                     TestCode: ticksheetitem.Testmaster.Code,
//                     TestDescription: ticksheetitem.Testmaster.Description
//                 }
//                 if (!checkExist(item)) {
//                     $scope.details.push(item);
//                 }
//             }
//             $scope.addNewLineItem();
//             $scope.currentcontext.option = 'detail';
//         }

//         $scope.addTickSheet = function () {
//             var testmaster = $scope.ticksheetconfig.selecteddetail.Testmaster;

//             var currentItem = getNewItem();
//             currentItem.TestId = $scope.ticksheetconfig.selecteddetail.ItemId;
//             currentItem.TestTypeId = testmaster.TESTMASTERTYPId;
//             currentItem.TestName = testmaster.Name;
//             currentItem.TestCode = testmaster.Code;
//             currentItem.TestDescription = testmaster.Description;

//             utl.Modal.open('patientemr.patientorderdetail', {
//                 params: { id: 0, pid: $scope.item.PatientId, current_item: currentItem },
//                 confirmCallback: $scope.onDetailSave
//             }
//             );
//         }

//         $scope.lookupCallback = function (scope, data, options, hasError) {
//             $scope.lookup = hasError ? {} : data;
//             $scope.getItem();
//         }

//         function loadData() {
//             $scope.getItem();
//             $scope.getDetails();
//             $scope.getPatientAttachments();
//             $scope.loadTickSheet();
//         }

//         $scope.initLookup = function () {
//             var inputData =
//                 [

//                 ]
//             var options = {
//                 action: 'General/Options/getoptions',
//                 data: inputData,
//                 type: 'post',
//                 onComplete: $scope.lookupCallback
//             };
//             utl.Http.doAction(options);
//         }

//         $scope.initLookup();
//     }

//     dietorderFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

// })();
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dietorderFormController', dietorderFormController);

    function dietorderFormController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig) {
        var vm = this;

        uibButtonConfig.activeClass = "opt-selected";
        $scope.item = {
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            OrderPriorityId: 1,
            OrderStatusId: 9 //9 - DRAFT
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            attachmentcount: 0
        };

        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.PatientId = parseInt($stateParams.pid);
        $scope.currentcontext.option = 'detail';
        $scope.currentcontext.userDepartmentId = -1;


        $scope.details = [];
        $scope.options = [{
                key: 'detail',
                name: $translate.instant('patientemr.patientorder-form.neworders.lbl')
            },
            {
                key: 'ticksheet',
                name: $translate.instant('patientemr.patientorder-form.ticksheet.lbl')
            }
        ];


        //Patient control related code starts

        vm.selectedPatient = {};
        $scope.patientChange = function () {
            $scope.item.EncounterId = vm.selectedPatient.EncounterId || 0;
        }

        //Patient contro related code ends


        //Visibility rules starts

        function isMainContext() {
            return $scope.currentcontext.context == 'main';
        }

        $scope.canShowPatientControl = function () {
            return isMainContext();
        }

        //Visibility rules ends

        $scope.addNewLineItem = function () {
            var detail = getNewItem();

            if ($scope.currentcontext.id > 0) {
                detail.PatientOrderId = $scope.currentcontext.id;
            }
            $scope.details.push(detail);
        }

        function getNewItem() {
            var detail = {
                Id: 0,
                PatientId: $scope.item.PatientId,
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
            return detail;
        }

        //Visibility handling starts

        //TickSheet area begins
        $scope.loadTickSheet = function () {
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
                if ((item.TestId == $scope.details[idx].TestId) && ($scope.details[idx].Status == 1)) {
                    return true;
                }
            }
            return false
        }

        // $scope.saveTickSheets = function() {
        //     $scope.details.splice(-1, 1);
        //     for(var idx in $scope.ticksheetconfig.selectedlist) {
        //         var ticksheetitem = $scope.ticksheetconfig.selectedlist[idx];
        //         var item = {
        //                 Quantity: 1,TestPrice : 10,Discount : 0,TaxCost : 0,
        //                 OrderPriorityId : $scope.item.OrderPriorityId, NetAmount : 10, OrderStatusId : $scope.item.OrderStatusId,
        //                 RequestDate : $scope.item.OrderRequestDate, ScheduleDate : $scope.item.OrderScheduleDate, Status : 1,
        //                 TestId : ticksheetitem.ItemId,
        //                 TestName : ticksheetitem.Testmaster.Name,
        //                 TestTypeId : ticksheetitem.Testmaster.TESTMASTERTYPId,
        //                 TestCode : ticksheetitem.Testmaster.Code,
        //                 TestDescription : ticksheetitem.Testmaster.Description
        //             }
        //             if(!checkExist(item)) {
        //                 $scope.details.push(item);
        //             }
        //     }
        //     $scope.addNewLineItem();
        //     $scope.currentcontext.option = 'detail';
        // }

        $scope.addTickSheet = function () {
            var testmaster = $scope.ticksheetconfig.selecteddetail.Testmaster;

            var currentItem = getNewItem();
            currentItem.TestId = $scope.ticksheetconfig.selecteddetail.ItemId;
            currentItem.TestTypeId = testmaster.TESTMASTERTYPId;
            currentItem.TestName = testmaster.Name;
            currentItem.TestCode = testmaster.Code;
            currentItem.TestDescription = testmaster.Description;

            utl.Modal.open('patientemr.patientorderdetail', {
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
            utl.Modal.open('patientemr.patientorderdetail', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.onDetailSave
            });
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
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        }

        $scope.previousorders = function () {
            utl.Modal.open('patientemr.previousorders', {
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

            var isDuplicate = utl.Common.isDuplicateRec($scope.details, {
                pivotkey: 'TestId',
                displaykey: 'TestName'
            });
            if (isDuplicate) {
                item.TestName = '';
                item.TestId = '';
                return;
            }

            //Set department id
            item.DepartmentId = item.testinfo.DepartmentId;
            item.TestTypeId = item.testinfo.TestTypeId;

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
                    $scope.item.OrderFromId = doctorObj.DepartmentId;
                }
            }
        };

        //Actions

        $scope.backToList = function () {
            $state.go(parentState);
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
            var activeRecords = $filter('filterArrayItems')($scope.details, [{
                search: 1,
                fields: ['Status']
            }]);
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
                item.PatientId = $scope.item.PatientId;
                item.OrderStatusId = $scope.item.OrderStatusId;

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
            var inputData = [{
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "User"
                },
                {
                    "Key": "OrderPriority"
                },
                {
                    "Key": "Department"
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

    dietorderFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig'];

})();