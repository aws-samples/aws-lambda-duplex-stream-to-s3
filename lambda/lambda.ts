/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

import * as https from 'https';
import * as path from 'path';
import * as stream from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';

interface CustomLambdaEvent {
  url: string;
}

const createUploadStream = (
  url: string
): { passStream: stream.PassThrough; parallelUploadS3: Upload } => {
  const passStream = new stream.PassThrough();
  const extension = path.extname(url);
  const uploadKeyName = `Upload-${new Date().toISOString()}${extension}`;
  const parallelUploadS3 = new Upload({
    client: new S3Client({}),
    queueSize: 4,
    params: {
      Bucket: process.env.UPLOAD_BUCKET_NAME,
      Key: uploadKeyName,
      Body: passStream,
    },
  });

  parallelUploadS3.on('httpUploadProgress', (progress) => {
    console.log(`Uploaded part: ${progress.part}`);
  });

  return { passStream, parallelUploadS3 };
};

export const handler = async (event: CustomLambdaEvent): Promise<void> => {
  console.log('Processing event: ', JSON.stringify(event, null, 2));
  try {
    const { parallelUploadS3, passStream } = createUploadStream(event.url);

    /**
     * Download the file from our URL and pipe the response to the PassThrough
     * stream being used in the S3 parallel upload.
     */
    https.get(event.url, (stream) => {
      stream.pipe(passStream);
    });

    await parallelUploadS3.done();
    console.log('Done');
  } catch (e) {
    console.log(e);
    throw e;
  }
};
