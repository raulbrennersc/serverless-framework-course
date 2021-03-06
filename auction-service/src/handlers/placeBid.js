import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';
import validator from '@middy/validator';
import placeBidSchema from '../lib/schemas/placeBidSchema';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
    console.log('Sem forbidden1');
    let updatedAuction;
    const { id } = event.pathParameters;
    const { amount } = event.body;
    const { email } = event.requestContext.authorizer;

    const auction = await getAuctionById(id);

    if(auction.status !== 'OPEN') {
      throw new createError.Forbidden('You cannot bid on closed auctions!');
    }

    if(amount <= auction.highestBid.amount){
      throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}!`);
    }

    if(auction.seller === email){
      throw new createError.Forbidden(`You can't bid your own auction!`);
    }

    if(auction.highestBid.bidder === email){
      throw new createError.Forbidden(`You already own the highest bid for this auction!`);
    }

    console.log('Sem forbidden');

    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email,
        },
        ReturnValues: 'ALL_NEW',
    };

    try{
      const result = await dynamoDB.update(params).promise();
      updatedAuction = result.Attributes;
    } catch(error){
        throw new createError.InternalServerError(error);
    }

    if(!updatedAuction){
      throw new createError.NotFound(`Auction with ID "${id}" not found!`);
    }
    
    return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid)
.use(validator({ inputSchema: placeBidSchema }));
