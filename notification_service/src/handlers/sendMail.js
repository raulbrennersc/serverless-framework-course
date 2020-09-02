import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'sa-east-1'});

async function sendMail(event, context) {
  const params = {
    Source: 'raulbrennersc@gmail.com',
    Destination: {
      ToAddresses: ['raulbrennersc@gmail.com'],
    },
    Message: {
      Body: {
        Text: {
          Data: 'Hello',
        },
      },
      Subject: {
        Data: 'Test Mail',
      },
    },
  };

  try{
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch(error){
    console.log(error);
  }
}

export const handler = sendMail;


