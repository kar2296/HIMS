(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('portalpendingorderController', portalpendingorderController);

    function portalpendingorderController($scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;

        $scope.gridData = [];
        $scope.currentfilter = {
            patientname: '',
            orderDate: utl.Formatter.getCurrentDate(),
            // VirtualOrderStatusId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.currentcontext.VCategory = [];

        $scope.CategorySelection = function (VirtualCategoryId) {
            if (VirtualCategoryId) {
                $scope.currentfilter.VirtualCategoryId = VirtualCategoryId;
                $scope.getList();
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            $scope.PendingOrders =[];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.ConsultTypeId = item.VirtualSubCategory.ConsultancyTypeId;
                item.AppointmentDate = item.OrderRequestDate;
                if (item.PatientId) {
                    // vm.gridConfig.data.push(item);
                    $scope.PendingOrders.push(item);
                }
            };
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var From = $filter('date')($scope.currentfilter.orderDate, 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')($scope.currentfilter.orderDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.VirtualOrderStatusId
                    },
                    {
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.VirtualCategoryId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.VirtualSubCategoryId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentcontext.pid
                    }
                ]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'confirm') {
                utl.Modal.open('patientportal.cancelOrder', {
                    params: {
                        id: entity.Id,
                        ctypeId: entity.ConsultTypeId,
                        apnmntdate: entity.AppointmentDate
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'orderinfo') {
                utl.Modal.open('patientportal.virtualorderinfo', {
                    params: {
                        id: entity.Id,
                    },
                    confirmCallback: $scope.getList
                });
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "OrderNumber",
                    displayName: $translate.instant('Ref#')
                },
                {
                    field: "StartDate",
                    displayName: $translate.instant('Request Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OrderRequestDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.OrderRequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "VirtualCategory.CategoryName",
                    displayName: $translate.instant('Category'),
                },
                {
                    field: "VirtualSubCategory.SubCategoryName",
                    displayName: $translate.instant('Sub Category'),
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('Doctor Name'),
                },
                {
                    field: "VirtualOrderStatus.Description",
                    displayName: $translate.instant('registration.checkedinpatients.staturs.lbl'),
                },
                {
                    field: "Id",
                    displayName: $translate.instant('registration.checkedinpatients.action.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'confirm\',entity)"  ng-if="entity.VirtualOrderStatusId==1"tooltip-placement="top">\
                    <img class="imgsrc" src="app/img/main/confirm.png"  uib-tooltip="Confirm" style="margin-top: 0px;width: 26px;"></span>\
                     <span class="grid-action" ng-click="handleEvents(\'orderinfo\',entity)" tooltip-placement="top">\
                    <img class="imgsrc" src="app/img/main/order.png"  uib-tooltip="Order Info" style="margin-top: 0px;width: 26px;"></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.backToList = function () {
            $state.go('app.slotschedule', {
                drData: $scope.drdetail,
                slotinfo: $scope.slotdata
            });
        };

        $scope.custom_sort = function (a, b) {
            if (b.Id && a.Id)
                return a.Id - b.Id;
            else
                return 0;
        }

        $scope.getCategoryData = function () {
            for (var idx in $scope.lookup.VirtualCategory) {
                var categorydata = $scope.lookup.VirtualCategory[idx];
                if (categorydata.Id == -1) {
                    categorydata.Text = 'All';
                }
                $scope.currentcontext.VCategory.push(categorydata);
                $scope.lookup.VirtualCategory.sort($scope.custom_sort);

            }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.getCategoryData();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "VirtualOrderStatus"
                },
                {
                    "Key": "VirtualCategory",
                },
                {
                    "Key": "VirtualSubCategory",
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

    portalpendingorderController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

})();