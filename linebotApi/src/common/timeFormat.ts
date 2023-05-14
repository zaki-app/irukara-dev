import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import advancedFormat from 'dayjs/plugin/advancedFormat';

dayjs.extend(utc);
dayjs.extend(advancedFormat);

// ナノ秒に変換
export const nanoSecondFormat = () => {
  const nanoFormat = 'YYYY-MM-DDTHH:mm:ss.SSSSSSSSS[Z]';
  console.log('unix時間', dayjs(1680350117564).format(nanoFormat));
  return dayjs().format(nanoFormat);
};

// 日本時間に変換したdayjsにする関数
export const jpDayjs = () => {
  return dayjs();
};
