import { format } from 'timeago.js';

export default class DateFormatter {
  date: Date;

  constructor(date?: Date | number) {
    if (date instanceof Date) {
      this.date = date;
    } else {
      this.date = new Date(date || 0);
    }
  }

  format(
    dateStyle: 'wymd' | 'wmd' | 'w' | '' | 'ago',
    timeStyle: 'hms' | 'hm' | 'h' | '',
    length: 'short' | 'long'
  ) {
    let options: Intl.DateTimeFormatOptions = {};

    switch (dateStyle) {
      case 'wymd':
        options.weekday = length;
        options.year = 'numeric';
        options.month = length;
        options.day = 'numeric';
        break;
      case 'wmd':
        options.weekday = length;
        options.month = length;
        options.day = 'numeric';
        break;
      case 'w':
        options.weekday = length;
        break;
      case 'ago':
        const str = format(this.date);
        return length === 'short' ? str.replace(/ ago$/gi, '') : str;
    }

    switch (timeStyle) {
      case 'hms':
        options.hour = 'numeric';
        options.minute = '2-digit';
        options.second = '2-digit';
        break;
      case 'hm':
        options.hour = 'numeric';
        options.minute = '2-digit';
        break;
      case 'h':
        options.hour = 'numeric';
        break;
    }

    let formatter = new Intl.DateTimeFormat(undefined, options);
    return formatter.format(this.date);
  }
}
