function init() {

    const   clientIdParamName = "cid",
            userPoolIdParamName = "upid",
            identityPoolIdParamName = "ipid",
            cognitoRegionParamName = "r";

    var streamName,
        streamType,
        rate,
        sendDataHandle,
        totalRecordsSent = 0,
        cognitoAppClientId = getCongitoConfigParameterByName(clientIdParamName),
        cognitoUserPoolId = getCongitoConfigParameterByName(userPoolIdParamName),
        cognitoIdentityPoolId = getCongitoConfigParameterByName(identityPoolIdParamName),
        cognitoRegion = getCongitoConfigParameterByName(cognitoRegionParamName),
        cognitoUser;


    $("#userPoolId").val(cognitoUserPoolId);
    $("#identityPoolId").val(cognitoIdentityPoolId);
    $("#clientId").val(cognitoAppClientId);
    $("#userPoolRegion").val(cognitoRegion);

    function getCongitoConfigParameterByName(name) {
    var data = getQSParameterByName(name);
    if(data == null || data == '') {
        data = localStorage.getItem(name);
        return data;
    }
    localStorage.setItem(name, data);
    return data;
    }
    function getQSParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var dateTime = [];
    var usersCounter = [];
    var androidUsers = [];
    var iOSUsers = [];
    var windowsUsers = [];
    var otherUsers = [];
    var quadA = [];
    var quadB = [];
    var quadC = [];
    var quadD = [];

    var osUsageData = [];
    var quadrantData = [];

    var colors = ["red", "green", "blue", "orange", "purple", "cyan", "magenta", "lime", "pink", "teal", "lavender", "brown", "beige", "maroon", "mint", "olive", "coral"];
    var dynamicColors = function(i) {
        if (i >= 0 && i < colors.length) return colors[i];
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    }


    var identity = function(arg1) {
      return arg1;
    };


    function addData(chart, label, data) {
        chart.data.labels = label;
        for (var i=0;i<chart.data.datasets.length;i++) {
            dataset = chart.data.datasets[i];
            dataset.data = data;
            dataset.fill = false;
            var color = dynamicColors(colors.length - 1 - i);
            dataset.fillColor = color;
            dataset.hightlightFill = color;
            dataset.backgroundColor = color;
            dataset.borderColor = color;
        };
        chart.update();
    }
    function updateData(chart, labels, data, datasetLabel, separateAxes = false) {
        chart.data.labels = labels;
        chart.data.datasets = new Array();

        for (var i=0;i<data.length;i++) {
            var dataset = {};
            dataset.data = data[i];
            dataset.label = datasetLabel[i];
            if (separateAxes) dataset.yAxisID = datasetLabel[i];
            dataset.fill = false;
            var color = dynamicColors(i);
            dataset.backgroundColor = color;
            dataset.borderColor = color;
            chart.data.datasets.push(dataset);
        }
        chart.update();
    }

    //Chart.js code
    var uniqueUsersChartConfig = {
        type: "line",
        data: {

            labels : dateTime,
            datasets : [
                {
                    label: "Total Unique Users",
                    borderColor : "rgba(151,187,205,1)",
                    data : usersCounter,
                    fill: true,
                    pointRadius: 0
                }

            ]
        },
        options: {
            legend: {
                display: false,
                position: "top"

            },
            animation: false,
            title: {
                display: false,
                text: "Unique Users",
                fontSize: 24
            },
            responsive: true,
            scales: {
                xAxes: [{
                    display: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (3 minutes)'
                    },
                    ticks: {
                        suggestedMin: 180,
                        suggestedMax: 180
                    }

                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false
                    },
                    ticks: {
                        min: 0,
                        suggestedMax: 0,
                        stepSize: 20
                    }
                }]
            }
        }
    };

    var osChartConfig = {
        type: 'pie',
        data: {
            labels: [
                "Android",
                "iOS",
                "Windows Phone",
                "Other"
            ],
            datasets: [
                {
                    data: osUsageData,
                    backgroundColor: [
                        "#3498DB",
                        "#1ABB9C",
                        "#9B59B6",
                        "#9CC2CB"
                    ]
                }
            ]
        },
        options: {
            title: {
                display: false,
                text: "Operating System Usage",
                fontSize: 24
            },
            legend: {
                display: true
            },
            responsive: true
        }
    };
    var generateLineChartConfig = function(label) {
        var config = {
            type: "line",
            data: {labels: [] , datasets: [ { label: label, data: [] }] },
            options: {
                legend: {
                    position: 'bottom'
                },
                responsive: true,

                scales: {

                    xAxes: [{
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 6
                        },
                        display: true
                    }]
            }}
        };
        return config;
    }

    var generateHorizontalBarChartConfig = function(label) {
        var config = {
            type: "horizontalBar",
            data: {
                labels: [],
                datasets: [
                    {
                        label: label,
                        data: []
                    }
                ]
            },
            options: {
                legend: {
                    display: true,
                    position: 'bottom'
                },

                responsive: true,
                scales: {
                    yAxes: [{
                       stacked: true
                    }],
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: false
                        },
                        ticks: {
                            stepSize: 10,
                            suggestedMin: 0,
                            suggestedMax: 10

                        }
                    }]
                }
            }
        };
        return config;
    }

    var generateLineChart = function(divId, label) {
        var ctx = document.getElementById(divId).getContext("2d");
        var config = generateLineChartConfig(label);
        return new Chart(ctx, config);
    }
    var generateHorizontalBarChart = function(divId, label) {
        var ctx = document.getElementById(divId).getContext("2d");
        var config = generateHorizontalBarChartConfig(label);
        return new Chart(ctx, config);
    }
    var getTimeSecsAgo = function(secsAgo, timeArg=new Date()) {
        return new Date(timeArg.getTime() - secsAgo*1000).toISOString().replace('T',' ').replace('Z','');

    };
    function getFormattedTime(timeArg) {
        return timeArg.toISOString().replace('T',' ').replace('Z','');
    }
    function toUTC(dateString) {
        var dateTime=dateString.split(' ');
       return dateTime[0]+'T'+dateTime[1]+'Z';
    }
    function getTimeLabel(time) {
        return time.split(' ')[1].split('.')[0];
    }
    var currentTime = new Date();

    var totalCallCurrentTime = getTimeSecsAgo(15*60, currentTime);
    var totalCalls = new Array();
    var labels= new Array();
    //var quadChart = generateLineChart("quadrantCanvas", "Total no of calls");

    var serviceCallChartData = {'labels': [], 'times': [], 'values': {}}
    var serviceCallQueryTime = getTimeSecsAgo(15*60, currentTime);
    var serviceCallChart = generateLineChart("callsByServiceCanvas", "No of service calls");

    var ec2CallChartData = {'labels': [], 'times': [], 'values': {"ec2.amazonaws.com|null": []}}
    var ec2CallQueryTime = getTimeSecsAgo(15*60, currentTime);
    var ec2CallChart = generateLineChart("callsByEC2Canvas", "No of EC2 calls");

    var anomalyScoreCurrentTime = getTimeSecsAgo(15*60, currentTime);
    var anomalyCallMap = {"Total Calls": [], "Anomaly Score": []};
    var anomalyCallLabels= new Array();
    var anomalyCallTimes= new Array();
    var anomalyChartConfig = generateLineChartConfig("Total no of calls");
    var anomalyCtx = document.getElementById("anomalyCanvas").getContext("2d");
    anomalyChartConfig.options.scales.yAxes =
        [{
            id: 'Total Calls',
            type: 'linear',
            position: 'left'
          }, {
            id: 'Anomaly Score',
            type: 'linear',
            position: 'right',
            ticks: {
                  max: 10,
                  min: 0
            }
          }
        ];
    anomalyChart = new Chart(anomalyCtx, anomalyChartConfig)
    //generateLineChart("anomalyCanvas", "Total no of calls");

    var maxIpQueryTime = new Date(currentTime.getTime() - 600000).toISOString().replace('T',' ').replace('Z','');
    var maxIpCallMap = {"Max calls per IP": []};//{"Max calls/IP per minute": [], "Total Calls": []};
    var maxIpCallLabels= new Array();
    var maxIpChart = generateLineChart("maxIpCanvas", "Max calls/IP");

    var ipQueryTime = new Date(currentTime.getTime() - 600000).toISOString().replace('T',' ').replace('Z','');
    var osChart = generateHorizontalBarChart("osCanvas", "No of calls/IP");

    var userQueryTime = new Date(currentTime.getTime() - 600000).toISOString().replace('T',' ').replace('Z','');
    var userCallChart = generateHorizontalBarChart("callsByUserCanvas", "No of calls/IAM user");

    var apiQueryTime = new Date(currentTime.getTime() - 600000).toISOString().replace('T',' ').replace('Z','');
    var apiCallChart = generateHorizontalBarChart("callsByAPICanvas", "No of calls/API");

    var totalCallCtx = document.getElementById("A_count");
    var totalCallTimeCtx = document.getElementById("A_percent");
    var totalSuccessfulCalls = 0;
    var firstRecord = 0;
    var lastRecord = 0;
    var noNewRecordCount = 0;
    var isInSlowUpdate = false;
    var isInFastUpdate = false;

    var splitFunc = function(entry) {return entry.split('|')[0]; };

    var retrieveParams = function(metricType, eventTime) {
        return {
            //BUGFIX removed hardcoded table names
            TableName: metrics_table,
            ConsistentRead: true,
            ScanIndexForward: true,
            KeyConditionExpression: "MetricType = :TrailLog AND EventTime > :currentTime",
            ExpressionAttributeValues: { ":currentTime": eventTime, ":TrailLog": metricType }
        }
    };
    var retrieveParamsFromMaxTable = function(metricType, eventTime) {
        var date = eventTime.split(' ');
        var time = date[1].split(':');
        var hour = date[0]+ " " + time[0];
        var min = time[1];
        return {
            //BUGFIX removed hardcoded table names
            TableName: ip_table,
            ConsistentRead: true,
            ScanIndexForward: true,
            KeyConditionExpression: "#hour = :hour AND #min > :minute",
            ExpressionAttributeNames: {"#hour": "Hour", "#min": "Minute"},
            ExpressionAttributeValues: { ":hour": hour, ":minute": min }
        }
    }
    var updateHorizontalBarChart = function(data, noOfTopItems, chartName, queryTime, labelFunc=identity) {
        var items = data.Items;
        var ipCountMap = {};

        // Merge the counts of each DDB item into a single map.
        for (var i=0; i<items.length; i++) {
            var entryMap = JSON.parse(items[i].Data);
            var mySet = new Set(Object.keys(entryMap));
            for (let key1 of mySet) ipCountMap[key1] = (ipCountMap[key1]||0) + entryMap[key1];
        }

        if (items.length > 0) {
            //console.log(items);
            queryTime = items[items.length-1].EventTime;

            var topIps = Object.keys(ipCountMap).sort(function(a,b) { return ipCountMap[b] - ipCountMap[a]}).slice(0,noOfTopItems);
            if (topIps.length < noOfTopItems) {
                ipCountMap[""] = 0;
                for (var i=topIps.length; i<noOfTopItems; i++) {
                    topIps.push("");
                }
            }

            var topIpCounts = topIps.map(function(ip) {return ipCountMap[ip]; })
            topIps = topIps.map(labelFunc);
            addData(chartName,topIps,topIpCounts);
        }
        return queryTime;
    };
    var range1 = function(n) {
        return Array(n).fill().map((_, i) => i+1);
    };
    var range = function(n) {
        return Array(n).fill().map((_, i) => i);
    };
    var allzeros = function(arr) {
        return arr.every(function(x) { return x==0; });
    };
    var normalizeValues = function(labels, times, vals) {
        //make existing and new labels/vals as an array of objects, sort it based on label.
        //if any value is 0, check if label before and after is less than 10 seconds. if so remove it.
        // Constraint: any consecutive non-zero value will be atleast 10 seconds apart.
        n=labels.length;
        if (n>0) {
            var indicesOfLabelsToRemove = range1(n-1).filter(function(key, _) {
                return ((times[key-1] + 10000 < times[key]) || (times[key] + 10000 < times[key+1])) && allzeros(vals.map(function(val) {return val[key]; }));
            });
            console.log('indices to remove ' + indicesOfLabelsToRemove);
            console.log('labels before removing ' + labels);
            console.log('times before removing ' + times);
            for (i=indicesOfLabelsToRemove.length-1; i>=0; i--) {
                x=indicesOfLabelsToRemove[i];
                labels.splice(x,1);
                times.splice(x,1);
                vals.forEach(function(valArray) { valArray.splice(x,1);});
            };

            console.log('labels after removing ' + labels);
        }


        var labelsToAdd = range1(n).filter(function(key) {
            return (times[key]>=times[key-1]+20000)
        });
        //console.log('labels to add ' + labelsToAdd);
        for (i=labelsToAdd.length-1; i>=0; i--) {
            x=labelsToAdd[i];
            noOfLabelsToInsert = (times[x]-times[x-1])/10000 - 1;
            for (j=0;j<noOfLabelsToInsert; j++) {
                timeToInsert = times[x] - 10000;
                labels.splice(x,0, getTimeLabel(getFormattedTime(new Date(timeToInsert))));
                times.splice(x,0, timeToInsert);
                vals.forEach(function(valArray) { valArray.splice(x,0,0);});
            }
        };
        //console.log('final labels ' + labels);
        //console.log('final times' + times);
    };

    var limitValuesToOneHour=function(labels, times, vals) {
        indexToSlice = times.find(function(x) { return x <= (times[times.length-1] - 3600*1000); });
        if (indexToSlice>0) {
            labels.splice(0,indexToSlice);
            times.splice(0,indexToSlice);
            vals.forEach(function(val) { val.slice(indexToSlice); });
        }
    };

    var splitLabel = function(label) {
        return [''].concat(label.split(' '));
    }
    var sortLabels = function(data) {
        data.sort(function(obj1, obj2) {return obj1['time'] - obj2['time']});
    }

    var fastUpdateLineChart = function(data, chartData, chart, queryTime, labelFunc=identity) {
        var serviceCallLabels = chartData.labels;
        var serviceCallTimes = chartData.times;
        var serviceCallMap = chartData.values;

        var items = data.Items;
        for (var i=0; i<items.length; i++) {
            queryTime = items[i].EventTime;
            var timeToPut = getTimeLabel(queryTime)

            serviceCallLabels.push(timeToPut);
            serviceCallTimes.push(new Date(toUTC(queryTime)).getTime());
            ddbitem = JSON.parse(items[i].Data);

            ddbkeys = new Set(Object.keys(ddbitem));

            for (var key in  serviceCallMap) {

                if (!ddbkeys.has(key)) {ddbitem[key]=0;}
            }
            for (let entry of Object.keys(ddbitem)) {
                if (entry in serviceCallMap) {
                    serviceCallMap[entry].push(ddbitem[entry]);
                }
                else {
                    var newServiceEntry = new Array(serviceCallLabels.length-1);
                    newServiceEntry.fill(0);
                    newServiceEntry.push(ddbitem[entry]);
                    serviceCallMap[entry] = newServiceEntry;
                }
            }
        }
        if (items.length == 0) {
            serviceCallTimes.push(new Date(toUTC(queryTime)).getTime());
            var timeToPut = queryTime.split('.')[0].split(' ')[1];
            serviceCallLabels.push(timeToPut);


            for (var key in  serviceCallMap) {
                serviceCallMap[key].push(0);
            }
            time10sAgo = getTimeSecsAgo(10);
            queryTime = (queryTime > time10sAgo?queryTime: time10sAgo);
        }
        updateData(chart, serviceCallLabels,  Object.values(serviceCallMap), Object.keys(serviceCallMap).map(labelFunc));

        return queryTime;
    }

    var updateLineChart = function(data, chartData, chart, labelFunc=identity) {
        var labels = chartData.labels;
        var serviceCallTimes = chartData.times;
        var serviceCallMap = chartData.values;

        var items = data.Items;

        for (var i=0; i<items.length; i++) {
            var queryTime = items[i].EventTime;
            serviceCallTimes.push(new Date(toUTC(queryTime)).getTime());
            var timeToPut = queryTime.split('.')[0].split(' ')[1];

            labels.push((timeToPut));

            ddbitem = JSON.parse(items[i].Data);

            ddbkeys = new Set(Object.keys(ddbitem));

            for (var key in  serviceCallMap) {

                if (!ddbkeys.has(key)) {ddbitem[key]=0;}
            }
            for (let entry of Object.keys(ddbitem)) {
                if (entry in serviceCallMap) {
                    serviceCallMap[entry].push(ddbitem[entry]);
                }
                else {
                    var newServiceEntry = new Array(labels.length-1);
                    newServiceEntry.fill(0);
                    newServiceEntry.push(ddbitem[entry]);
                    serviceCallMap[entry] = newServiceEntry;
                }
            }
        }



        dataObj=[];
        datasetLabels = Object.keys(serviceCallMap);
        for (var i=0; i<labels.length; i++) {
            dataObj.push({'time': serviceCallTimes[i], 'label': labels[i], 'values': datasetLabels.map(function(label) { return serviceCallMap[label][i]; }) });
        }
        sortLabels(dataObj);
        console.log(dataObj);
        var labels=[]
        var times=[]
        var vals=datasetLabels.map(function(label) {return []; });

        var dataLen = dataObj.length;
        var datasetLabelLen = datasetLabels.length;

        for (var i=0;i<dataLen;i++) {
            labels.push(dataObj[i]['label']);
            times.push(dataObj[i]['time']);
            for(var j=0;j<datasetLabelLen;j++) {
                vals[j].push(dataObj[i]['values'][j]);
            }
        }

        normalizeValues(labels,times,vals);
        limitValuesToOneHour(labels,times,vals);
        var newCallMap={};

        datasetLabels.forEach(function(label,index) { newCallMap[label]= vals[index];});
        //console.log(labels);
        updateData(chart, labels,  Object.values(newCallMap), Object.keys(newCallMap).map(labelFunc));
        return {'labels': labels, 'times': times, 'values': newCallMap};
    }

    var updateDashboard = function(){
        var params = retrieveParams("NumberOfSuccessfulCalls", totalCallCurrentTime);
        var ipParams = retrieveParams("CallsPerUniqueIp", ipQueryTime);
        var userParams = retrieveParams("CallsPerUser", userQueryTime);

        serviceCallQueryTime = getTimeSecsAgo(15*60);
        var serviceTypeParams = retrieveParams("CallsPerServiceType", serviceCallQueryTime);
        var ec2Params = retrieveParams("EC2Calls", ec2CallQueryTime);
        var anomalyParams = retrieveParams("AnomalyScore", anomalyScoreCurrentTime);
        var apiParams = retrieveParams("CallsPerAPI", apiQueryTime);
        var maxIpParams = retrieveParamsFromMaxTable("MaxIP", maxIpQueryTime);


        var docClient = new AWS.DynamoDB.DocumentClient();

        docClient.query(params, function(err, data) {
            if (err) console.log(err);
            else {

                var items = data.Items;
                for (var i=0; i<items.length; i++) {
                    totalSuccessfulCalls += parseInt(items[i].Data.match(/(\d)/)[1]);
                }
                var callTime;
                if (items.length > 0) callTime = items[items.length-1].EventTime.split('.')[0];
                else callTime = getTimeSecsAgo(20).split('.')[0];
                totalCallCtx.innerHTML = "<h4>Count: " + totalSuccessfulCalls + "</h4>";
                totalCallTimeCtx.innerHTML = "<h3><small>Last Updated: " + callTime + " UTC</small></h3>";
                //totalCallCurrentTime = updateLineChart(data, labels, {"Total no of calls" : totalCalls}, quadChart, totalCallCurrentTime);
            }
        });
        docClient.query(ipParams, function(err, data) {
            if (err) console.log(err);
            else {
                ipQueryTime = updateHorizontalBarChart(data, 5, osChart, ipQueryTime, splitFunc);
            }
        });
        docClient.query(userParams, function(err, data) {
            if (err) console.log(err);
            else {
                userQueryTime = updateHorizontalBarChart(data, 5, userCallChart, userQueryTime, splitFunc);
            }
        });

        while(isInFastUpdate);
        isInSlowUpdate = true;
        docClient.query(serviceTypeParams, function(err, data) {
            if (err) console.log(err);
            else {

                serviceCallChartData = updateLineChart(data, serviceCallChartData, serviceCallChart, splitFunc) ;
            }

        });

        ec2CallQueryTime = getTimeSecsAgo(15*60);
        docClient.query(ec2Params, function(err, data) {
            if (err) console.log(err);
            else {
                ec2CallChartData = updateLineChart(data, ec2CallChartData, ec2CallChart, function(label) { result = label.split('|')[1]; if (result == "null") return "SuccessfulCalls"; else return "Failure calls: " + result;}) ;

            }
        });
        isInSlowUpdate = false;

        docClient.query(apiParams, function(err, data) {
            if (err) console.log(err);
            else {
                apiQueryTime = updateHorizontalBarChart(data, 10, apiCallChart, apiQueryTime);
            }
        });
        docClient.query(maxIpParams, function(err, data) {
            if (err) console.log(err);
            else {
                var items = data.Items;
                for (var i=0; i<items.length; i++) {
                    maxIpCallLabels.push(splitLabel(items[i].Hour.replace(' ', 'T')+":"+items[i].Minute+" IP:" + items[i].IP));
                    maxIpCallMap["Max calls per IP"].push(parseInt(items[i].MaxCount));
                }
                if (items.length>0) {
                    maxIpQueryTime = items[items.length-1].Hour+":"+items[items.length-1].Minute+":00.000";
                    updateData(maxIpChart, maxIpCallLabels, Object.values(maxIpCallMap), Object.keys(maxIpCallMap));
                }
                else {
                    var defaultTime = getTimeSecsAgo(30);
                    if (maxIpQueryTime < defaultTime) maxIpQueryTime = defaultTime;
                }
            }
        });


        setTimeout( function() {
            updateDashboard();
        }, 60000);
    }

    var fastUpdate = function() {
        var docClient = new AWS.DynamoDB.DocumentClient();

        var serviceTypeParams = retrieveParams("CallsPerServiceType", serviceCallQueryTime);

        while(isInSlowUpdate);
        isInFastUpdate = true;
        docClient.query(serviceTypeParams, function(err, data) {
            if (err) console.log(err);
            else {
                serviceCallQueryTime = fastUpdateLineChart(data, serviceCallChartData, serviceCallChart, serviceCallQueryTime, splitFunc) ;
            }

        });


        var ec2Params = retrieveParams("EC2Calls", ec2CallQueryTime);
        docClient.query(ec2Params, function(err, data) {
            if (err) console.log(err);
            else {
                //console.log(ec2CallChartData);

                ec2CallQueryTime = fastUpdateLineChart(data, ec2CallChartData, ec2CallChart, ec2CallQueryTime, function(label) { result = label.split('|')[1]; if (result == "null") return "SuccessfulCalls"; else return "Failure calls: " + result;}) ;
            }
        });
        isInFastUpdate = false;
        var anomalyParams = retrieveParams("AnomalyScore", anomalyScoreCurrentTime);

        docClient.query(anomalyParams, function(err, data) {
            if (err) console.log(err);
            else {
                var items = data.Items;
                for (var i=0; i<items.length; i++) {
                    anomalyCallLabels.push(getTimeLabel(items[i].EventTime));
                    anomalyCallTimes.push(new Date(toUTC(items[i].EventTime)).getTime());
                    ddbItem = JSON.parse(items[i].Data);
                    anomalyCallMap["Total Calls"].push(parseInt(Object.keys(ddbItem)[0].split("|")[0]));
                    anomalyCallMap["Anomaly Score"].push(parseFloat(Object.values(ddbItem)[0]));
                }
                if (items.length>0) {
                    anomalyScoreCurrentTime = items[items.length-1].EventTime;
                    updateData(anomalyChart, anomalyCallLabels, Object.values(anomalyCallMap), Object.keys(anomalyCallMap), true);
                }
            }
        });
        setTimeout( function() {
            fastUpdate();
        }, 10000);

    }
    var cognitoAuth = function() {

        $("#logoutLink").click( function() {
                cognitoUser.signOut();

                $("#password").val("");
                $("#loginForm").removeClass("hidden");
                $("#logoutLink").addClass("hidden");
                $("#unauthMessage").removeClass("hidden");
                $("#dashboard_content").addClass("hidden");
        });
        $("#btnSaveConfiguration").click(function (e) {

        var clientId = $("#clientId").val(),
            userPoolId = $("#userPoolId").val(),
            identityPoolId = $("#identityPoolId").val(),
            userPoolRegion = $("#userPoolRegion").val();

        if(clientId && userPoolId && identityPoolId && userPoolRegion){
            $("#configErr").addClass("hidden");
            localStorage.setItem(clientIdParamName, clientId);
            localStorage.setItem(userPoolIdParamName, userPoolId);
            localStorage.setItem(identityPoolIdParamName, identityPoolId);
            localStorage.setItem(cognitoRegionParamName, userPoolRegion);
            $("#cognitoModal").modal("hide");

        }
        else {
            $("#configErr").removeClass("hidden");
        }

        });
        function refreshAuthentication(userPool, userData) {
            var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
            cognitoUser.authenticateUser( authDetails, {
                onSuccess: function(result) {
                    var logins = {};
                    logins["cognito-idp." + cognitoRegion + ".amazonaws.com/" + cognitoUserPoolId] = result.getIdToken().getJwtToken();
                    var params = {
                        IdentityPoolId: cognitoIdentityPoolId,
                        Logins: logins
                    };

                    AWS.config.region = cognitoRegion;
                    AWSCognito.config.region = cognitoRegion;

                    AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

                    AWS.config.credentials.get(function(refreshErr) {
                        if(refreshErr) {
                            console.error(refreshErr);
                        }
                        else {
                            setTimeout( function() {
                                refreshAuthentication(userPool, userData);
                            }, 3600*1000);

                        }
                    });

            },
            onFailure: function(err) {
                alert(err);
            }

        });
        }

        $("#btnSavePassword").click(function (e) {
            var newPassword = $("#newPassword").val();

            if(newPassword.length >= 8 && newPassword.match(/[a-z]/) && newPassword.match(/[A-Z]/) && newPassword.match(/[0-9]/) && newPassword == $("#newPassword2").val()) {
                $("#newPasswordModal").modal("hide");
                $("#newPasswordErr").addClass("hidden");
                $("#newPasswordMatchErr").addClass("hidden");
                $("#newPasswordComplexityErr").addClass("hidden");
                $("#btnLogin").trigger("click");
            } else {
              $("#newPasswordErr").removeClass("hidden");
              if(newPassword != $("#newPassword2").val()) {
                $("#newPasswordMatchErr").removeClass("hidden");
              } else {
                $("#newPasswordMatchErr").addClass("hidden");
              }
              if(newPassword.length < 8 || !newPassword.match(/[a-z]/) || !newPassword.match(/[A-Z]/) || !newPassword.match(/[0-9]/)) {
                $("#newPasswordComplexityErr").removeClass("hidden");
                if(newPassword.length < 8 ) {
                  $("#newPasswordLengthErr").removeClass("hidden");
                } else {
                  $("#newPasswordLengthErr").addClass("hidden");
                }
                if(!newPassword.match(/[a-z]/)) {
                  $("#newPasswordLowerErr").removeClass("hidden");
                } else {
                  $("#newPasswordLowerErr").addClass("hidden");
                }
                if(!newPassword.match(/[A-Z]/)) {
                  $("#newPasswordUpperErr").removeClass("hidden");
                } else {
                  $("#newPasswordUpperErr").addClass("hidden");
                }
                if(!newPassword.match(/[0-9]/)) {
                  $("#newPasswordNumberErr").removeClass("hidden");
                } else {
                  $("#newPasswordNumberErr").addClass("hidden");
                }
              } else {
                $("#newPasswordComplexityErr").addClass("hidden");
              }
            }
        });

        $("#btnLogin").click(function() {
            //validate that the Cognito configuration parameters have been set
            if(!cognitoAppClientId || !cognitoUserPoolId || !cognitoIdentityPoolId || !cognitoRegion) {

                $("#configErr").removeClass("hidden");
                $("#configureLink").trigger("click");
                return;
            }

            //update ui
            $("#loginForm").addClass("hidden");
            $("#signInSpinner").removeClass("hidden");

            var userName = $("#userName").val();
            var password = $("#password").val();
            var newPassword = $("#newPassword").val();

            var authData = {
                UserName: userName,
                Password: password
            };

            var authDetails = new AmazonCognitoIdentity.AuthenticationDetails(authData);

            var poolData = {
                UserPoolId: cognitoUserPoolId,
                ClientId: cognitoAppClientId
            };

            var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
            var userData = {
                Username: userName,
                Pool: userPool
            };

            cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
            cognitoUser.authenticateUser( authDetails, {
                onSuccess: function(result) {

                    var logins = {};
                    logins["cognito-idp." + cognitoRegion + ".amazonaws.com/" + cognitoUserPoolId] = result.getIdToken().getJwtToken();
                    var params = {
                        IdentityPoolId: cognitoIdentityPoolId,
                        Logins: logins
                    };

                    AWS.config.region = cognitoRegion;
                    AWSCognito.config.region = cognitoRegion;

                    AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

                    AWS.config.credentials.get(function(refreshErr) {
                        if(refreshErr) {
                            console.error(refreshErr);
                        }
                        else {
                            $("#unauthMessage").addClass("hidden");
                            $("#logoutLink").removeClass("hidden");
                            $("#dashboard_content").removeClass("hidden");
                            $("#signInSpinner").addClass("hidden");
                            updateDashboard();
                            setTimeout( function() {
                                fastUpdate();
                            }, 10000);
                            setTimeout( function() {
                                refreshAuthentication(userPool, userData);
                            }, 3600*1000);

                        }
                    });

                },
                onFailure: function(err) {
                    $("#logoutLink").addClass("hidden");
                    $("#loginForm").removeClass("hidden");
                    $("#signInSpinner").addClass("hidden");

                    alert(err);
                },
                newPasswordRequired: function(userAttributes, requiredAttributes) {
                    // User was signed up by an admin and must provide new
                    // password and required attributes, if any, to complete
                    // authentication.
                    console.log("New Password Required");

                    var attributesData = {};
                    if (newPassword.length >= 8 && newPassword.match(/[a-z]/) && newPassword.match(/[A-Z]/) && newPassword.match(/[0-9]/) && newPassword == $("#newPassword2").val()) {
                        cognitoUser.completeNewPasswordChallenge(newPassword, attributesData, this)
                    } else {
                        $("#newPasswordModal").modal("show");
                    }
                }
            });
        });
    }

    cognitoAuth();

    function timeNow() {
        var d = new Date(),
            h = (d.getHours()<10?'0':'') + d.getHours(),
            m = (d.getMinutes()<10?'0':'') + d.getMinutes(),
            s = (d.getSeconds()<10?'0':'') + d.getSeconds();

        return h + ':' + m + ':' + s;
    }

}
