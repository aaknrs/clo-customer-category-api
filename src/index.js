const _ = require('lodash');
const AWS = require('aws-sdk');

const createErrorFormat = (errorMessage, errorCode) => {
    var jsonData = {};
    jsonData["id"] = errorCode;
    jsonData["text"] = errorMessage;
    return jsonData;
};

const createResponseFormat = (responseBody, businessErrorBody) => {
    var jsonData = {};
    if (businessErrorBody != responseBody) {
        jsonData["response"] = responseBody;
    }
    if (businessErrorBody != undefined) {
        jsonData["error"] = businessErrorBody;
    }
    return jsonData;
};

let dynamodb;

exports.handler = (event, context, callback) => {
    console.log(" Request to lambda: " + JSON.stringify(event));
    const done = (err, res) => callback(null, {
        "body" : err ? err.message : res.body,
        "statusCode" : err ? err.status : res.status,
        "headers" : {
            'Content-Type' : 'application/json',
            'Accept' : 'application/json',
            'X-Requested-With' : '*',
            'Access-Control-Allow-Origin' : '*',
            'Access-Control-Allow-Methods' : 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers' : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with'
        }
    });
    if (dynamodb === undefined) {
        console.log("DB connection created for region " +  process.env.AWS_DEFAULT_REGION);
        dynamodb = new AWS.DynamoDB.DocumentClient();
    }
    executeRequest(event, done);
}

async function executeRequest(event, done) {
    switch (event.httpMethod) {
        case 'POST' :
            try {
                persistUserCategoryData(event, done);
            } catch (err) {
                done(err);
                break;
            }
            break;
        case 'GET' :
            try {
                getUserCategoryData("userAccountId", done);
            } catch (err) {
                done(err);
                break;
            }    
            break;
        default:
            let err = new Error();
            err.message = createErrorFormat("Method not supported", "10405"); 
            err.status = 405;
            done(err);
    }
}

function getUserCategoryData (userAccountId, done) {
    const getProfileForUserAccount = {
        TableName: "cma_user_profile",
        ProjectionExpression: "username, date_of_birth, gender, profile_picture",
        KeyConditionExpression: "#userAccountId = :userAccountId",
        ExpressionAttributeNames: {
            ":userAccountId" : userAccountId
        }
    }
    let responseBody = createResponseFormat({"categories": [{"id": 1,"caption": "Shoes"},{"id": 2,"caption": "Hats"}]}, null)
    const response = {
        status: 200,
        body: JSON.stringify(responseBody)
    };
    done(null, response);
}

function persistUserCategoryData (event, done) {
    const response = {
        status: 204,
    };
    done(null, response);
}
