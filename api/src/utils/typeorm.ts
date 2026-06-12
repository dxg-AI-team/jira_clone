import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

import {
  Project,
  ProjectVersion,
  Component,
  User,
  Issue,
  Comment,
  Page,
  Space,
  Sprint,
  Attachment,
  IssueLink,
  Notification,
  ActivityLog,
  SavedFilter,
} from 'entities';
import { EntityNotFoundError, BadUserInputError } from 'errors';
import { generateErrors } from 'utils/validation';

type EntityConstructor =
  | typeof Project
  | typeof ProjectVersion
  | typeof Component
  | typeof User
  | typeof Issue
  | typeof Comment
  | typeof Page
  | typeof Space
  | typeof Sprint
  | typeof Attachment
  | typeof IssueLink
  | typeof Notification
  | typeof ActivityLog
  | typeof SavedFilter;
type EntityInstance =
  | Project
  | ProjectVersion
  | Component
  | User
  | Issue
  | Comment
  | Page
  | Space
  | Sprint
  | Attachment
  | IssueLink
  | Notification
  | ActivityLog
  | SavedFilter;

const entities: { [key: string]: EntityConstructor } = {
  ActivityLog,
  Attachment,
  Comment,
  Component,
  Issue,
  IssueLink,
  Notification,
  Page,
  Project,
  ProjectVersion,
  SavedFilter,
  Space,
  Sprint,
  User,
};

export const findEntityOrThrow = async <T extends EntityConstructor>(
  Constructor: T,
  id: number | string,
  options?: FindOneOptions,
): Promise<InstanceType<T>> => {
  const instance = await Constructor.findOne(id, options);
  if (!instance) {
    throw new EntityNotFoundError(Constructor.name);
  }
  return instance;
};

export const validateAndSaveEntity = async <T extends EntityInstance>(instance: T): Promise<T> => {
  const Constructor = entities[instance.constructor.name];

  if ('validations' in Constructor) {
    const errorFields = generateErrors(instance, Constructor.validations);

    if (Object.keys(errorFields).length > 0) {
      throw new BadUserInputError({ fields: errorFields });
    }
  }
  return instance.save() as Promise<T>;
};

export const createEntity = async <T extends EntityConstructor>(
  Constructor: T,
  input: Partial<InstanceType<T>>,
): Promise<InstanceType<T>> => {
  const instance = Constructor.create(input);
  return validateAndSaveEntity(instance as InstanceType<T>);
};

export const updateEntity = async <T extends EntityConstructor>(
  Constructor: T,
  id: number | string,
  input: Partial<InstanceType<T>>,
): Promise<InstanceType<T>> => {
  const instance = await findEntityOrThrow(Constructor, id);
  Object.assign(instance, input);
  return validateAndSaveEntity(instance);
};

export const deleteEntity = async <T extends EntityConstructor>(
  Constructor: T,
  id: number | string,
): Promise<InstanceType<T>> => {
  const instance = await findEntityOrThrow(Constructor, id);
  await instance.remove();
  return instance;
};
