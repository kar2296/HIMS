(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newgeneralvendorMastersListController', newgeneralvendorMastersListController);

    function newgeneralvendorMastersListController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            VendorCode: '',
            VendorName: '',
            ActiveStatusId: 2,
            VendorTypeId: 1,
            BusinessDomainId: -1,
            DistributionTypeId: -1,
            SupplyTypeId: 2
            // SupplyTypeId: parseInt(utl.Session.getCurrentItemCategoryId())
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.Item = {
            Activefrom: utl.Formatter.getCurrentDate()
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                From: '',
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

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'text',
                    translate: 'inventory.vendormasters.number.lbl',
                    model: 'PhoneNumber',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'text',
                    translate: 'inventory.vendormasters.email.lbl',
                    model: 'EmailAddress',
                    options: $scope.lookup.FromStore,
                    position: {
                        r: 0,
                        c: 1
                    }
                },
                {
                    type: 'text',
                    translate: 'inventory.vendormasters.city.lbl',
                    model: 'City',
                    options: $scope.lookup.ToStore,
                    position: {
                        r: 1,
                        c: 0
                    }
                },
                {
                    type: 'text',
                    translate: 'inventory.vendormasters.leadtime.lbl',
                    model: 'LeadTime',
                    options: $scope.lookup.VendorMaster,
                    position: {
                        r: 1,
                        c: 1
                    }
                }

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
        };

        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            // if ($scope.currentfilter.VendorTypeId == 2) {
            //     $scope.currentfilter.SupplyTypeId = -1;
            // } else {
            //     $scope.currentfilter.SupplyTypeId = parseInt(utl.Session.getCurrentItemCategoryId());
            // }
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.vendorcode
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.vendorname
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.VendorTypeId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.DistributionTypeId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.BusinessDomainId
                },
                {
                    Key: 7,
                    Value: $scope.advancedfilter.PhoneNumber
                },

                {
                    Key: 8,
                    Value: $scope.advancedfilter.EmailAddress
                },
                {
                    Key: 9,
                    Value: $scope.advancedfilter.City
                },
                {
                    Key: 10,
                    Value: $scope.advancedfilter.LeadTime
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.SupplyTypeId
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/vendormaster/GetVendorMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.newvendormastertabgeneral.vendormastergeneral', {
                id: 0
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/vendormaster/DeleteVendorMaster',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.newvendormastertabgeneral.vendormastergeneral', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    VendorMasterId: entity.VendorMasterId,
                    VendorCode: entity.VendorCode,
                    VendorName: entity.VendorName,
                    VendorDescription: entity.VendorDescription,
                    VendorTypeId: entity.VendorTypeId,
                    Pincode: entity.Pincode,
                    Area: entity.Area,
                    City: entity.City,
                    State: entity.State,
                    Country: entity.Country,
                    MobileNumber: entity.MobileNumber,
                    PhoneNumber: entity.PhoneNumber,
                    FaxNumber: entity.FaxNumber,
                    EmailAddress: entity.EmailAddress,
                    ManufacturerName: entity.ManufacturerName,
                    ContactPerson: entity.ContactPerson,
                    BusinessDomainId: entity.BusinessDomainId,
                    DistributionTypeId: entity.DistributionTypeId,
                    PaymentTermsId: entity.PaymentTermsId,
                    LicenceCode: entity.LicenceCode,
                    AddressLine1: entity.AddressLine1,
                    AddressLine2: entity.AddressLine2,
                    ddressLine3: entity.AddressLine3,
                    VendorUrl: entity.VendorUrl,
                    LeadTime: entity.LeadTime,
                    CurrencyCodeId: entity.CurrencyCodeId,
                    IsActive: entity.IsActive,
                    ActiveFrom: entity.ActiveFrom,
                    ActiveTo: entity.ActiveTo,
                    ActiveStatusId: entity.ActiveStatusId,
                    Comments: entity.Comments
                });
            } else if (actionType == 'view') {
                $state.go('app.newvendormastertabgeneral.vendormastergeneral', {
                    id: entity.Id,
                    IsProfile: entity.IsProfile,
                    VendorMasterId: entity.VendorMasterId,
                    VendorCode: entity.VendorCode,
                    VendorName: entity.VendorName,
                    VendorDescription: entity.VendorDescription,
                    VendorTypeId: entity.VendorTypeId,
                    Pincode: entity.Pincode,
                    Area: entity.Area,
                    City: entity.City,
                    State: entity.State,
                    Country: entity.Country,
                    MobileNumber: entity.MobileNumber,
                    PhoneNumber: entity.PhoneNumber,
                    FaxNumber: entity.FaxNumber,
                    EmailAddress: entity.EmailAddress,
                    ManufacturerName: entity.ManufacturerName,
                    ContactPerson: entity.ContactPerson,
                    BusinessDomainId: entity.BusinessDomainId,
                    DistributionTypeId: entity.DistributionTypeId,
                    PaymentTermsId: entity.PaymentTermsId,
                    LicenceCode: entity.LicenceCode,
                    AddressLine1: entity.AddressLine1,
                    AddressLine2: entity.AddressLine2,
                    ddressLine3: entity.AddressLine3,
                    VendorUrl: entity.VendorUrl,
                    LeadTime: entity.LeadTime,
                    CurrencyCodeId: entity.CurrencyCodeId,
                    IsActive: entity.IsActive,
                    ActiveFrom: entity.ActiveFrom,
                    ActiveTo: entity.ActiveTo,
                    ActiveStatusId: entity.ActiveStatusId,
                    Comments: entity.Comments
                });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "VendorCode",
                displayName: $translate.instant('inventory.vendormasters.code.lbl')
            },
            {
                field: "VendorName",
                displayName: $translate.instant('inventory.vendormasters.name.lbl')
            },

            {
                field: "VendorType.Description",
                displayName: $translate.instant('inventory.vendormasters.type.lbl')
            },

            // {
            //     field: "BusinessDomain.Description",
            //     displayName: $translate.instant('inventory.vendormaster.businessdomain.lbl')
            // },

            {
                field: "DistributionType.Description",
                displayName: $translate.instant('inventory.vendormaster.distributiontype.lbl')
            },

            {
                field: "MobileNumber",
                displayName: $translate.instant('inventory.vendormasters.number.lbl')
            },
            {
                field: "EmailAddress",
                displayName: $translate.instant('inventory.vendormasters.email.lbl')
            },
            {
                field: "City",
                displayName: $translate.instant('inventory.vendormasters.city.lbl')
            },
            // {
            //     field: "LeadTime",
            //     displayName: $translate.instant('inventory.vendormasters.leadtime.lbl')
            // },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('inventory.vendormasters.status.lbl')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                     <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                    \
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "VendorType"
            },
            {
                "Key": "ActiveStatus"
            },
            {
                "Key": "PhoneNumber"
            },
            {
                "Key": "Email"
            },
            {
                "Key": "City"
            },
            {
                "Key": "LeadTime"
            },
            {
                "Key": "DistributionType"
            },
            {
                "Key": "BusinessDomain"
            },
            {
                "Key": "SupplyType"
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

    newgeneralvendorMastersListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();