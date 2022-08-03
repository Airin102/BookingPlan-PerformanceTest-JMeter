/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 69.46666666666667, "KoPercent": 30.533333333333335};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.381, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.225, 500, 1500, "Update Booking"], "isController": false}, {"data": [0.348, 500, 1500, "Delete Booking"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.071, 500, 1500, "Create Booking"], "isController": false}, {"data": [0.6, 500, 1500, "Token"], "isController": false}, {"data": [0.042, 500, 1500, "Get Booking"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3000, 916, 30.533333333333335, 27647.726999999995, 0, 84480, 1566.5, 84209.0, 84226.0, 84273.0, 6.966440334760679, 7.7318462184420245, 1.1549868247197168], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Update Booking", 500, 200, 40.0, 34324.86599999999, 255, 84283, 1643.0, 84216.8, 84231.75, 84267.91, 1.4594279042615295, 2.0184001933741973, 0.399347362084063], "isController": false}, {"data": ["Delete Booking", 500, 200, 40.0, 34176.682, 248, 84480, 1256.0, 84222.0, 84234.0, 84293.79, 1.1749169333728104, 1.5085749843736047, 0.18862924203758794], "isController": false}, {"data": ["Debug Sampler", 500, 0, 0.0, 0.33200000000000013, 0, 82, 0.0, 1.0, 1.0, 2.0, 1.179050628433985, 0.38113272130780296, 0.0], "isController": false}, {"data": ["Create Booking", 500, 116, 23.2, 23805.525999999994, 1016, 84359, 2161.5, 84208.0, 84231.0, 84300.95, 5.328275024243652, 5.273285560907512, 1.6943914577094812], "isController": false}, {"data": ["Token", 500, 200, 40.0, 33861.427999999985, 243, 84289, 359.5, 84205.9, 84218.0, 84245.0, 1.932994672666682, 2.507985080180619, 0.291081814966018], "isController": false}, {"data": ["Get Booking", 500, 200, 40.0, 39717.528, 1078, 84367, 22653.5, 84216.0, 84232.0, 84356.98, 2.8427504178843117, 3.928214688775684, 0.2615108294577169], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48] failed: Connection timed out: connect", 114, 12.445414847161572, 3.8], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205] failed: Connection timed out: connect", 202, 22.05240174672489, 6.733333333333333], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 199, 21.724890829694324, 6.633333333333334], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.205.8.205] failed: Connection timed out: connect", 1, 0.1091703056768559, 0.03333333333333333], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 201, 21.943231441048034, 6.7], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 199, 21.724890829694324, 6.633333333333334], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3000, 916, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205] failed: Connection timed out: connect", 202, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 201, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 199, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 199, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48] failed: Connection timed out: connect", 114], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Update Booking", 500, 200, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205] failed: Connection timed out: connect", 116, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 83, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 1, "", "", "", ""], "isController": false}, {"data": ["Delete Booking", 500, 200, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48] failed: Connection timed out: connect", 114, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205] failed: Connection timed out: connect", 86, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Create Booking", 500, 116, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 116, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Token", 500, 200, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 116, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 84, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Booking", 500, 200, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 116, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/54.205.8.205, restful-booker.herokuapp.com/18.211.231.38] failed: Connection timed out: connect", 83, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to restful-booker.herokuapp.com:443 [restful-booker.herokuapp.com/54.235.77.118, restful-booker.herokuapp.com/174.129.128.48, restful-booker.herokuapp.com/18.211.231.38, restful-booker.herokuapp.com/54.205.8.205] failed: Connection timed out: connect", 1, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
