/********************************************************************************************************************* 
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           * 
 *                                                                                                                    * 
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    * 
 *  with the License. A copy of the License is located at                                                             * 
 *                                                                                                                    * 
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    * 
 *                                                                                                                    * 
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES * 
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    * 
 *  and limitations under the License.                                                                                * 
 *********************************************************************************************************************/ 
 
/** 
 * @author Solution Builders 
 */ 

'use strict';

console.log('Loading function');

const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');
const moment = require('moment');
const WebsiteHelper = require('./lib/website-helper.js');
const MetricsHelper = require('./lib/metrics-helper.js');
const KinesisAppHelper = require('./lib/kinesisapp-helper.js');
const UUID = require('node-uuid');

/**
 * Request handler.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let responseStatus = 'FAILED';
    let responseData = {};

    if (event.RequestType === 'Delete') {
        if (event.ResourceProperties.customAction === 'sendMetric') {
            responseStatus = 'SUCCESS';

            let _metricsHelper = new MetricsHelper();

            let _metric = {
                Solution: event.ResourceProperties.solutionId,
                UUID: event.ResourceProperties.UUID,
                TimeStamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.S'),
                Data: {
                    Version: event.ResourceProperties.version,
                    RequestType: event.RequestType
                }
            };

            _metricsHelper.sendAnonymousMetric(_metric, function(err, data) {
                if (err) {
                    responseData = {
                        Error: 'Sending metrics helper delete failed'
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                }
                sendResponse(event, callback, context.logStreamName, 'SUCCESS');
            });
        } else {
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }
    }

    if (event.RequestType === 'Create') {
        if (event.ResourceProperties.customAction === 'configureWebsite') {
            let _websiteHelper = new WebsiteHelper();
            //BUGFIX removed hardcoded table names:: analyticsTable &\ ipTable
            _websiteHelper.copyWebSiteAssets(event.ResourceProperties.sourceS3Bucket,
                event.ResourceProperties.sourceS3key,  event.ResourceProperties.sourceManifest, event.ResourceProperties.destS3Bucket,
                event.ResourceProperties.userPoolId, event.ResourceProperties.userPoolClientId,
                event.ResourceProperties.identityPoolId, event.ResourceProperties.region,
                event.ResourceProperties.UUID, event.ResourceProperties.anonymousData,event.ResourceProperties.analyticsTable, event.ResourceProperties.ipTable,
                function(err, data) {
                    if (err) {
                        responseData = {
                            Error: 'Copy of website assets failed'
                        };
                        console.log([responseData.Error, ':\n', err].join(''));
                    } else {
                        responseStatus = 'SUCCESS';
                        responseData = {};
                    }

                    sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
                });

        } else if (event.ResourceProperties.customAction === 'startKinesisApplication') {
          let _kinesisAppHelper = new KinesisAppHelper();

          _kinesisAppHelper.startApplication(event.ResourceProperties.ApplicationName,
              function(err, data) {
                  if (err) {
                      responseData = {
                          Error: 'Starting kinesis application failed'
                      };
                      console.log([responseData.Error, ':\n', err].join(''));
                  } else {
                      responseStatus = 'SUCCESS';
                      responseData = {};
                  }

                  sendResponse(event, callback, context.logStreamName, responseStatus, responseData);
              });

        } else if (event.ResourceProperties.customAction === 'createUuid') {
            responseStatus = 'SUCCESS';
            responseData = {
                UUID: UUID.v4()
            };
            sendResponse(event, callback, context.logStreamName, responseStatus, responseData);

        } else if (event.ResourceProperties.customAction === 'sendMetric') {
            let _metricsHelper = new MetricsHelper();

            let _metric = {
                Solution: event.ResourceProperties.solutionId,
                UUID: event.ResourceProperties.UUID,
                TimeStamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.S'),
                Data: {
                    Version: event.ResourceProperties.version,
                    SendAnonymousData: event.ResourceProperties.anonymousData,
                    RequestType: event.RequestType
                }
            };

            _metricsHelper.sendAnonymousMetric(_metric, function(err, data) {
                if (err) {
                    responseData = {
                        Error: 'Sending anonymous launch metric failed'
                    };
                    console.log([responseData.Error, ':\n', err].join(''));
                } else {
                    responseStatus = 'SUCCESS';
                    responseData = {};
                }
            });
            sendResponse(event, callback, context.logStreamName, 'SUCCESS');
        }

    }

};

/**
 * Sends a response to the pre-signed S3 URL
 */
let sendResponse = function(event, callback, logStreamName, responseStatus, responseData) {
    const responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: `See the details in CloudWatch Log Stream: ${logStreamName}`,
        PhysicalResourceId: logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData,
    });

    console.log('RESPONSE BODY:\n', responseBody);
    const parsedUrl = url.parse(event.ResponseURL);
    const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'PUT',
        headers: {
            'Content-Type': '',
            'Content-Length': responseBody.length,
        }
    };

    const req = https.request(options, (res) => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        callback(null, 'Successfully sent stack response!');
    });

    req.on('error', (err) => {
        console.log('sendResponse Error:\n', err);
        callback(err);
    });

    req.write(responseBody);
    req.end();
};
