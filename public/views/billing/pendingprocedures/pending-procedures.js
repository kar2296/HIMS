(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingProcedureListController', pendingProcedureListController);

    function pendingProcedureListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            if (modalConfig.params.eid) {
                $scope.currentcontext.EncounterId = modalConfig.params.eid;
            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.id = modalConfig.params.id

        $scope.items = [];
        //Dynamic form starts
        function initDynamicForm() {
            $scope.defaultdata = {
                mrn: '',
                patientname: '',
                dateofbirth: '',
                orderpriorityid: 1,
                phoneno: '',
                visitid: '',
                From: utl.Formatter.getCurrentDate(),
                PatientId: -1,
                orderstatusid: 1,
                To: '',
                ReferralId: -1,
                PinCode: '',
                VisitDate: '',
                Country: '',
                VisitTypeId: -1,
                State: '',
                GuarantorId: -1,
                CityTown: '',
                IsAdmitted: false,
                Area: ''
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [{
                        type: 'select',
                        translate: 'patientemr.patientorder-list.filter_priority.lbl',
                        model: 'orderpriorityid',
                        options: $scope.lookup.OrderPriority,
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.filter_status.lbl',
                        model: 'orderstatusid',
                        options: $scope.lookup.OrderStatus,
                        position: {
                            r: 0,
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

        $scope.actionClick = function(actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));;
            }
            if ($scope.currentcontext.id >= 1) {
                $scope.getList()
            };
        }

        $scope.toggleCanShowDetails = function(clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        //Dynamic form  ends

        //getList
        $scope.getListCallback = function(scope, res, options, hasError) {
            for (var jdx in res.Data) {
                var list = res.Data[jdx];
                list.IsSelected = false;
                $scope.items.push(list);
            }
            // $scope.items = res.Data;
        };

        $scope.getList = function() {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.id },
                    { Key: 4, Value: [1] },
                    { Key: 10, Value: $scope.currentcontext.DoctorId },
                    // { Key: 30, Value: [4, 5] },
                    // { Key: 35, Value: false }
                ],
                PageContext: { PageSize: 100, PageNumber: 1 }
            };

            var options = {
                action: 'emr/procedureorder/GetProcedureOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.IsOrderSelected = function(item) {
            for (var idx in $scope.items) {
                var orderlist = $scope.items[idx];
                if (orderlist.Id == item.Id) {
                    orderlist.IsSelected = true;
                }
            }
        }

        $scope.loadorders = function() {
            $scope.Seleectedrows = [];
            for (var lx in $scope.items) {
                var SelectedOrd = $scope.items[lx];
                if (SelectedOrd.IsSelected == true) {
                    $scope.Seleectedrows.push(SelectedOrd);
                }
            }
            $scope.confirmCallback({
                list: $scope.Seleectedrows
            });
        }

        $scope.select = function(item) {
            $scope.confirmCallback({
                id: item.Id
            });
        }

        //Lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // initDynamicForm();
            if ($scope.currentcontext.id >= 1) {
                $scope.getList()
            };
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "OrderStatus"
                },
                {
                    "Key": "OrderPriority"
                },
                {
                    "Key": "ReceiptType"
                },
                {
                    "Key": "VisitType"
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

    pendingProcedureListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();