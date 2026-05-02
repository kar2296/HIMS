(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orgFormController', orgFormController);

    orgFormController.$inject = ['$rootScope','$stateParams', '$state', '$translate', 'utl', 'Upload', '$timeout'];
    function orgFormController($rootScope,$stateParams, $state, $translate, utl, Upload, $timeout) {
        var vm = this;
        angular.extend(vm, {
            item: { IsActive : true},
            currentcontext: { id: parseInt($stateParams.id), file: null },
            lookup: {},
            /* Api */
            backToList: backToList,
            saveItem: saveItem,
            saveAndApprove: saveAndApprove,
            save: save,
            clear: clear,
            getOrgLogo: getOrgLogo,
            getOrgLogoCallback: getOrgLogoCallback
        });
        initLookup();
        vm.item.LicenseActiveFrom = new Date();
        vm.item.ActiveFrom = new Date();

        //Save and approve
        function saveAndApprove() {
            vm.item.ActiveStatus = 'Active' //Active
            saveItem();
        }

        function save() {
            vm.item.ActiveStatus = 'Draft'; //Draft
            saveItem();
        }
        
        ////////////
        function getOrgLogoCallback  (scope, data, options, hasError) {
            vm.currentcontext.Logo = data.Logo;
        };

        function getOrgLogo () {
            if(vm.item.LogoPath) {
                var inputData = { Id : vm.item.Id, LogoPath : vm.item.LogoPath };
                var options = {
                    action: 'SystemSettings/organization/GetOrganizationLogo',
                    data: { Data : inputData },
                    type: 'post',
                    onComplete: getOrgLogoCallback
                };
                utl.Http.doAction(options);
            }
        };
        
        function getItemCallback(scope, data, options, hasError) {
            vm.item = data;
            getOrgLogo();
        };

        function getItem(pageNo) {
            if (vm.currentcontext.id && vm.currentcontext.id > 0) {
                var options = {
                    action: 'SystemSettings/organization/GetOrganizationById',
                    data: { Id: vm.currentcontext.id },
                    type: 'post',
                    onComplete: getItemCallback
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

        function backToList() {
            $state.go('app.orgs');
        }
         function addNew () {
        $state.go('app.org', { id:0 });
    }

        function saveItemCallback(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            backToList();
        };

        function clear() {
            vm.item = {};
        }      
          

        function saveItem() {
            // if(!$scope.item_form.isValid()) {
            //    $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'SystemSettings/organization/AddOrganization';
            if (vm.currentcontext.id && vm.currentcontext.id > 0) {
                actionName = 'SystemSettings/organization/UpdateOrganization';
            }

            if (vm.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url:  actionUrl, 
                    data: { 
                        file: vm.currentcontext.file ,
                        Data: vm.item
                    }
                }).then(function (resp) { //upload function returns a promise
                        utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                        vm.currentcontext.file = null;
                        backToList();
                },
                function (resp) { //catch error
                    console.log('Error status: ' + resp.status);
                    utl.Alert.showErrorMsg('Error status: ' + resp.status);
                },
                function (evt) {
                    console.log(evt);
                });
                return false;
            }
            else {
                var options = {
                    action: actionName,
                    data: { Data: vm.item, file: vm.currentcontext.file },
                    type: 'post',
                    onComplete: saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };
 

        function lookupCallback(scope, data, options, hasError) {
            vm.lookup = hasError ? {} : data;
            getItem();
        }

        function initLookup() {
            var inputData = [ 
                                {"Key" : "Pincode"},
                                {"Key" : "City"},
                                {"Key" : "State"},
                                {"Key" : "Country"}
                            ];        
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: lookupCallback
            };
            utl.Http.doAction(options);            
        }
    }
})();