export async function uploadAuctionPicture(event) {

  if(auction.status !== 'OPEN') {
    throw new createError.Forbidden('You cannot upload pictures for closed auctions!');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
}

export const handler = uploadAuctionPicture;