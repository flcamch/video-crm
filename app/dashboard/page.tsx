import { getDeals, getContacts, getCompanies } from '@/lib/db'

export default async function DashboardPage() {
  const deals = getDeals()
  const contacts = getContacts()
  const companies = getCompanies()

  const dealsByStage = {
    lead: deals.filter(d => d.stage === 'lead').length,
    consultation: deals.filter(d => d.stage === 'consultation').length,
    quote: deals.filter(d => d.stage === 'quote').length,
    won: deals.filter(d => d.stage === 'won').length,
    lost: deals.filter(d => d.stage === 'lost').length,
  }

  const totalWonValue = deals
    .filter(d => d.stage === 'won')
    .reduce((sum, d) => sum + (d.value || 0), 0)

  const openDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length

  const recentDeals = deals.slice(0, 5)

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Kontakte</p>
              <p className="text-3xl font-bold text-gray-900">{contacts.length}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Firmen</p>
              <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <span className="text-3xl">🏢</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Offene Deals</p>
              <p className="text-3xl font-bold text-gray-900">{openDeals}</p>
            </div>
            <span className="text-3xl">📋</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Gewonnener Umsatz</p>
              <p className="text-3xl font-bold text-gray-900">CHF {totalWonValue.toLocaleString('de-CH')}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Deals nach Stage</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Lead</span>
              <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">
                {dealsByStage.lead}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Beratung</span>
              <span className="inline-block px-3 py-1 bg-blue-200 text-blue-800 text-sm font-medium rounded-full">
                {dealsByStage.consultation}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Offerte</span>
              <span className="inline-block px-3 py-1 bg-amber-200 text-amber-800 text-sm font-medium rounded-full">
                {dealsByStage.quote}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Gewonnen</span>
              <span className="inline-block px-3 py-1 bg-green-200 text-green-800 text-sm font-medium rounded-full">
                {dealsByStage.won}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Verloren</span>
              <span className="inline-block px-3 py-1 bg-red-200 text-red-800 text-sm font-medium rounded-full">
                {dealsByStage.lost}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Neueste Deals</h2>
          <div className="space-y-3">
            {recentDeals.length === 0 ? (
              <p className="text-gray-600 text-sm">Keine Deals vorhanden</p>
            ) : (
              recentDeals.map(deal => (
                <div key={deal.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <p className="text-xs text-gray-500">{deal.company_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">CHF {deal.value?.toLocaleString('de-CH') || '0'}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                      deal.stage === 'lead' ? 'bg-gray-200 text-gray-800' :
                      deal.stage === 'consultation' ? 'bg-blue-200 text-blue-800' :
                      deal.stage === 'quote' ? 'bg-amber-200 text-amber-800' :
                      deal.stage === 'won' ? 'bg-green-200 text-green-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {deal.stage === 'lead' && 'Lead'}
                      {deal.stage === 'consultation' && 'Beratung'}
                      {deal.stage === 'quote' && 'Offerte'}
                      {deal.stage === 'won' && 'Gewonnen'}
                      {deal.stage === 'lost' && 'Verloren'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
