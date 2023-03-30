'use strict';
const AWS = require("aws-sdk");

const generatePolicy = (principalId, Resource, Effect) => {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect,
          Resource,
        },
      ],
    },
  };
};

module.exports.basicAuthorizer = async (event) => {
  try {
    console.log("Basic authorizer event: ", JSON.stringify(event));

    if (event.type !== "TOKEN") {
      return "unauthorized";
    }
    const authToken = event.authorizationToken;

    const [, encodedCreds] = authToken.split(" ");
    const bufferResponse = Buffer.from(encodedCreds, "base64");
    const [username, password] = bufferResponse.toString("utf-8").split(":");

    console.log('username', username);
    console.log('password', password);

    console.log(' process.env[username]',  process.env[username]);

    const validPassword = process.env[username];

    const effect = validPassword !== password ? "Deny" : "Allow";

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    console.log(`policy: ${JSON.stringify(policy)}`);
    return policy;
  } catch(err) {
    console.log('err', err);
    throw Error("unauthorized");
  }
};
