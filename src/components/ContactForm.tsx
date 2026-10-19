'use client'

import React, { useId, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/Button'
import { FadeIn } from '@/components/FadeIn'
import { Textarea } from "@/components/ui/textarea"
import { contactSchema, type ContactSchema } from '@/lib/schemats'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

const TextInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<'input'> & { label: string; error?: string }
>(({ label, error, ...props }, ref) => {
  let id = useId()

  return (
    <div className="group relative z-0 transition-all focus-within:z-10">
      <input
        type="text"
        id={id}
        ref={ref}
        {...props}
        placeholder=" "
        className={`peer block w-full border bg-transparent px-6 pt-12 pb-4 text-sm text-neutral-950 ring-4 ring-transparent transition group-first:rounded-t-2xl group-last:rounded-b-2xl focus:border-neutral-950 focus:ring-neutral-950/5 focus:outline-hidden ${
          error ? 'border-red-500' : 'border-neutral-300'
        }`}
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute top-1/2 left-6 -mt-3 origin-left text-sm transition-all duration-200 peer-not-placeholder-shown:-translate-y-4 peer-not-placeholder-shown:scale-75 peer-not-placeholder-shown:font-semibold peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-semibold ${
          error ? 'text-red-500 peer-not-placeholder-shown:text-red-500 peer-focus:text-red-500' : 'text-neutral-500 peer-not-placeholder-shown:text-neutral-950 peer-focus:text-neutral-950'
        }`}
      >
        {label}
      </label>
      {error && <p className="absolute bottom-3 text-right w-[90%] left-6 text-xs text-red-500">{error}</p>}
    </div>
  )
})

TextInput.displayName = 'TextInput'

function RadioInput({
  label,
  ...props
}: React.ComponentPropsWithoutRef<'input'> & { label: string }) {
  return (
    <label className="flex gap-x-3">
      <input
        type="radio"
        {...props}
        className="h-6 w-6 flex-none appearance-none rounded-full border border-neutral-950/20 outline-hidden checked:border-[0.5rem] checked:border-neutral-950 focus-visible:ring-1 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
      />
      <span className="text-sm text-neutral-950">{label}</span>
    </label>
  )
}

export function ContactForm() {
  const t = useTranslations('ContactPage')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messageId = useId()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema)
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: ContactSchema) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        reset()
      } else {
        toast.error(result.error)
        if (result.details) {
          result.details.forEach((detail: any) => {
            toast.error(`${detail.path.join('.')}: ${detail.message}`)
          })
        }
      }
    } catch (error) {
      toast.error('送信に失敗しました。もう一度お試しください。')
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FadeIn className="lg:order-last">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="font-display text-base font-semibold text-neutral-950">
          {t('form.heading')}
        </h2>
        <div className="isolate mt-6 -space-y-px rounded-2xl bg-white/50">
          <TextInput
            label={t('form.name')}
            {...register('name')}
            autoComplete="name"
            error={errors.name?.message}
          />
          <TextInput
            label={t('form.email')}
            type="email"
            {...register('email')}
            autoComplete="email"
            error={errors.email?.message}
          />
          <TextInput
            label={t('form.company')}
            {...register('company')}
            autoComplete="organization"
          />
          <TextInput
            label={t('form.phone')}
            type="tel"
            {...register('phone')}
            autoComplete="tel"
          />
          <div className="flex flex-col gap-2 border-x border-neutral-300 px-6 py-6">
            <label htmlFor={messageId} className="text-sm text-neutral-500">
              {t('form.messagePlaceholder')}
            </label>
            <Textarea
              id={messageId}
              placeholder={t('form.messagePlaceholder')}
              {...register('message')}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? `${messageId}-error` : undefined}
              className="m-0 w-full border-none p-0 shadow-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4"
              rows={10}
            />
            {errors.message && (
              <p id={`${messageId}-error`} className="mt-1 text-right text-xs text-red-600">
                {errors.message.message}
              </p>
            )}
          </div>
          <div className="border border-neutral-300 px-6 py-8 first:rounded-t-2xl last:rounded-b-2xl">
            <fieldset>
              <legend className="text-sm text-neutral-500">
                {t('form.budget.legend')}
              </legend>
              <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <RadioInput
                  label={t('form.budget.lt50')}
                  {...register('budget')}
                  value="50万以下"
                />
                <RadioInput
                  label={t('form.budget.lt100')}
                  {...register('budget')}
                  value="100万以下"
                />
                <RadioInput
                  label={t('form.budget.lt300')}
                  {...register('budget')}
                  value="300万以下"
                />
                <RadioInput
                  label={t('form.budget.gte300')}
                  {...register('budget')}
                  value="300万以上"
                />
                <RadioInput
                  label={t('form.budget.gte500')}
                  {...register('budget')}
                  value="500万以上"
                />
                <RadioInput
                  label={t('form.budget.gte1000')}
                  {...register('budget')}
                  value="1000万以上"
                />
              </div>
            </fieldset>
          </div>
          <div className="peer block w-full border border-neutral-300 bg-transparent px-6 py-4 text-base/6 text-neutral-950 ring-4 ring-transparent transition group-first:rounded-t-2xl group-last:rounded-b-2xl focus:border-neutral-950 focus:ring-neutral-950/5 focus:outline-hidden">
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger className="h-full w-full border border-neutral-300">
                <SelectValue placeholder={t('form.topicPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="peer flex w-full gap-2 border border-neutral-300 bg-white text-base/6 text-neutral-950 transition group-first:rounded-t-2xl group-last:rounded-b-2xl focus:border-neutral-500 focus:ring-neutral-500 focus:outline-hidden">
                {[
                  { value: 'contact', label: t('topics.contact') },
                  { value: 'partner', label: t('topics.partner') },
                  { value: 'estimate', label: t('topics.estimate') },
                  { value: 'monitor', label: t('topics.monitor') },
                  { value: 'other', label: t('topics.other') },
                ].map((topic) => (
                  <SelectItem key={topic.value} value={topic.value}>
                    {topic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="mt-10" disabled={isSubmitting} aria-label={t('form.submit')}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              {t('form.submitting')}
            </div>
          ) : (
            t('form.submit')
          )}
        </Button>
      </form>
    </FadeIn>
  )
}

