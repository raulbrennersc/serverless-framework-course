import AWS from 'aws-sdk';
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
    let auction;

    try{
      const result = await dynamoDB.scan({
        TableName: process.env.AUCTIONS_TABLE_NAME,
      }).promise();
      auction = result.Items;
    } catch(error){
        throw new createError.InternalServerError(error);
    }
    
    return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = middy(getAuctions)
.use(httpJsonBodyParser())
.use(httpEventNormalizer())
.use(httpErrorHandler());
