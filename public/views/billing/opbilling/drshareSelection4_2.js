(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drshareSelectionController', drshareSelectionController);

    function drshareSelectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {};
        $scope.TeamLookUp = [];
        $scope.ShareDetail = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.lookup = {};
        if (modalConfig && modalConfig.params) {
            $scope.selectedPatient = modalConfig.params.patient;
            $scope.RateTypeId = modalConfig.params.ratetype;
            $scope.patTypeId = modalConfig.params.patType;
            $scope.encId = modalConfig.params.encId;
            $scope.IsEditable = modalConfig.params.IsEditable;
            $scope.item.idx = modalConfig.params.itemid;
            // var item = modalConfig.params.item;
            // console.log(item);
            // if(item) {
            //     $scope.item.ServiceItemId = item.ServiceId;
            //     $scope.item.ServiceRateCategoryId = item.ServiceRateCategoryId;
            //     $scope.item.Rate = item.Rate;
            // }
            $scope.item = modalConfig.params.item;
            $scope.item.idx = modalConfig.params.itemid;
            $scope.currentfilter = modalConfig.params.filterData;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.Save = function () {
            //$scope.item.DocShareDetails = $scope.ShareDetail;
            //$scope.item.DocShareDetails = $scope.TeamLookUp;

            // $scope.confirmCallback($scope.item);


                    //var lines = $scope.getLinesForSave();
                    console.log($scope.TeamLookUp);return;
                    var options = {
                        action: 'clinicalmaster/ServiceItemPerformingDoctor/ManageServiceItemPerformingDoctor',
                        data: {
                            Data: $scope.ShareDetail
                        },
                        type: 'post',
                        onComplete: $scope.confirmCallback
                    };
                    utl.Http.doAction(options);


        }

        // $scope.SelectedDoctor = function (item, selectedItem) {
        //     $scope.selectedItem.SelectDoctor = true;
        // }
        $scope.getLinesForSave = function () {
            $scope.ShareDetail = [];
            for (var idx in $scope.TeamLookUp) {
                var item = $scope.TeamLookUp[idx];
                // if (item.EncounterId > 0) {
                    // if (item.TeamId > 0) {
                        item.DoctorId = selectedItem.DoctorId;
                        item.PatientTypeId = $scope.patTypeId;
                        item.idx = $scope.item.idx;
                        item.EncounterId = $scope.encId;
                        item.DoctorName = selectedItem.DoctorName;
                        item.PerformDrShareValue = selectedItem.DoctorShareValue;
                        item.TeamId = selectedItem.TeamId;
                        item.PerformDrShare = selectedItem.DoctorShare;
                        if (item.PerformDrShareValue > 0) {
                            item.PerformDrShare = $scope.item.NetAmount * (item.PerformDrShareValue / 100);
                        }
                        $scope.ShareDetail.push(item);
                    //    }
                // }
            }

            return $scope.ShareDetail;
        }

        $scope.SelectedDoctor = function (item, selectedItem) {
            item.DoctorId = selectedItem.Id;
            item.DoctorName = selectedItem.Text;
            //if (item.IsLoadAllDocs) {
                // item.DoctorId = selectedItem.Id;
                // item.PatientTypeId = $scope.patTypeId;
                // item.idx = $scope.item.idx;
                // item.EncounterId = $scope.encId;
                // item.DoctorName = selectedItem.Text;
                // item.ServiceItemId = $scope.item.ServiceItemId;
                // item.ServiceRateCategoryId = $scope.item.ServiceRateCategoryId;
                // item.Rate = $scope.item.Rate;
                //item.TeamId = item.TeamId;
                //item.PerformDrShareValue = item.DrLookup[0].DoctorShareValue;
                //item.DoctorValue = item.DrLookup[0].DoctorShare;
                // if (item.PerformDrShareValue > 0) {;
                //     item.PerformDrShare = $scope.item.NetAmount * (item.PerformDrShareValue / 100);
                // }
                //$scope.ShareDetail.push(item);
            // } else {
            //     // $scope.ShareDetail=[];
            //     item.ServPerformDoctorId = selectedItem.DoctorId;
            //     item.PatientTypeId = $scope.patTypeId;
            //     item.idx = $scope.item.idx;
            //     item.EncounterId = $scope.encId;
            //     item.PerformDoctorName = selectedItem.DoctorName;
            //     item.PerformDrShareValue = selectedItem.DoctorShareValue;
            //     //item.TeamId = item.TeamId;
            //     item.PerformDrShare = selectedItem.DoctorShare;
            //     if (item.PerformDrShareValue > 0) {
            //         item.PerformDrShare = $scope.item.NetAmount * (item.PerformDrShareValue / 100);
            //     }
            //     $scope.ShareDetail.push(item);
            // }
        };

        $scope.addNewLineItem = function () {
            var DrShare = {
                Team: '',
                Id: 0,
                Status: 1,
                IsLoadAllDocs: true,
                Amount: 0,
                DrLookup: [],
                FacilityId: utl.Session.getCurrentFacilityId(),
                ServiceItemId: $scope.item.ServiceItemId,
                ServiceRateCategoryId: $scope.item.ServiceRateCategoryId,
                Rate: $scope.item.Rate

            }
            $scope.TeamLookUp.push(DrShare);
        };

        $scope.getDocLookupCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var GroupedBatchData = _.groupBy(data.Data, 'TeamId');
                for (var cdx in GroupedBatchData) {
                    var performDr = GroupedBatchData[cdx];
                    var DrShare = {
                        Team: '',
                        IsLoadAllDocs: false,
                        DrLookup: []
                    }
                    for (var jdx in performDr) {
                        var DrTeamShare = performDr[jdx];
                        DrShare.Team = DrTeamShare.Team.Description;
                        DrShare.TeamId = DrTeamShare.TeamId;
                        DrShare.IsLoadAllDocs = DrTeamShare.IsDisplayAllDoctors;
                        DrShare.DrLookup.push(DrTeamShare);
                        // if (!DrTeamShare.IsDisplayAllDoctors) {
                        //     DrShare.DrLookup.push(DrTeamShare);
                        // } else {
                        //     DrShare.DrLookup = $scope.lookup.Doctor;
                        // }
                    }
                    $scope.TeamLookUp.push(DrShare);
                }
            }
        };

        $scope.getDocLookup = function () {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: $scope.item.ServiceId
                    },
                    {
                        Key: 6,
                        Value: $scope.RateTypeId
                    }
                ],
            };
            var options = {
                action: 'clinicalmaster/ServiceItemPerformingDoctor/GetServiceItemPerformingDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDocLookupCallback
            };
            utl.Http.doAction(options);
        }



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDocLookup();
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
            },
            // {
            //     "Key": "Department"
            // },
        ];

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

    drshareSelectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();