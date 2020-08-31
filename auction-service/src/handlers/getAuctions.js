import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
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

export const handler = commonMiddleware(getAuctions);
