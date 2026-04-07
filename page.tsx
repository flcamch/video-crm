'use client'

import { useState, useEffect } from 'react'
import { Deal, Contact, Company, Activity } from '@/lib/types'
import Typeahead from '@/components/Typeahead'

const STAGES = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-100', accent: '#6B7280' },
  { id: 'beratung', label: 'Beratung', color: 'bg-blue-50', accent: '#2563EB' },
  { id: 'offerte', label: 'Offerte gesendet', color: 'bg-amber-50', accent: '#D97706' },
  { id: 'gewonnen', label: 'Gewonnen', color: 'bg-green-50', accent: '#16A34A' },
  { id: 'verloren', label: 'Verloren', color: 'bg-red-50', accent: '#DC2626' },
]

const ACTIVITY_ICONS: Record<string, string> = {
  call: '📞',
  email: '📧',
  meeting: '🤝',
  note: '📝',
}

interface NewDealForm {
  title: string
  company: { id: number; label: string } | null
  contact: { id: number; label: string } | null
  value: string
  stage: string
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [activities, setActivities] = useState<Record<number, Activity[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [draggedDealId, setDraggedDealId] = useState<number | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)

  const [newDealForm, setNewDealForm] = useState<NewDealForm>({
    title: '',
    company: null,
    contact: null,
    value: '',
    stage: 'lead',
  })

  const [editingDealTitle, setEditingDealTitle] = useState<number | null>(null)
  const [editingDealValue, setEditingDealValue] = useState<number | null>(null)
  const [editingDealNotes, setEditingDealNotes] = useState<number | null>(null)
  const [tempEditValues, setTempEditValues] = useState<Record<string, string>>({})

  const [newActivityForm, setNewActivityForm] = useState<{
    type: 'call' | 'email' | 'meeting' | 'note'
    title: string
    note: string
  }>({
    type: 'note',
    title: '',
    note: '',
  })

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

      // Load activities for selected deal
      if (selectedDealId) {
        const selectedDeal = dealsData.find((d: Deal) => d.id === selectedDealId)
        if (selectedDeal) {
          const activitiesRes = await fetch(`/api/activities?deal_id=${selectedDealId}`)
          const activitiesData = await activitiesRes.json()
          setActivities(prev => ({ ...prev, [selectedDealId]: activitiesData }))
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  async function loadActivitiesForDeal(dealId: number) {
    try {
      const res = await fetch(`/api/activities?deal_id=${dealId}`)
      const data = await res.json()
      setActivities(prev => ({ ...prev, [dealId]: data }))
    } catch (error) {
      console.error('Failed to load activities:', error)
    }
  }

  function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  function getSelectedDeal(): Deal | null {
    return deals.find(d => d.id === selectedDealId) || null
  }

  function handleDragStart(e: React.DragEvent, dealId: number) {
    setDraggedDealId(dealId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleDrop(e: React.DragEvent, stageId: string) {
    e.preventDefault()
    if (!draggedDealId) return

    try {
      await fetch(`/api/deals/${draggedDealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: stageId }),
      })
      setDraggedDealId(null)
      setDragOverStage(null)
      loadData()
    } catch (error) {
      console.error('Failed to update deal stage:', error)
    }
  }

  async function handleCreateNewDeal() {
    if (!newDealForm.title || !newDealForm.company || !newDealForm.contact) return

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDealForm.title,
          company_id: newDealForm.company.id,
          contact_id: newDealForm.contact.id,
          value: newDealForm.value ? parseFloat(newDealForm.value) : 0,
          stage: newDealForm.stage,
        }),
      })
      const newDeal = await res.json()
      setNewDealForm({ title: '', company: null, contact: null, value: '', stage: 'lead' })
      setShowNewDealModal(false)
      loadData()
      setSelectedDealId(newDeal.id)
    } catch (error) {
      console.error('Failed to create deal:', error)
    }
  }

  async function handleUpdateDealTitle(dealId: number, newTitle: string) {
    if (!newTitle.trim()) return
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })
      setEditingDealTitle(null)
      loadData()
    } catch (error) {
      console.error('Failed to update deal:', error)
    }
  }

  async function handleUpdateDealValue(dealId: number, newValue: string) {
    if (!newValue.trim()) return
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: parseFloat(newValue) }),
      })
      setEditingDealValue(null)
      loadData()
    } catch (error) {
      console.error('Failed to update deal:', error)
    }
  }

  async function handleUpdateDealNotes(dealId: number, newNotes: string) {
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNotes }),
      })
      setEditingDealNotes(null)
      loadData()
    } catch (error) {
      console.error('Failed to update deal:', error)
    }
  }

  async function handleAddActivity() {
    if (!selectedDealId || !newActivityForm.title.trim()) return

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: selectedDealId,
          type: newActivityForm.type,
          title: newActivityForm.title,
          note: newActivityForm.note || undefined,
        }),
      })
      setNewActivityForm({ type: 'note', title: '', note: '' })
      loadActivitiesForDeal(selectedDealId)
    } catch (error) {
      console.error('Failed to add activity:', error)
    }
  }

  async function handleCreateCompany(companyName: string) {
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: companyName }),
      })
      const newCompany = await res.json()
      setCompanies(prev => [...prev, newCompany])
      setNewDealForm(prev => ({
        ...prev,
        company: { id: newCompany.id, label: newCompany.name },
      }))
    } catch (error) {
      console.error('Failed to create company:', error)
    }
  }

  async function handleCreateContact(contactName: string) {
    const [firstName, ...lastNameParts] = contactName.split(' ')
    const lastName = lastNameParts.join(' ') || 'Mustermann'

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: '',
          company_id: newDealForm.company?.id || null,
        }),
      })
      const newContact = await res.json()
      setContacts(prev => [...prev, newContact])
      setNewDealForm(prev => ({
        ...prev,
        contact: { id: newContact.id, label: `${newContact.first_name} ${newContact.last_name}` },
      }))
    } catch (error) {
      console.error('Failed to create contact:', error)
    }
  }

  const selectedDeal = getSelectedDeal()
  const stageDeals = (stageId: string) => deals.filter(d => d.stage === stageId)
  const stageTotalValue = (stageId: string) => stageDeals(stageId).reduce((sum, d) => sum + (d.value || 0), 0)

  const companyOptions = companies.map(c => ({ id: c.id, label: c.name }))
  const contactOptions = contacts.map(c => ({ id: c.id, label: `${c.first_name} ${c.last_name}` }))

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Pipeline Kanban */}
      <div className="flex-1 overflow-x-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Pipeline</h1>
            <button
              onClick={() => setShowNewDealModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Neuer Deal
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {STAGES.map(stage => (
              <div key={stage.id} className="flex flex-col">
                <div
                  className={`${stage.color} px-4 py-3 rounded-t-lg border-b-2`}
                  style={{ borderBottomColor: stage.accent }}
                >
                  <h3 className="font-bold text-sm text-gray-900">{stage.label}</h3>
                  <p className="text-xs text-gray-600 mt-1">{stageDeals(stage.id).length} Deal(s)</p>
                  <p className="text-xs font-semibold text-gray-700 mt-2">
                    CHF {stageTotalValue(stage.id).toLocaleString('de-CH')}
                  </p>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`flex-1 bg-gray-50 rounded-b-lg p-4 space-y-3 min-h-96 transition-all ${
                    dragOverStage === stage.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onDragEnter={() => setDragOverStage(stage.id)}
                  onDragLeave={() => setDragOverStage(null)}
                >
                  {stageDeals(stage.id).map(deal => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      onClick={() => {
                        setSelectedDealId(deal.id)
                        loadActivitiesForDeal(deal.id)
                      }}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow border border-gray-200"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg mt-0.5">⠿</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{deal.title}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{deal.company_name || 'No company'}</p>
                      <p className="text-xs text-gray-600">{deal.contact_name || 'No contact'}</p>
                      <p className="font-bold text-blue-600 text-sm mt-2">CHF {deal.value?.toLocaleString('de-CH') || '0'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Slide-over Panel */}
      {selectedDeal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black bg-opacity-20"
            onClick={() => {
              setSelectedDealId(null)
              setEditingDealTitle(null)
              setEditingDealValue(null)
              setEditingDealNotes(null)
            }}
          ></div>
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-xl border-l border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                {editingDealTitle === selectedDeal.id ? (
                  <input
                    type="text"
                    value={tempEditValues[`title-${selectedDeal.id}`] || selectedDeal.title}
                    onChange={(e) => setTempEditValues(prev => ({ ...prev, [`title-${selectedDeal.id}`]: e.target.value }))}
                    onBlur={() => {
                      handleUpdateDealTitle(selectedDeal.id, tempEditValues[`title-${selectedDeal.id}`] || selectedDeal.title)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateDealTitle(selectedDeal.id, tempEditValues[`title-${selectedDeal.id}`] || selectedDeal.title)
                      }
                    }}
                    autoFocus
                    className="flex-1 text-2xl font-bold border border-blue-500 rounded px-2 py-1"
                  />
                ) : (
                  <h2
                    onClick={() => {
                      setEditingDealTitle(selectedDeal.id)
                      setTempEditValues(prev => ({ ...prev, [`title-${selectedDeal.id}`]: selectedDeal.title }))
                    }}
                    className="text-2xl font-bold text-gray-900 flex-1 cursor-pointer hover:text-blue-600"
                  >
                    {selectedDeal.title}
                  </h2>
                )}
                <button
                  onClick={() => {
                    setSelectedDealId(null)
                    setEditingDealTitle(null)
                    setEditingDealValue(null)
                    setEditingDealNotes(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Stage Badge */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Stage</p>
                <select
                  value={selectedDeal.stage}
                  onChange={(e) => {
                    fetch(`/api/deals/${selectedDeal.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ stage: e.target.value }),
                    }).then(() => loadData())
                  }}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STAGES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Company & Contact */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">💼 Firma</p>
                  <p className="font-medium text-gray-900">{selectedDeal.company_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">👤 Kontakt</p>
                  <p className="font-medium text-gray-900">{selectedDeal.contact_name || '-'}</p>
                </div>
              </div>

              {/* Value */}
              <div>
                <p className="text-xs text-gray-600 mb-2">💰 Wert</p>
                {editingDealValue === selectedDeal.id ? (
                  <input
                    type="number"
                    value={tempEditValues[`value-${selectedDeal.id}`] || selectedDeal.value}
                    onChange={(e) => setTempEditValues(prev => ({ ...prev, [`value-${selectedDeal.id}`]: e.target.value }))}
                    onBlur={() => {
                      handleUpdateDealValue(selectedDeal.id, tempEditValues[`value-${selectedDeal.id}`] || '0')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateDealValue(selectedDeal.id, tempEditValues[`value-${selectedDeal.id}`] || '0')
                      }
                    }}
                    autoFocus
                    className="w-full border border-blue-500 rounded px-3 py-2"
                  />
                ) : (
                  <p
                    onClick={() => {
                      setEditingDealValue(selectedDeal.id)
                      setTempEditValues(prev => ({ ...prev, [`value-${selectedDeal.id}`]: String(selectedDeal.value || 0) }))
                    }}
                    className="font-bold text-blue-600 text-lg cursor-pointer hover:text-blue-700"
                  >
                    CHF {selectedDeal.value?.toLocaleString('de-CH') || '0'}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-gray-600 mb-2">📝 Notizen</p>
                {editingDealNotes === selectedDeal.id ? (
                  <textarea
                    value={tempEditValues[`notes-${selectedDeal.id}`] || selectedDeal.notes || ''}
                    onChange={(e) => setTempEditValues(prev => ({ ...prev, [`notes-${selectedDeal.id}`]: e.target.value }))}
                    onBlur={() => {
                      handleUpdateDealNotes(selectedDeal.id, tempEditValues[`notes-${selectedDeal.id}`] || '')
                    }}
                    autoFocus
                    rows={3}
                    className="w-full border border-blue-500 rounded px-3 py-2"
                  />
                ) : (
                  <p
                    onClick={() => {
                      setEditingDealNotes(selectedDeal.id)
                      setTempEditValues(prev => ({ ...prev, [`notes-${selectedDeal.id}`]: selectedDeal.notes || '' }))
                    }}
                    className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 p-3 bg-gray-50 rounded"
                  >
                    {selectedDeal.notes || 'Klicken um Notizen hinzuzufügen...'}
                  </p>
                )}
              </div>

              {/* Activities */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-600 mb-3 font-medium">📅 Aktivitäten</p>

                {/* Activity List */}
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {(activities[selectedDeal.id] || []).map(activity => (
                    <div key={activity.id} className="text-sm border border-gray-200 rounded p-2 bg-gray-50">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{ACTIVITY_ICONS[activity.type] || '📝'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                          {activity.note && (
                            <p className="text-xs text-gray-600 mt-1 break-words">{activity.note}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleDateString('de-CH')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Activity Form */}
                <div className="space-y-2 p-3 bg-gray-50 rounded">
                  <select
                    value={newActivityForm.type}
                    onChange={(e) => setNewActivityForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="note">📝 Notiz</option>
                    <option value="call">📞 Anruf</option>
                    <option value="email">📧 E-Mail</option>
                    <option value="meeting">🤝 Meeting</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Aktivitätsname..."
                    value={newActivityForm.title}
                    onChange={(e) => setNewActivityForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <textarea
                    placeholder="Notiz (optional)..."
                    value={newActivityForm.note}
                    onChange={(e) => setNewActivityForm(prev => ({ ...prev, note: e.target.value }))}
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                  />
                  <button
                    onClick={handleAddActivity}
                    className="w-full text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Deal Modal */}
      {showNewDealModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Neuer Deal</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={newDealForm.title}
                onChange={(e) => setNewDealForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Deal-Titel"
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <Typeahead
                items={companyOptions}
                value={newDealForm.company?.label || ''}
                onChange={(val) => {
                  const matching = companyOptions.find(c => c.label === val)
                  if (!matching) {
                    setNewDealForm(prev => ({ ...prev, company: null }))
                  }
                }}
                onSelect={(item) => {
                  setNewDealForm(prev => ({ ...prev, company: item }))
                }}
                onCreateNew={handleCreateCompany}
                createLabel="Neue Firma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kontakt</label>
              <Typeahead
                items={contactOptions}
                value={newDealForm.contact?.label || ''}
                onChange={(val) => {
                  const matching = contactOptions.find(c => c.label === val)
                  if (!matching) {
                    setNewDealForm(prev => ({ ...prev, contact: null }))
                  }
                }}
                onSelect={(item) => {
                  setNewDealForm(prev => ({ ...prev, contact: item }))
                }}
                onCreateNew={handleCreateContact}
                createLabel="Neuer Kontakt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wert (CHF)</label>
              <input
                type="number"
                value={newDealForm.value}
                onChange={(e) => setNewDealForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select
                value={newDealForm.stage}
                onChange={(e) => setNewDealForm(prev => ({ ...prev, stage: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowNewDealModal(false)
                  setNewDealForm({ title: '', company: null, contact: null, value: '', stage: 'lead' })
                }}
                className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateNewDeal}
                disabled={!newDealForm.title || !newDealForm.company || !newDealForm.contact}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
