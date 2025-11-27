'use client'

import { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { format } from 'date-fns'
import uk from 'date-fns/locale/uk'
import { holidaysApi, timeOffApi } from '@/lib/api'

interface Holiday {
  id: string
  name: string
  date: string
  type: string
}

interface TimeOffRequest {
  id: string
  type: 'VACATION' | 'SICK_LEAVE'
  startDate: string
  endDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason: string
}

export default function CalendarComponent() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)

  const fetchHolidays = async () => {
    try {
      const data = await holidaysApi.getHolidays()
      if (data.holidays) {
        setHolidays(data.holidays)
      }
    } catch (error) {
      console.error('Error fetching holidays:', error)
    }
  }

  const fetchTimeOffRequests = async () => {
    try {
      const data = await timeOffApi.getRequests()
      if (data.requests) {
        // Фільтруємо тільки затверджені запити
        const approvedRequests = data.requests.filter(
          (req: TimeOffRequest) => req.status === 'APPROVED'
        )
        setTimeOffRequests(approvedRequests)
      }
    } catch (error) {
      console.error('Error fetching time off requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHolidayForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return holidays.find(
      (h) => format(new Date(h.date), 'yyyy-MM-dd') === dateStr
    )
  }

  const getTimeOffForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return timeOffRequests.find((request) => {
      const start = format(new Date(request.startDate), 'yyyy-MM-dd')
      const end = format(new Date(request.endDate), 'yyyy-MM-dd')
      return dateStr >= start && dateStr <= end
    })
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchHolidays(), fetchTimeOffRequests()])
    }
    loadData()
  }, [])

  // Додаємо tooltip для свят
  useEffect(() => {
    const addTooltips = () => {
      const tiles = document.querySelectorAll('.react-calendar__tile')
      tiles.forEach((tile) => {
        // Отримуємо дату з атрибута або з тексту
        const ariaLabel = tile.getAttribute('aria-label')
        const abbr = tile.querySelector('abbr')
        
        let date: Date | null = null
        
        if (ariaLabel) {
          try {
            date = new Date(ariaLabel)
            if (isNaN(date.getTime())) date = null
          } catch (e) {
            // Ігноруємо помилки
          }
        }
        
        // Якщо не вдалося отримати з aria-label, спробуємо з abbr
        if (!date && abbr && abbr.getAttribute('title')) {
          try {
            date = new Date(abbr.getAttribute('title') || '')
            if (isNaN(date.getTime())) date = null
          } catch (e) {
            // Ігноруємо помилки
          }
        }
        
        if (date) {
          const holiday = getHolidayForDate(date)
          const timeOff = getTimeOffForDate(date)
          
          if (holiday) {
            tile.setAttribute('title', holiday.name)
            tile.setAttribute('data-holiday', holiday.name)
            tile.classList.add('has-holiday')
          }
          
          if (timeOff) {
            const typeLabel = timeOff.type === 'VACATION' ? 'Відпустка' : 'Лікарняний'
            const dateRange = `${format(new Date(timeOff.startDate), 'd MMM', { locale: uk })} - ${format(new Date(timeOff.endDate), 'd MMM', { locale: uk })}`
            tile.setAttribute('title', `${typeLabel}: ${dateRange}`)
            tile.setAttribute('data-timeoff', `${typeLabel}: ${dateRange}`)
            tile.classList.add('has-timeoff')
          }
        }
      })
    }

    // Додаємо tooltip після завантаження свят та зміни місяця
    if (!loading) {
      // Використовуємо більший таймаут для забезпечення рендерингу календаря
      const timer = setTimeout(addTooltips, 300)
      return () => clearTimeout(timer)
    }
  }, [holidays, timeOffRequests, loading, selectedDate])

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const holiday = getHolidayForDate(date)
      const timeOff = getTimeOffForDate(date)
      
      if (holiday) {
        const isPublicHoliday = holiday.type === 'public_holiday'
        return (
          <div className="text-xs text-center mt-1">
            <div className={`${
              isPublicHoliday 
                ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
            } text-white rounded-lg px-2 py-1 font-bold shadow-md`}>
              🎉
            </div>
          </div>
        )
      }
      
      if (timeOff) {
        const isVacation = timeOff.type === 'VACATION'
        return (
          <div className="text-xs text-center mt-1">
            <div className={`${
              isVacation 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
            } text-white rounded-lg px-2 py-1 font-bold shadow-md`}>
              {isVacation ? '🏖️' : '🏥'}
            </div>
          </div>
        )
      }
    }
    return null
  }

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const holiday = getHolidayForDate(date)
      const timeOff = getTimeOffForDate(date)
      
      if (holiday) {
        return holiday.type === 'public_holiday' ? 'public-holiday-tile' : 'company-holiday-tile'
      }
      
      if (timeOff) {
        return timeOff.type === 'VACATION' ? 'vacation-tile' : 'sick-leave-tile'
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
            onChange={(value) => {
              if (value instanceof Date) {
                setSelectedDate(value)
              } else if (Array.isArray(value) && value[0] instanceof Date) {
                setSelectedDate(value[0])
              }
            }}
            onActiveStartDateChange={({ activeStartDate }) => {
              if (activeStartDate) {
                setCurrentMonth(activeStartDate)
              }
            }}
            value={selectedDate}
            tileContent={tileContent}
            tileClassName={tileClassName}
            locale="uk-UA"
          />
          <style jsx global>{`
            .public-holiday-tile {
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
              font-weight: 600 !important;
              border: 2px solid #ef4444 !important;
            }
            .public-holiday-tile:hover {
              background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%) !important;
              border-color: #dc2626 !important;
            }
            .company-holiday-tile {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
              font-weight: 600 !important;
              border: 2px solid #3b82f6 !important;
            }
            .company-holiday-tile:hover {
              background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%) !important;
              border-color: #2563eb !important;
            }
            .vacation-tile {
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
              font-weight: 600 !important;
              border: 2px solid #10b981 !important;
            }
            .vacation-tile:hover {
              background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%) !important;
              border-color: #059669 !important;
            }
            .sick-leave-tile {
              background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%) !important;
              font-weight: 600 !important;
              border: 2px solid #a855f7 !important;
            }
            .sick-leave-tile:hover {
              background: linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%) !important;
              border-color: #9333ea !important;
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
              position: relative;
              cursor: pointer;
            }
            .react-calendar__tile[data-holiday],
            .react-calendar__tile.has-holiday,
            .react-calendar__tile[data-timeoff],
            .react-calendar__tile.has-timeoff {
              cursor: help;
              position: relative;
            }
            .react-calendar__tile[data-holiday]:hover::after,
            .react-calendar__tile.has-holiday:hover::after {
              content: attr(data-holiday);
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.9);
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 0.875rem;
              white-space: nowrap;
              z-index: 1000;
              margin-bottom: 5px;
              pointer-events: none;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            .react-calendar__tile[data-holiday]:hover::before,
            .react-calendar__tile.has-holiday:hover::before {
              content: '';
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              border: 5px solid transparent;
              border-top-color: rgba(0, 0, 0, 0.9);
              z-index: 1001;
              margin-bottom: -5px;
              pointer-events: none;
            }
            .react-calendar__tile[data-timeoff]:hover::after,
            .react-calendar__tile.has-timeoff:hover::after {
              content: attr(data-timeoff);
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.9);
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 0.875rem;
              white-space: nowrap;
              z-index: 1000;
              margin-bottom: 5px;
              pointer-events: none;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            .react-calendar__tile[data-timeoff]:hover::before,
            .react-calendar__tile.has-timeoff:hover::before {
              content: '';
              position: absolute;
              bottom: 100%;
              left: 50%;
              transform: translateX(-50%);
              border: 5px solid transparent;
              border-top-color: rgba(0, 0, 0, 0.9);
              z-index: 1001;
              margin-bottom: -5px;
              pointer-events: none;
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
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #555;
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
          {(() => {
            // Фільтруємо свята для поточного місяця
            const currentMonthHolidays = holidays.filter((holiday) => {
              const holidayDate = new Date(holiday.date)
              return (
                holidayDate.getMonth() === currentMonth.getMonth() &&
                holidayDate.getFullYear() === currentMonth.getFullYear()
              )
            })

            // Фільтруємо затверджені відпустки/лікарняні для поточного місяця
            const currentMonthTimeOff = timeOffRequests.filter((request) => {
              const startDate = new Date(request.startDate)
              const endDate = new Date(request.endDate)
              const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
              const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
              
              // Перевіряємо, чи перетинається діапазон з поточним місяцем
              return startDate <= monthEnd && endDate >= monthStart
            })

            // Створюємо об'єднаний список подій
            const allEvents: Array<{
              id: string
              type: 'holiday' | 'timeoff'
              name: string
              date: Date
              endDate?: Date
              eventType?: string
              timeOffType?: 'VACATION' | 'SICK_LEAVE'
            }> = []

            // Додаємо свята
            currentMonthHolidays.forEach((holiday) => {
              allEvents.push({
                id: holiday.id,
                type: 'holiday',
                name: holiday.name,
                date: new Date(holiday.date),
                eventType: holiday.type,
              })
            })

            // Додаємо відпустки/лікарняні
            currentMonthTimeOff.forEach((request) => {
              const startDate = new Date(request.startDate)
              const endDate = new Date(request.endDate)
              
              // Якщо це діапазон, показуємо як один елемент
              allEvents.push({
                id: request.id,
                type: 'timeoff',
                name: request.type === 'VACATION' ? 'Відпустка' : 'Лікарняний',
                date: startDate,
                endDate: endDate,
                timeOffType: request.type,
              })
            })

            // Сортуємо за датою
            allEvents.sort((a, b) => {
              return a.date.getTime() - b.date.getTime()
            })

            if (allEvents.length === 0) {
              return (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-gray-600 font-medium text-lg">Немає подій у цьому місяці</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {format(currentMonth, 'MMMM yyyy', { locale: uk })}
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                {allEvents.map((event) => {
                  const isSelected = format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  const isRange = event.endDate && format(event.endDate, 'yyyy-MM-dd') !== format(event.date, 'yyyy-MM-dd')
                  
                  return (
                    <div
                      key={`${event.type}-${event.id}`}
                      className={`p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg'
                          : event.type === 'holiday'
                          ? 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-primary-300 hover:shadow-md'
                          : event.timeOffType === 'VACATION'
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-300 hover:shadow-md'
                          : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                          event.type === 'holiday'
                            ? event.eventType === 'public_holiday'
                              ? 'bg-gradient-to-br from-red-400 to-red-500'
                              : 'bg-gradient-to-br from-blue-400 to-blue-500'
                            : event.timeOffType === 'VACATION'
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                            : 'bg-gradient-to-br from-purple-400 to-indigo-500'
                        }`}>
                          {event.type === 'holiday' 
                            ? (event.eventType === 'public_holiday' ? '🇺🇦' : '🎊')
                            : (event.timeOffType === 'VACATION' ? '🏖️' : '🏥')
                          }
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 text-lg mb-1">
                            {event.name}
                          </div>
                          <div className="text-sm text-gray-600 font-medium mb-2">
                            📅 {isRange 
                              ? `${format(event.date, 'd MMM', { locale: uk })} - ${format(event.endDate!, 'd MMM yyyy', { locale: uk })}`
                              : format(event.date, 'd MMMM yyyy', { locale: uk })
                            }
                          </div>
                          <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                            event.type === 'holiday'
                              ? event.eventType === 'public_holiday'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                              : event.timeOffType === 'VACATION'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {event.type === 'holiday'
                              ? (event.eventType === 'public_holiday' ? '🏛️ Державне свято' : '🏢 Корпоративна подія')
                              : (event.timeOffType === 'VACATION' ? '🏖️ Відпустка' : '🏥 Лікарняний')
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

