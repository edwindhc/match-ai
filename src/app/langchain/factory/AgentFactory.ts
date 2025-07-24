import { BaseLLM } from '../base/BaseLLM'
import { BaseAgent } from '../base/BaseAgent'
import { Tool } from '@langchain/core/tools'
import { OpenAIAgent } from '../agents/OpenAIAgent'
import { OpenAIModel } from '../models/OpenAIModel'

// Factory Pattern
export class AgentFactory {
  static createAgent(llm: BaseLLM, tools: Tool[]): BaseAgent {
    if (llm instanceof OpenAIModel) {
      return new OpenAIAgent({ model: llm.getModel(), tools })
    }
    throw new Error('Unsupported LLM type')
  }
}
