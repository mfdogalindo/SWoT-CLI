type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

type SnakeToCamelCaseObject<T> = {
  [K in keyof T as SnakeToCamelCase<string & K>]: T[K];
};

export class DatabaseMapper {
  static toCamelCase<T>(str: string): string {
    return str.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
  }

  static mapKeys<T extends object>(obj: T): SnakeToCamelCaseObject<T> {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      const newKey = this.toCamelCase(key);
      newObj[newKey] = obj[key as keyof T];
    });
    return newObj as SnakeToCamelCaseObject<T>;
  }

  static mapRows<T extends object>(rows: T[]): SnakeToCamelCaseObject<T>[] {
    return rows.map(row => this.mapKeys(row));
  }
}