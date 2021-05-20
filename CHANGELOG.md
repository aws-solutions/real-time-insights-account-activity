# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2021-05-31

### Added

- Added Encryption support for Kinesis Firehose delivery stream
- Added Point In Time Recovery support for DynamoDB Table
- Added cfn_nag suppress rules for Lambda VPC deployment and Reserved Concurrency

### Changed

- Removed unused dev dependency Grunt

## [1.1.1] - 2020-03-30

### Changed

- Updated node runtime to version 12

## [1.1] - 2019-08-29

### Added

- CHANGELOG file
- Default encryption to S3 buckets via CloudFormation (instead of custom resources)

### Changed

- Updated node runtime to version 8
- Updated python runtime to version 3
