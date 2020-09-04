import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors'
import validator from '@middy/validator';
import { getAuctionById } from "./getAuction";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import { setAuctionPicture } from '../lib/setAuctionPicture';
import uploadAuctionPictureSchema from '../lib/schemas/uploadAuctionPictureSchema';

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  if(!auction){
    throw new createError.NotFound(`Auction with ID "${id}" not found!`);
  }

  if(auction.seller !== email){
    throw new createError.Forbidden(`You can't update the picture of an auction that is not yours!`);
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');


  if(auction.status !== 'OPEN') {
    throw new createError.Forbidden('You cannot upload pictures for closed auctions!');
  }

  let updatedAuction;
  try {
    const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
    console.log(pictureUrl);
    updatedAuction = await setAuctionPicture(id, pictureUrl);
    console.log(updatedAuction);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }


  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(validator({ inputSchema: uploadAuctionPictureSchema }));