import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface DateRangePickerProps {
  value: Date
  onChange: (date: Date) => void
}

const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const presets = [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Yesterday', getValue: () => subDays(new Date(), 1) },
    { label: '2 Days Ago', getValue: () => subDays(new Date(), 2) },
    { label: '1 Week Ago', getValue: () => subDays(new Date(), 7) },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-surface border border-gray-700 rounded-lg hover:border-accent transition-colors text-white"
      >
        <Calendar className="w-4 h-4 text-accent" />
        <span className="text-sm">{format(value, 'MMM d, yyyy')}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-surface border border-gray-700 rounded-lg shadow-xl z-20">
            <div className="p-3">
              <p className="text-xs text-gray-400 mb-2 font-medium">Quick Select</p>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      onChange(preset.getValue())
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-surface-light rounded transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-700 p-3">
              <p className="text-xs text-gray-400 mb-2 font-medium">Custom Date</p>
              <input
                type="date"
                value={format(value, 'yyyy-MM-dd')}
                onChange={(e) => {
                  onChange(new Date(e.target.value))
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 bg-background border border-gray-700 rounded text-white text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DateRangePicker
