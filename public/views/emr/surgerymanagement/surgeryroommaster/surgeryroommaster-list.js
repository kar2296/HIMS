(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryroommasterController', surgeryroommasterController);

    function surgeryroommasterController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl, ) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.Items = [];
        $scope.currentfilter = {
            SurgeryRoomTypeId: -1,
            ActiveStatusId: 2,
            CodeName: ''
        };
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();

        //Dynamic form  ends
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getList = function () {
            var inputData = {
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.SurgeryRoomTypeId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.CodeName
                    }
                    // { Key: 3, Value: $scope.currentfilter.PatientNameMRN },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'OtManagement/SurgeryRoomMaster/GetSurgeryRoomMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            utl.Modal.open('app.surgeryroom-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.initLookup
            });
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.surgeryroom-form', {
                    params: {
                        id: entity.Id
                    },
                    confirmCallback: $scope.initLookup
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "SNo",
                    displayName: "SNo",
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "Code",
                    displayName: $translate.instant('surgeryroommaster.code.lbl')
                },
                {
                    field: "Name",
                    displayName: $translate.instant('surgeryroommaster.name.lbl')
                },
                {
                    field: "SurgeryRoomType.Description",
                    displayName: $translate.instant('surgeryroommaster.surgeryroomtype.lbl')
                },
                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('surgeryroommaster.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [{
                            actiontype: 'edit',
                            display: 'common.editaction.lbl'
                        },
                        // {actiontype: 'delete', display : 'common.deleteaction.lbl'}
                    ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "SurgeryRoomType"
                },
                {
                    "Key": "Procedure"
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Room",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: 3
                        }]
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
                    "Key": "ActiveStatus"
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
    surgeryroommasterController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];
})();