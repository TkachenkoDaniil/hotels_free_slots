interface Worker {
  id: number,
  name: string,
}

interface DatabaseSchema {
  id: number,
  worker: Worker,
  day: string, // example: '2020-06-05'
  bisyTime: string, // json or jsonB
}
const mockedScheduleData: DatabaseSchema[] = [
  {
    id: 11,
    worker: { id: 1, name: 'Andrey' },
    day: '2021-07-28 00:00:00.000',
    bisyTime: '[["10:00","11:30"],["11:30","12:00"],["12:00","13:00"],["13:30","14:00"],["16:00","17:00"]]',
  },
  {
    id: 22,
    worker: { id: 2, name: 'Boris' },
    day: '2021-07-28 00:00:00.000',
    bisyTime: '[["10:00","11:00"],["12:00","13:00"],["13:00","13:30"],["17:30","18:00"]]',
  },
];


// if worker doesn't have schedule records in the database on the particular day
// const mockedWorkers: Worker[] = [{ id: 1, name: 'Andrey' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Daniil' }];
const mockedWorkers: Worker[] = [{ id: 1, name: 'Andrey' }, { id: 2, name: 'Bob' }];
const getWorkers = (): Worker[] => mockedWorkers; // imulates query to database for getting users

const getScheduleFromBatabase = (day: Date, id?: number): DatabaseSchema[] | undefined => {
  if (id != null) {
    const userSchedule: DatabaseSchema | undefined = mockedScheduleData.find((item) => {
      return item.worker.id === id
    });
    return userSchedule != null ? [userSchedule] : undefined;
  }
  return mockedScheduleData;
}

export {
  getWorkers,
  getScheduleFromBatabase,
};
