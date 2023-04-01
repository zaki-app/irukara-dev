import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(advancedFormat);

// ナノ秒に変換
export const nanoSecondFormat = () => {
  const nanoFormat = 'YYYY-MM-DDTHH:mm:ss.SSSSSSSSS[Z]';
  return dayjs().format(nanoFormat);
};
