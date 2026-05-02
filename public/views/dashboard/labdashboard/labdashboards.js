(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabDashBoardController', LabDashBoardController);

    function LabDashBoardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.Items = [];
        $scope.Items.appoinmentCount = '0';
        $scope.Items.checkedincount = '0';
        $scope.Items.inpatientcount = '0';
        $scope.Items.otschedulecount = '0';
        $scope.Items.otnotescount = '0';
        $scope.Items.pendingdischargescount = '0';
        $scope.Items.labresultcount = '0';
        $scope.Items.imagingradiologycount = '0';
        $scope.Items.endoscopycount = '0';
        $scope.Items.abnormalcount = '0';
        $scope.Items.prescriptioncount = '0';
        $scope.Items.surgeryrequestcount = '0';
        $scope.Items.admissionrequestcount = '0';
        $scope.Items.physiotheraphycount = '0';

        $scope.rows = [];
        $scope.row = { cols: [] };
        $scope.headerRow = { cols: [] };

        $scope.Items = {
            AllSupDept: {},
            AllOrdStatus: {}
        };

        $scope.currentcontext = {
            SubDepartmentId: [],
            OrderStatusId: []
        };
        $scope.currentcontext.CanOrderAcceptances = utl.Privilege.hasAccess('CanOrderAcceptances');
        $scope.currentcontext.CanSpecimenCollection = utl.Privilege.hasAccess('CanSpecimenCollection');
        $scope.currentcontext.CanResultEntries = utl.Privilege.hasAccess('CanResultEntries');
        $scope.currentcontext.CanResultApprovals = utl.Privilege.hasAccess('CanResultApprovals');
        $scope.currentcontext.CanResultReleases = utl.Privilege.hasAccess('CanResultReleases');
        $scope.currentcontext.CanResultTemplates = utl.Privilege.hasAccess('CanResultTemplates');
        $scope.currentcontext.CanManageTests = utl.Privilege.hasAccess('CanManageTests');
        $scope.currentcontext.CanManageParameter = utl.Privilege.hasAccess('CanManageParameter');
        $scope.currentcontext.CanReports = utl.Privilege.hasAccess('CanReports');

        // $scope.getdoctDashboardCountCallBack = function (scope, res, options, hasError) {
        //     $scope.Items.appoinmentCount = res.appointment.appoinmentCount;
        //     $scope.Items.checkedincount = res.mycheckedin.checkedincount;
        // $scope.Items.inpatientcount = res.myinpatient.inpatientcount;
        // $scope.Items.otschedulecount = res.otschedule.otschedulecount;
        // $scope.Items.otnotescount = res.reviewnotes.otnotescount;
        // $scope.Items.pendingdischargescount = res.pendingdischarge.pendingdischargescount;
        // $scope.Items.labresultcount = res.resultreview.labresultcount;
        // $scope.Items.imagingradiologycount = res.radiologyresult.imagingradiologycount;
        // $scope.Items.endoscopycount = res.endoscopyresults.endoscopycount;
        // $scope.Items.abnormalcount = res.abnormalresults.abnormalcount;
        // $scope.Items.prescriptioncount = res.prescription.prescriptioncount;
        // $scope.Items.surgeryrequestcount = res.surgeryrequest.surgeryrequestcount;
        // $scope.Items.admissionrequestcount = res.admissionrequest.admissionrequestcount;
        // $scope.Items.physiotheraphycount = res.physiotheraphy.physiotheraphycount;
        // $scope.Items.doctormedicalauditcount = res.doctormedicalauditcount.doctormedicalauditcount;


        // if (!$scope.Items.appoinmentCount)
        //     $scope.Items.appoinmentCount = '0';
        // if (!$scope.Items.checkedincount)
        //     $scope.Items.checkedincount = '0';
        // if (!$scope.Items.inpatientcount)
        //     $scope.Items.inpatientcount = '0';
        // if (!$scope.Items.otschedulecount)
        //     $scope.Items.otschedulecount = '0';
        // if (!$scope.Items.otnotescount)
        //     $scope.Items.otnotescount = '0';
        // if (!$scope.Items.pendingdischargescount)
        //     $scope.Items.pendingdischargescount = '0';
        // if (!$scope.Items.labresultcount)
        //     $scope.Items.labresultcount = '0';
        // if (!$scope.Items.imagingradiologycount)
        //     $scope.Items.imagingradiologycount = '0';
        // if (!$scope.Items.endoscopycount)
        //     $scope.Items.endoscopycount = '0';
        // if (!$scope.Items.abnormalcount)
        //     $scope.Items.abnormalcount = '0';
        // if (!$scope.Items.prescriptioncount)
        //     $scope.Items.prescriptioncount = '0';
        // if (!$scope.Items.surgeryrequestcount)
        //     $scope.Items.surgeryrequestcount = '0';
        // if (!$scope.Items.admissionrequestcount)
        //     $scope.Items.admissionrequestcount = '0';
        // if (!$scope.Items.physiotheraphycount)
        //     $scope.Items.physiotheraphycount = '0';
        // if (!$scope.Items.doctormedicalauditcount)
        //     $scope.Items.doctormedicalauditcount = '0';
        // };
        $scope.getddCount = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'appointment'
                    },
                    {
                        Key: 'mycheckedin'
                    },

                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'Visit/DoctorDashboard/GetDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdoctDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.appoinment = function () {
            $state.go('app.doctorappointment');
        }
        $scope.checkedinpatients = function () {
            // $state.go('app.checkedinpatients');
            $state.go('app.oppatienttab.mycheckin');
        }
        $scope.inpatients = function () {
            $state.go('app.currentinpatient');
        }
        $scope.otschedules = function () {
            $state.go('app.otdoctorschedule');
        }
        $scope.otnotes = function () {
            $state.go('app.otdoctornotes', {
                context: 'doctor'
            });
        }
        $scope.pendingdischarges = function () {
            $state.go('app.pendingdischarges');
        }
        $scope.labresult = function () {
            $state.go('app.labresultreviews', {
                context: 'doctor'
            });
        }
        $scope.imagingradiology = function () {
            $state.go('app.radiologyresults');
        }
        $scope.endoscopyresults = function () {
            $state.go('app.endoscopyresultreview');
        }
        $scope.upnormalresults = function () {
            $state.go('app.abnormallabresults');
        }
        $scope.prescription = function () {
            $state.go('app.doctorprescription');
        }
        $scope.surgeryrequest = function () {
            $state.go('app.otrequests');
        }
        $scope.admissionrequest = function () {
            $state.go('app.admissionrequests');
        }
        $scope.physiotheraphy = function () {
            $state.go('app.physiotheraphytab.details');
        }
        $scope.doctorMedicalAudit = function () {
            $state.go('app.medicalauditemr');
        }

        $scope.acceptances = function () {
            $state.go('app.orderacknowledgements', {
                tp: 1,
                context: 'lab'
            });
        }
        $scope.specimen = function () {
            $state.go('app.samplecollectionlist');
        }
        $scope.resultentries = function () {
            $state.go('app.processallorders', {
                tp: 1,
                context: 'lab'
            });
        }
        // $scope.resultapprovals = function () {
        //     $state.go('app.resultapprovaltab.approvalmyorders', {
        //         tp: 1
        //     });
        // }
        $scope.resultapprovals = function () {
            $state.go('app.approvalallorders', {
                tp: 1
            });
        }
        $scope.resultreleases = function () {
            $state.go('app.resultdispatches', {
                tp: 1
            });
        }
        $scope.resulttemplates = function () {
            $state.go('app.notetemplates', { context: 'lab' });
        }
        $scope.managetests = function () {
            $state.go('app.testmasters', { context: 'lab' });
        }
        $scope.manageparam = function () {
            $state.go('app.analytemasters', { context: 'lab' });
        }
        $scope.labreport = function () {
            $state.go('app.labreports', { context: 'lab' });
        }
        $scope.antibiotic = function () {
            $state.go('app.antibioticmasters', { context: 'lab' });
        }
        $scope.orgisolation = function () {
            $state.go('app.organismsisolations', { context: 'lab' });
        }

        // Expose navigation for React components
        $scope.handleNavigation = function(stateName, params) {
            $state.go(stateName, params);
        };
        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.getOutPatientList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 5,
                    Value: $scope.currentcontext.DoctorId
                },
                {
                    Key: 17,
                    Value: FromDate
                },
                {
                    Key: 18,
                    Value: ToDate
                }
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOutPatientListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getOutPatientListCallBack = function (scope, res, options, hasError) {
            $scope.outpatientlist = res.Data;
        }


        $scope.GetFacilityDashboardOptions = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'encounter'
                    }, {
                        Key: 'patient'
                    },
                    {
                        Key: 'appointment'
                    },
                        // {
                        //     Key: 'newborn'
                        // }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
        }

        $scope.getLABDeptListCallBack = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                $scope.currentcontext.SubDepartmentId.push(res.Data[idx].Id);
                var id = res.Data[idx].Id;
                var name = res.Data[idx].DepartmentName;
                $scope.Items.AllSupDept[id] = name;
            }
            // $scope.getOrderStatusList();
        }

        $scope.getLABDeptList = function () {
            var inputData = {
                Params: [
                    { Key: 6, Value: 8 }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'SystemSettings/department/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLABDeptListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getOrderStatusListCallBack = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                $scope.currentcontext.OrderStatusId.push(res.Data[idx].Id);
                var id = res.Data[idx].Id;
                var name = res.Data[idx].DisplayName;
                $scope.Items.AllOrdStatus[id] = name;
            }
            $scope.getList();
        }


        $scope.getOrderStatusList = function () {
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'LIS/OrderStatus/GetOrderStatuss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOrderStatusListCallBack
            };
            utl.Http.doAction(options);
        };

        var groupByMulti = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupByMulti(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        var getDeptLabel = function (key) {
            var deptname = $scope.Items.AllSupDept[key] || "";
            return deptname;
        };

        var getOrderStatusLabel = function (key) {
            var ordsts = $scope.Items.AllOrdStatus[key] || key;
            return ordsts;
        };
        var fillEmptyCols = function (colIndexes, cols) {
            for (var cIndex = cols.length; cIndex < colIndexes.length; cIndex++) {
                cols.push({ text: '' });
            }
        };

        var constructTable = function (gItems) {
            var colIndexes = ['Department', 'Total'];
            $scope.rows = [];
            for (var sdKey in gItems) {
                $scope.row = { cols: [] };
                fillEmptyCols(colIndexes, $scope.row.cols);
                //0 - subdepartment name
                $scope.row.cols[0] = { text: getDeptLabel(sdKey) };
                for (var osKey in gItems[sdKey]) {
                    var osIndex = colIndexes.indexOf(osKey);
                    var osTotal = gItems[sdKey][osKey].length;
                    if (osIndex === -1) {
                        colIndexes.push(osKey);
                        osIndex = colIndexes.indexOf(osKey);
                        fillEmptyCols(colIndexes, $scope.row.cols);
                    }
                    $scope.row.cols[osIndex] = { text: osTotal };
                }

                $scope.rows.push($scope.row);
            }
            // for (var idx in $scope.rows) {
            //     var total = $scope.rows[idx];
            // }
            $scope.headerRow = { cols: [] };
            for (var cIndex = 0; cIndex < colIndexes.length; cIndex++) {
                $scope.headerRow.cols.push({ text: getOrderStatusLabel(colIndexes[cIndex]) });
            }
            //$scope.rows.splice(0,0, $scope.headerRow);

            for (var rIndex = 0; rIndex < $scope.rows.length; rIndex++) {
                fillEmptyCols(colIndexes, $scope.rows[rIndex].cols);
            }
            return $scope.rows;
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            var sourceData = res.Data;
            var groupedItems = groupByMulti(sourceData, ['SubDepartmentId', 'OrderStatusId']);
            var table = constructTable(groupedItems);
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 9,
                        Value: 1
                    }]
            }

            var options = {
                action: 'emr/patientorder/GetMinPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };



        $scope.getLABDeptList();
        // $scope.getddCount();
        // $scope.GetFacilityDashboardOptions();
        // $scope.getOutPatientList();
    }
    LabDashBoardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();