(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientlabourListController', patientlabourListController);

    function patientlabourListController($scope, $stateParams, $state, $translate, utl,$filter) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            LabourStatusId: 2,
            ModeOfDeliveryId: -1,
   lmpdate: utl.Formatter.getCurrentDate(),
            namemrn: ''
        };
        //  Start
        //Dynamic form starts

        $scope.currentcontext = {
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        //Dynamic form  ends    
        //  End
        $scope.patientInfo = {};

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
     var From = $filter('date')($scope.currentfilter.lmpdate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.lmpdate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid },
                
                    { Key: 3, Value: $scope.currentfilter.LabourStatusId },
                    { Key: 4, Value: $scope.currentfilter.ModeOfDeliveryId },
                    { Key: 5, Value: From },
                    { Key: 6, Value: To },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'emr/PatientLabourDetail/GetPatientLabourDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function () {
        //     $state.go('patientemr.labourdetail', { id: 0 });
        // }


        $scope.getpatientGenderCallback = function (scope, res, options, hasError) {

            $scope.patientInfo = res.Data[0];

        };
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.getpatientGender = function () {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {

                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.pid } //,
                    ],

                };

                var options = {
                    action: 'registration/patient/GetPatients',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getpatientGenderCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.addNew = function () {
            if ($scope.patientInfo.GenderId == 2) {
                $state.go('patientemr.patientlabourform', { id: 0 });
            }
            else {
                utl.Alert.showErrorMsg($translate.instant('patientemr.patientlabourdetails.errormsg.lbl'));

            }
        };
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/PatientLabourDetail/DeletePatientLabourDetail',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
     
         $scope.cancelItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.LabourStatusId = 3;
            var actionName = 'emr/PatientLabourDetail/UpdatePatientLabourDetail';
            var options = {
                action: actionName,
                data: { Data: $scope.item},
                type: 'post',
                onComplete: $scope.cancelItemCallback
            };
            utl.Http.doAction(options);
        }
           $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('patientemr.labourdetail', { id: row.entity.Id, pid: $scope.currentcontext.pid });
            }
            // if (actionType == 'Cancel') {
            //     $scope.Cancel(row.entity.Id);
            // }
             else if (actionType == 'cancel') {
                $scope.item = row.entity;
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Do You Want To Cancel LabourDetails',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onCancelConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.AllergyName);

            }
        }
        $scope.getPatientInfo = function (row) {
            console.log(row);
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "LMPDate", displayName: $translate.instant('patientemr.patientlabourdetails-list.lmp.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.LMPDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.LMPDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "Gravida",
                    displayName: $translate.instant('patientemr.patientlabourdetails.para.lbl'),

                },
                {
                    field: "Para",
                    displayName: $translate.instant('patientemr.patientlabourdetails.gravida.lbl'),

                },
                {
                    field: "ModeOfDelivery.Description",
                    displayName: $translate.instant('patientemr.patientlabourdetails-list.modeofdelivery.lbl'),

                },
                {
                    field: "Patient",
                    displayName: $translate.instant('patientemr.patientlabourdetails-list.doctorname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<span ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">' +
                    "<span >{{row.entity.Doctor.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Doctor.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Doctor.LastName}}</span>" +
                    "</span></div>"
                },

                { field: "LabourStatus.Description", displayName: $translate.instant('patientemr.patientlabourdetails-list.Status.lbl') },
                // Status based Button Visiblity - Start 
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)" ng-show="row.entity.LabourStatusId==2 || row.entity.LabourStatusId==3"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.LabourStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'delete\',row)" ng-show="row.entity.LabourStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                                                                                <span class="grid-action" ng-click="grid.appScope.handleEvents(\'cancel\',row)" ng-show="row.entity.LabourStatusId==2"><i class="btn btn-danger btn-rounded fa fa-close" aria-hidden="true"></i></span>\
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
            $scope.getpatientGender();

        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ModeOfDelivery" },
                { "Key": "LabourStatus" }
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
    patientlabourListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$filter'];

})();