import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('getTodos')
import { createLogger } from '../../utils/logger'
import { getTodosByUserId, getTodosByUserIdSort, getTodosByUserFilter } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event', event)
    const userId = getUserId(event);

    let todos;
    if(event.queryStringParameters) {
      if (event.queryStringParameters.sortBy !== undefined &&
          event.queryStringParameters.sortBy !== null &&
          event.queryStringParameters.sortBy !== "" && 
          event.queryStringParameters.sortOrder !== undefined &&
          event.queryStringParameters.sortOrder !== null &&
          event.queryStringParameters.sortOrder !== ""
      ) {
        const sortBy = event.queryStringParameters.sortBy;
        const sortOrder = event.queryStringParameters.sortOrder;
        todos = await getTodosByUserIdSort(userId, sortBy, sortOrder);
      }

      else if (event.queryStringParameters.filter !== undefined &&
        event.queryStringParameters.filter !== null &&
        event.queryStringParameters.filter !== "" 
      ) {
        const filter = event.queryStringParameters.filter;
        todos = await getTodosByUserFilter(userId, filter);
      }
    } else {
      todos = await getTodosByUserId(userId);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    }
})

handler.use(
  cors({
    credentials: true
  })
)
