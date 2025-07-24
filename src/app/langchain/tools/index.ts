import { tool, Tool } from '@langchain/core/tools'
import { PayloadRequest } from 'payload'
import z from 'zod'
import { userTools } from './Users'
import { employeeTools } from './Employees.tool'

type ToolDef<T extends z.ZodSchema> = {
  name: string
  description: string
  schema: T
  handler: (req: PayloadRequest) => (params: z.infer<T>) => Promise<unknown>
}

export const createTools = <T extends ToolDef<z.ZodSchema>[]>(
  req: PayloadRequest,
  defs: T,
): Tool[] => defs.map((d) => tool(d.handler(req), d) as unknown as Tool)

const getTools = [...userTools, ...employeeTools]
export const generateTools = (req: PayloadRequest) => createTools(req, getTools)
