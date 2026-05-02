(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabCenterSlotListController', LabCenterSlotListController);

    function LabCenterSlotListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            // FacilityId: utl.Session.getCurrentFacilityId(),
            AppointmentSessionTypeId: -1,
            DoctorId: -1,
            SpecialityId: -1,
            ActiveStatusId: 2
        };
        $scope.currentcontext = {};
        if ($stateParams.tp == 'dt') {
            $stateParams.id = utl.Session.getCurrentFacilityId();
        }
        $scope.currentcontext.id = parseInt($stateParams.id);
        var facilityid = parseInt($stateParams.id);

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.AppointmentSessionTypeId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.SpecialityId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.OrderTypeId
                    },
                    {
                        Key: 11,
                        Value: '0'
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function() {
            $state.go('app.labcenterprofiletab.labcenterslots', {
                aid: 0,
                facid: parseInt($stateParams.id),
                FacilityId: parseInt($stateParams.id),
                FacilityName: $state.params.FacilityName,
                IsProfile: $state.params.IsProfile
            });
        }


        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'appointment/AppointmentMultiSession/DeleteAppointmentMultiSession',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {
            var docName = '';
            if (entity.User) {
                if (entity.User.Title.Description) {
                    docName = entity.User.Title.Description;
                }
                if (entity.User.FirstName) {
                    docName += ' ' + entity.User.FirstName;
                }
                if (entity.User.LastName) {
                    docName += ' ' + entity.User.LastName;
                }
            }
            if (actionType == 'edit') {
                $state.go('app.labcenterprofiletab.labcenterslots', {
                    aid: entity.Id,
                    FacilityId: parseInt($stateParams.id),
                    FacilityName: $state.params.FacilityName,
                    IsProfile: $state.params.IsProfile
                })
            }
            // {
            //     utl.Modal.open('app.apptmultisessionfrom', {
            //         params: {
            //             id: entity.Id,
            //             DoctorName: docName
            //         },
            //         confirmCallback: $scope.getList
            //     });
            // } 
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "VirtualSubCategory.SubCategoryName",
                    displayName: $translate.instant('Order Type')
                },
                {
                    field: "SessionType.Description",
                    displayName: $translate.instant('appointment.appointmentsession-list.appointmentsessiontype.lbl')
                },
                {
                    field: "StartTime",
                    displayName: $translate.instant('Start Time'),
                    cellTemplate: "<ngformatdate date-val='entity.StartTime'></ngformatdate>"
                },
                {
                    field: "EndTime",
                    displayName: $translate.instant('End Time'),
                    cellTemplate: "<ngformatdate date-val='entity.EndTime'></ngformatdate>"
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('appointment.appointmentcategory-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                        <span class="grid-action" ng-click="handleEvents(\'delete\',entity)"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt="">\
                     </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "AppointmentSessionType"
                },
                {
                    "Key": "Facility"
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
                    "Key": "Speciality"
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "VirtualSubCategory",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: true
                        }],

                    }
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

    LabCenterSlotListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();