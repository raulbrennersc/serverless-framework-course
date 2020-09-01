const schema = {
  properties: {
    body: {
      type: 'object',
      properties: {
        amount: {
          type: 'number'
        },
      },
      required: ['amount']
    },
  },
  required: ['body', 'queryStringParameters'],
};

export default schema;