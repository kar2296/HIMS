(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CRMDashBoardController', CRMDashBoardController);

    function CRMDashBoardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
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


        $scope.currentcontext.CanOrderAcceptances = utl.Privilege.hasAccess('CanOrderAcceptances');
        $scope.currentcontext.CanSpecimenCollection = utl.Privilege.hasAccess('CanSpecimenCollection');
        $scope.currentcontext.CanResultEntries = utl.Privilege.hasAccess('CanResultEntries');
        $scope.currentcontext.CanResultApprovals = utl.Privilege.hasAccess('CanResultApprovals');
        $scope.currentcontext.CanResultReleases = utl.Privilege.hasAccess('CanResultReleases');
        $scope.currentcontext.CanResultTemplates = utl.Privilege.hasAccess('CanResultTemplates');
        $scope.currentcontext.CanManageTests = utl.Privilege.hasAccess('CanManageTests');
        $scope.currentcontext.CanManageParameter = utl.Privilege.hasAccess('CanManageParameter');
        $scope.currentcontext.CanReports = utl.Privilege.hasAccess('CanReports');

        $scope.addNew = function () {
          $state.go('app.totalcall-list', {
              id: 0
          });
      }

        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        (function($) {
            'use strict';
            $(function() {
          
              // Remove pro banner on close
              document.querySelector('#bannerClose').addEventListener('click',function() {
                document.querySelector('#proBanner').classList.add('d-none');
              });
              
              Chart.defaults.global.legend.labels.usePointStyle = true;
              
              if ($("#serviceSaleProgress").length) {
                var bar = new ProgressBar.Circle(serviceSaleProgress, {
                  color: 'url(#gradient)',
                  // This has to be the same size as the maximum width to
        //           // prevent clipping
                  strokeWidth: 8,
                  trailWidth: 8,
                  easing: 'easeInOut',
                  duration: 1400,
                  text: {
                    autoStyleContainer: false
                  },
                  from: { color: '#aaa', width: 6 },
                  to: { color: '#57c7d4', width: 6 }
                });
          
                bar.animate(.65);  // Number from 0.0 to 1.0
                bar.path.style.strokeLinecap = 'round';
                let linearGradient = '<defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse"><stop offset="20%" stop-color="#da8cff"/><stop offset="50%" stop-color="#9a55ff"/></linearGradient></defs>';
                bar.svg.insertAdjacentHTML('afterBegin', linearGradient);
              }
              if ($("#productSaleProgress").length) {
                var bar = new ProgressBar.Circle(productSaleProgress, {
                  color: 'url(#productGradient)',
                  // This has to be the same size as the maximum width to
                  // prevent clipping
                  strokeWidth: 8,
                  trailWidth: 8,
                  easing: 'easeInOut',
                  duration: 1400,
                  text: {
                    autoStyleContainer: false
                  },
                  from: { color: '#aaa', width: 6 },
                  to: { color: '#57c7d4', width: 6 }
                });
          
                bar.animate(.6);  // Number from 0.0 to 1.0
                bar.path.style.strokeLinecap = 'round';
                let linearGradient = '<defs><linearGradient id="productGradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse"><stop offset="40%" stop-color="#36d7e8"/><stop offset="70%" stop-color="#b194fa"/></linearGradient></defs>';
                bar.svg.insertAdjacentHTML('afterBegin', linearGradient);
              }
              if ($("#points-chart").length) {
                var ctx = document.getElementById('points-chart').getContext("2d");
          
                var gradientStrokeViolet = ctx.createLinearGradient(0, 0, 0, 181);
                gradientStrokeViolet.addColorStop(0, 'rgba(218, 140, 255, 1)');
                gradientStrokeViolet.addColorStop(1, 'rgba(154, 85, 255, 1)');
          
                var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: [1, 2, 3, 4, 5, 6, 7, 8],
                        datasets: [
                          {
                            label: "North Zone",
                            borderColor: gradientStrokeViolet,
                            backgroundColor: gradientStrokeViolet,
                            hoverBackgroundColor: gradientStrokeViolet,
                            pointRadius: 0,
                            fill: false,
                            borderWidth: 1,
                            fill: 'origin',
                            data: [20, 40, 15, 35, 25, 50, 30, 20]
                          },
                          {
                            label: "South Zone",
                            borderColor: '#e9eaee',
                            backgroundColor: '#e9eaee',
                            hoverBackgroundColor: '#e9eaee',
                            pointRadius: 0,
                            fill: false,
                            borderWidth: 1,
                            fill: 'origin',
                            data: [40, 30, 20, 10, 50, 15, 35, 20]
                          }
                      ]
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    display: false,
                                    min: 0,
                                    stepSize: 10
                                },
                                gridLines: {
                                  drawBorder: false,
                                  display: false
                                }
                            }],
                            xAxes: [{
                                gridLines: {
                                  display:false,
                                  drawBorder: false,
                                  color: 'rgba(0,0,0,1)',
                                  zeroLineColor: '#eeeeee'
                                },
                                ticks: {
                                    padding: 20,
                                    fontColor: "#9c9fa6",
                                    autoSkip: true,
                                },
                                barPercentage: 0.7
                            }]
                          }
                        },
                        elements: {
                          point: {
                            radius: 0
                          }
                        }
                      })
              }
              if ($("#events-chart").length) {
                var ctx = document.getElementById('events-chart').getContext("2d");
          
                var gradientStrokeBlue = ctx.createLinearGradient(0, 0, 0, 181);
                gradientStrokeBlue.addColorStop(0, 'rgba(54, 215, 232, 1)');
                gradientStrokeBlue.addColorStop(1, 'rgba(177, 148, 250, 1)');
          
                var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: [1, 2, 3, 4, 5, 6, 7, 8],
                        datasets: [
                          {
                            label: "Domestic",
                            borderColor: gradientStrokeBlue,
                            backgroundColor: gradientStrokeBlue,
                            hoverBackgroundColor: gradientStrokeBlue,
                            pointRadius: 0,
                            fill: false,
                            borderWidth: 1,
                            fill: 'origin',
                            data: [20, 40, 15, 35, 25, 50, 30, 20]
                          },
                          {
                            label: "International",
                            borderColor: '#e9eaee',
                            backgroundColor: '#e9eaee',
                            hoverBackgroundColor: '#e9eaee',
                            pointRadius: 0,
                            fill: false,
                            borderWidth: 1,
                            fill: 'origin',
                            data: [40, 30, 20, 10, 50, 15, 35, 20]
                          }
                      ]
                    },
                    options: {
                        legend: {
                            display: false
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    display: false,
                                    min: 0,
                                    stepSize: 10
                                },
                                gridLines: {
                                  drawBorder: false,
                                  display: false
                                }
                            }],
                            xAxes: [{
                                gridLines: {
                                  display:false,
                                  drawBorder: false,
                                  color: 'rgba(0,0,0,1)',
                                  zeroLineColor: '#eeeeee'
                                },
                                ticks: {
                                    padding: 20,
                                    fontColor: "#9c9fa6",
                                    autoSkip: true,
                                },
                                barPercentage: 0.7
                            }]
                          }
                        },
                        elements: {
                          point: {
                            radius: 0
                          }
                        }
                      })
              }
              if ($("#visit-sale-chart").length) {
                Chart.defaults.global.legend.labels.usePointStyle = true;
                var ctx = document.getElementById('visit-sale-chart').getContext("2d");
          
                var gradientStrokeViolet = ctx.createLinearGradient(0, 0, 0, 181);
                gradientStrokeViolet.addColorStop(0, 'rgba(218, 140, 255, 1)');
                gradientStrokeViolet.addColorStop(1, 'rgba(154, 85, 255, 1)');
                var gradientLegendViolet = 'linear-gradient(to right, rgba(218, 140, 255, 1), rgba(154, 85, 255, 1))';
                
                var gradientStrokeBlue = ctx.createLinearGradient(0, 0, 0, 360);
                gradientStrokeBlue.addColorStop(0, 'rgba(54, 215, 232, 1)');
                gradientStrokeBlue.addColorStop(1, 'rgba(177, 148, 250, 1)');
                var gradientLegendBlue = 'linear-gradient(to right, rgba(54, 215, 232, 1), rgba(177, 148, 250, 1))';
          
                var gradientStrokeRed = ctx.createLinearGradient(0, 0, 0, 300);
                gradientStrokeRed.addColorStop(0, 'rgba(255, 191, 150, 1)');
                gradientStrokeRed.addColorStop(1, 'rgba(254, 112, 150, 1)');
                var gradientLegendRed = 'linear-gradient(to right, rgba(255, 191, 150, 1), rgba(254, 112, 150, 1))';
          
                var myChart = new Chart(ctx, {
                  type: 'bar',
                  data: {
                      labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'],
                      datasets: [
                        {
                          label: "Total Calls",
                          borderColor: gradientStrokeViolet,
                          backgroundColor: gradientStrokeViolet,
                          hoverBackgroundColor: gradientStrokeViolet,
                          legendColor: gradientLegendViolet,
                          pointRadius: 0,
                          fill: false,
                          borderWidth: 1,
                          fill: 'origin',
                          data: [20, 40, 15, 35, 25, 50, 30, 20]
                        },
                        {
                          label: "Total Missed Call",
                          borderColor: gradientStrokeRed,
                          backgroundColor: gradientStrokeRed,
                          hoverBackgroundColor: gradientStrokeRed,
                          legendColor: gradientLegendRed,
                          pointRadius: 0,
                          fill: false,
                          borderWidth: 1,
                          fill: 'origin',
                          data: [40, 30, 20, 10, 50, 15, 35, 40]
                        },
                        {
                          label: "Total Outgoing Call",
                          borderColor: gradientStrokeBlue,
                          backgroundColor: gradientStrokeBlue,
                          hoverBackgroundColor: gradientStrokeBlue,
                          legendColor: gradientLegendBlue,
                          pointRadius: 0,
                          fill: false,
                          borderWidth: 1,
                          fill: 'origin',
                          data: [70, 10, 30, 40, 25, 50, 15, 30]
                        }
                    ]
                  },
                  options: {
                    responsive: true,
                    legend: false,
                    legendCallback: function(chart) {
                      var text = []; 
                      text.push('<ul>'); 
                      for (var i = 0; i < chart.data.datasets.length; i++) { 
                          text.push('<li><span class="legend-dots" style="background:' + 
                                     chart.data.datasets[i].legendColor + 
                                     '"></span>'); 
                          if (chart.data.datasets[i].label) { 
                              text.push(chart.data.datasets[i].label); 
                          } 
                          text.push('</li>'); 
                      } 
                      text.push('</ul>'); 
                      return text.join('');
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                display: false,
                                min: 0,
                                stepSize: 20,
                                max: 80
                            },
                            gridLines: {
                              drawBorder: false,
                              color: 'rgba(235,237,242,1)',
                              zeroLineColor: 'rgba(235,237,242,1)'
                            }
                        }],
                        xAxes: [{
                            gridLines: {
                              display:false,
                              drawBorder: false,
                              color: 'rgba(0,0,0,1)',
                              zeroLineColor: 'rgba(235,237,242,1)'
                            },
                            ticks: {
                                padding: 20,
                                fontColor: "#9c9fa6",
                                autoSkip: true,
                            },
                            categoryPercentage: 0.5,
                            barPercentage: 0.5
                        }]
                      }
                    },
                    elements: {
                      point: {
                        radius: 0
                      }
                    }
                })
                $("#visit-sale-chart-legend").html(myChart.generateLegend());
              }
              if ($("#visit-sale-chart-dark").length) {
                Chart.defaults.global.legend.labels.usePointStyle = true;
                var ctx = document.getElementById('visit-sale-chart-dark').getContext("2d");
          
                var gradientStrokeViolet = ctx.createLinearGradient(0, 0, 0, 181);
                gradientStrokeViolet.addColorStop(0, 'rgba(218, 140, 255, 1)');
                gradientStrokeViolet.addColorStop(1, 'rgba(154, 85, 255, 1)');
                var gradientLegendViolet = 'linear-gradient(to right, rgba(218, 140, 255, 1), rgba(154, 85, 255, 1))';
                
                var gradientStrokeBlue = ctx.createLinearGradient(0, 0, 0, 360);
                gradientStrokeBlue.addColorStop(0, 'rgba(54, 215, 232, 1)');
                gradientStrokeBlue.addColorStop(1, 'rgba(177, 148, 250, 1)');
                var gradientLegendBlue = 'linear-gradient(to right, rgba(54, 215, 232, 1), rgba(177, 148, 250, 1))';
          
                var gradientStrokeRed = ctx.createLinearGradient(0, 0, 0, 300);
                gradientStrokeRed.addColorStop(0, 'rgba(255, 191, 150, 1)');
                gradientStrokeRed.addColorStop(1, 'rgba(254, 112, 150, 1)');
                var gradientLegendRed = 'linear-gradient(to right, rgba(255, 191, 150, 1), rgba(254, 112, 150, 1))';
          
                var myChart = new Chart(ctx, {
                  type: 'bar',
                  data: {
                      labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'],
                      datasets: [
                        {
                          label: "Total Calls",
                          borderColor: gradientStrokeViolet,
                          backgroundColor: gradientStrokeViolet,
                          hoverBackgroundColor: gradientStrokeViolet,
                          legendColor: gradientLegendViolet,
                          pointRadius: 0,
                          fill: false,
                          borderWidth: 1,
                          fill: 'origin',
                          data: [20, 40, 15, 35, 25, 50, 30, 20]
                        },
                        {
                          label: "Total Missed Call",
                          borderColor: gradientStrokeRed,
                          backgroundColor: gradientStrokeRed,
                          hoverBackgroundColor: gradientStrokeRed,
                          legendColor: gradientLegendRed,
                          pointRadius: 0,
                          fill: false,
                          borderWidth: 1,
                          fill: 'origin',
                          data: [40, 30, 20, 10, 50, 15, 35, 40]
                        },
                        {
                          label: "Total Outgoing Call",
                          borderColor: gradientStrokeBlue,
                          backgroundColor: gradientStrokeBlue,
                          hoverBackgroundColor: gradientStrokeBlue,
                          legendColor: gradientLegendBlue,
                          pointRadius: 0,
                          fill: false,
                          borderWidth: 1,
                          fill: 'origin',
                          data: [70, 10, 30, 40, 25, 50, 15, 30]
                        }
                    ]
                  },
                  options: {
                    responsive: true,
                    legend: false,
                    legendCallback: function(chart) {
                      var text = []; 
                      text.push('<ul>'); 
                      for (var i = 0; i < chart.data.datasets.length; i++) { 
                          text.push('<li><span class="legend-dots" style="background:' + 
                                     chart.data.datasets[i].legendColor + 
                                     '"></span>'); 
                          if (chart.data.datasets[i].label) { 
                              text.push(chart.data.datasets[i].label); 
                          } 
                          text.push('</li>'); 
                      } 
                      text.push('</ul>'); 
                      return text.join('');
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                display: false,
                                min: 0,
                                stepSize: 20,
                                max: 80
                            },
                            gridLines: {
                              drawBorder: false,
                              color: '#322f2f',
                              zeroLineColor: '#322f2f'
                            }
                        }],
                        xAxes: [{
                            gridLines: {
                              display:false,
                              drawBorder: false,
                              color: 'rgba(0,0,0,1)',
                              zeroLineColor: 'rgba(235,237,242,1)'
                            },
                            ticks: {
                                padding: 20,
                                fontColor: "#9c9fa6",
                                autoSkip: true,
                            },
                            categoryPercentage: 0.5,
                            barPercentage: 0.5
                        }]
                      }
                    },
                    elements: {
                      point: {
                        radius: 0
                      }
                    }
                })
                $("#visit-sale-chart-legend-dark").html(myChart.generateLegend());
              }
              if ($("#traffic-chart").length) {
                var gradientStrokeBlue = ctx.createLinearGradient(0, 0, 0, 181);
                gradientStrokeBlue.addColorStop(0, 'rgba(54, 215, 232, 1)');
                gradientStrokeBlue.addColorStop(1, 'rgba(177, 148, 250, 1)');
                var gradientLegendBlue = 'linear-gradient(to right, rgba(54, 215, 232, 1), rgba(177, 148, 250, 1))';
          
                var gradientStrokeRed = ctx.createLinearGradient(0, 0, 0, 50);
                gradientStrokeRed.addColorStop(0, 'rgba(255, 191, 150, 1)');
                gradientStrokeRed.addColorStop(1, 'rgba(254, 112, 150, 1)');
                var gradientLegendRed = 'linear-gradient(to right, rgba(255, 191, 150, 1), rgba(254, 112, 150, 1))';
          
                var gradientStrokeGreen = ctx.createLinearGradient(0, 0, 0, 300);
                gradientStrokeGreen.addColorStop(0, 'rgba(6, 185, 157, 1)');
                gradientStrokeGreen.addColorStop(1, 'rgba(132, 217, 210, 1)');
                var gradientLegendGreen = 'linear-gradient(to right, rgba(6, 185, 157, 1), rgba(132, 217, 210, 1))';      
          
                var trafficChartData = {
                  datasets: [{
                    data: [30, 30, 40],
                    backgroundColor: [
                      gradientStrokeBlue,
                      gradientStrokeGreen,
                      gradientStrokeRed
                    ],
                    hoverBackgroundColor: [
                      gradientStrokeBlue,
                      gradientStrokeGreen,
                      gradientStrokeRed
                    ],
                    borderColor: [
                      gradientStrokeBlue,
                      gradientStrokeGreen,
                      gradientStrokeRed
                    ],
                    legendColor: [
                      gradientLegendBlue,
                      gradientLegendGreen,
                      gradientLegendRed
                    ]
                  }],
              
                  // These labels appear in the legend and in the tooltips when hovering different arcs
                  labels: [
                    'Total Calls',
                    'Total Missed Call',
                    'Total Outgoing Call',
                  ]
                };
                var trafficChartOptions = {
                  responsive: true,
                  animation: {
                    animateScale: true,
                    animateRotate: true
                  },
                  legend: false,
                  legendCallback: function(chart) {
                    var text = []; 
                    text.push('<ul>'); 
                    for (var i = 0; i < trafficChartData.datasets[0].data.length; i++) { 
                        text.push('<li><span class="legend-dots" style="background:' + 
                        trafficChartData.datasets[0].legendColor[i] + 
                                    '"></span>'); 
                        if (trafficChartData.labels[i]) { 
                            text.push(trafficChartData.labels[i]); 
                        }
                        text.push('<span class="float-right">'+trafficChartData.datasets[0].data[i]+"%"+'</span>')
                        text.push('</li>'); 
                    } 
                    text.push('</ul>'); 
                    return text.join('');
                  }
                };
                var trafficChartCanvas = $("#traffic-chart").get(0).getContext("2d");
                var trafficChart = new Chart(trafficChartCanvas, {
                  type: 'doughnut',
                  data: trafficChartData,
                  options: trafficChartOptions
                });
                $("#traffic-chart-legend").html(trafficChart.generateLegend());      
              }
              if ($("#inline-datepicker").length) {
                $('#inline-datepicker').datepicker({
                  enableOnReadonly: true,
                  todayHighlight: true,
                });
              }
            });
          })(jQuery);      

       
       
         


        // $scope.getddCount();
        // $scope.GetFacilityDashboardOptions();
        // $scope.getOutPatientList();
    }
    CRMDashBoardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();