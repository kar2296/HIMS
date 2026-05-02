(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('shoulderAssessmentController', shoulderAssessmentController);

    function shoulderAssessmentController($scope, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;
        uibButtonConfig.activeClass = "btn-primary";

        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({ $scope: $scope }));

        $scope.currentcontext = {
            id: 0
        };
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.workarea = {
            PatientId : $scope.currentcontext.pid
        };
        $scope.backToList = function () {
            $state.go('patientemr.orthoassesment'); 
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }
        $scope.checkedinpatients = function () {
            $state.go('app.checkedinpatients');
        }

        //save item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        }
    
        $scope.saveItem = function () {
            
            var actionName = 'emr/ShoulderAssessment/AddShoulderAssessment';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/ShoulderAssessment/UpdateShoulderAssessment';
            }

            var inputData = prepareForSave();
          
            var options = {
                action: actionName,
                data: {Data : inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }

        function prepareForSave(){
            var inputData = $scope.workarea;
            inputData.Content = JSON.stringify({ data : $scope.workarea.Items });
            delete inputData.Items;
            return inputData;
        }
        
        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            if(res && res.Data && res.Data.length > 0) {
                $scope.workarea = res.Data[0];
                $scope.currentcontext.id = $scope.workarea.Id;

                var content =  JSON.parse($scope.workarea.Content);
                $scope.workarea.Items = content.data;
            }
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.pid }
                ],
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1                }
            };

            var options = {
                action: 'emr/shoulderassessment/GetShoulderAssessments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

         //print
         $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'emr/shoulderassessment/PrintOrthoAssessment',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }


        $scope.getList();

        $scope.workarea.Items = [
            {
                section: 'Contralateral:',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'Contralateral:', type: 'label', cls: '2 header-col-main' },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_combo.html', code: '', options: [{ code: 'Normal', text: 'Normal' }, { code: 'Nearly Normal', text: 'Nearly Normal' }, { code: 'Abnormal', text: 'Abnormal' }, { code: 'Severely abnormal', text: 'Severely abnormal' }] },
                                ]
                            },
                            {
                                display: '', type: 'dummy', cls: 5
                            }
                        ]
                    }]
            },
            {
                section: 'Chief Complaint',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'Chief Complaint', type: 'label', cls: '2 header-col-main' },
                            { display: 'Right', type: 'label', cls: '5 header-col' },
                            { display: 'Left', type: 'label', cls: '5 header-col' }
                        ]

                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'Pain', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 3, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                    { cls: 9, type: 'sh_single.html', code: '', options: [{ code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }, { code: '6', text: '6' }, { code: '7', text: '7' }, { code: '8', text: '8' }, { code: '9', text: '9' }, { code: '10', text: '10' }] }
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, name: '', questions: [
                                    { cls: 3, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                    { cls: 9, type: 'sh_single.html', code: '', options: [{ code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }, { code: '6', text: '6' }, { code: '7', text: '7' }, { code: '8', text: '8' }, { code: '9', text: '9' }, { code: '10', text: '10' }] }
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: 'Pain medications?', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                ]
                            },
                            {
                                display: '', type: 'dummy', cls: 5
                            }
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'Instability', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 3, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                    { cls: 9, type: 'sh_single.html', code: '', options: [{ code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }, { code: '6', text: '6' }, { code: '7', text: '7' }, { code: '8', text: '8' }, { code: '9', text: '9' }, { code: '10', text: '10' }] }
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 3, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                    { cls: 9, type: 'sh_single.html', code: '', options: [{ code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }, { code: '6', text: '6' }, { code: '7', text: '7' }, { code: '8', text: '8' }, { code: '9', text: '9' }, { code: '10', text: '10' }] }
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: 'Loss of movement', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 3, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                    { cls: 9, type: 'sh_single.html', code: '', options: [{ code: 'Min', text: 'Min' }, { code: 'Mod', text: 'Mod' }, { code: 'Sev', text: 'Sev' }] }
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 3, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                    { cls: 9, type: 'sh_single.html', code: '', options: [{ code: 'Min', text: 'Min' }, { code: 'Mod', text: 'Mod' }, { code: 'Sev', text: 'Sev' }] }
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: 'Weakness ', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'Y', text: 'Y' }, { code: 'N', text: 'N' }] },
                                ]
                            }
                        ]
                    },
                ]
            },
            {
                section: 'History',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'History', type: 'label', cls: '2 header-col-main' },
                            { display: 'RTA (description needed)', type: 'label', cls: '2 header-col' },
                            { display: 'Sports (description needed)', type: 'label', cls: '2 header-col' },
                            { display: 'Domestic fall', type: 'label', cls: '2 header-col' },
                            { display: 'Spontaneous', type: 'label', cls: '2 header-col' },
                            { display: 'Occupational', type: 'label', cls: '2 header-col' }
                        ]

                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'Activities Affected', type: 'label', cls: 2 },
                            { display: '', type: 'text', cls: 2 },
                            { display: '', type: 'text', cls: 2 },
                            { display: '', type: 'text', cls: 2 },
                            { display: '', type: 'text', cls: 2 },
                            { display: '', type: 'text', cls: 2 },
                        ]
                    }
                ]
            },
            {
                section: 'Activity',
                info: '<b><i>Circle the number in the box that indicates your ability to do the following activities:</i><br/> 0 = unable to do; 1 = very difficult to do; 2 = somewhat difficult; 3 = not difficult.</b>',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'Activity', type: 'label', cls: '2 header-col-main' },
                            { display: 'Right Arm', type: 'label', cls: '5 header-col' },
                            { display: 'Left Arm', type: 'label', cls: '5 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'Put on a shirt ', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: 'Sleep on your  painful side', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'Wash back/do up blouse', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: 'Manage Toileting', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: 'Comb hair', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 7,
                        cols: [
                            { display: 'Reach a high shelf', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 8,
                        cols: [
                            { display: 'Lift 4kgs above the shoulder', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 9,
                        cols: [
                            { display: 'Throw a ball overhand', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 10,
                        cols: [
                            { display: 'Do usual work.  List:', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 11,
                        cols: [
                            { display: 'Do usual sport.  List:', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    }
                ]
            },
            //ROM
            {
                section: 'ROM',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'ROM', type: 'label', cls: '2 header-col-main' },
                            { display: 'Right', type: 'label', cls: '5 header-col' },
                            { display: 'Left', type: 'label', cls: '5 header-col' }
                        ]

                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: '', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_display.html', display: 'Active' },
                                    { cls: 6, type: 'sh_display.html', display: 'Passive'  }
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_display.html', display:'Active' },
                                    { cls: 6, type: 'sh_display.html', display: 'Passive'  }
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: 'Forward Flexion', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'Abduction', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }, { code: '120', text: '120<sup>o</sup>' }, { code: '140', text: '140<sup>o</sup>' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: 'External rotation ( 0⁰ )', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: 'Internal rotation ( 0⁰ )', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'Lat Thigh', text: 'Lat Thigh' }, { code: 'Buttock', text: 'Buttock' }, { code: 'L5', text: 'L5' }, { code: 'L2', text: 'L2' }, { code: 'D12', text: 'D12' } ] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'Lat Thigh', text: 'Lat Thigh' }, { code: 'Buttock', text: 'Buttock' }, { code: 'L5', text: 'L5' }, { code: 'L2', text: 'L2' }, { code: 'D12', text: 'D12' } ] }
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'Lat Thigh', text: 'Lat Thigh' }, { code: 'Buttock', text: 'Buttock' }, { code: 'L5', text: 'L5' }, { code: 'L2', text: 'L2' }, { code: 'D12', text: 'D12' } ] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'Lat Thigh', text: 'Lat Thigh' }, { code: 'Buttock', text: 'Buttock' }, { code: 'L5', text: 'L5' }, { code: 'L2', text: 'L2' }, { code: 'D12', text: 'D12' } ] }
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 7,
                        cols: [
                            { display: 'External Rotation (90⁰)', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 8,
                        cols: [
                            { display: 'Internal Rotation (90⁰)', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0<sup>o</sup>' }, { code: '15', text: '15<sup>o</sup>' }, { code: '30', text: '30<sup>o</sup>' }, { code: '45', text: '45<sup>o</sup>' }, { code: '60', text: '60<sup>o</sup>' }, { code: '90', text: '90<sup>o</sup>' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 9,
                        cols: [
                            { display: 'Cross body adduction', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }, { code: 'PAINFULL', text: 'PAINFULL'}] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }, { code: 'PAINFULL', text: 'PAINFULL'}] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 5, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }, { code: 'PAINFULL', text: 'PAINFULL'}] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }, { code: 'PAINFULL', text: 'PAINFULL'}] },
                                ]
                            }
                        ]
                    }
                ]
            },

            //Signs
            {
                section: 'Signs',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 0,
                        cols: [
                            { display: 'Signs', type: 'label', cls: '2 header-col-main' },
                            { display: '<div><b><span>0=NONE</span>&nbsp;&nbsp;&nbsp;<span>1=MILD</span>&nbsp;&nbsp;&nbsp;<span>2=MODERATE</span>&nbsp;&nbsp;&nbsp;<span>3=SEVERE</span></b></div>', type: 'label', cls: '10 header-col' },
                        ]
                    },
                    {
                        rowno: 1,
                        cols: [
                            { display: 'Tenderness', type: 'label', cls: '2 header-col' },
                            { display: '', type: 'label', cls: '2 header-col' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'Supraspinatous/Gtubero', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'Lat', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'Post ', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'A-C Joint', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'Scapula', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'SSP', text: 'SSP' }, { code: 'ISP', text: 'ISP' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'RMB', text: 'RMB' }, { code: 'LEV SCAP', text: 'LEV SCAP' }] }
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'SSP', text: 'SSP' }, { code: 'ISP', text: 'ISP' }] },
                                    { cls: 6, type: 'sh_single.html', code: '', options: [{ code: 'RMB', text: 'RMB' }, { code: 'LEV SCAP', text: 'LEV SCAP' }] }
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 7,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'Biceps', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 8,
                        cols: [
                            { display: 'Wasting / Muscle', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 9,
                        cols: [
                            { display: ' ', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_display.html', code: '', display:'IF YES, WHERE ? :' },
                                    { cls: 6, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_display.html', code: '', display:'IF YES, WHERE ? :' },
                                    { cls: 6, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 10,
                        cols: [
                            { display: 'Scars location', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 11,
                        cols: [
                            { display: '', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_display.html', code: '', display:'IF YES, WHERE ? :' },
                                    { cls: 6, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_display.html', code: '', display:'IF YES, WHERE ? :' },
                                    { cls: 6, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 12,
                        cols: [
                            { display: 'Deformity – describe', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 13,
                        cols: [
                            { display: ' ', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_display.html', code: '', display:'IF YES, DESCRIBE ? :' },
                                    { cls: 6, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 6, type: 'sh_display.html', code: '', display:'IF YES, DESCRIBE ? :' },
                                    { cls: 6, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    },
                ]
            },
            // IMPINGEMENT TEST
            {
                section: 'IMPINGEMENT TEST',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'IMPINGEMENT TEST', type: 'label', cls: '4 header-col-main' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'Compression test ', type: 'label', cls: 2 },
                            { display: 'IR', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'ER', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'Neers’s Test(Passive FF in slight IR)', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: 'HAWKINS   (Passive IR in 90 Flex)', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: 'Classic painful arc - ABD', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 7,
                        cols: [
                            { display: 'Sub acromial crepitus', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    }
                ]
            },
             // STRENGTH (MRC GRADING)
             {
                section: 'STRENGTH (MRC GRADING)',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'STRENGTH (MRC GRADING)', type: 'label', cls: '4 header-col-main' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'Testing affected by pain?', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: 'FLEXION', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'EXTENSION', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: 'ABDUCTION', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: 'ADDUCTION', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 7,
                        cols: [
                            { display: 'INTERNAL ROTATION (ARM AT SIDE)', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            }
                        ]
                    },
                    {
                        rowno: 8,
                        cols: [
                            { display: 'EXTRENAL ROTATION (ARM AT SIDE)', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }, { code: '4', text: '4' }, { code: '5', text: '5' }] },
                                ]
                            }
                        ]
                    },
                ]
            },
              //   ROTATOR CUFF SIGN
              {
                section: 'ROTATOR CUFF SIGN',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'ROTATOR CUFF SIGN', type: 'label', cls: '4 header-col-main' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'SSP ', type: 'label', cls: 2 },
                            { display: 'Drop arm sign', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: ' ', type: 'label', cls: 2 },
                            { display: 'Empty can', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: 'ISP ', type: 'label', cls: 2 },
                            { display: 'External rotation lag sign', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'Sub Scap', type: 'label', cls: 2 },
                            { display: 'Internal rotation lag sign', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: '', type: 'label', cls: 2 },
                            { display: 'Napoleon sign Belly press', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: '', type: 'label', cls: 2 },
                            { display: 'Lift Off Sign', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                ]
            },
             //   AC JOINT TEST
             {
                section: 'AC JOINT TEST',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'AC JOINT TEST', type: 'label', cls: '4 header-col-main' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'Cross arm test', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    }
                ]
            },
            //Biceps / SLAP
            {
                section: 'Biceps / SLAP',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'Biceps / SLAP', type: 'label', cls: '4 header-col-main' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'O’Brien’s test', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: 'Speeds test', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'Yergason test', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '+', text: '+' }, { code: '-', text: '-' }] },
                                ]
                            },
                        ]
                    }
                ]
            },
            //Signs
            {
                section: 'Signs',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 0,
                        cols: [
                            { display: 'Signs', type: 'label', cls: '2 header-col-main' },
                            { display: '<div><b><span>0=NONE</span>&nbsp;&nbsp;&nbsp;<span>1=MILD(0-1cm translation)</span>&nbsp;&nbsp;&nbsp;<span>2=MODERATE(1-2cm translation or upto glenoid rim)</span>&nbsp;&nbsp;&nbsp;<span>3=SEVERE(>2cms translation or over the rim of the glenoid)</span></b></div>', type: 'label', cls: '10 header-col' },
                        ]
                    },
                    {
                        rowno: 1,
                        cols: [
                            { display: 'INSTABILITY', type: 'label', cls: '4 header-col' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'Anterior translation', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: 'Posterior translation', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: 'Inferior translation (Sulcus sign)', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: 'Anterior Apprehension', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: '0', text: '0' }, { code: '1', text: '1' }, { code: '2', text: '2' }, { code: '3', text: '3' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: 'Reproduce symptoms', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 7,
                        cols: [
                            { display: 'Voluntary instability', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 8,
                        cols: [
                            { display: 'Relocation positive?', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 9,
                        cols: [
                            { display: 'Generalized ligamentous laxity', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'YES', text: 'YES' }, { code: 'NO', text: 'NO' }] },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 10,
                        cols: [
                            { display: 'Other physical findings', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    }
                ]
            },
            //INVESTIGATIONS
             {
                section: 'INVESTIGATIONS',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'INVESTIGATIONS', type: 'label', cls: '4 header-col-main' },
                            { display: 'Right', type: 'label', cls: '4 header-col' },
                            { display: 'Left', type: 'label', cls: '4 header-col' },
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: 'X-RAY', type: 'label', cls: 2 },
                            { display: 'AP', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 3,
                        cols: [
                            { display: '', type: 'label', cls: 2 },
                            { display: 'OUTLET', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 4,
                        cols: [
                            { display: '', type: 'label', cls: 2 },
                            { display: 'Other Views', type: 'label', cls: 2 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 5,
                        cols: [
                            { display: 'USG', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 6,
                        cols: [
                            { display: 'MRI', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_textarea.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_textarea.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 7,
                        cols: [
                            { display: 'CT', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_textarea.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_textarea.html', code: '' },
                                ]
                            },
                        ]
                    },
                    {
                        rowno: 8,
                        cols: [
                            { display: 'OTHER', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_textarea.html', code: '' },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_textarea.html', code: '' },
                                ]
                            },
                        ]
                    }
                ]
            },
            //NEW / DIAGNOSIS
            {
                section: 'NEW / DIAGNOSIS',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'INVESTIGATIONS', type: 'label', cls: '4 header-col-main' },
                            { display: '', type: 'text', cls: '8 header-col' },
                        ]
                    }
                ]
            },
            //PLAN OF TREATMENT 
            {
                section: 'PLAN OF TREATMENT ',
                info: '',
                type: 'grid',
                rows: [
                    {
                        rowno: 1,
                        cols: [
                            { display: 'PLAN OF TREATMENT', type: 'label', cls: '4 header-col-main' },
                            { display: 'conservative', type: 'label', cls: '4 header-col' },
                            { display: 'surgical', type: 'label', cls: '4 header-col' }
                        ]
                    },
                    {
                        rowno: 2,
                        cols: [
                            { display: '', type: 'label', cls: 4 },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_single.html', code: '', options: [{ code: 'PHYSIO', text: 'PHYSIO' }, { code: 'MEDICATION', text: 'MEDICATION' }] },
                                ]
                            },
                            {
                                display: '', type: 'composite', cls: 4, questions: [
                                    { cls: 12, type: 'sh_text.html', code: '' },
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

    }

    shoulderAssessmentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();