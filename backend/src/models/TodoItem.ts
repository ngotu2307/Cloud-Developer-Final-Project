export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: number
  attachmentUrl?: string
}
