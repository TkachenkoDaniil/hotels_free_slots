import { getWorkers, getScheduleFromBatabase } from './dbEvents';
import { DatabaseSchema, ServicesTimes } from './interfaces';
import {
  servicesTimes,
  START_DAY_TIME,
  END_DAY_TIME,
  MINUTES_IN_HOURS,
  MINUTES_IN_HALF_HOUR,
} from './constants';

interface ScheduleConfig {
  workerId: number | undefined,
  serviceType: keyof ServicesTimes, // type of service: feetService || headService || bodyService
}

type Slot = { time: string, availableCount: number };

const parseTime = (time: string): number[] => {
  const [hours, minutes] = time.split(':');
  return [Number(hours), Number(minutes)];
};

const compareTimes = (time1: string, time2: string): number => {
  const [hours1, minutes1] = parseTime(time1);
  const [hours2, minutes2] = parseTime(time2);
  if (hours1 > hours2) return 1;
  else if (hours1 < hours2) return -1;
  else if (minutes1 > minutes2) return 1;
  else if (minutes1 < minutes2) return -1;
  return 0;
}

const getFreeSlotsOfWorker = (workersSchedule: DatabaseSchema) => {
  const busyTime = JSON.parse(workersSchedule.bisyTime)
  let tempSlot = START_DAY_TIME;
  const slots = busyTime.reduce((accum: any, item: [string, string], index: number) => {
    const [time1, time2] = item;
    if (compareTimes(tempSlot, time1) === -1) {
      accum.push([tempSlot, time1]);
    }
    if (index === busyTime.length - 1 && compareTimes(time2, END_DAY_TIME) === -1) {
      accum.push([time2, END_DAY_TIME]);
    }
    tempSlot = time2;
    return accum;
  }, []);
  return slots
};

const calculateTime = (time: string, serviceTime: number): string => {
  let [hours, minutes] = parseTime(time);
  const amountHours = Math.floor(serviceTime/MINUTES_IN_HOURS);
  const amountMinutes = serviceTime % MINUTES_IN_HOURS;
  hours += amountHours;
  if (amountMinutes + minutes >= MINUTES_IN_HOURS) {
    minutes = (amountMinutes + minutes) % MINUTES_IN_HOURS
    hours += 1;
  } else {
    minutes += amountMinutes;
  }
  return `${hours}:${minutes === 0 ? '00' : minutes }`;
};



const isWorkerSlotFree = (slot: string[], workerSlots: any): boolean => {
  const [startSlotTime, endSlotTime] = slot;
  return workerSlots.some((workerSlot: [string, string]): boolean => {
    const startWorkerSlotTime: string = workerSlot[0];
    const endWorkerSlotTime: string = workerSlot[1];
    const comparedStartSlotTimes = compareTimes(startSlotTime, startWorkerSlotTime);
    const comparedEndSlotTimes = compareTimes(endSlotTime, endWorkerSlotTime);
    if (
      (comparedStartSlotTimes === 1 || comparedStartSlotTimes === 0)
      && (comparedEndSlotTimes === -1 || comparedEndSlotTimes === 0)
      ) {
      return true;
    }
    return false;
  });
}

async function getAvailableTimeSlots(opts: {
  config: ScheduleConfig,
  day: Date,
}): Promise<Slot[]> {
  const { serviceType, workerId } = opts.config;
  const workers = getWorkers();
  const workersSchedule = getScheduleFromBatabase(opts.day, workerId);
  const workersSlots = workersSchedule?.map((item) => {
    return getFreeSlotsOfWorker(item);
  });
  if (workerId == null) {
    workers.forEach((item) => {
      if (workersSchedule?.find((schedule) => schedule.worker.id === item.id) == null) {
        workersSlots?.push([[START_DAY_TIME, END_DAY_TIME]]);
      }
    }); 
  }
  let slotStartTime: string = START_DAY_TIME;
  const serviceTime: number = servicesTimes[serviceType];
  const slots = [];
  while (slotStartTime !== END_DAY_TIME) {
    const slotEndTime = calculateTime(slotStartTime, serviceTime)
    const potentialSlot = [slotStartTime, slotEndTime];
    const availableCount = workersSlots?.reduce((accum: number, workerSlots: [string, string]): number => {
      if (isWorkerSlotFree(potentialSlot, workerSlots)) {
        return accum + 1;
      }
      return accum;
    }, 0);
    if (availableCount !== 0) {
      slots.push({ time: slotStartTime, availableCount });
    }
    slotStartTime = calculateTime(slotStartTime, MINUTES_IN_HALF_HOUR)
  }
  console.log('slots', slots) // free slots
  return slots;
};

const preparedConfig: ScheduleConfig = {
  workerId: undefined, // id of user, example: 1 or undefined
  serviceType: 'feetService',
};

getAvailableTimeSlots({ config: preparedConfig, day: new Date() });
