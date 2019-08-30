#!/usr/bin/python
# -*- coding: utf-8 -*-

# #####################################################################################################################
# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                            #
#                                                                                                                     #
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance     #
# with the License. A copy of the License is located at                                                              #
#                                                                                                                     #
#      http://www.apache.org/licenses/LICENSE-2.0                                                                     #
#                                                                                                                     #
# or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES  #
# OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions     #
# and limitations under the License.                                                                                 #
#######################################################################################################################
 
# @author Solution Builders 

from itertools import groupby
import boto3
import botocore
import base64
import os
import logging
import urllib.request
import urllib.parse
from json import loads,dumps
from collections import OrderedDict
from operator import itemgetter
from random import randint
from sys import maxsize
from time import sleep

log_level = str(os.environ.get('LOG_LEVEL')).upper()
if log_level not in ['DEBUG', 'INFO','WARNING', 'ERROR','CRITICAL']:
    log_level = 'ERROR'
log = logging.getLogger()
log.setLevel(log_level)

send_anonymous_data = str(os.environ.get('SEND_ANONYMOUS_DATA')).upper()
ip_table_name = os.environ.get('IP_TABLE')
table_name = os.environ.get('TABLE')
calls_per_ip="CallsPerUniqueIp"
successful_calls = "NumberOfSuccessfulCalls"
anomaly_score = "AnomalyScore"
max_retry_attempts = 5
client = boto3.client('dynamodb')

def update_dynamodb(record_data):
    ddb_record = client.get_item(TableName=table_name,
        Key={'MetricType': {'S':metric_type},
             'EventTime':{'S':event_time} },
        ConsistentRead=True)

    ddb_data = loads(ddb_record['Item']['Data']['S'])
    concurrency_token = int(ddb_record['Item']['ConcurrencyToken']['N'])
    merged_data = { k : record_data.get(k,0) + ddb_data.get(k,0) for k in set(record_data) | set(ddb_data) }
    record_data = OrderedDict(sorted(merged_data.items(), key=itemgetter(1), reverse=True))
    put_record(metric_type, event_time, record_data, concurrency_token)

def put_record_with_retry(metric_type, event_time, record_data, merged_data, concurrency_token, attempt=0):
    log.info("Retry: {0} {1} {2}".format(metric_type, event_time, str(attempt)))
    if attempt > max_retry_attempts: return
    try:
        put_record(metric_type, event_time, merged_data, concurrency_token)
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == 'ConditionalCheckFailedException':
            sleep(randint(0,5))
            ddb_record = client.get_item(TableName=table_name,
                Key={'MetricType': {'S':metric_type},
                    'EventTime':{'S':event_time} },
                    ConsistentRead=True)
            merged_data = merge_record_with_ddb(record_data, ddb_record)
            put_record_with_retry(metric_type, event_time, record_data, merged_data, concurrency_token, attempt+1)
        else: raise

def put_record(metric_type, event_time, data, concurrency_token=None):
    item = {'MetricType': {'S':metric_type},
             'EventTime':{'S':event_time},
             'Data':{'S':dumps(data)},
             'ConcurrencyToken':{'N':str(randint(0,maxsize))}}
    if concurrency_token:
        client.put_item(TableName=table_name, Item=item,
                        ConditionExpression='ConcurrencyToken = :concurrency_token',
                        ExpressionAttributeValues={':concurrency_token':{'N':str(concurrency_token)}})
    else:
        client.put_item(TableName=table_name, Item=item)

def merge_record_with_ddb(record_data, ddb_record):
    ddb_data = loads(ddb_record['Item']['Data']['S'])
    concurrency_token = int(ddb_record['Item']['ConcurrencyToken']['N'])
    merged_data = { k : record_data.get(k,0) + ddb_data.get(k,0) for k in set(record_data) | set(ddb_data) }
    merged_data = OrderedDict(sorted(merged_data.items(), key=itemgetter(1), reverse=True))
    return merged_data

def merge_record_values(metric_key, grouped_rows):
    if 'AnomalyScore' in metric_key:
        return sum(float(key[5]) for key in grouped_rows)
    else:
        return sum(int(key[5]) for key in grouped_rows)

#This function sends anonymous usage data, if enabled
def sendAnonymousData(event_time,dataDict):
    log.debug("Sending Anonymous Data")
    postDict = {}
    postDict['Data'] = dataDict
    postDict['TimeStamp'] = event_time
    postDict['Solution'] = 'SO0037'
    postDict['UUID'] = os.environ.get('UUID')

    # API Gateway URL to make HTTP POST call
    url = 'https://metrics.awssolutionsbuilder.com/generic'
    data = urllib.parse.urlencode(postDict).encode()
    log.debug(data)

    headers = {'content-type': 'application/json'}
    req = urllib.request.Request(url, data, headers)
    rsp = urllib.request.urlopen(req)
    rspcode = rsp.getcode()
    content = rsp.read()
    log.debug("Response from APIGateway: %s, %s", rspcode, content)

def lambda_handler(event, context):
    payload = event['Records']
    output = {}

    data = [base64.b64decode(record['kinesis']['data']).decode().strip().split(',') for record in payload]
    data = filter(lambda x: x[2]!="null", data)
    log.info(data)

    for metric_key,metric_group in groupby(data, key=lambda x:"{0}|{1}".format(x[0],x[1])):
        grouped_metric = list(metric_group)
        for category_key,grouped_rows in groupby(grouped_metric, key=lambda x: "{0}|{1}".format(x[2],x[3])):
            output.setdefault(metric_key, {})[category_key] = merge_record_values(metric_key, list(grouped_rows))

    for record_key in output:
        event_time,metric_type = record_key.split('|')
        record_data = OrderedDict(sorted(output[record_key].items(), key=itemgetter(1), reverse=True))

        ddb_record = client.get_item(TableName=table_name,
            Key={'MetricType': {'S':metric_type},
                 'EventTime':{'S':event_time} },
            ConsistentRead=True)

        if 'Item' not in ddb_record:
            put_record(metric_type,event_time, record_data)
        else:
            merged_data = merge_record_with_ddb(record_data, ddb_record)
            put_record_with_retry(metric_type, event_time, record_data, merged_data, int(ddb_record['Item']['ConcurrencyToken']['N']))
        if metric_type == calls_per_ip:
            max_ip = next(iter(record_data))
            max_ip_count = record_data[max_ip]

            max_ip = max_ip.split('|')[0]
            hour,minute,_ = event_time.split(':')

            ddb_max_ip = client.get_item(TableName=ip_table_name,
                Key={'Hour': {'S': hour},
                 'Minute':{'S':minute} },
                ConsistentRead=True)

            if 'Item' not in ddb_max_ip or max_ip_count > int(ddb_max_ip['Item']['MaxCount']['N']):
                client.put_item(TableName=ip_table_name,
                    Item={'Hour': {'S':hour},
                         'Minute':{'S':minute},
                         'IP':{'S':max_ip},
                         'MaxCount':{'N': str(max_ip_count)}} )
    if send_anonymous_data == "YES":
        try:
            unique_keys = list(set(output))
            for record_key in unique_keys:
                event_time,metric_type = record_key.split('|')
                if metric_type == successful_calls or metric_type == anomaly_score:
                    ddb_record = client.get_item(TableName=table_name,
                        Key={'MetricType': {'S':metric_type},
                             'EventTime':{'S':event_time} },
                        ConsistentRead=True)
                    del ddb_record["Item"]["ConcurrencyToken"]
                    del ddb_record["Item"]["EventTime"]
                    metric_data= {}
                    metric_data['MetricType'] = ddb_record['Item']['MetricType']['S']
                    if metric_type == successful_calls:
                        services, num_calls = ddb_record['Item']['Data']['S'].split(',')[0].split(':')
                        metric_data['NumberOfSuccessfulCalls'] = num_calls.replace('}','').replace(' ', '')
                    if metric_type == anomaly_score:
                        num_calls,anomaly_data = ddb_record['Item']['Data']['S'].split(',')[0].split(':')
                        metric_data['NumberOfSuccessfulCalls'] = num_calls.replace('{', '').replace('"', '').split('|')[0]
                        metric_data['AnamonlyScore'] = anomaly_data.replace('}', '')
                    sendAnonymousData(event_time,metric_data)
        except Exception as error:
            log.error(error)
