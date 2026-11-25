'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function DateTimePicker({ value, onChange, className, placeholder }: DateTimePickerProps) {
  const selectedDate = value ? new Date(value) : null;

  return (
    <div className={cn('relative w-full', className)}>
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => {
          if (date) {
            // Format to YYYY-MM-DDTHH:mm for datetime-local compatibility if needed
            // or just use ISO string
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - offset * 60 * 1000);
            onChange(localDate.toISOString().substring(0, 16));
          } else {
            onChange('');
          }
        }}
        showTimeSelect
        dateFormat="Pp"
        placeholderText={placeholder || 'Select date and time'}
        customInput={
          <Button
            variant="outline"
            className={cn(
              'w-full h-12 justify-start text-left font-bold rounded-2xl border-slate-200 px-4',
              !value && 'text-slate-500'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-pink-600" />
            {value ? selectedDate?.toLocaleString() : placeholder || 'Select date and time'}
          </Button>
        }
        calendarClassName="!rounded-2xl !border-slate-200 !shadow-xl !font-sans"
        wrapperClassName="w-full"
      />
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border-radius: 1.5rem !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
          overflow: hidden;
        }
        .react-datepicker__header {
          background-color: #fff !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding-top: 1rem !important;
        }
        .react-datepicker__day--selected {
          background-color: #ec4899 !important;
          border-radius: 0.5rem !important;
        }
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
          background-color: #ec4899 !important;
        }
        .react-datepicker__navigation {
          top: 1rem !important;
        }
      `}</style>
    </div>
  );
}
