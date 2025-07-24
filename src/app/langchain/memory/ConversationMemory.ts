import { ChatOpenAI } from '@langchain/openai'
import { BufferMemory } from 'langchain/memory'
import { ConversationChain } from 'langchain/chains'
import { LanguageModelLike } from '@langchain/core/language_models/base'

export class ConversationMemory {
  private memory: BufferMemory
  private chain: ConversationChain

  constructor(model: LanguageModelLike) {
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'chat_history',
      inputKey: 'input',
      outputKey: 'output',
    })

    this.chain = new ConversationChain({
      llm: model as ChatOpenAI,
      memory: this.memory,
    })
  }

  async addMessage(message: string, role: 'user' | 'assistant' | 'system', timestamp?: string) {
    if (!message) return

    const ts = timestamp || new Date().toISOString()
    // Guardar el mensaje y el timestamp en la memoria
    await this.memory.saveContext(
      { input: message, timestamp: ts },
      { output: role !== 'user' ? message : '', timestamp: ts },
    )
  }

  async getContext() {
    return await this.memory.loadMemoryVariables({})
  }

  async clear() {
    await this.memory.clear()
  }
}
