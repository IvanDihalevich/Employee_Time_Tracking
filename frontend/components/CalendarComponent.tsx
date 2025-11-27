'use client'

import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale/uk'
import { holidaysApi } from '@/lib/api'

interface Holiday {
  id: string
  name: string
  date: string
  type: string
}

export default function CalendarComponent() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHolidays()
  }, [])

  const fetchHolidays = async () => {
    try {
      const data = await holidaysApi.getHolidays()
      if (data.holidays) {
        setHolidays(data.holidays)
      }
    } catch (error) {
      console.error('Error fetching holidays:', error)
    } finally {
      setLoading(false)
    }
  }

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd')
      const holiday = holidays.find(
        (h) => format(new Date(h.date), 'yyyy-MM-dd') === dateStr
      )
      if (holiday) {
        return (
          <div className="text-xs text-center mt-1">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg px-2 py-1 font-bold shadow-md">
              {holiday.name}
            </div>
          </div>
        )
      }
    }
    return null
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd')
      const holiday = holidays.find(
        (h) => format(new Date(h.date), 'yyyy-MM-dd') === dateStr
      )
      if (holiday) {
        return 'holiday-tile'
      }
    }
    return null
  }

  const selectedDateHolidays = holidays.filter(
    (h) => format(new Date(h.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Завантаження календаря...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white shadow-2xl rounded-2xl p-8 border-2 border-gray-100">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            locale="uk-UA"
          />
          <style jsx global>{`
            .holiday-tile {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
              font-weight: 600 !important;
            }
            .react-calendar {
              width: 100%;
              border: none;
              font-family: inherit;
              background: transparent;
            }
            .react-calendar__navigation {
              display: flex;
              margin-bottom: 1.5rem;
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              border-radius: 12px;
              padding: 0.75rem;
            }
            .react-calendar__navigation button {
              color: white !important;
              font-weight: 700 !important;
              font-size: 1.1rem !important;
              min-width: 44px;
              background: transparent !important;
              border: none !important;
            }
            .react-calendar__navigation button:hover {
              background: rgba(255, 255, 255, 0.2) !important;
              border-radius: 8px;
            }
            .react-calendar__navigation button:enabled:hover,
            .react-calendar__navigation button:enabled:focus {
              background: rgba(255, 255, 255, 0.2) !important;
            }
            .react-calendar__month-view__weekdays {
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              border-radius: 8px;
              padding: 0.5rem 0;
              margin-bottom: 0.5rem;
            }
            .react-calendar__month-view__weekdays__weekday {
              color: #1f2937 !important;
              font-weight: 700 !important;
              font-size: 0.9rem !important;
              text-transform: uppercase;
              padding: 0.5rem;
            }
            .react-calendar__tile {
              padding: 1rem 0.5rem !important;
              background: white !important;
              border: 2px solid transparent !important;
              border-radius: 8px !important;
              color: #1f2937 !important;
              font-weight: 600 !important;
              font-size: 1rem !important;
              transition: all 0.2s ease !important;
            }
            .react-calendar__tile:hover {
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
              border-color: #3b82f6 !important;
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .react-calendar__tile--active {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
              color: white !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
              border-color: #1d4ed8 !important;
            }
            .react-calendar__tile--now {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
              color: #92400e !important;
              font-weight: 700 !important;
              border: 2px solid #f59e0b !important;
            }
            .react-calendar__tile--neighboringMonth {
              color: #9ca3af !important;
              opacity: 0.5;
            }
            .react-calendar__tile--weekend {
              color: #dc2626 !important;
              font-weight: 700 !important;
            }
            .react-calendar__tile--weekend:hover {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
              border-color: #dc2626 !important;
            }
          `}</style>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white shadow-2xl rounded-2xl p-6 border-2 border-gray-100 sticky top-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Вихідні та свята
            </h2>
          </div>
          {holidays.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-600 font-medium text-lg">Немає запланованих свят</p>
              <p className="text-gray-400 text-sm mt-2">Свята будуть відображатися тут</p>
            </div>
          ) : (
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                    format(new Date(holiday.date), 'yyyy-MM-dd') ===
                    format(selectedDate, 'yyyy-MM-dd')
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg'
                      : 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      holiday.type === 'public_holiday'
                        ? 'bg-gradient-to-br from-red-400 to-red-500'
                        : 'bg-gradient-to-br from-blue-400 to-blue-500'
                    }`}>
                      {holiday.type === 'public_holiday' ? '🇺🇦' : '🎊'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-lg mb-1">
                        {holiday.name}
                      </div>
                      <div className="text-sm text-gray-600 font-medium mb-2">
                        📅 {format(new Date(holiday.date), 'd MMMM yyyy', { locale: uk })}
                      </div>
                      <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                        holiday.type === 'public_holiday'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {holiday.type === 'public_holiday'
                          ? '🏛️ Державне свято'
                          : '🏢 Корпоративна подія'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

