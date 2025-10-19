import { formatPercent, getGainLossColor } from '@/lib/utils/format'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PerformanceBadgeProps {
  value: number
  showIcon?: boolean
}

export default function PerformanceBadge({ value, showIcon = true }: PerformanceBadgeProps) {
  const color = getGainLossColor(value)

  let Icon = Minus
  if (value > 0) Icon = TrendingUp
  if (value < 0) Icon = TrendingDown

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span className="text-sm font-medium">{formatPercent(value)}</span>
    </div>
  )
}
