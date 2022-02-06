import { ServicesTimes } from './interfaces';

export const START_DAY_TIME = '10:00';
export const END_DAY_TIME = '18:00';
export const MINUTES_IN_HOURS = 60;
export const MINUTES_IN_HALF_HOUR = 30;

const servicesTimes: ServicesTimes = {
  feetService: 30,
  headService: 60,
  bodyService: 120,
};

export { servicesTimes };