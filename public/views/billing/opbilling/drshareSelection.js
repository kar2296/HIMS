(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drshareSelectionController', drshareSelectionController);

    function drshareSelectionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig,$filter) {
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

            var item = modalConfig.params.item;
            console.log(item);
            $scope.item = modalConfig.params.item;
            $scope.item.idx = modalConfig.params.itemid;
            $scope.currentfilter = modalConfig.params.filterData;

            // for (var jdx in $scope.item.PatientDoctorShareDetails) {
            //     var DrTeamShare = $scope.item.PatientDoctorShareDetails[jdx];
            //     DrTeamShare.PerformDrShare = DrTeamShare.DoctorShareAmount;
            //     DrTeamShare.idx = $scope.item.idx;
            //     //DrTeamShare.Status = 3;
            //     $scope.TeamLookUp.push(DrTeamShare);
            // }
            for (var jdx in $scope.item.DocShareDetails) {
                var DrTeamShare = $scope.item.DocShareDetails[jdx];
                //DrTeamShare.PerformDrShare = DrTeamShare.DoctorShareAmount;
                if(!DrTeamShare.PerformDrShare)
                {
                    if(DrTeamShare.DoctorShareAmount) {
                        DrTeamShare.PerformDrShare = DrTeamShare.DoctorShareAmount;
                        DrTeamShare.PerformDrShareValue = DrTeamShare.DoctorSharePercentage;
                    }
                }
                if(DrTeamShare.DoctorId)
                {
                    DrTeamShare.PerformDoctorId = DrTeamShare.DoctorId;
                    DrTeamShare.PerformDoctorName = DrTeamShare.DoctorId;

                }

                DrTeamShare.idx = $scope.item.idx;
                //DrTeamShare.Status = 3;
                $scope.TeamLookUp.push(DrTeamShare);
            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        console.log($scope.item);
        $scope.refreshReactProps();
        $scope.Save = function () {
            //$scope.item.DocShareDetails = $scope.TeamLookUp;
            // $scope.item.DocShareDetails = $filter('filter')($scope.TeamLookUp, {
            //     Status: 1           });

                $scope.item.DocShareDetails = $scope.TeamLookUp.filter(person => person.Status >= 1);
            console.log($scope.item.DocShareDetails);//return;
            var total = 0;
            for (var jdx in $scope.item.DocShareDetails) {
                var DrTeamShare = $scope.item.DocShareDetails[jdx];
                if(DrTeamShare.Status != 2) {
                total = parseFloat(total) + parseFloat(DrTeamShare.PerformDrShare);}
            }

            if(parseFloat(total) > parseFloat($scope.item.Amount)) {
                utl.Alert.showErrorMsg($translate.instant('Please Check Share Amounts.. Share amount exceeds Total Value'));
                return;
            }

            //console.log($scope.item.idx);
            $scope.item.TotalShare = parseFloat(total).toFixed(2);
            $scope.confirmCallback($scope.item);
        }

        // $scope.SelectedDoctor = function (item, selectedItem) {
        //     $scope.selectedItem.SelectDoctor = true;
        // }

        $scope.deleteItem = function (item) {
            item.Status = 2;
            $scope.refreshReactProps();
        };

        $scope.getLinesForSave = function (){
            $scope.ShareDetail = [];
            for (var idx in $scope.TeamLookUp) {
                var item = $scope.TeamLookUp[idx];
                if (item.EncounterId > 0) {
                    if (item.TeamId > 0) {
                        item.PerformDoctorId = selectedItem.DoctorId;
                        item.PatientTypeId = $scope.patTypeId;
                        item.idx = $scope.item.idx;
                        item.EncounterId = $scope.encId;
                        item.PerformDoctorName = selectedItem.DoctorName;
                        item.PerformDrShareValue = selectedItem.DoctorShareValue;
                        item.TeamId = selectedItem.TeamId;
                        item.PerformDrShare = selectedItem.DoctorShare;
                        if (item.PerformDrShareValue > 0) {
                            item.PerformDrShare = $scope.item.NetAmount * (item.PerformDrShareValue / 100);
                        }
                        $scope.ShareDetail.push(item);
                       }
                }
            }

            return result;
        }

        $scope.addNewLineItem = function () {
            var DrShare = {
                Team: '',
                Id: 0,
                Status: 1,
                IsLoadAllDocs: true,
                DrLookup: [],
                FacilityId: utl.Session.getCurrentFacilityId(),
                ServiceItemId: $scope.item.ServiceId,
                ServiceRateCategoryId: $scope.item.ServiceRateCategoryId,
                Rate: $scope.item.Rate

            }
            $scope.TeamLookUp.push(DrShare);
            $scope.refreshReactProps();
        };

        $scope.checkTotal = function (item, selectedItem) {
            var total = 0;
            for (var jdx in $scope.TeamLookUp) {
                var DrTeamShare = $scope.TeamLookUp[jdx];
                total = parseFloat(total) + parseFloat(DrTeamShare.PerformDrShare);
            }

            if(parseFloat(total) > parseFloat($scope.item.Amount)) {
                utl.Alert.showErrorMsg($translate.instant('Please Check Share Amounts.. Share amount exceeds Total Value'));
            }
        }

        $scope.SelectedDoctor = function (item, selectedItem) {
            // item.DoctorId = selectedItem.Id;
            // item.DoctorName = selectedItem.Text;
            item.PerformDoctorId = selectedItem.Id;
            item.PerformDoctorName = selectedItem.Text;
            item.PerformDrShareValue = 0;
            //item.PerformDrShare = item.DoctorShare;
            item.idx = $scope.item.idx;
            // if (item.IsLoadAllDocs) {
            //     item.PerformDoctorId = selectedItem.Id;
            //     item.PatientTypeId = $scope.patTypeId;
            //     item.idx = $scope.item.idx;
            //     item.EncounterId = $scope.encId;
            //     item.PerformDoctorName = selectedItem.Text;
            //     item.TeamId = item.TeamId;
            //     // item.PerformDrShareValue = item.DrLookup[0].DoctorShareValue;
            //     // item.PerformDrShare = item.DrLookup[0].DoctorShare;
            //     if (item.PerformDrShareValue > 0) {
            //         item.PerformDrShare = $scope.item.NetAmount * (item.PerformDrShareValue / 100);
            //     }
            //     $scope.ShareDetail.push(item);
            // } else {
            //     // $scope.ShareDetail=[];
            //     item.PerformDoctorId = selectedItem.DoctorId;
            //     item.PatientTypeId = $scope.patTypeId;
            //     item.idx = $scope.item.idx;
            //     item.EncounterId = $scope.encId;
            //     item.PerformDoctorName = selectedItem.DoctorName;
            //     item.PerformDrShareValue = selectedItem.DoctorShareValue;
            //     item.TeamId = item.TeamId;
            //     item.PerformDrShare = selectedItem.DoctorShare;
            //     if (item.PerformDrShareValue > 0) {
            //         item.PerformDrShare = $scope.item.NetAmount * (item.PerformDrShareValue / 100);
            //     }
            //     $scope.ShareDetail.push(item);
            // }
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
            //$scope.getDocLookup();
            $scope.refreshReactProps();
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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                rows: $scope.TeamLookUp
                    .map(function (item, idx) { item._idx = idx; return item; })
                    .filter(function (item) { return item.Status === 1; }),
                doctorOptions: ($scope.lookup && $scope.lookup.Doctor) || []
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            var item = $scope.TeamLookUp[payload.idx];
            if (!item) { return; }
            switch (actionName) {
                case 'doctorChange':
                    item.DoctorId = payload.value;
                    var selected = null;
                    for (var idx in ($scope.lookup.Doctor || [])) {
                        if ($scope.lookup.Doctor[idx].Id === payload.value) {
                            selected = $scope.lookup.Doctor[idx];
                            break;
                        }
                    }
                    if (selected) {
                        $scope.SelectedDoctor(item, selected);
                    }
                    $scope.refreshReactProps();
                    break;
                case 'shareChange':
                    item.PerformDrShare = payload.value;
                    $scope.checkTotal(item);
                    $scope.refreshReactProps();
                    break;
                case 'deleteItem':
                    $scope.deleteItem(item);
                    break;
            }
        };

        $scope.initLookup();

    }

    drshareSelectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();