import { LanguageModelLike } from '@langchain/core/language_models/base'

export abstract class BaseLLM {
  protected model: LanguageModelLike

  constructor(model: LanguageModelLike) {
    this.model = model
  }

  abstract getModel(): LanguageModelLike
}
