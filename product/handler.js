'use strict';

const results = [
  {
    id: 1,
    title: 'product red',
    price: 100,
    image: 'https://cdn.homedepot.com.mx/productos/150169/150169-z.jpg',
    count: 1
  },
  {
    id: 2,
    title: 'product blue',
    price: 300,
    image: 'https://m.media-amazon.com/images/I/51Eg49ZtnlL._AC_SL1001_.jpg',
    count: 2
  }, 
  {
    id: 3,
    title: 'product green',
    price: 300,
    image: 'https://m.media-amazon.com/images/I/71oobehHW-L._AC_SL1500_.jpg',
    count: 3
  },
   {
    id: 4,
    title: 'product yellow',
    price: 400,
    image: 'https://m.media-amazon.com/images/I/7163ck4COpL._AC_SL1500_.jpg',
    count: 4
  }, 
  {
    id: 5,
    title: 'product purple',
    price: 500,
    image: 'https://m.media-amazon.com/images/I/81mXeHhatZL._AC_SL1500_.jpg',
    count: 5
  },
]

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
        productName: 'book',
        input: 123,
    })
  };

};

module.exports.getProductList = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    },
    body: JSON.stringify({ results })
  };
};

module.exports.getProductById = async (event) => {
  const result = results.find(item => item.id === parseInt(event.pathParameters.productId))
  return {
    statusCode: 200,
    body: JSON.stringify({ result })
  };

};
