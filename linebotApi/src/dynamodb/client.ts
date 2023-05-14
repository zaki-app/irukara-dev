import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export default function DynamoClient() {
  const client = process.env.IS_OFFLINE
    ? new DynamoDBClient({
        region: process.env.REGION,
        endpoint: process.env.DYNAMODB_ENDPOINT,
      })
    : new DynamoDBClient({
        region: process.env.REGION,
      });

  return client;
}
