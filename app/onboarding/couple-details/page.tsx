'use client'

import { useState, useEffect } from 'react'
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { OnboardingLayout } from '@/components/layout/OnboardingLayout'
import { Button } from '@/components/ui/button'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { useCompleteOnboardingNavigation, useOnboardingStepData } from '@/hooks/useOnboardingNavigation'
import { cn } from "@/lib/utils"
import { CURRENCY_CONFIG } from '@/lib/constants'

const FormSchema = z.object({
  weddingDate: z.date().optional(),
})

export default function CoupleDetailsPage() {
  const [partner1Name, setPartner1Name] = useState('')
  const [partner2Name, setPartner2Name] = useState('')
  const [currency, setCurrency] = useState<keyof typeof CURRENCY_CONFIG>('USD')
  const [budgetValue, setBudgetValue] = useState([CURRENCY_CONFIG.USD.default])
  const [stillDeciding, setStillDeciding] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  // Load existing step data
  const { data: stepData, loadStepData } = useOnboardingStepData(2)

  useEffect(() => {
    loadStepData()
  }, [loadStepData])

  useEffect(() => {
    if (stepData) {
      setPartner1Name(stepData.partner1Name || '')
      setPartner2Name(stepData.partner2Name || '')
      setCurrency(stepData.currency || 'USD')
      setBudgetValue([stepData.budgetValue || CURRENCY_CONFIG.USD.default])
      setStillDeciding(stepData.stillDeciding || false)
      
      if (stepData.weddingDate) {
        form.setValue('weddingDate', new Date(stepData.weddingDate))
      }
    }
  }, [stepData, form])

  const currentConfig = CURRENCY_CONFIG[currency]

  const canProceed = partner1Name.trim() && partner2Name.trim() && (form.getValues('weddingDate') || stillDeciding) && budgetValue[0]

  const { handleBack, handleNext, isNavigating, isSaving, error } = useCompleteOnboardingNavigation(
    2, // Step number for couple details
    '/onboarding/stage',
    '/onboarding/guest-info',
    () => canProceed,
    () => {
      const weddingDate = form.getValues('weddingDate')
      return {
        partner1Name,
        partner2Name,
        weddingDate: stillDeciding ? null : weddingDate?.toISOString(),
        stillDeciding,
        budgetValue: budgetValue[0],
        currency
      }
    }
  )

  const handleCurrencyChange = (newCurrency: keyof typeof CURRENCY_CONFIG) => {
    setCurrency(newCurrency)
    setBudgetValue([CURRENCY_CONFIG[newCurrency].default])
  }

  // Function to format budget value with selected currency
  const formatBudget = (value: number) => {
    const symbol = currentConfig.symbol
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}k`
    } else {
      return `${symbol}${value}`
    }
  }

  return (
    <OnboardingLayout
      currentStep={3}
      imageIcon="heart"
      imageTitle="Your Love Story"
      imageSubtitle="Begins Here"
      title="To tailor your journey, I'll need just a few details."
      description="These first details will allow me to craft your plan with care and precision."
      onBack={handleBack}
      onNext={handleNext}
      canProceed={canProceed}
      isNavigating={isNavigating}
      loadingText="Preparing your journey..."
    >
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 mb-6">
          <div className="flex items-center">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        </div>
      )}

      {/* Couple Names Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
          First names of the couple
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={partner1Name}
            onChange={(e) => setPartner1Name(e.target.value)}
            placeholder="First name (Partner 1)"
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
          />
          <input
            type="text"
            value={partner2Name}
            onChange={(e) => setPartner2Name(e.target.value)}
            placeholder="First name (Partner 2)"
            className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
          />
        </div>
      </div>

      {/* Wedding Date Section */}
      <Form {...form}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            Wedding date <span className="text-gray-500 font-normal">(You can change this later)</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weddingDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          disabled={stillDeciding}
                          className={cn(
                            "w-full h-12 justify-between font-normal bg-white border-2 border-gray-200 hover:border-primary",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MM/dd/yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border border-gray-200 shadow-lg" align="start">
                      <CustomCalendar
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={stillDeciding}
                        className="w-full"
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            <div className="flex items-center h-12 space-x-2">
              <Checkbox
                id="still-deciding"
                checked={stillDeciding}
                onCheckedChange={(checked: boolean) => {
                  setStillDeciding(checked)
                  if (checked) {
                    form.setValue('weddingDate', undefined)
                  }
                }}
              />
              <label htmlFor="still-deciding" className="text-sm text-gray-700 cursor-pointer">
                We are still deciding
              </label>
            </div>
          </div>
        </div>
      </Form>

      {/* Budget Slider Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wedding budget
        </label>
        <div className="space-y-4">
          {/* Currency Selector */}
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 bg-gray-100 rounded-lg p-2">
              {Object.entries(CURRENCY_CONFIG).map(([currencyCode, config]) => (
                <button
                  key={currencyCode}
                  onClick={() => handleCurrencyChange(currencyCode as keyof typeof CURRENCY_CONFIG)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currency === currencyCode
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {config.symbol} {currencyCode}
                </button>
              ))}
            </div>
          </div>
          
          <div className="px-2">
            <Slider
              value={budgetValue}
              onValueChange={setBudgetValue}
              max={currentConfig.max}
              min={currentConfig.min}
              step={currentConfig.step}
              className="w-full"
            />
          </div>
          <div className="text-center">
            <span className="text-2xl font-semibold text-primary">
              {formatBudget(budgetValue[0])}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Slide to adjust your budget range
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}