/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
import * as path from 'path';
import {
  aws_lambda_nodejs as lambda,
  aws_s3 as s3,
  Duration,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AwsLambdaDuplexStreamToS3Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const uploadBucket = new s3.Bucket(this, 'UploadBucket', {});

    const streamLambda = new lambda.NodejsFunction(this, 'LambdaFunction', {
      functionName: 'duplex-stream-to-s3',
      entry: path.resolve(__dirname, '../lambda/lambda.ts'),
      memorySize: 256,
      timeout: Duration.minutes(15),
      environment: {
        UPLOAD_BUCKET_NAME: uploadBucket.bucketName,
      },
    });

    uploadBucket.grantWrite(streamLambda);
  }
}
