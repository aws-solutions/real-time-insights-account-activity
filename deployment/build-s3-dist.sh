#!/bin/bash
#
# This assumes all of the OS-level configuration has been completed and git repo has already been cloned
#
# This script should be run from the repo's deployment directory
# cd deployment
# ./build-s3-dist.sh source-bucket-base-name trademarked-solution-name version-code
#
# Paramenters:
#  - source-bucket-base-name: Name for the S3 bucket location where the template will source the Lambda
#    code from. The template will append '-[region_name]' to this bucket name.
#    For example: ./build-s3-dist.sh solutions my-solution v1.0.0
#    The template will then expect the source code to be located in the solutions-[region_name] bucket
#
#  - trademarked-solution-name: name of the solution for consistency
#
#  - version-code: version of the package

# Check to see if input has been provided:
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Please provide the base source bucket name (where the lambda code will eventually reside), trademark approved solution name and version."
    echo "For example: ./build-s3-dist.sh solutions trademarked-solution-name v1.0.0"
    exit 1
fi

# Get reference for all important folders
template_dir="$PWD"
template_dist_dir="$template_dir/global-s3-assets"
build_dist_dir="$template_dir/regional-s3-assets"
source_dir="$template_dir/../source"

echo "------------------------------------------------------------------------------"
echo "[Init] Clean old dist, node_modules and bower_components folders"
echo "------------------------------------------------------------------------------"
rm -rf $template_dist_dir
mkdir -p $template_dist_dir
rm -rf $build_dist_dir
mkdir -p $build_dist_dir

echo "------------------------------------------------------------------------------"
echo "[Packing] Templates"
echo "------------------------------------------------------------------------------"
cp $template_dir/real-time-insights-account-activity.template $template_dist_dir/

replace="s/%%BUCKET_NAME%%/$1/g"
sed -i '' -e $replace $template_dist_dir/real-time-insights-account-activity.template
replace="s/%%SOLUTION_NAME%%/$2/g"
sed -i '' -e $replace $template_dist_dir/real-time-insights-account-activity.template
replace="s/%%VERSION%%/$3/g"
sed -i '' -e $replace $template_dist_dir/real-time-insights-account-activity.template

echo "------------------------------------------------------------------------------"
echo "[Build] Custom resource helper Lambda function"
echo "------------------------------------------------------------------------------"
cd $source_dir/helper
npm install
npm run build
npm run zip
cp ./dist/custom-resource-helper.zip $build_dist_dir/custom-resource-helper.zip
rm -rf dist
rm -rf node_modules

echo "------------------------------------------------------------------------------"
echo "[Build] Lambda function to update DDB from Kinesis stream"
echo "------------------------------------------------------------------------------"
cd $source_dir/update_ddb_from_stream
rm -rf ./dist && mkdir ./dist
cp update_ddb_from_stream.py ./dist
cd dist
zip -r update_ddb_from_stream.zip .
cp ./update_ddb_from_stream.zip $build_dist_dir/update_ddb_from_stream.zip

echo "------------------------------------------------------------------------------"
echo "[Build] Copying web site content"
echo "------------------------------------------------------------------------------"
cp -r $source_dir/web_site $build_dist_dir/

echo "------------------------------------------------------------------------------"
echo "[Build] Generating web site manifest"
echo "------------------------------------------------------------------------------"
cd "$template_dir/manifest-generator" || exit
npm install
node app.js --target "$build_dist_dir/web_site" --output "$build_dist_dir/web-site-manifest.json"

echo "------------------------------------------------------------------------------"
echo "S3 Packaging Complete"
echo "------------------------------------------------------------------------------"
