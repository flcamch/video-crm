'use client'

import { useState, useEffect } from 'react'
import { Deal, Offer, Service } from '@/lib/types'

const STAGES = [
  { id: 'lead', name: 'Lead / Interesse', color: 'gray' },
  { id: 'consultation', name: 'Beratung / Gespräch', color: 'blue' },
  { id: 'quote', name: 'Offerte gesendet', color: 'amber' },
  { id: 'won', name: 'Gewonnen / In Produktion', color: 'green' },
  { id: 'lost', name: 'Verloren', color: 'red' },
]

const colorClasses: Record<string, string> = {
  gray: 'bg-gray-200 text-gray-800',
  blue: 'bg-blue-200 text-blue-800',
  amber: 'bg-amber-200 text-amber-800',
  green: 'bg-green-200 text-green-800',
  red: 'bg-red-200 text-red-800',
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [showDealModal, setShowDealModal] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    value: '',
    notes: '',
    contact_id: '',
    company_id: '',
  })
  const [offerData, setOfferData] = useState({
    title: '',
    subtitle: '',
    description: '',
    services: [{ name: '', price: '' }],
    timeline_start: '',
    timeline_end: '',
    valid_until: '',
  })
  const [contacts, setContacts] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [dealsRes, contactsRes, companiesRes] = await Promise.all([
        fetch('/api/deals'),
        fetch('/api/contacts'),
        fetch('/api/companies'),
      ])
      const dealsData = await dealsRes.json()
      const contactsData = await contactsRes.json()
      const companiesData = await companiesRes.json()
      setDeals(dealsData)
      setContacts(contactsData)
      setCompanies(companiesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  function openDealModal(deal?: Deal) {
    if (deal) {
      setSelectedDeal(deal)
      setFormData({
        title: deal.title,
        value: deal.value?.toString() || '',
        notes: deal.notes || '',
        contact_id: deal.contact_id?.toString() || '',
        company_id: deal.company_id?.toString() || '',
      })
    } else {
      setSelectedDeal(null)
      setFormData({
        title: '',
        value: '',
        notes: '',
        contact_id: '',
        company_id: '',
      })
    }
    setShowDealModal(true)
  }

  async function handleSaveDeal() {
    try {
      if (selectedDeal) {
        await fetch(`/api/deals/${selectedDeal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      setShowDealModal(false)
      loadData()
    } catch (error) {
      console.error('Failed to save deal:', error)
    }
  }

  async function handleChangeStage(dealId: number, newStage: string) {
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      loadData()
      if (selectedDeal?.id === dealId) {
        setSelectedDeal({ ...selectedDeal, stage: newStage })
      }
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  async function loadOfferForDeal(dealId: number) {
    try {
      const res = await fetch(`/api/deals/${dealId}`)
      const deal = await res.json()
      if (deal.offer) {
        setSelectedOffer(deal.offer)
      }
    } catch (error) {
      console.error('Failed to load offer:', error)
    }
  }

  function openOfferModal(deal: Deal) {
    setSelectedDeal(deal)
    setOfferData({
      title: '',
      subtitle: '',
      description: '',
      services: [{ name: '', price: '' }],
      timeline_start: '',
      timeline_end: '',
      valid_until: '',
    })
    loadOfferForDeal(deal.id)
    setShowOfferModal(true)
  }

  async function handleSaveOffer() {
    if (!selectedDeal) return

    const services: Service[] = offerData.services
      .filter(s => s.name && s.price)
      .map(s => ({
        name: s.name,
        price: parseFloat(s.price),
      }))

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: selectedDeal.id,
          title: offerData.title,
          subtitle: offerData.subtitle,
          description: offerData.description,
          services,
          timeline_start: offerData.timeline_start,
          timeline_end: offerData.timeline_end,
          valid_until: offerData.valid_until,
          status: 'draft',
        }),
      })
      const offer = await res.json()
      setSelectedOffer(offer)
      loadData()
    } catch (error) {
      console.error('Failed to save offer:', error)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
        <button
          onClick={() => openDealModal()}
          className="btn-primary"
        >
          + Neuer Deal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 overflow-x-auto pb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(300px, 1fr))' }}>
        {STAGES.map(stage => {
          const stageDeal = deals.filter(d => d.stage === stage.id)
          return (
            <div key={stage.id} className="flex flex-col">
              <div className={`px-4 py-3 rounded-t-lg ${colorClasses[stage.color]}`}>
                <h3 className="font-bold text-sm">{stage.name}</h3>
                <p className="text-xs mt-1">{stageDeal.length} Deal(s)</p>
              </div>
              <div className="flex-1 bg-gray-100 rounded-b-lg p-4 space-y-3 min-h-96">
                {stageDeal.map(deal => (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow border-l-4 border-blue-500"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{deal.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{deal.company_name}</p>
                    <p className="text-xs text-gray-600">{deal.contact_name}</p>
                    <p className="font-bold text-blue-600 mt-2">CHF {deal.value?.toLocaleString('de-CH') || '0'}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full md:w-96 bg-white rounded-t-lg shadow-lg p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedDeal.title}</h2>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-600">Firma</p>
                <p className="font-medium">{selectedDeal.company_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Kontakt</p>
                <p className="font-medium">{selectedDeal.contact_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Wert</p>
                <p className="font-medium">CHF {selectedDeal.value?.toLocaleString('de-CH') || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">Stage</p>
                <select
                  value={selectedDeal.stage}
                  onChange={(e) => handleChangeStage(selectedDeal.id, e.target.value)}
                  className="input text-sm"
                >
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              {selectedDeal.notes && (
                <div>
                  <p className="text-xs text-gray-600">Notizen</p>
                  <p className="text-sm">{selectedDeal.notes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => openOfferModal(selectedDeal)}
              className="btn-primary w-full mb-3"
            >
              Offerte erstellen/bearbeiten
            </button>

            {selectedOffer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <p className="text-xs text-blue-700 font-medium mb-2">Offerte vorhanden</p>
                <p className="text-blue-900 mb-2 break-all text-xs">{selectedOffer.token}</p>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/pitch/${selectedOffer.token}`)}
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                >
                  Link kopieren
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedDeal(null)}
              className="btn-secondary w-full mt-3"
            >
              Schliessen
            </button>
          </div>
        </div>
      )}

      {showOfferModal && selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full md:w-96 bg-white rounded-t-lg shadow-lg p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Offerte erstellen</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={offerData.title}
                  onChange={(e) => setOfferData({ ...offerData, title: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Untertitel</label>
                <input
                  type="text"
                  value={offerData.subtitle}
                  onChange={(e) => setOfferData({ ...offerData, subtitle: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={offerData.description}
                  onChange={(e) => setOfferData({ ...offerData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leistungen</label>
                {offerData.services.map((service, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={service.name}
                      onChange={(e) => {
                        const newServices = [...offerData.services]
                        newServices[idx].name = e.target.value
                        setOfferData({ ...offerData, services: newServices })
                      }}
                      className="input flex-1"
                    />
                    <input
                      type="number"
                      placeholder="CHF"
                      value={service.price}
                      onChange={(e) => {
                        const newServices = [...offerData.services]
                        newServices[idx].price = e.target.value
                        setOfferData({ ...offerData, services: newServices })
                      }}
                      className="input w-24"
                    />
                    {offerData.services.length > 1 && (
                      <button
                        onClick={() => {
                          const newServices = offerData.services.filter((_, i) => i !== idx)
                          setOfferData({ ...offerData, services: newServices })
                        }}
                        className="btn-danger"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setOfferData({
                    ...offerData,
                    services: [...offerData.services, { name: '', price: '' }]
                  })}
                  className="btn-secondary text-sm w-full"
                >
                  + Leistung hinzufügen
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Datum</label>
                <input
                  type="date"
                  value={offerData.timeline_start}
                  onChange={(e) => setOfferData({ ...offerData, timeline_start: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Datum</label>
                <input
                  type="date"
                  value={offerData.timeline_end}
                  onChange={(e) => setOfferData({ ...offerData, timeline_end: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gültig bis</label>
                <input
                  type="date"
                  value={offerData.valid_until}
                  onChange={(e) => setOfferData({ ...offerData, valid_until: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowOfferModal(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveOffer}
                className="btn-primary flex-1"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {showDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full md:w-96 bg-white rounded-t-lg shadow-lg p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedDeal ? 'Deal bearbeiten' : 'Neuer Deal'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontakt</label>
                <select
                  value={formData.contact_id}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                  className="input"
                >
                  <option value="">Wählen...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="input"
                >
                  <option value="">Wählen...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wert (CHF)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDealModal(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveDeal}
                className="btn-primary flex-1"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
