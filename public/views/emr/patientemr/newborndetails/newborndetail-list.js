(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newborndetailsListController', newborndetailsListController);

    function newborndetailsListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            NewBornStatusId: 2,
            ModeOfDeliveryId: -1,

            namemrn: '',
            // DeliveryDate: utl.Formatter.getCurrentDate(),

        };
        //  Start
        //Dynamic form starts

        $scope.currentcontext = {
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        //Dynamic form  ends    
        //  End

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var FromDate = $filter('date')($scope.currentfilter.deliverydate, 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')($scope.currentfilter.deliverydate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                    { Key: 2, Value: $scope.currentfilter.ModeOfDeliveryId },
                    { Key: 3, Value: $scope.currentfilter.NewBornStatusId },
                    { Key: 4, Value: FromDate },
                    { Key: 5, Value: ToDate },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/newborndetail/GetNewBornDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }

        //Grid Actions
        $scope.addNew = function () {
            $state.go('patientemr.newbornform', { id: 0 });
        };



        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/newborndetail/DeleteNewBornDetail',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        // }

        // Cancel Requests from List Screen Function - End 
        $scope.cancelCallback = function (scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.Cancel = function (NewBornId, NewBornStatusId) {
            var options = {
                action: 'emr/newborndetail/UpdateNewBornDetail',
                data: { Data: { Id: NewBornId, NewBornStatusId: NewBornStatusId } },
                type: 'post',
                onComplete: $scope.cancelCallback
            };
            utl.Http.doAction(options);
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('patientemr.newbornform', { id: row.entity.Id, pid: $scope.currentcontext.pid });
            }
            else if (actionType == 'cancel') {
                $scope.Cancel(row.entity.Id, 3);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);

            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "DeliveryDate", displayName: $translate.instant('patientemr.newborndetails-list.deliverydate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.DeliveryDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.DeliveryDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "Gender.Description", displayName: $translate.instant('patientemr.newborndetails-list.gender.lbl') },
                {
                    field: "ModeOfDelivery.Description", displayName: $translate.instant('patientemr.newborndetails-list.modeofdelivery.lbl')

                },

                {
                    field: "Weight", displayName: $translate.instant('patientemr.newborndetails-list.weight.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.Weight }} </span>" + "<span >{{row.entity.WeightUnits.Description}}</span>" + "</div>"

                },
                {
                    field: "Length", displayName: $translate.instant('patientemr.newborndetails-form.lenght.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.Length }} </span>" + "<span >{{row.entity.HEIGHTUNITS.Description}}</span>" + "</div>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('patientemr.newborndetails-list.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                    "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Doctor.LastName}}</span>" +
                    "</span></div>"
                }, {
                    field: "PediatricianId", displayName: $translate.instant('patientemr.newborndetails-list.peditrician.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                    "<span >{{row.entity.Pediatrician.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Pediatrician.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Pediatrician.LastName}}</span>" +
                    "</span></div>"
                },

                { field: "NewBornStatus.Description", displayName: $translate.instant('patientemr.newborndetails-list.Status.lbl') },
                // Status based Button Visiblity - Start 
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.NewBornStatusId==2 || row.entity.NewBornStatusId==3 "><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.NewBornStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.NewBornStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                                                                                                      <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-show="row.entity.NewBornStatusId==2"><i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"></i></span>\
          </div>',
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
                // Status based Button Visiblity - End 
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ModeOfDelivery" },
                { "Key": "NewBornStatus" },
                { "Key": "WeightUnits" },
                { "Key": "HEIGHTUNITS" },
            ];
            /*   2/12/2016 */
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
    newborndetailsListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();