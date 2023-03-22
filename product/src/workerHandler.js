const { DynamoDB, SNS } = require("aws-sdk");

exports.catalogBatchProcess = async (event) => {
    try {
        const db = new DynamoDB.DocumentClient();
        const sns = new SNS();
        const TableName = 'tableNameProducts';
        const products = [];

        for (const message of event.Records) {
            const product = JSON.parse(message.body);

            const payload = {
                PutRequest: {
                    Item: product
                }
            };

            products.push(payload);
        }

        console.log('products', JSON.stringify(products));
       
        const dbParams = {
            RequestItems: {
                [TableName]: products
            }
        };
    
        const dbResponse = await db.batchWrite(dbParams).promise();
        console.log('dbResponse', dbResponse);

        const message = {
            message: 'Created a product sucessfully',
            data: products
        }

        const SNSParams = {
            Message: JSON.stringify(message),
            TopicArn: 'arn:aws:sns:us-west-1:329821757763:createProductTopic'
        };

        const publishResponse = await sns.publish(SNSParams).promise();
        console.log('publishResponse', publishResponse);
    } catch (err) {
        console.log('err:', err);
    }
}