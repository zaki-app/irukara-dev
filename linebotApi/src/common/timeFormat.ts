import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(advancedFormat);

// 日本時間に変換したdayjsにする関数
export const jpDayjs = () => {
  return dayjs();
};
