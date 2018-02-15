#!/bin/bash

# This assumes all of the OS-level configuration has been completed and git repo has already been cloned

# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name
# source-bucket-base-name should be the base name for the S3 bucket location where the template will source the Lambda code from.
# The template will append '-[region_name]' to this bucket name.
# For example: ./build-s3-dist.sh solutions
# The template will then expect the source code to be located in the solutions-[region_name] bucket

# Check to see if input has been provided:
if [ -z "$1" ]; then
    echo "Please provide the base source bucket name where the lambda code will eventually reside.\nFor example: ./build-s3-dist.sh solutions"
    exit 1
fi

# Build source
echo "Staring to build distribution"
echo "export deployment_dir=`pwd`"
export deployment_dir=`pwd`
echo "mkdir -p dist"
mkdir -p dist
echo "cp -f real-time-insights-account-activity.template dist"
cp -f real-time-insights-account-activity.template dist
echo "Updating code source bucket in template with $1"
replace="s/%%BUCKET_NAME%%/$1/g"
echo "sed -i '' -e $replace dist/real-time-insights-account-activity.template"
sed -i '' -e $replace dist/real-time-insights-account-activity.template

echo "Building CFN custom resource helper Lambda function"
cd $deployment_dir/../source/helper
npm install
npm run build
npm run zip
cp ./dist/custom-resource-helper.zip $deployment_dir/dist/custom-resource-helper.zip

echo "Building Lambda function to update DDB from Kinesis stream"
cd $deployment_dir/../source/update_ddb_from_stream
rm -rf ./dist && mkdir ./dist
cp update_ddb_from_stream.py ./dist
cd dist
zip -r update_ddb_from_stream.zip .
cp ./update_ddb_from_stream.zip $deployment_dir/dist/update_ddb_from_stream.zip

echo "Copying web site content to $deployment_dir/dist"
cp -r $deployment_dir/../source/web_site $deployment_dir/dist/

echo "Generating web site manifest"
cd $deployment_dir/manifest-generator
npm install
node app.js

cd $deployment_dir
