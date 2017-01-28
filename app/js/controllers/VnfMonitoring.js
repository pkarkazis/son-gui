/*
Copyright (c) 2015 SONATA-NFV [, ANY ADDITIONAL AFFILIATION]
ALL RIGHTS RESERVED.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Neither the name of the SONATA-NFV [, ANY ADDITIONAL AFFILIATION]
nor the names of its contributors may be used to endorse or promote 
products derived from this software without specific prior written 
permission.

This work has been performed in the framework of the SONATA project,
funded by the European Commission under Grant number 671517 through 
the Horizon 2020 and 5G-PPP programmes. The authors would like to 
acknowledge the contributions of their colleagues of the SONATA 
partner consortium (www.sonata-nfv.eu).
*/

SonataApp.controller('VnfMonitoring',['$rootScope','$scope','$routeParams','$location','$http',function($rootScope,$scope, $routeParams, $location, $http){
	
  $scope.vnf = {};
  $scope.a_metrics = [];
  $scope.vnf.currentMemoryUsage = 0;
  $scope.vnf.currentCPUUsage = 0;
	$scope.current_time = new Date();
  $scope.ten_m_before = new Date($scope.current_time.getTime() - 15*60000);

$scope.getVM = function(){
  $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_mem_perc",
                  "start": ""+ new Date(new Date().getTime() - 20*60000).toISOString(),
                  "end": ""+new Date().toISOString(),
                  "step": "10m",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {

           $scope.vnf.exported_instance = data.metrics.result[0].metric.exported_instance;
           $scope.vnf.instance          = data.metrics.result[0].metric.instance;
           $scope.vnf.group             = data.metrics.result[0].metric.group;
           $scope.vnf.id                = data.metrics.result[0].metric.id;
            
          });
}

$scope.getCurrentMemory = function(){
  
   $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_mem_perc",
                  "start": ""+ new Date().toISOString(),
                  "end": ""+new Date().toISOString(),
                  "step": "10m",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {
        
           $scope.vnf.currentMemoryUsage = 100-data.metrics.result[0].values[0][1];
           
           
            
          });
}

$scope.getCurrentCPU = function(){
  
   $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_cpu_perc",
                  "start": ""+ new Date().toISOString(),
                  "end": ""+new Date().toISOString(),
                  "step": "1m",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {
            $scope.vnf.currentCPUUsage = data.metrics.result[0].values[0][1];
           
            
          });
}


$scope.getCPU_History = function(){
  
   $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_cpu_perc",

                  "start": ""+ new Date(new Date().getTime() - 20*60000).toISOString(),
                  "end": ""+new Date().toISOString(),
                  "step": "10s",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {
       
            
          });
}


 
        
        /*var m=[['Time', 'Used', 'Total']];

        data.metrics.result[0].values.forEach( function(element, index) {
          
           
            m.push(['100',parseFloat(element[1]),400]);
            
          

        });
          var options = {
              title: 'CPU',
              hAxis: {title: 'Timestamp',  titleTextStyle: {color: '#333'}},
              vAxis: {minValue: 0}
            };
            console.log(m);
           $scope.drawTheChart(m,options,'cpu_chart');*/

$scope.drawGauges = function(){
   google.charts.setOnLoadCallback(drawChart);
      function drawChart() {

        var data = google.visualization.arrayToDataTable([
          ['Label', 'Value'],
          ['Memory', parseFloat($scope.vnf.currentMemoryUsage)],
          ['CPU', parseFloat($scope.vnf.currentCPUUsage)]
        ]);

        var options = {
          width: 400, height: 120,
          redFrom: 90, redTo: 100,
          yellowFrom:75, yellowTo: 90,
          minorTicks: 5
        };

        var chart = new google.visualization.Gauge(document.getElementById('vCPUschart'));

        chart.draw(data, options);

        setInterval(function() {
          $scope.getCurrentMemory();          
          data.setValue(0, 1, parseFloat($scope.vnf.currentMemoryUsage));
          chart.draw(data, options);
        }, 10000);
        setInterval(function() {
          $scope.getCurrentCPU(); 
          data.setValue(1, 1, parseFloat($scope.vnf.currentCPUUsage));
          chart.draw(data, options);
        }, 10000);
       
      }
}

$scope.drawTheChart = function(data_array,options,element){

       var data = google.visualization.arrayToDataTable(data_array);
       var options = options;
       var chart = new google.visualization.AreaChart(document.getElementById(element));
       chart.draw(data, options);
       

}

    $scope.drawCPUChart = function(){
       
       google.charts.setOnLoadCallback(drawChart);

      function drawChart() {

        var m=[
          ['Time', 'Percent']
        ];

        $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_cpu_perc",

                  "start": ""+ new Date(new Date().getTime() - 20*60000).toISOString(),
                  "end": ""+new Date().toISOString(),
                  "step": "10s",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {
       
            data.metrics.result[0].values.forEach( function(element, index) {
          
           
            var timestamp = element[0].toString();
            timestamp = timestamp.replace('.','');
            
            timestamp = new Date(parseInt(timestamp));

            m.push([timestamp,parseFloat(element[1])]);

            });

            var options = {
              title: 'CPU',
              hAxis: {title: 'Time',  titleTextStyle: {color: '#333'}},
              vAxis: {minValue: 0,maxValue:100}
            };
            


              $scope.drawTheChart(m,options,'cpu_chart');


          });



        

        
      }
    }




     $scope.drawMEMChart = function(){
       
       google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        


        var m=[
          ['Time', 'Percent']
        ];

        $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_mem_perc",
                  "start": ""+ new Date(new Date().getTime() - 10*60000).toISOString(),
                  "end": ""+new Date().toISOString(),
                  "step": "1m",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {
       
            data.metrics.result[0].values.forEach( function(element, index) {
          
           
            var timestamp = element[0].toString();
            timestamp = timestamp.replace('.','');
            
            timestamp = new Date(parseInt(timestamp));

            m.push([timestamp,parseFloat(100-element[1])]);

            });
           


            var options = {
              title: 'Memory',
              hAxis: {title: 'Time',  titleTextStyle: {color: '#333'}},
              vAxis: {minValue: 0,maxValue:100}
            };
            


              $scope.drawTheChart(m,options,'mem_chart');


          });

      }
    }












    $scope.drawRxTxBPSChart = function(){
       
       google.charts.setOnLoadCallback(drawChart);

      function drawChart() {        
        var tstart = new Date(new Date().getTime() - 15*60000).toISOString();
        var tend = new Date().toISOString();
        $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_net_rx_bps",
                  "start": ""+ tstart,
                  "end": ""+tend,
                  "step": "10s",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id},{"labeltag":"inf","labelid":"eth0"}]
                  },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {

            var rx = data;


                        $http({
                      method  : 'POST',
                      url     : $scope.apis.monitoring,
                      data:  {
                              "name": "vm_net_tx_bps",
                              "start": ""+ tstart,
                              "end": ""+tend,
                              "step": "10s",
                              "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id},{"labeltag":"inf","labelid":"eth0"}]
                              },
                      headers : { 'Content-Type': 'application/json' }
                     })
                      .success(function(data) {

                          var tx = data;
                          $scope.kam_bps = [['Time', 'Rx bps','Tx bps']];


                          rx.metrics.result[0].values.forEach( function(rx, index) {
                                  
                                  var ttime = rx[0];
                                  var rx_value = rx[1];
                                  var tx_value = tx.metrics.result[0].values[index][1];


                                  var timestamp = ttime.toString();
                                  timestamp = timestamp.replace('.','');
                                  timestamp = new Date(parseInt(timestamp));
                                  $scope.kam_bps.push([timestamp,parseFloat(rx_value),parseFloat(tx_value)]);






                            });

                             var options = {
                              title: 'Rx/Tx',
                              hAxis: {title: 'Time',  titleTextStyle: {color: '#333'}},
                              vAxis: {minValue: 0}
                            };
                            
                            
                              $scope.drawTheChart($scope.kam_bps,options,'rx_tx_chart');


                      });




         
          });


      
      }

    }



    $scope.drawDiskChart = function(){
       google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
        


       

        $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_disk_total_1k_blocks",
                  "start": ""+ new Date(new Date().getTime() - 15*60000).toISOString(),
                  "end": ""+new Date().toISOString(),
                  "step": "1m",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {
            
            $scope.vnf.disk_total = 0;
            data.metrics.result.forEach( function(element, index) {
              var m= element.metric.file_system;
              if(m.startsWith("/dev")){

                $scope.vnf.disk_total = parseFloat(element.values[0][1]);


                 $http({
                    method  : 'POST',
                    url     : $scope.apis.monitoring,
                    data:  {
                            "name": "vm_disk_used_1k_blocks",
                            "start": ""+ new Date(new Date().getTime() - 15*60000).toISOString(),
                            "end": ""+new Date().toISOString(),
                            "step": "1m",
                            "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id}]
                              },
                    headers : { 'Content-Type': 'application/json' }
                   })
                    .success(function(data) {
                      
                    
                    data.metrics.result.forEach( function(element, index) {
                        var m= element.metric.file_system;
                        if(m.startsWith("/dev")){
                          $scope.kam_disk = [['Time', 'Usage','Total']];
                          element.values.forEach( function(value, index) {

                              var timestamp = value[0].toString();
                              timestamp = timestamp.replace('.','');
                              timestamp = new Date(parseInt(timestamp));
                              $scope.kam_disk.push([timestamp,parseFloat(value[1]),parseFloat($scope.vnf.disk_total)]);
                          });

                        }
                      
                      });
                    var options = {
              title: 'Disk',
              hAxis: {title: 'Time',  titleTextStyle: {color: '#333'}},
              vAxis: {minValue: 0,maxValue:$scope.vnf.disk_total}
            };
            
              $scope.drawTheChart($scope.kam_disk,options,'disk_chart');

                   

                    });





              }

            });
          
          });

      }
    }

    $scope.drawRxTxPPSChart = function(){
       
       google.charts.setOnLoadCallback(drawChart);
        function drawChart() {
             
        var tstart = new Date(new Date().getTime() - 20*60000).toISOString();
        var tend = new Date().toISOString();
        $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "vm_net_rx_pps",
                  "start": ""+ tstart,
                  "end": ""+tend,
                  "step": "10s",
                  "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id},{"labeltag":"inf","labelid":"eth0"}]
                  },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {

            var rx = data;


                        $http({
                      method  : 'POST',
                      url     : $scope.apis.monitoring,
                      data:  {
                              "name": "vm_net_tx_pps",
                              "start": ""+ tstart,
                              "end": ""+tend,
                              "step": "10s",
                              "labels": [{"labeltag":'exported_job','labelid':'vnf'},{"labeltag":"id","labelid":$routeParams.id},{"labeltag":"inf","labelid":"eth0"}]
                              },
                      headers : { 'Content-Type': 'application/json' }
                     })
                      .success(function(data) {

                        
                          var tx = data;
                          $scope.kam_pps = [['Time', 'Rx pps','Tx pps']];


                            rx.metrics.result[0].values.forEach( function(rx, index) {
                                  var ttime = rx[0];
                                  var rx_value = rx[1];
                                  var tx_value = tx.metrics.result[0].values[index][1];


                                  var timestamp = ttime.toString();
                                  timestamp = timestamp.replace('.','');
                                  timestamp = new Date(parseInt(timestamp));
                                  $scope.kam_pps.push([timestamp,parseFloat(rx_value),parseFloat(tx_value)]);






                            });

                             var options = {
                              title: 'Rx/Tx',
                              hAxis: {title: 'Time',  titleTextStyle: {color: '#333'}},
                              vAxis: {minValue: 0}
                            };
                            
                            
                              $scope.drawTheChart($scope.kam_pps,options,'rx_tx_pps_chart');


                      });




         
          });

      }

     
    }











    
    $scope.getContainers = function(){
      

      $http({
          method  : 'POST',
          url     : $scope.apis.monitoring,
          data:  {
                  "name": "cnt_mem_perc",
                  "start": ""+ $scope.ten_m_before.toISOString(),
                  "end": ""+$scope.current_time.toISOString(),
                  "step": "20m",
                  "labels": [{"labeltag":"exported_job", "labelid":"containers"},{"labeltag":"id","labelid":$routeParams.id}]
                    },
          headers : { 'Content-Type': 'application/json' }
         })
          .success(function(data) {
            $scope.containers = data.metrics.result;
          });



    }


    $scope.init = function(){
      (function(w){w = w || window; var i = w.setInterval(function(){},100000); while(i>=0) { w.clearInterval(i--); }})(/*window*/);
      $scope.getVM();
      $scope.drawGauges();
      $scope.drawCPUChart();
      $scope.drawMEMChart();
      $scope.drawRxTxBPSChart();
      $scope.drawRxTxPPSChart();
      $scope.getContainers();
      $scope.getCurrentMemory();
      $scope.getCPU_History();
      $scope.drawDiskChart();


      
      setInterval(function() {
          $scope.drawCPUChart();
          $scope.drawMEMChart();          
          $scope.drawRxTxBPSChart();
          $scope.drawRxTxPPSChart();  
        }, 10000);


      setInterval(function(){
        
        $scope.drawDiskChart();
      },60000);
      
      //drawCPUS
      //drawMEMS
      //drawRX/TX
      //drawDISC
      

    	/*$scope.getCPU();
    	$scope.getMEM();
    	$scope.getLineGraph();*/
    	
    	/*$scope.FillCPUGraph();*/
    	 /*setInterval(function() {
          $scope.FillCPUGraph();
        }, 5000);*/
    	
    }

     
    
}]);