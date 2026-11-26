'use client'

import { useLanguage } from '@/lib/i18n'
import { Check, Star, Flag, Trophy, Sparkles } from 'lucide-react'

interface PointsMilestoneTrackerProps {
  totalPoints: number
}

const MILESTONE_STEP = 1000
const MAX_MILESTONES = 10
const TRACKER_HEIGHT = 850 // Fixed height in pixels - increased to show 5 milestones at once

export function PointsMilestoneTracker({ totalPoints }: PointsMilestoneTrackerProps) {
  const { locale } = useLanguage()

  // Calculate completed milestones (capped at MAX_MILESTONES)
  const completedMilestones = Math.min(Math.floor(totalPoints / MILESTONE_STEP), MAX_MILESTONES)
  const hasReachedMax = completedMilestones >= MAX_MILESTONES
  
  // Next milestone calculation
  const nextMilestoneNumber = completedMilestones + 1
  const nextMilestonePoints = Math.min(nextMilestoneNumber * MILESTONE_STEP, MAX_MILESTONES * MILESTONE_STEP)
  const pointsToNext = hasReachedMax ? 0 : nextMilestonePoints - totalPoints
  const progressPercentage = hasReachedMax ? 100 : Math.min((totalPoints % MILESTONE_STEP) / MILESTONE_STEP * 100, 100)

  // Generate ALL 10 milestones data
  const milestones = []
  for (let i = 1; i <= MAX_MILESTONES; i++) {
    const isCompleted = i <= completedMilestones
    const isNext = i === completedMilestones + 1 && !hasReachedMax
    milestones.push({
      points: i * MILESTONE_STEP,
      completed: isCompleted,
      isNext: isNext && !hasReachedMax,
      title: locale === 'hi' ? `${i}हज़ार मील का पत्थर` : `${i}K Points Milestone`,
      description: locale === 'hi'
        ? `${i * 1000} पॉइंट्स तक पहुंचने के लिए ${i <= completedMilestones ? 0 : (i * MILESTONE_STEP - totalPoints)} पॉइंट्स और चाहिए।`
        : `${i <= completedMilestones ? 0 : (i * MILESTONE_STEP - totalPoints)} more points to reach ${i}K.`
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: TRACKER_HEIGHT }}>
      {/* Fixed Header - Always Visible */}
      <div className="bg-gradient-to-r from-saffron to-saffron-dark px-6 py-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{locale === 'hi' ? 'पॉइंट्स मील का पत्थर ट्रैकर' : 'Points Milestone Tracker'}</h3>
              <p className="text-white/80 text-sm">{locale === 'hi' ? 'हर 1000 पॉइंट्स पर नया मील का पत्थर' : 'New milestone every 1,000 points'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-xs uppercase tracking-wide">{locale === 'hi' ? 'कुल पॉइंट्स' : 'Total Points'}</p>
            <p className="text-white font-bold text-2xl">{totalPoints.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar for Next Milestone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-white text-sm">
            <span>
              {locale === 'hi' ? 'अगला मील का पत्थर' : 'Next Milestone'}:
              {hasReachedMax 
                ? (locale === 'hi' ? 'Coming Soon!' : 'Coming Soon!') 
                : `${nextMilestonePoints.toLocaleString()} pts`}
            </span>
            <span>{hasReachedMax ? '100%' : progressPercentage.toFixed(1) + '%'}</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-white/80 text-xs">
            {hasReachedMax
              ? (locale === 'hi' ? 'सभी मील के पत्थर पूरे हो गए!' : 'All milestones completed!')
              : (locale === 'hi' 
                  ? `${pointsToNext} पॉइंट्स बाकी हैं अगले मील के पत्थर तक`
                  : `${pointsToNext} points remaining to next milestone`)}
          </p>
        </div>
      </div>

      {/* Scrollable Milestone List - Independent Vertical Scrolling */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto p-5 pr-2 custom-scrollbar">
          <div className="relative pr-4">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-saffron via-gray-200 to-gray-200" />
            
            <div className="space-y-6 pb-4">
              {/* All 10 Milestones */}
              {[...Array(MAX_MILESTONES)].map((_, i) => {
                const milestoneNumber = i + 1
                const isCompleted = milestoneNumber <= completedMilestones
                const milestonePoints = milestoneNumber * MILESTONE_STEP
                const pointsToThis = milestonePoints - totalPoints
                
                return (
                  <div 
                    key={milestoneNumber}
                    className="relative flex items-start gap-4"
                  >
                    {/* Timeline Marker */}
                    <div className="relative flex-shrink-0 z-10">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-saffron border-4 border-white shadow-lg shadow-saffron/30'
                            : 'bg-white border-4 border-gray-300 shadow-sm'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-6 h-6 text-white" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-300" />
                        )}
                      </div>
                    </div>
                    
                    {/* Milestone Card */}
                    <div 
                      className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-300 ${
                        isCompleted
                          ? 'bg-saffron/5 border-saffron/20 shadow-sm'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {isCompleted && (
                              <Star className="w-4 h-4 text-saffron" />
                            )}
                            <h4 className={`font-semibold text-sm ${isCompleted ? 'text-saffron' : 'text-navy'}`}>
                              {locale === 'hi' ? `${milestoneNumber}हज़ार मील का पत्थर` : `${milestoneNumber}K Points Milestone`}
                            </h4>
                            {milestoneNumber === completedMilestones + 1 && !isCompleted && completedMilestones < MAX_MILESTONES && (
                              <span className="px-2 py-0.5 text-xs bg-saffron/10 text-saffron rounded-full font-medium">
                                {locale === 'hi' ? 'अगला' : 'Next'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {locale === 'hi'
                              ? `${isCompleted ? milestoneNumber * 1000 + ' पॉइंट्स पूरे किए! शानदार प्रगति।' : `${milestoneNumber * 1000} पॉइंट्स तक पहुंचने के लिए ${pointsToThis > 0 ? pointsToThis : 0} पॉइंट्स और चाहिए।`}`
                              : `${isCompleted ? milestoneNumber + 'K points achieved! Great progress.' : `${pointsToThis > 0 ? pointsToThis : 0} more points to reach ${milestoneNumber}K.`}`}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className={`font-bold text-lg ${isCompleted ? 'text-saffron' : 'text-gray-500'}`}>
                            {(milestoneNumber * 1000).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{locale === 'hi' ? 'पॉइंट्स' : 'pts'}</p>
                        </div>
                      </div>
                      
                      {/* Progress indicator for next milestone */}
                      {milestoneNumber === completedMilestones + 1 && !isCompleted && completedMilestones < MAX_MILESTONES && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">{locale === 'hi' ? 'प्रगति' : 'Progress'}</span>
                            <span className="font-medium text-saffron">{((totalPoints % MILESTONE_STEP) / MILESTONE_STEP * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-saffron rounded-full transition-all duration-500"
                              style={{ width: `${((totalPoints % MILESTONE_STEP) / MILESTONE_STEP) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              )}

              {/* Coming Soon Card */}
              <div key="coming-soon" className="relative flex items-start gap-4">
                {/* Timeline Marker */}
                <div className="relative flex-shrink-0 z-10">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      completedMilestones >= MAX_MILESTONES
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-white shadow-lg shadow-amber-400/30'
                        : 'bg-white border-4 border-gray-300 shadow-sm'
                    }`}
                  >
                    {completedMilestones >= MAX_MILESTONES ? (
                      <Sparkles className="w-6 h-6 text-white" />
                    ) : (
                      <Trophy className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Coming Soon Card */}
                <div 
                  className={`flex-1 min-w-0 p-4 rounded-xl border transition-all duration-300 ${
                    completedMilestones >= MAX_MILESTONES
                      ? 'bg-amber-50 border-amber-200 shadow-md'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className={`w-4 h-4 ${completedMilestones >= MAX_MILESTONES ? 'text-amber-500' : 'text-gray-400'}`} />
                        <h4 className={`font-semibold text-sm ${completedMilestones >= MAX_MILESTONES ? 'text-amber-600' : 'text-gray-500'}`}>
                          {locale === 'hi' ? 'जल्द आ रहा है!' : 'Coming Soon!'}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {locale === 'hi'
                          ? 'बधाई हो! आपने 10,000 पॉइंट्स का मील का पत्थर हासिल कर लिया है। एक स्वच्छ और हरित भारत की दिशा में योगदान देते रहें!'
                          : "Congratulations! You've reached the 10,000-point milestone. More exciting milestones and achievements are on their way. Keep contributing towards a cleaner and greener India!"}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className={`font-bold text-lg ${completedMilestones >= MAX_MILESTONES ? 'text-amber-500' : 'text-gray-400'}`}>
                        🏆
                      </p>
                      <p className="text-xs text-gray-400">{locale === 'hi' ? 'उपलब्धि' : 'Achievement'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Stats - Always Visible */}
      <div className="border-t border-gray-200 px-5 py-4 bg-gray-50/50 flex-shrink-0">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-2xl font-bold text-saffron">{Math.min(completedMilestones, MAX_MILESTONES)}</p>
            <p className="text-xs text-gray-500">{locale === 'hi' ? 'पूर्ण मील के पत्थर' : 'Milestones Done'}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-2xl font-bold text-navy">{totalPoints.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{locale === 'hi' ? 'कुल पॉइंट्स' : 'Total Points'}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-2xl font-bold text-green">
              {completedMilestones >= MAX_MILESTONES
                ? (locale === 'hi' ? 'Coming Soon!' : 'Coming Soon!')
                : `${nextMilestonePoints.toLocaleString()}`}
            </p>
            <p className="text-xs text-gray-500">{locale === 'hi' ? 'अगला लक्ष्य' : 'Next Target'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}