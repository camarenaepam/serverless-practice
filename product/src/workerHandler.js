const { DynamoDB, SNS } = require("aws-sdk");

exports.catalogBatchProcess = async (event) => {
    try {
        const db = new DynamoDB.DocumentClient();
        const sns = new SNS();
        const TableName = 'tableNameProducts';
        const products = [];

        for (const message of event.Records) {
            let product = JSON.parse(message.body);

            product = {
                ...product,
                id: (typeof(product.id) === 'string') ? Number(product.id) : product.id,
                price: (typeof(product.price) === 'string') ? Number(product.price) : product.price
            }

            console.log('product', product);
            console.log('product.id', product.id);
            console.log('product.id', product.id);
            console.log('typeof(product.id)', typeof(product.id));

            const payload = {
                PutRequest: {
                    Item: product
                }
            };

            products.push(payload);
        }


        products.forEach(item => console.log('Item', item.PutRequest.Item))
       
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