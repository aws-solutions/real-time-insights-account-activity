# AWS Real-Time Insights into AWS Account Activity with Kinesis Analytics
This AWS Solution leverages AWS CloudTrail, AWS Kinesis Analytics, Amazon DynamoDB, AWS Lambda, Amazon S3, Amazon Cognito, and Chart.js to provide real-time insights into AWS account activity.

## OS/Python Environment Setup
```bash
sudo apt-get update
sudo apt-get install zip sed wget -y
sudo pip install --upgrade pip
sudo pip install --upgrade setuptools
sudo pip install --upgrade virtualenv
```

## Building Lambda Package
```bash
export DIST_OUTPUT_BUCKET=my-bucket-name # bucket where customized code will reside
export VERSION=my-version # version number for the customized code
cd deployment
./build-s3-dist.sh $DIST_OUTPUT_BUCKET real-time-insights-account-activity $VERSION
```

source-bucket-base-name should be the base name for the S3 bucket location where the template will source the Lambda code from.
The template will append '-[region_name]' to this value.
For example: ./build-s3-dist.sh solutions
The template will then expect the source code to be located in the solutions-[region_name] bucket

## CF template and Lambda function
Located in deployment/dist

***

Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
