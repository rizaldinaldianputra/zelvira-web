import { BaseService } from './base.service';

export interface HelpArticle {
  id?: number;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

class HelpServiceClass extends BaseService<HelpArticle> {
  constructor() {
    super('/v1/help-articles');
  }

  async getActive() {
    return this.getAll(0, 100, true);
  }
}

export const HelpService = new HelpServiceClass();
