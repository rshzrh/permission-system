import { ValidationError } from "../errors";

type ResolverResult<T> = Promise<T | ValidationError>;

interface Resolvers {
  UserResult: {
    __resolveType(obj: any): string;
  };
  GroupResult: {
    __resolveType(obj: any): string;
  };
  TweetResult: {
    __resolveType(obj: any): string;
  };
  TweetPermissionsResult: {
    __resolveType(obj: any): string;
  };
}