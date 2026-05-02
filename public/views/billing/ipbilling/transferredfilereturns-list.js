(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('TransferredFileReturnsListController', TransferredFileReturnsListController);

    function TransferredFileReturnsListController($rootScope,$timeout,$scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.Items = [];
        $scope.currentfilter = {
            MRDIPFileStatusId: [5,7],
            RequestDate: utl.Formatter.getCurrentDate(),
        };
        //  $scope.currentfilter.DocumentDate = new Date();
        $scope.currentcontext = {};

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FromDate = $filter('date')($scope.currentfilter.RequestDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.RequestDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.PatientName
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.VisitNo
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.MRDIPFileStatusId
                    },
                    { Key: 9, Value: FromDate },
                    { Key: 10, Value: ToDate },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'IPManagement/IPFileRequest/GetIPFileRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);

        };

        //Grid Actions

        $scope.item = {};

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'IPManagement/IPFileRequest/DeleteIPFileRequest',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'filereturn') {
                // utl.Session.setEMRPatientId(entity.PatientId);
                $state.go('app.transferredfilereturnsform', {
                    id: entity.Id,
                });
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                style:{
                    field:'MRDIPFileStatusId',
                    value:{
                        7:{'background':'red','color':'#fff'}
                    }
                }
            },
            columnDefs: [
                {
                    field: "S.No",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "RequestDate",
                    displayName: $translate.instant('Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.RequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },

                {
                    field: "VisitNo",
                    displayName: $translate.instant('Visit No')
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('Patient Name')
                },
                {
                    field: "RequestUser",
                    displayName: $translate.instant('inventory.stockrequests.requestedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.RequestUser.FirstName}}&nbsp;</span>" + "<span >{{entity.RequestUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "ApproveUser",
                    displayName: $translate.instant('Approved By'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ApproveUser.Title.Description}}&nbsp;</span>" + "<span >{{entity.ApproveUser.FirstName}}&nbsp;</span>" + "<span >{{entity.ApproveUser.LastName}}</span>" + "</div>"
                },
                {
                    field: "DoctorName",
                    displayName: $translate.instant('Doctor Name')
                },
                {
                    field: "MRDIPFileStatus.Description",
                    displayName: $translate.instant('admissions.status.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;class='col-sm-2'></div>\
                                                &nbsp;<span>{{entity.MRDIPFileStatus.Description}}</span>\
                                            </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'filereturn\',entity)" ng-hide="entity.MRDIPFileStatusId==8"><i class="btn text-white dem-color4  btn-xs" aria-hidden="true"><strong>File Return</strong></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'filereturn\',entity)" ng-show="entity.MRDIPFileStatusId==8"><i class="btn text-white dem-color4  btn-xs" aria-hidden="true"><strong>View</strong></i></span>\
                            </div>',
                    handleEvent: $scope.handleEvents,
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "MRDIPFileStatus"
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

    TransferredFileReturnsListController.$inject = ['$rootScope','$timeout','$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();