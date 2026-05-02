(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('alertViewFormController', alertViewFormController);

    function alertViewFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = getDefaultItem();

        function getDefaultItem() {
            var item = {
                        OnsetDate : utl.Formatter.getCurrentDateWithoutTime(),
                        DepartmentId : -1
                    };
            return item;            
        }
         $scope.selectedPatient = {};
        $scope.currentcontext = {
            userdepartments : null
        };
        if (modalConfig && modalConfig.params) {
            if(modalConfig.params.pid) {
                $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
                $scope.item.PatientId = $scope.currentcontext.pid;
                $scope.currentcontext.isPatientAlert = true;
            }
        }
        
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
         
        $scope.selectedPatient = {};
         $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

           $scope.Delete = function () {
            var PatientName = $scope.selectedPatient.FirstName +''+ $scope.selectedPatient.LastName +'/'+ $scope.selectedPatient.MRN;
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id,PatientName);
        }
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function () {
            //console.log($scope.item.PatientId);
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }
        $scope.canDisablePatientSearch = function() {
            return $scope.item.PatientId > 0;
        }
  
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.reset = function() {
            $scope.item_form.$resetForm(true);
            $scope.item = getDefaultItem();
        }

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.reset();
            $scope.getAlerts();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // if(validateDate()) {
                var actionName = 'generalmaster/PatientAlert/AddPatientAlert';
            
                var options = {
                    action: actionName,
                    data: {Data : $scope.item },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
            utl.Http.doAction(options);
            };


        //general alters
        $scope.getGeneralAlertsCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getGeneralAlerts = function () {            
            var inputData = {
                Params: [
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() },
                    { Key: 7, Value: true }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGeneralAlertsCallback
            };

            utl.Http.doAction(options);
        };

        //patient alerts
        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getPatientAlerts = function () {            
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getAlerts = function() {
            if($scope.currentcontext.isPatientAlert) {
                $scope.getPatientAlerts();
            } else {
                $scope.getGeneralAlerts();
            }
        }

        //review
        $scope.reviewCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getAlerts();
        };

   
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.onReviewConfirm = function () {
            var selectedAlerts = getSelectionRows();
            
            var reviewedAlerts = [];

            for(var idx in selectedAlerts) {
                var alert = { PatientAlertId : selectedAlerts[idx].Id, UserId : utl.Session.getCurrentUserId()};
                reviewedAlerts.push(alert);
            }

            var actionName = 'generalmaster/PatientAlertReview/ManagePatientAlertReviews';
        
            var options = {
                action: actionName,
                data: { Data : reviewedAlerts },
                type: 'post',
                onComplete: $scope.reviewCallback
            };
            utl.Http.doAction(options);
        }
        $scope.review = function() {
            var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'generalmaster.alertview.confirm-review-msg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onReviewConfirm,
                };
                utl.Dialog.confirmMessage(confirmOptions);
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                  {
                    field: "AlertDescription", displayName: $translate.instant('generalmaster.alertview.alertdescription.lbl'),
                     width : '30%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                    + '<a uib-tooltip="{{entity.AlertDescription}}" tooltip-placement="bottom">'
                    + "<span >{{entity.AlertDescription}}&nbsp;</span>"
                    + "</a></div>"
                },
                // { field: "AlertType.Description", displayName: $translate.instant('generalmaster.alertview.alerttype.lbl') },
                // { field: "Severity.Description", displayName: $translate.instant('generalmaster.alertview.severity.lbl') },
                // { field: "Priority.Description", displayName: $translate.instant('generalmaster.alertview.priority.lbl') },
                    // {
                    //     field: "OnsetDate", displayName: $translate.instant('generalmaster.alertview.onsetdate.lbl'),
                    //     cellTemplate: "<ngformatdate date-val='entity.OnsetDate'></ngformatdate>"
                    // },
                {
                    field: "ClosureDate", displayName: $translate.instant('generalmaster.alertview.closuredate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.ClosureDate'></ngformatdate>"
                },
                // {
                //     field: "CreatedAt", displayName: $translate.instant('generalmaster.alertview.recordeddate.lbl'),
                //     cellTemplate: "<ngformatdate date-val='entity.CreatedAt'></ngformatdate>"
                // },
                { field: "User.UserName", displayName: $translate.instant('generalmaster.alertview.recordedby.lbl') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        vm.gridConfig.enableRowSelection=  true;
        //vm.gridConfig.multiSelect = true;
        vm.gridConfig.enableFullRowSelection = true; 
        vm.gridConfig.onRegisterApi = function(gridApi){
            //set gridApi on scope
            $scope.gridApi = gridApi;
        };

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        };

        //validation
        function validateDate() {
            //ClosureDate should be greated than OnsetDate and OnsetDate should not be past date
            if($scope.item.ClosureDate) {
                return utl.Formatter.isGreaterDate($scope.item.ClosureDate,$scope.item.OnsetDate);
            }
            return true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getAlerts();            
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "AlertType" },
                { "Key": "Severity" },
                { "Key": "Priority" },
                { "Key": "Department" },
                { "Key": "Gender" }
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

    alertViewFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl','$uibModalInstance','modalConfig'];

})();