'use strict';
const { S3, SQS } = require("aws-sdk");
const csv = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');

const headers =  {
  "Access-Control-Allow-Headers" : "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};

const getObject = async (s3, bucketName, objectKey) => {
  return s3.getObject({
      Bucket: bucketName,
      Key: objectKey,
  });
};

const createReadStream = async (s3Object, sqs) => {
  await s3Object.createReadStream().pipe(csv()).on(
    'data', async data => {
      const QueueUrl = 'https://sqs.us-west-1.amazonaws.com/329821757763/product-dev-catalogItemsQueue';
      console.log('parsedData:', data)
      const sendMessageResponse = await sqs.sendMessage({ QueueUrl, MessageBody: JSON.stringify(data) }).promise();
      console.log('sendMessageResponse', sendMessageResponse);
    }
    );
  return s3Object;
};

const copyObject = async (s3, bucketName, objectKey, copiedObjectKey) => {
  return s3
    .copyObject({
      Bucket: bucketName,
      CopySource: `${bucketName}/${objectKey}`,
      Key: copiedObjectKey,
    })
    .promise();
};

const deleteObject = async (s3, bucketName, objectKey) => {
  return s3
    .deleteObject({
      Bucket: bucketName,
      Key: objectKey,
    })
    .promise();
};

module.exports.getImportedProducts = async (event) => {
  try {
    const fileName = event.pathParameters.fileName;
    const s3 = new S3();
    const Bucket = 'uploaded-camarena';

    if (!fileName) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "filename is required" })
      }
    }

    const params = {
      Bucket,
      Key: `uploaded/${fileName}`,
      Expires: 60,
      ContentType: "text/csv",
    };

    const url = s3.getSignedUrl("putObject", params);


    if (!url) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `file ${fileName} doesn't exist` })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ err })
    }
  }
};

module.exports.importFileParser = async (event) => {
  try {
    const region = 'us-west-1';
    const sqs = new SQS({ region });
    const s3 = new S3({ region });
    
    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const objectKey = record.s3.object.key;
  
      const s3Object = await getObject(s3, bucketName, objectKey);
      
      await createReadStream(s3Object, sqs);
      await copyObject(
        s3,
        bucketName,
        objectKey,
        objectKey.replace("uploaded", "parsed")
      );
      await deleteObject(s3, bucketName, objectKey);
    }
  } catch (err) {
    console.log('err', err);
  }
};
