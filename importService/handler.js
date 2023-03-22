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

const getObject = async (bucket, objectKey) => {
  try {
    const s3 = new S3({ region: 'us-west-1' });

    const params = {
      Bucket: bucket,
      Key: objectKey 
    }


   const s3Object = await s3.getObject(params).promise();

   console.log('s3Object:', s3Object);

   const body = s3Object.Body
   const chunks = []

 
   for await (const chunk of body) {
     chunks.push(chunk)
   }
   
   const responseBuffer = Buffer.from(chunks)
   
   return responseBuffer;
  } catch (e) {
    throw new Error(`getObject:Could not retrieve file from S3: ${e.message}`)
  }
}

const parseObject = async (data) => {
  try {
    const results = [];
    await fs.createReadStream(data).pipe(csv({separator: ','})).on('parse:data', (data) => results.push(data));
    return results;
  } catch (e) {
    throw new Error(`Could not stream csv: ${e}`) 
  }
}

module.exports.importFileParser = async (event) => {
  try {
    const sqs = new SQS({ region: 'us-west-1' });

    const QueueUrl = 'https://sqs.us-west-1.amazonaws.com/329821757763/product-dev-catalogItemsQueue';
    const record = event.Records[0];
    console.log('record', record);

    const s3Object = await getObject(record.s3.bucket.name, record.s3.object.key);
    const data = await parseObject(s3Object);
    console.log('data', data);

    for (const product of data) {
      await sqs.sendMessage({ QueueUrl, MessageBody: JSON.stringify(product) }).promise();
      console.log('sendMessageResponse', sendMessageResponse);
    }
  } catch (err) {
    console.log('err', err);
  }
};
