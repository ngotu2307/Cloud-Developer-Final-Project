import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
import { TodoUpdate } from '../models/TodoUpdate'

import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todosAccess')

export class TodosAccess {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly todoUserIndex = process.env.TODOS_BY_USER_INDEX,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) { }

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todoUserIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    logger.info(`All todos for user ${userId} is ${items}`)

    return items as TodoItem[]
  }

  async getTodoItem(todoId: string): Promise<TodoItem> {
    logger.info(`Get todo item: ${todoId}`)

    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        todoId
      }
    }).promise()

    const item = result.Item

    return item as TodoItem
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    console.log('Creating new todo')
    const params = {
      TableName: this.todosTable,
      Item: todoItem
    }

    await this.docClient.put(params).promise()
    logger.info(`Todo item ${todoItem.todoId} was created`)

    return todoItem as TodoItem
  }

  async updateTodo(
    todoId: string,
    updatedTodo: TodoUpdate)
    : Promise<TodoItem> {
    logger.info(`Update todoId: ${todoId} with updatedTodo: ${updatedTodo}`)

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId
      },
      UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
      ExpressionAttributeNames: {
        "#name": "name",
        "#dueDate": "dueDate",
        "#done": "done",
      },
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done,
      },
      ReturnValues: "ALL_NEW"
    }

    const result = await this.docClient.update(params).promise();
    return result.Attributes as TodoItem;
  }

  async deleteTodoItem(
    todoId: string
  ): Promise<TodoItem> {
    logger.info(`Delete todo ${todoId}`);

    let params = {
      TableName: this.todosTable,
      Key: {
        todoId
      }
    }
    const result =  await this.docClient.delete(params).promise();
    const item = result.Attributes;
    return item as TodoItem;
  }

  async updateAttachmentUrl(
    todoId: string, 
    attachmentUrl: string)
  : Promise<TodoItem> {
    logger.info(`generateUploadUrl todo ${todoId} with attachmentUrl: ${attachmentUrl}`);

    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()

      return result.Attributes as TodoItem
  }

  async getAttachmentUrl(attachmentId: string): Promise<string> {
    const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${attachmentId}`
    return attachmentUrl
  }

  async getUploadUrl(attachmentId: string): Promise<string> {
    const uploadUrl = this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: attachmentId,
      Expires: Number(this.urlExpiration)
    })
    return uploadUrl
  }
}