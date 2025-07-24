import { BaseLLM } from '../base/BaseLLM'
import { LanguageModelLike } from '@langchain/core/language_models/base'
import { ChatOpenAI } from '@langchain/openai'

export class OpenAIModel extends BaseLLM {
  constructor() {
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      apiKey: process.env.OPENAI_API_KEY,
    })
    super(model)
  }

  getModel(): LanguageModelLike {
    return this.model
  }
}
