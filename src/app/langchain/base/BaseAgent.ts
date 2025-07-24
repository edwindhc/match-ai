import { Tool } from '@langchain/core/tools'
import { BaseMessage, MessageFieldWithRole } from '@langchain/core/messages'
import { AgentAction, AgentFinish } from '@langchain/core/agents'
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'
import { MemoryVariables } from '@langchain/core/memory'
import { ConversationMemory } from '../memory/ConversationMemory'

export type Message = HumanMessage | AIMessage | SystemMessage | ToolMessage

export interface AgentResponse {
  actions?: AgentAction[]
  finish?: AgentFinish
  messages?: MessageFieldWithRole[]
}

export abstract class BaseAgent {
  protected tools: Tool[]

  constructor(tools: Tool[]) {
    this.tools = tools
  }

  abstract stream(input: {
    messages: Message[]
  }): Promise<AsyncGenerator<{ messages: BaseMessage[] }, void, unknown>>
  abstract run(input: string | { messages: Message[] }): Promise<AgentResponse>
}
