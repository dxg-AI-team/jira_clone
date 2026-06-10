import { pick } from 'lodash';

import { Page } from 'entities';

export const pagePartial = (page: Page): Partial<Page> =>
  pick(page, ['id', 'title', 'parentPageId', 'createdAt', 'updatedAt']);
