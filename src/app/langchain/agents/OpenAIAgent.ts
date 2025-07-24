import { BaseAgent, Message } from '../base/BaseAgent'
import { Tool } from '@langchain/core/tools'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { LanguageModelLike } from '@langchain/core/language_models/base'

export class OpenAIAgent extends BaseAgent {
  private agent: ReturnType<typeof createReactAgent>

  constructor({ model, tools }: { model: LanguageModelLike; tools: Tool[] }) {
    super(tools)
    this.agent = createReactAgent({ llm: model, tools })
  }

  async stream(input: { messages: Message[] }) {
    return this.agent.stream(input, { streamMode: 'values' })
  }

  async run(input: string | { messages: Message[] }) {
    const formattedInput =
      typeof input === 'string' ? { messages: [{ role: 'user', content: input }] } : input

    return await this.agent.invoke(formattedInput)
  }
}
