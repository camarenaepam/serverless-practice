'use strict';
const { DynamoDB } = require("aws-sdk");
const { Converter: { unmarshall }  } = DynamoDB;


const headers =  {
  "Access-Control-Allow-Headers" : "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};

module.exports.getProductList = async (event) => {
  try {
    const db = new DynamoDB.DocumentClient();
    const tableProducts = 'tableNameProducts';
    const tableStock = 'tableNameStock';
    
    const results = await db.scan({ TableName: tableProducts }).promise();
    const stock = await db.scan({ TableName: tableStock }).promise();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ results, stock })
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ err })
    }
  }
};

module.exports.createProduct = async (event) => {
  try {
    const db = new DynamoDB.DocumentClient(); 
    const TableName = 'tableNameProducts';
    
    const params = {
      TableName,
      Item: JSON.parse(event.body)
    }

    var result = await db.put(params).promise();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result })
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ err })
    }
  }
};

module.exports.getProductById = async (event) => {
  try {
    const db = new DynamoDB();

    const TableName = 'tableNameProducts';
    const productID = event.pathParameters.productId;

    var params = {
      Key: {
       "id": {"N": productID}
      }, 
      TableName
    };

    var result = await db.getItem(params).promise();

    if (!result) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "product doesn't exist" })
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result: unmarshall(result.Item)})
    };
  } catch (err) {
    console.log('err:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ err })
    }
  }
};
