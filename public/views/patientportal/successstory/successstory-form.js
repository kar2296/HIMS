(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientSuccessStoryFormController', PatientSuccessStoryFormController);

    function PatientSuccessStoryFormController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.currentcontext.file = null;
        $scope.CategoryInfo = $stateParams.CategoryInfo;
        // $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.CategoryId =  $scope.CategoryInfo.Id;
        $scope.currentcontext = {};
       


        $scope.backToList = function () {
            $state.go('patientportal.successstory');
        }
        $scope.addNew = function () {
            $state.go('app.successstoryform', {
                id: 0
            });
        }
        /* autosearch starts */
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Employee Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Department',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }
        /* autosearch End */

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };
        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.item.CreatedId = utl.Session.getCurrentUserId();
            $scope.item.CreatedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
                $scope.item.CreatedId = utl.Session.getCurrentUserId();
                $scope.item.CreatedDate = utl.Formatter.getCurrentDate();
            } else {
                $scope.item.ActiveStatusId = 3;
                $scope.item.CreatedId = utl.Session.getCurrentUserId();
                $scope.item.CreatedDate = utl.Formatter.getCurrentDate();
            }
            $scope.saveItem();
        }
        $scope.clear = function () {
            $scope.item = {};
        }

        $scope.getImagesCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Image = data.Attachment;
        };

        $scope.getImages = function () {
            if ($scope.item.Attachment) {
                var inputData = {
                    Id: $scope.item.Id,
                    Attachment: $scope.item.Attachment
                };
                var options = {
                    action: 'VirtualHealthcare/SuccessStory/GetAttachmentFile',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getImagesCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getImages();
        };

        $scope.getItem = function (pageNo) {
            if ( $scope.item.CategoryId  &&  $scope.item.CategoryId  > 0) {
                var options = {
                    action: 'VirtualHealthcare/SuccessStory/GetSuccessStoryById',
                    data: {
                        Id: $scope.item.CategoryId
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.getItemCallback = function (scope, data, options, hasError) {
        //     if (data.Data.length > 0) {
        //         $scope.item = data.Data[0];
        //         $scope.currentcontext.id = $scope.item.Id;
        //         $scope.getImages();
        //     }
        // };

        // $scope.getItem = function () {
        //     var inputData = {
        //         Params: [
        //             { Key: 1, Value: $scope.item.FacilityId },


        //         ]
        //     };
        //     var options = {
        //         action: 'VirtualHealthcare/SuccessStory/GetSuccessStorys',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getItemCallback
        //     };

        //     utl.Http.doAction(options);
        // };


        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            var actionName = 'VirtualHealthcare/SuccessStory/AddSuccessStory';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'VirtualHealthcare/SuccessStory/UpdateSuccessStory';
            }

            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    $scope.currentcontext.file = null;
                    $scope.getItem();
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();

        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "SuccessCategory"
            },
            {
                "Key": "Organization"
            },
            {
                "Key": "Facility"
            }

            ]
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

    PatientSuccessStoryFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})(); 