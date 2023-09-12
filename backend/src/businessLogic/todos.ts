import 'source-map-support/register'
import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()
const logger = createLogger('todos')

export async function getTodosByUserId(
    userId: string
): Promise<TodoItem[]> {
    logger.info(`Get all todos user ${userId}`)

    return todosAccess.getTodosByUserId(userId)
}

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {
    const todoId = uuid.v4();

    const newItem: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...createTodoRequest
    }

    logger.info(`Create todo ${todoId} for user ${userId}, new Item ${newItem}`)
    return todosAccess.createTodo(newItem)
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest,
): Promise<TodoItem> {
    logger.info(`Update todo ${todoId}, updateTodoRequest: ${updateTodoRequest}`)
    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new Error('Item not found!')
    if (item.userId !== userId) {
        throw new Error('User invalid!')
    }

    return todosAccess.updateTodo(todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo (userId: string, todoId: string): Promise<TodoItem> {
    logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })
    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new Error('Item not found!')
    if (item.userId !== userId) {
        throw new Error('User invalid!')
    }
    return todosAccess.deleteTodoItem(todoId)
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string): Promise<TodoItem> {
    logger.info(`Generate URL attachment: ${attachmentId}`)
    const attachmentUrl = await todosAccess.getAttachmentUrl(attachmentId)
    logger.info(`Attachment URL ${attachmentUrl}`, { userId, todoId })

    const item = await todosAccess.getTodoItem(todoId)

    if (!item) throw new Error('Item not found!')
    if (item.userId !== userId) {
        throw new Error('User invalid!')
    }

    return todosAccess.updateAttachmentUrl(todoId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
    logger.info(`Generating upload URL for attachment ${attachmentId}`)
  
    const uploadUrl = await todosAccess.getUploadUrl(attachmentId)
  
    return uploadUrl
}

