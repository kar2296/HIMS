(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('completeorderController', completeorderController);

    function completeorderController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, uibButtonConfig, $timeout) {
        var vm = this;

        $scope.gridData = [];
        $scope.currentfilter = {
            patientname: '',
            orderDate: utl.Formatter.getCurrentDate(),
            VirtualOrderStatusId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.currentcontext = {};
        $scope.drdetail = $stateParams.drData;
        $scope.slotdata = $stateParams.slotinfo;
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid) {
            $scope.currentfilter.pid = parseInt($stateParams.pid);
        }
        if ($stateParams.ctgryid) {
            $scope.currentfilter.VirtualCategoryId = parseInt($stateParams.ctgryid);
        }
        $scope.currentcontext.VCategory = [];

        $scope.CategorySelection = function (VirtualCategoryId) {
            if (VirtualCategoryId) {
                $scope.currentfilter.VirtualCategoryId = VirtualCategoryId;
                $scope.getList();
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);


        $scope.setMaster = function(item) {
            $scope.selected = item;
        }
        
        $scope.isSelected = function(item) {
            return $scope.selected === item;
        }

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.loaduserInfo = function () {
            for (var idx in $scope.PendingOrders) {
                var patInfo = $scope.PendingOrders[idx];
                $scope.getPatientUsers(patInfo);
            }
        };

        $scope.getPatientUsersCallback = function (scope, data, options, hasError) {
            var userpatId = data.Data[0].PatientId;
            var UserId = data.Data[0].Id
            for (var idx in $scope.PendingOrders) {
                var item = $scope.PendingOrders[idx];
                if (item.PatientId == userpatId) {
                    item.PatUserId = UserId;
                }
            }
        };
        $scope.getPatientUsers = function (patInfo) {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 3,
                        Value: 8
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                    {
                        Key: 23,
                        Value: patInfo.PatientId
                    },

                ],
            };
            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientUsersCallback
            };

            utl.Http.doAction(options);
        }


        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.PendingOrders = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.ConsultTypeId = item.VirtualSubCategory.ConsultancyTypeId;
                item.AppointmentDate = item.OrderScheduleDate;
                if (item.PatientId) {
                    $scope.PendingOrders.push(item);
                }
            };
            $scope.loaduserInfo();
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {

            var From = $filter('date')($scope.currentfilter.orderDate, 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')($scope.currentfilter.orderDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: 6
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.orderpatient
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
                        Value: $scope.currentfilter.pid
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

        $scope.assignDoctorCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.assignDoctor = function (entity) {
            $scope.item = entity;
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/AssignVirtualOrder',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.assignDoctorCallback
            };
            utl.Http.doAction(options);

        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'confirm') {
                utl.Modal.open('app.orderInfoStatus', {
                    params: {
                        id: entity.Id,
                        ctypeId: entity.ConsultTypeId,
                        apnmntdate: entity.AppointmentDate,
                        patUserid: entity.PatUserId
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'assign') {
                utl.Modal.open('app.assignvirtualorders', {
                    params: {
                        id: entity.Id,
                        ctgryId: entity.VirtualCategoryId
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'orderinfo') {
                utl.Modal.open('app.virtualorderinfo', {
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
                    displayName: $translate.instant('registration.checkedinpatients.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OrderScheduleDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.OrderRequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('Patient Name'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
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
                    <span class="grid-action" ng-click="handleEvents(\'assign\',entity)" ng-if="entity.VirtualOrderStatusId==2"tooltip-placement="top">\
                    <img class="imgsrc" src="app/img/main/advice.png"  uib-tooltip="Assign" style="margin-top: 0px;width: 26px;"></span>\
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

    completeorderController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', 'uibButtonConfig', '$timeout'];

})();