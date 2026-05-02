(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('lisInterfaceResultController', lisInterfaceResultController);

    function lisInterfaceResultController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig, $timeout) {
        var vm = this;
        $scope.AnalyzerAnalyteMap = [];
        $scope.AnalyzerMap = [];
        $scope.LISResultInfo = {};
        $scope.ResultInfo = [];


        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.currentcontext = {};
        // $scope.item = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.PatientId = parseInt($stateParams.pid);
        $scope.currentcontext.PatientId = parseInt($stateParams.pid);
        $scope.currentcontext.Sampleid = $stateParams.Sampleid;
        $scope.currentcontext.AcceptedAll = false;
        $scope.currentcontext.RejectedAll = false;
        $scope.currentcontext.IsSaved = false;

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.ismodal = true;
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.item.PatientId = modalConfig.params.pid;
            $scope.currentcontext.PatientId = modalConfig.params.pid;
            $scope.currentcontext.Sampleid = modalConfig.params.Sampleid;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getAnalyzerMappingCallback = function (scope, res, options, hasError) {
            if (res) {
                var item = new Array();
                var itemanalyzer = new Array();
                for (var idxft in res.Data) {
                    if (!(item[res.Data[idxft].AssetId]))
                        item[res.Data[idxft].AssetId] = new Array();

                    if (!(itemanalyzer[res.Data[idxft].AssetId]))
                        itemanalyzer[res.Data[idxft].AssetId] = new Array();

                    if (!(item[res.Data[idxft].AssetId][res.Data[idxft].Code]))
                        item[res.Data[idxft].AssetId][res.Data[idxft].Code] = new Array();

                    if (!(itemanalyzer[res.Data[idxft].AssetId][res.Data[idxft].Code]))
                        itemanalyzer[res.Data[idxft].AssetId][res.Data[idxft].Code] = res.Data[idxft];

                    if (!(item[res.Data[idxft].AssetId][res.Data[idxft].Code][res.Data[idxft].AnalyteId]))
                        item[res.Data[idxft].AssetId][res.Data[idxft].Code][res.Data[idxft].AnalyteId] = res.Data[idxft];
                }
                $scope.AnalyzerAnalyteMap = item;
                $scope.AnalyzerMap = itemanalyzer;
            }
            $scope.getAnalyzerPatientInfo();
        };

        $scope.AnalyzerAnalyteMapData = function (AssetId, LISCode, AnalyteId) {
            var AnalyzerAnalyteMap = {};
            if ($scope.AnalyzerAnalyteMap) {
                if ($scope.AnalyzerAnalyteMap[AssetId]) {
                    if ($scope.AnalyzerAnalyteMap[AssetId][LISCode]) {
                        if ($scope.AnalyzerAnalyteMap[AssetId][LISCode][AnalyteId]) {
                            AnalyzerAnalyteMap = $scope.AnalyzerAnalyteMap[AssetId][LISCode][AnalyteId];
                        }
                    }
                }
            }
            return AnalyzerAnalyteMap;
        }

        $scope.AnalyzerMapData = function (AssetId, LISCode) {
            var AnalyzerMap = {};
            if ($scope.AnalyzerMap) {
                if ($scope.AnalyzerMap[AssetId]) {
                    if ($scope.AnalyzerMap[AssetId][LISCode]) {
                        AnalyzerMap = $scope.AnalyzerMap[AssetId][LISCode];
                    }
                }
            }
            return AnalyzerMap;
        }

        $scope.getAnalyzerMapping = function () {
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 5000000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'lis/AnalyzerAnalyteMap/GetAnalyzerAnalyteMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAnalyzerMappingCallback
            };
            utl.Http.doAction(options);
        }


        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.lisinterface');
            }
        }

        $scope.AcceptAllItems = function () {
            if ($scope.currentcontext.AcceptedAll) {
                $scope.currentcontext.RejectedAll = false;
                $scope.ApprovedStateChange(true);
                $scope.RejectedStateChange(false);
            } else {
                $scope.ApprovedStateChange(false);
            }
        };

        $scope.RejectAllItems = function () {
            if ($scope.currentcontext.RejectedAll) {
                $scope.currentcontext.AcceptedAll = false;
                $scope.RejectedStateChange(true);
                $scope.ApprovedStateChange(false);
            } else {
                $scope.RejectedStateChange(false);
            }
        };

        $scope.Acceptitem = function (result) {
            if (result.Approved)
                result.Rejected = !result.Approved;
        };

        $scope.Rejectitem = function (result) {
            if (result.Rejected)
                result.Approved = !result.Rejected;
        };

        $scope.ApprovedStateChange = function (flag) {
            for (var idx in $scope.ResultInfo) {
                var result = $scope.ResultInfo[idx];
                result.Approved = flag;
            }
        };

        $scope.RejectedStateChange = function (flag) {
            for (var idx in $scope.ResultInfo) {
                var result = $scope.ResultInfo[idx];
                result.Rejected = flag;
            }
        };

        $scope.getAnalyzerPatientInfo = function () {
            if ($scope.currentcontext.PatientId && $scope.currentcontext.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentcontext.PatientId },
                    type: 'post',
                    onComplete: $scope.getAnalyzerPatientInfoCallback
                };
                utl.Http.doAction(options);
            } else if ($scope.currentcontext.id > 0) {
                $scope.getAnalyzerTestResult();
            }
        };

        $scope.getAnalyzerPatientInfoCallback = function (scope, data, options, hasError) {
            if (data) {
                $scope.item = data;
                $scope.getAnalyzerTestResult();
            }
        };

        $scope.getAnalyzerTestResult = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        {
                            // Key: 4, Value: $scope.currentcontext.id
                            Key: 2, Value: $scope.currentcontext.Sampleid
                         },
                         { Key: 12, Value: $scope.item.FacilityId },
                    ],
                    PageContext: {
                        PageSize: 10000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'lis/LISInterfaceResults/GetLISResultsWithoutGroup',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAnalyzerTestResultCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getAnalyzerTestResultCallback = function (scope, res, options, hasError) {
            $scope.LISResultInfo = res.Data;

            for (var idx in $scope.LISResultInfo) {
                if ($scope.LISResultInfo[idx].Approved) {
                    $scope.currentcontext.IsSaved = true;
                }
                if ($scope.LISResultInfo[idx].Rejected) {
                    $scope.currentcontext.IsSaved = true;
                }
            }
            $scope.getReferenceDescription();
        }

        $scope.custom_sort = function (a, b) {
            if (!a.DisplayNo) a.DisplayNo = 0;
            if (!b.DisplayNo) b.DisplayNo = 0;
            return a.DisplayNo - b.DisplayNo;
        }

        $scope.getReferenceDescription = function () {
            var tabindx = 1;
            $scope.LISResultInfo.sort($scope.custom_sort);
            for (var idx in $scope.LISResultInfo) {
                try {
                    var items = $scope.LISResultInfo[idx];
                    if (items) {
                        var AssetId = items.AssetId;
                        var LISCode = items.Code;
                        var LISName = items.AnalyteName;
                        var AnalyteId = items.AnalyteId;
                        var vAnalyzerAnalyteMap = null;

                        if (AnalyteId > 0)
                            vAnalyzerAnalyteMap = $scope.AnalyzerAnalyteMapData(AssetId, LISCode, AnalyteId);

                        if (vAnalyzerAnalyteMap && vAnalyzerAnalyteMap.AnalyteId) {
                            $scope.LISResultInfo[idx].AnalyteId = $scope.LISResultInfo[idx].AnalyteId;

                            if (vAnalyzerAnalyteMap.Name)
                                $scope.LISResultInfo[idx].LISDescription = vAnalyzerAnalyteMap.Name;
                            else
                                $scope.LISResultInfo[idx].LISDescription = LISCode + '-' + LISName;

                            $scope.LISResultInfo[idx].controlid = 'txt' + tabindx;
                            $scope.LISResultInfo[idx].tabindex = tabindx++;

                            if (!$scope.LISResultInfo[idx].Approved && !$scope.LISResultInfo[idx].Rejected)
                                $scope.LISResultInfo[idx].FullResultValue = $scope.LISResultInfo[idx].ResultValue;

                            if (vAnalyzerAnalyteMap.Analytemaster) {
                                $scope.LISResultInfo[idx].Description = vAnalyzerAnalyteMap.Analytemaster.Description;
                                $scope.LISResultInfo[idx].UOM = vAnalyzerAnalyteMap.Analytemaster.AnalyteuomId;
                            }

                            if ($scope.item.GenderId && items && vAnalyzerAnalyteMap && vAnalyzerAnalyteMap.Analytemaster &&
                                vAnalyzerAnalyteMap.Analytemaster.Analyterefmasters) {
                                $scope.item.AgeInDays = utl.Formatter.getAgeInDaysFromDOB($scope.item.DOB);
                                var refmaster = vAnalyzerAnalyteMap.Analytemaster.Analyterefmasters;
                                for (var idxrfms in refmaster) {
                                    var anarefmas = refmaster[idxrfms];
                                    if (anarefmas.GenderId == $scope.item.GenderId &&
                                        (anarefmas.Agefrom <= $scope.item.AgeInDays && $scope.item.AgeInDays <= anarefmas.Ageto)) {
                                        $scope.LISResultInfo[idx].MaxValue = anarefmas.MaxValue;
                                        $scope.LISResultInfo[idx].MinValue = anarefmas.MinValue;
                                        $scope.LISResultInfo[idx].Refvalue = anarefmas.Refvalue;
                                    }
                                }
                            }
                            $scope.ResultInfo.push($scope.LISResultInfo[idx]);
                        } else {

                            var vAnalyzerMapData = null;

                            if (AssetId > 0)
                                vAnalyzerMapData = $scope.AnalyzerMapData(AssetId, LISCode);

                            $scope.LISResultInfo[idx].AnalyteId = AnalyteId;

                            if (vAnalyzerMapData.Name)
                                $scope.LISResultInfo[idx].LISDescription = vAnalyzerMapData.Name;
                            else
                                $scope.LISResultInfo[idx].LISDescription = LISCode;

                            $scope.LISResultInfo[idx].controlid = 'txt' + tabindx;
                            $scope.LISResultInfo[idx].tabindex = tabindx++;

                            if (!$scope.LISResultInfo[idx].Approved && !$scope.LISResultInfo[idx].Rejected)
                                $scope.LISResultInfo[idx].FullResultValue = $scope.LISResultInfo[idx].ResultValue;


                            $scope.ResultInfo.push($scope.LISResultInfo[idx]);
                        }
                    }

                } catch (ex) { console.log(ex); }
            }

            $timeout(function () {
                $('#txt1').focus();
            }, 300);
        }

        $scope.keyPress = function (eInner, indexid) {
            if (eInner.keyCode == 13) {
                var newindexid = 0;
                try {
                    newindexid = parseInt(indexid) + 1;
                } catch (ex) { }
                $('[tabindex=' + newindexid + ']').focus();
                return false;
            }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();

        };

        $scope.save = function () {
            if ($scope.checkMandatoryFields()) {
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                return false;
            } else {
                if ($scope.ResultInfo && $scope.ResultInfo.length == 0) {
                    let result = {
                        'LISId': $scope.currentcontext.id,
                        'Rejected': true,
                        'RejectedById': 1
                    };
                    $scope.ResultInfo.push(result);
                }
                var options = {
                    action: 'lis/LISInterfaceResults/UpdateLISResult',
                    data: { Data: $scope.ResultInfo },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.checkMandatoryFields = function () {
            var bnotselectedflag = false;
            for (var idx in $scope.ResultInfo) {
                if ($scope.ResultInfo[idx].Approved) {
                    $scope.ResultInfo[idx].ApprovedById = utl.Session.getCurrentUserId();
                }
                if ($scope.ResultInfo[idx].Rejected) {
                    $scope.ResultInfo[idx].RejectedById = utl.Session.getCurrentUserId();
                }
                var result = $scope.ResultInfo[idx];
                if (!result.Approved && !result.Rejected)
                    bnotselectedflag = true;
            }
            return bnotselectedflag;
        }

        $scope.getAnalyzerMapping();
    }

    lisInterfaceResultController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig', '$timeout'];

})();