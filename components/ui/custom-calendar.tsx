"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CustomCalendar({ selected, onSelect, disabled, className }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selected || new Date())
  const [showMonthSelect, setShowMonthSelect] = useState(false)
  const [showYearSelect, setShowYearSelect] = useState(false)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const selectMonth = (month: number) => {
    setCurrentDate(new Date(currentYear, month, 1))
    setShowMonthSelect(false)
  }

  const selectYear = (year: number) => {
    setCurrentDate(new Date(year, currentMonth, 1))
    setShowYearSelect(false)
  }

  const selectDate = (day: number) => {
    if (disabled) return
    const selectedDate = new Date(currentYear, currentMonth, day)
    onSelect?.(selectedDate)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return selected.getDate() === day && 
           selected.getMonth() === currentMonth && 
           selected.getFullYear() === currentYear
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          disabled={disabled}
          className={cn(
            "h-9 w-9 rounded-md text-sm font-normal transition-colors hover:bg-gray-100",
            isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary",
            isToday(day) && !isSelected(day) && "bg-gray-100 font-semibold",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {day}
        </button>
      )
    }
    
    return days
  }

  return (
    <div className={cn("p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4 relative">
        <Button
          variant="outline"
          size="sm"
          onClick={previousMonth}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowMonthSelect(!showMonthSelect)}
            disabled={disabled}
            className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded"
          >
            {months[currentMonth]}
          </button>
          
          <button
            onClick={() => setShowYearSelect(!showYearSelect)}
            disabled={disabled}
            className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded"
          >
            {currentYear}
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={nextMonth}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Month Selector */}
        {showMonthSelect && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-48">
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => selectMonth(index)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    index === currentMonth 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {month.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year Selector */}
        {showYearSelect && (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-48">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => currentYear - 6 + i).map((year) => (
                <button
                  key={year}
                  onClick={() => selectYear(year)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${
                    year === currentYear 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="h-9 w-9 flex items-center justify-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  )
}