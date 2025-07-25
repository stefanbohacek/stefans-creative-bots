// time is in UTC, subtract 5 hours for EST
// '0 8 * * *' would be every day at 8-5 = 3am

export default {
  EVERY_SECOND: '*/1 * * * * *',
  EVERY_FIVE_SECONDS: '*/5 * * * * *',
  EVERY_TEN_SECONDS: '*/10 * * * * *',  
  EVERY_FIFTEEN_SECONDS: '*/15 * * * * *',
  EVERY_THIRTY_SECONDS: '*/30 * * * * *',
  EVERY_MINUTE: '* * * * *',
  EVERY_FIVE_MINUTES: '*/5 * * * *',
  EVERY_TEN_MINUTES: '*/10 * * * *',
  EVERY_THIRTY_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 */1 * * *',
  EVERY_TWO_HOURS: '0 */2 * * *',
  EVERY_THREE_HOURS: '0 */3 * * *',
  EVERY_FOUR_HOURS: '0 */4 * * *',
  EVERY_FIVE_HOURS: '0 */5 * * *',
  EVERY_SIX_HOURS: '15 */6 * * *',
  EVERY_SEVEN_HOURS: '15 */7 * * *',
  EVERY_EIGHT_HOURS: '15 */8 * * *',
  EVERY_NINE_HOURS: '15 */9 * * *',
  EVERY_TEN_HOURS: '15 */10 * * *',
  EVERY_ELEVEN_HOURS: '15 */11 * * *',
  EVERY_TWELVE_HOURS: '1 */12 * * *',
  EVERY_DAY_MIDNIGHT: '0 0 * * *',
  EVERY_DAY_MORNING: '0 10 * * *',
  EVERY_DAY_LATE_MORNING: '0 14 * * *',
  EVERY_DAY_NOON: '0 17 * * *',
  EVERY_DAY_AFTERNOON: '0 19 * * *',
  EVERY_DAY_EVENING: '0 0 * * *'
};
