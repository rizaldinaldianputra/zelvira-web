import { BaseService } from './base.service';

export interface Faq {
  id?: number;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
}

class FaqServiceClass extends BaseService<Faq> {
  constructor() {
    super('/v1/faqs');
  }

  async getActive() {
    return this.getAll(0, 100, true);
  }
}

export const FaqService = new FaqServiceClass();
