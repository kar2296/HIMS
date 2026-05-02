(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('fullRegistrationTabController', fullRegistrationTabController);

    function fullRegistrationTabController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        var tabvm = this;
        if (!$stateParams.id)
            $stateParams.id = 0;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.currentcontext = {};
        $scope.tabs = [
            { title: $translate.instant('registration.fullregistrationtab.tabbasic.lbl'), state: 'app.fullregistrationtab.basic', canDisable: false },
            { title: $translate.instant('registration.fullregistrationtab.tabpatientid.lbl'), state: 'app.fullregistrationtab.patientids', canDisable: canDisableTab },
            { title: $translate.instant('registration.fullregistrationtab.tabpatientkin.lbl'), state: 'app.fullregistrationtab.patientkins', canDisable: canDisableTab },
            // { title: $translate.instant('registration.fullregistrationtab.tabguarantor.lbl'), state: 'app.fullregistrationtab.patientguarantor', canDisable: canDisableTab },
            // { title: $translate.instant('registration.fullregistrationtab.auditlog.lbl'), state: 'app.fullregistrationtab.auditlog', canDisable: canDisableTab },
            { title: $translate.instant('registration.fullregistrationtab.familylink.lbl'), state: 'app.fullregistrationtab.familylink', canDisable: canDisableTab }
        ];

        tabvm.currentcontext = {
            patientid: 0
        };
        // $scope.currentcontext = {}
        // tabvm.currentcontext.CanUserManual = utl.Privilege.hasPrivilege('CanUserManual')
        // tabvm.currentcontext.CanProcessFlow = utl.Privilege.hasPrivilege('CanProcessFlow')
        $scope.openattachments = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.item.PatientId, itemid: $scope.item.Id },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }


        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }

        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }
        $scope.addNewFull = function () {
            $state.go('app.fullregistrationtab.basic', { id: 0 });
        }

        $scope.addNewQuick = function () {
            $state.go('app.quickregistration', { id: 0 });
        }

        //Patient picker related code starts
        // function patientPickerCallback(patientdata) {
        //     $state.go('app.fullregistrationtab.basic', { id: patientdata.pid });
        // }

        $scope.pickPatient = function () {
            utl.Modal.open('app.patientpicker', {
                params: {}, confirmCallback: $scope.initLookup
            }
            );
        }

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.Id,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);
    
        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }


        $scope.PatInfoCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.id = $scope.item.Id;
            $state.go('app.fullregistrationtab.basic', { id: $scope.currentcontext.id });
            $scope.getPatientProfilePic();
        };

        $scope.patientChange = function (pageNo) {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.PatInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.pickPatient = function () {
        //     utl.Modal.open('app.patientpicker', {
        //         params: {},
        //         // confirmCallback: patientPickerCallback
        //     });
        // }
        //Patient picker related code ends
        $('#myModal').hide();
        $scope.showprocessflow = function () {
            $('#myModal').show();
        }

        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        }
        //Reload banner code starts
        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        tabvm.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }
        //Reload banner code ends
    }

    fullRegistrationTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];
})();