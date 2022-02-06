export interface Worker {
  id: number,
  name: string,
}

export interface DatabaseSchema {
  id: number,
  worker: Worker,
  day: string,
  bisyTime: string, // json or jsonB
}

export interface ServicesTimes {
  feetService: number;
  headService: number;
  bodyService: number;
}
