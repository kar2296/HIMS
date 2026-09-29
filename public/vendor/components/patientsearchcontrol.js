(function () {
    'use strict';

    angular
        .module('common.utils')
        .controller('patientSearchCtrl', ['utl', '$scope', '$timeout', '$http', function (utl, $scope, $timeout, $http) {
            var cvm = this;
            cvm.patients = [];
            cvm.patientdisplay = {};
            cvm.searchByPatientId = false;
            cvm.IsMRN = false;
            cvm.newPatientNo = '';
            cvm.allowotherfacpatients = 0;
            cvm.mrnshortcode =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'mrnshortcode');
            cvm.allowotherfacpatients = utl.FacilitySetting.getFacilitySettingValue('billing', 'allowotherfacpatients');
            $scope.$watch('cvm.patientid',
                function (newValue, oldValue) {
                    // cvm.newPatientNo = newValue;
                    if (!cvm.patientchangebyuser) {
                        cvm.searchPatient(newValue, true);
                    }
                });

            cvm.OnSelectPatient = function ($item, $model, $label, $event) {
                cvm.patientchangebyuser = true;
                cvm.patientid = $item.Id;
                cvm.patientinfo = $item;

                $timeout(function () {
                    if (cvm.patientchange) {
                        cvm.patientchange();
                    }
                }, 100);
            }

            cvm.setPatientInfo = function (patient) {
                if (patient) {
                    cvm.patientdisplay = patient;
                    cvm.patientinfo = patient;
                }
            }

            cvm.formatPatient = function ($model) {
                if (cvm.displayoption) {
                    return $model.Mobile;
                } else {
                    return $model.FirstName;
                }

            }

            function searchPatientCallback(res) {
                var result = res.data.Data;

                for (var idx in result) {
                    var item = result[idx];
                    item.PatientName = "";
                    if (item.Title && item.Title.Description) {
                        item.TitleDesc = item.Title.Description;
                    }
                    if (item.FirstName) {
                        item.PatientName = item.PatientName + item.FirstName;
                    }
                    if (item.LastName) {
                        item.PatientName = item.PatientName + ' ' + item.LastName;
                    }

                    if (item.Age) {
                        // item.Age = item.Age + 'Y';
                        item.Age = item.Age;
                    }

                    if (item.GenderId == 1) {
                        item.GenderCode = 'M';
                    } else if (item.GenderId == 2) {
                        item.GenderCode = 'F';
                    } else if (item.GenderId == 3) {
                        item.GenderCode = 'U';
                    }

                    if (item.Encounters && item.Encounters.length > 0) {
                        var encounter = item.Encounters[0];
                        if (encounter.EncounterStatusId != 2) {
                            item.VisitIdentifier = encounter.VisitIdentifier;
                            item.EncounterId = encounter.EncounterId;
                        }
                    }
                    if (item.OutStandingAmount)
                        item.OutStandingAmount = item.OutStandingAmount
                }
                cvm.setPatientInfo(utl.Common.getItemByProp(result, 'Id', cvm.patientid));
                if (cvm.issearch == true ) {
                    cvm.patientid = result[0].Id;
                    cvm.patientinfo = result[0];

                    $timeout(function () {
                        if (cvm.patientchange) {
                            cvm.patientchange();
                        }
                    }, 100);
                } else {
                    // cvm.mobileData = query;
                    cvm.patientinfo =
                    {
                        Id: 0,
                        Mobile: cvm.newPatientNo
                    };
                }
                return result;
            };

            cvm.MRNSearch = function () {
                var PID = cvm.controlid;
                cvm.patientdisplay = '';
                $('#' + PID).focus();
            }

            cvm.searchPatient = function (query, searchByPatientId) {

                //Search only active patients
                var canSearch = false;
                var inputData = {
                    Params: [{
                        Key: 7,
                        Value: 2
                    },
                    {
                        Key: 37,
                        Value: 2
                    },
                        // {
                        //     Key: 29,
                        //     Value: utl.Session.getCurrentFacilityId()
                        // }
                    ],
                    PageContext: {
                        PageSize: 20,
                        PageNumber: 1
                    }
                };
                if (!cvm.allowotherfacpatients || cvm.allowotherfacpatients == 0) {
                    inputData.Params.push({
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    });
                }
                if (searchByPatientId == true && query != -1 && query != undefined) {
                    if(cvm.displayoption == 'mobile') {
                        cvm.issearch = true;
                        inputData.Params.push({
                            Key: 0,
                            Value: cvm.controlid
                        });
                    } else
                    {
                        inputData.Params.push({
                            Key: 0,
                            Value: query
                        });
                    }

                    canSearch = true;
                } else if (query && query.length > 2) {
                    if (cvm.mrnshortcode) {
                        if (!cvm.IsMRN) {
                            inputData.Params.push({
                                Key: 1,
                                Value: query
                            });
                        } else {
                            if (isNaN(query)) {
                                inputData.Params.push({
                                    Key: 2,
                                    Value: query
                                });
                            } else {
                                inputData.Params.push({
                                    Key: 32,
                                    Value: query
                                });
                            }
                        }
                    } else {
                        inputData.Params.push({
                            Key: 1,
                            Value: query
                        });
                    }

                    canSearch = true;
                    if (cvm.controlid == 'cid') {
                        inputData.Params.push({
                            Key: 15,
                            Value: 2
                        });
                    }

                    if (cvm.controlid == 'eid') {
                        inputData.Params.push({
                            Key: 15,
                            Value: 1
                        });
                    }

                    if (cvm.filterconfig) {
                        if (cvm.filterconfig.isvisitinprogress) {
                            inputData.Params.push({
                                Key: 24,
                                Value: cvm.filterconfig.isvisitinprogress
                            });
                        }
                        if (cvm.filterconfig.isbilloutstanding) {
                            inputData.Params.push({
                                Key: 25,
                                Value: 1
                            });
                        }
                        if (cvm.filterconfig.ipnotallowop == 1 && !cvm.filterconfig.context) {
                            inputData.Params.push({
                                Key: 15,
                                Value: 1
                            });
                        }
                    }

                    cvm.patientid = null;
                } else if (query && query.length > 0 && cvm.IsMRN && cvm.mrnshortcode) {

                    if (isNaN(query)) {
                        inputData.Params.push({
                            Key: 2,
                            Value: query
                        });
                    } else {
                        inputData.Params.push({
                            Key: 32,
                            Value: query
                        });
                    }

                    canSearch = true;

                    if (cvm.filterconfig) {
                        if (cvm.filterconfig.isvisitinprogress) {
                            inputData.Params.push({
                                Key: 24,
                                Value: cvm.filterconfig.isvisitinprogress
                            });
                        }
                        if (cvm.filterconfig.isbilloutstanding) {
                            inputData.Params.push({
                                Key: 25,
                                Value: 1
                            });
                        }
                        if (cvm.filterconfig.ipnotallowop == 1 && !cvm.filterconfig.context) {
                            inputData.Params.push({
                                Key: 15,
                                Value: 1
                            });
                        }
                    }

                    cvm.patientid = null;
                }


                if (canSearch == true) {
                    cvm.newPatientNo = query;
                    //inputData.Params.push({ Key: 28, Value: utl.Session.getCurrentFacilityId() });
                    return $http.post(window.appPath.apiroot + 'registration/Patient/GetMinPatientSearch', inputData)
                        .then(searchPatientCallback);
                } else {
                    cvm.newPatientNo = query;
                }
                return null;
            }

            cvm.getPatientDisplayString = function() {
                if (!cvm.patientdisplay) return '';
                if (typeof cvm.patientdisplay === 'string') return cvm.patientdisplay;
                if (cvm.displayoption) return cvm.patientdisplay.Mobile || '';
                return cvm.patientdisplay.FirstName || '';
            };

            // Fix the searchPatient wrapper
            cvm.reactSearchPatient = function(query) {
                var promise = cvm.searchPatient(query);
                if (promise && promise.then) {
                    return promise; // searchPatientCallback returns the array
                }
                return Promise.resolve([]);
            };

            cvm.refreshReactProps = function() {
                cvm.reactPropsContainer = {
                    onSearch: cvm.reactSearchPatient,
                    onSelect: function(patient) {
                        cvm.OnSelectPatient(patient, patient, patient.PatientName, null);
                        cvm.patientdisplay = patient;
                        $scope.$applyAsync();
                    },
                    reactProps: {
                        controlId: cvm.controlid,
                        canDisable: !!cvm.candisable,
                        tabIndex: cvm.tabindex || 0,
                        patientDisplay: cvm.getPatientDisplayString(),
                        placeholder: cvm.mrnshortcode ? 'Search Name/Phone/UHID....' : 'Patient Name/Phone/UHID search'
                    }
                };
            };

            $scope.$watchGroup([
                function() { return cvm.candisable; },
                function() { return cvm.patientdisplay; }
            ], function() {
                cvm.refreshReactProps();
            });

            cvm.init = function () {
                cvm.refreshReactProps();
                //Init logic
            }

            //caution : base method, please don't modifiy
            cvm.$onInit = function () {
                $timeout(cvm.init, 100);
            }
        }])
        .component('patientsearch', {
            bindings: {
                patientid: '=?',
                patientinfo: '=?',
                filterconfig: "=?",
                controlid: '=?',
                issearch: '=?',
                displayoption: "=?",
                // newPatientNo: "=",
                patientchange: '&',
                tabindex: "<?",
                candisable: "<?",
            },
            controller: 'patientSearchCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/patientsearchcontrol.html'
        })
})();