import { partytownSnippet } from '@qwik.dev/partytown/integration'

const trackingId = process.env.NEXT_PUBLIC_GA_ID || ''
// Dates are not serializable through Partytown. Restore the original timestamp
// as a native Date in each thread before passing the command to GA.
const initializeQueue =
  'window.dataLayer=window.dataLayer||[];window.gtag=function(){if(arguments[0]==="js"&&typeof arguments[1]==="number")arguments[1]=new Date(arguments[1]);window.dataLayer.push(arguments)};'

export function AnalyticsScripts() {
  if (!trackingId) return null

  return (
    <>
      <script
        id="analytics-queue"
        dangerouslySetInnerHTML={{ __html: initializeQueue }}
      />
      <script
        id="analytics-worker"
        dangerouslySetInnerHTML={{
          __html: partytownSnippet({
            // Keep the main-thread queue so fallback also preserves early visits.
            forward: [['gtag', { preserveBehavior: true }]],
          }),
        }}
      />
      <script
        id="analytics-worker-queue"
        type="text/partytown"
        dangerouslySetInnerHTML={{ __html: initializeQueue }}
      />
      {/* Partytown loads this inert script in its worker, not synchronously. */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        id="analytics-library"
        type="text/partytown"
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
    </>
  )
}
