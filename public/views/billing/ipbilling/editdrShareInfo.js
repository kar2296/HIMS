(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('editdrShareInfoController', editdrShareInfoController);

    function editdrShareInfoController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.DocShareDetails = [];
        $scope.lookup = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.encId = modalConfig.params.encId;
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.serviceid = modalConfig.params.serviceid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.CanShowUpdate = true;

        //React bridge: replaces the whole Team/Doctor/Share Amount
        //table (a plain ng-repeat over $scope.DocShareDetails
        //containing one <ui-select> per row for DoctorId). Rows are
        //correlated by array index since DocShareDetails is iterated
        //unfiltered. The original ui-select's on-select="SelectedDoctor(...)"
        //calls a function that doesn't exist anywhere in this controller
        //-- not reproduced (see EditDrShareInfoListScreen's doc comment).
        $scope.handleReactAction = function (actionType, payload) {
            if (actionType == 'doctorChange') {
                $scope.DocShareDetails[payload.index].DoctorId = payload.id;
                $scope.refreshReactProps();
            } else if (actionType == 'shareAmountChange') {
                $scope.DocShareDetails[payload.index].DoctorShareAmount = payload.value;
                $scope.refreshReactProps();
            }
        };

        $scope.refreshReactProps = function () {
            $scope.reactPropsContainer = {
                reactProps: {
                    doctorOptions: ($scope.lookup && $scope.lookup.Doctor) || [],
                    showDoctorShare: !!$scope.ShowDoctorShare,
                    rows: ($scope.DocShareDetails || []).map(function (item, idx) {
                        return {
                            index: idx,
                            teamDescription: item.Team && item.Team.Description,
                            doctorId: item.DoctorId,
                            doctorShareAmount: item.DoctorShareAmount
                        };
                    })
                },
                onAction: $scope.handleReactAction
            };
        };

        $scope.refreshReactProps();

        $scope.getDocShareDetailsCallback = function (scope, res, options, hasError) {
            $scope.DocShareDetails = [];
            for(var idx in res.Data){
                var item = res.Data[idx];
                if(item.ShareType==2){
                    $scope.DocShareDetails.push(item);
                }
            }
            $scope.refreshReactProps();
        };

        $scope.getDocShareDetails = function () {
            var inputData = {
                Params: [{
                    Key: 9,
                    Value: $scope.currentcontext.encId
                }],
            };
            var options = {
                action: 'billing/patientdoctorsharedetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDocShareDetailsCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getDrsharebyBillIdCallback = function (scope, res, options, hasError) {
            $scope.DocShareDetails = [];
            for(var idx in res.Data){
                var item = res.Data[idx];
                if(item.ShareType==2){
                    $scope.DocShareDetails.push(item);
                }
            }
            // $scope.DocShareDetails = res.Data;
            $scope.CanShowUpdate = false;
            $scope.refreshReactProps();
        };

        $scope.getDrsharebyBillId = function () {
            var inputData = {
                Params: [{
                    Key: 10,
                    Value: $scope.currentcontext.id
                },
                {
                    Key: 13,
                    Value: $scope.currentcontext.serviceid
                }
            ],
            };
            var options = {
                action: 'billing/patientdoctorsharedetails/GetPatientDoctorShareDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDrsharebyBillIdCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.Save = function () {
            var actionName = 'billing/patientdoctorsharedetails/UpdatePatientShareInfoDetails';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.DocShareDetails
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getFacInfoCallbck = function (scope, data, options, hasError) {
           
            $scope.item.IsDoctorShare = data.IsDoctorShare;
            $scope.ShowDoctorShare = false;
            if (data.IsDoctorShare) {
                $scope.ShowDoctorShare = true;
            }
            $scope.refreshReactProps();
        };

        $scope.getFacInfo = function () {
            var options = {
                action: 'SystemSettings/facility/GetFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getFacInfoCallbck
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.currentcontext.encId > 0) {
                $scope.getDocShareDetails();
            }
            if ($scope.currentcontext.id > 0) {
                $scope.getDrsharebyBillId();
            }
            $scope.getFacInfo();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            }];

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

    editdrShareInfoController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();