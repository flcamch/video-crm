'use client'

import { useState, useEffect } from 'react'
import { Contact, Company, Deal, Activity } from '@/lib/types'
import Typeahead from '@/components/Typeahead'

type Tab = 'overview' | 'activities' | 'deals'
type ContactOrCompany = Contact | Company | null

interface NewContactForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  position: string
  company: { id: number; label: string } | null
  notes: string
}

interface NewActivityForm {
  type: 'call' | 'email' | 'meeting' | 'note'
  title: string
  note: string
}

const ACTIVITY_ICONS: Record<string, string> = {
  call: '📞',
  email: '📧',
  meeting: '🤝',
  note: '📝',
}

export default function ContactsPage() {
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [selectedTab, setSelectedTab] = useState<Tab>('overview')
  const [activeListTab, setActiveListTab] = useState<'contacts' | 'companies'>('contacts')
  const [searchTerm, setSearchTerm] = useState('')

  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  const [loading, setLoading] = useState(true)
  const [showNewContactModal, setShowNewContactModal] = useState(false)

  const [newContactForm, setNewContactForm] = useState<NewContactForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    company: null,
    notes: '',
  })

  const [editingFields, setEditingFields] = useState<Record<string, string>>({})
  const [newActivityForm, setNewActivityForm] = useState<NewActivityForm>({
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
      const [contactsRes, companiesRes, dealsRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/companies'),
        fetch('/api/deals'),
      ])
      const contactsData = await contactsRes.json()
      const companiesData = await companiesRes.json()
      const dealsData = await dealsRes.json()

      setContacts(contactsData)
      setCompanies(companiesData)
      setDeals(dealsData)

      // Load activities for selected contact
      if (selectedContactId) {
        const activitiesRes = await fetch(`/api/activities?contact_id=${selectedContactId}`)
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  async function loadActivitiesForContact(contactId: number) {
    try {
      const res = await fetch(`/api/activities?contact_id=${contactId}`)
      const data = await res.json()
      setActivities(data)
    } catch (error) {
      console.error('Failed to load activities:', error)
    }
  }

  const selectedContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null

  function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  function handleSelectContact(contactId: number) {
    setSelectedContactId(contactId)
    setSelectedTab('overview')
    loadActivitiesForContact(contactId)
  }

  async function handleCreateNewContact() {
    if (!newContactForm.first_name || !newContactForm.last_name) return

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: newContactForm.first_name,
          last_name: newContactForm.last_name,
          email: newContactForm.email || null,
          phone: newContactForm.phone || null,
          position: newContactForm.position || null,
          company_id: newContactForm.company?.id || null,
          notes: newContactForm.notes || null,
        }),
      })
      const newContact = await res.json()
      setNewContactForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        company: null,
        notes: '',
      })
      setShowNewContactModal(false)
      loadData()
      handleSelectContact(newContact.id)
    } catch (error) {
      console.error('Failed to create contact:', error)
    }
  }

  async function handleUpdateContactField(field: string, value: any) {
    if (!selectedContact) return

    try {
      await fetch(`/api/contacts/${selectedContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      loadData()
      loadActivitiesForContact(selectedContact.id)
      setEditingFields({})
    } catch (error) {
      console.error('Failed to update contact:', error)
    }
  }

  async function handleAddActivity() {
    if (!selectedContact || !newActivityForm.title.trim()) return

    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedContact.id,
          type: newActivityForm.type,
          title: newActivityForm.title,
          note: newActivityForm.note || undefined,
        }),
      })
      setNewActivityForm({ type: 'note', title: '', note: '' })
      loadActivitiesForContact(selectedContact.id)
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
      setNewContactForm(prev => ({
        ...prev,
        company: { id: newCompany.id, label: newCompany.name },
      }))
    } catch (error) {
      console.error('Failed to create company:', error)
    }
  }

  const filteredContacts = contacts.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const contactDealCount = (contactId: number) => deals.filter(d => d.contact_id === contactId).length
  const contactDeals = selectedContact ? deals.filter(d => d.contact_id === selectedContact.id) : []

  const companyOptions = companies.map(c => ({ id: c.id, label: c.name }))

  return (
    <div className="flex h-screen bg-white">
      {/* Left Panel - List */}
      <div className="w-96 border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Kontakte</h1>
            <button
              onClick={() => setShowNewContactModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              + Neu
            </button>
          </div>

          <input
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveListTab('contacts')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeListTab === 'contacts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Kontakte
          </button>
          <button
            onClick={() => setActiveListTab('companies')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeListTab === 'companies'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Firmen
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeListTab === 'contacts' ? (
            filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <p className="text-sm">Keine Kontakte gefunden</p>
              </div>
            ) : (
              <div className="space-y-1 p-3">
                {filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelectContact(contact.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedContactId === contact.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                        {getInitials(contact.first_name, contact.last_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {contact.first_name} {contact.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {contact.company_name || 'Keine Firma'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {contactDealCount(contact.id)} Deal{contactDealCount(contact.id) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            filteredCompanies.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                <p className="text-sm">Keine Firmen gefunden</p>
              </div>
            ) : (
              <div className="space-y-1 p-3">
                {filteredCompanies.map(company => (
                  <div
                    key={company.id}
                    className="px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-900"
                  >
                    <p className="font-medium text-sm">{company.name}</p>
                    <p className="text-xs text-gray-500">{company.industry || 'Keine Branche'}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Right Panel - Detail */}
      <div className="flex-1 flex flex-col">
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">Kontakt auswählen</p>
              <p className="text-sm">Wählen Sie einen Kontakt aus, um Details zu sehen</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-2xl flex-shrink-0">
                  {getInitials(selectedContact.first_name, selectedContact.last_name)}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedContact.position || 'Position'}</p>
                  <p className="text-gray-500 text-sm mt-1">{selectedContact.company_name || 'Keine Firma'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  📞 Anrufen
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  📧 E-Mail
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  📝 Notiz
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-8">
                {(['overview', 'activities', 'deals'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`py-4 px-1 font-medium text-sm transition-colors border-b-2 ${
                      selectedTab === tab
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    {tab === 'overview' && 'Übersicht'}
                    {tab === 'activities' && 'Aktivitäten'}
                    {tab === 'deals' && 'Deals'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTab === 'overview' && (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">EMAIL</p>
                    {editingFields['email'] !== undefined ? (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={editingFields['email']}
                          onChange={(e) => setEditingFields(prev => ({ ...prev, email: e.target.value }))}
                          className="flex-1 border border-blue-500 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => {
                            handleUpdateContactField('email', editingFields['email'])
                          }}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => setEditingFields(prev => ({ ...prev, email: selectedContact.email || '' }))}
                        className="text-gray-900 cursor-pointer hover:text-blue-600 py-2"
                      >
                        {selectedContact.email || '- Klicken um zu bearbeiten'}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">TELEFON</p>
                    {editingFields['phone'] !== undefined ? (
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          value={editingFields['phone']}
                          onChange={(e) => setEditingFields(prev => ({ ...prev, phone: e.target.value }))}
                          className="flex-1 border border-blue-500 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => {
                            handleUpdateContactField('phone', editingFields['phone'])
                          }}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => setEditingFields(prev => ({ ...prev, phone: selectedContact.phone || '' }))}
                        className="text-gray-900 cursor-pointer hover:text-blue-600 py-2"
                      >
                        {selectedContact.phone || '- Klicken um zu bearbeiten'}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">POSITION</p>
                    {editingFields['position'] !== undefined ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingFields['position']}
                          onChange={(e) => setEditingFields(prev => ({ ...prev, position: e.target.value }))}
                          className="flex-1 border border-blue-500 rounded px-3 py-2 text-sm"
                        />
                        <button
                          onClick={() => {
                            handleUpdateContactField('position', editingFields['position'])
                          }}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => setEditingFields(prev => ({ ...prev, position: selectedContact.position || '' }))}
                        className="text-gray-900 cursor-pointer hover:text-blue-600 py-2"
                      >
                        {selectedContact.position || '- Klicken um zu bearbeiten'}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">FIRMA</p>
                    <p className="text-gray-900 py-2">{selectedContact.company_name || '- Keine Firma'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1 font-medium">NOTIZEN</p>
                    {editingFields['notes'] !== undefined ? (
                      <div className="flex gap-2">
                        <textarea
                          value={editingFields['notes']}
                          onChange={(e) => setEditingFields(prev => ({ ...prev, notes: e.target.value }))}
                          className="flex-1 border border-blue-500 rounded px-3 py-2 text-sm"
                          rows={3}
                        />
                        <button
                          onClick={() => {
                            handleUpdateContactField('notes', editingFields['notes'])
                          }}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 h-fit"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => setEditingFields(prev => ({ ...prev, notes: selectedContact.notes || '' }))}
                        className="text-gray-900 cursor-pointer hover:text-blue-600 py-2 whitespace-pre-wrap"
                      >
                        {selectedContact.notes || '- Klicken um Notizen hinzuzufügen'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedTab === 'activities' && (
                <div className="space-y-4 max-w-2xl">
                  {/* Activity List */}
                  <div className="space-y-2">
                    {activities.length === 0 ? (
                      <p className="text-gray-500 text-sm">Keine Aktivitäten</p>
                    ) : (
                      activities.map(activity => (
                        <div key={activity.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <span className="text-lg">{ACTIVITY_ICONS[activity.type] || '📝'}</span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.title}</p>
                              {activity.note && (
                                <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(activity.created_at).toLocaleDateString('de-CH')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Activity Form */}
                  <div className="border border-gray-200 rounded-lg p-4 mt-6 bg-gray-50 space-y-3">
                    <p className="font-medium text-gray-900 text-sm">Neue Aktivität</p>
                    <select
                      value={newActivityForm.type}
                      onChange={(e) => setNewActivityForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
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
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    />
                    <textarea
                      placeholder="Notiz (optional)..."
                      value={newActivityForm.note}
                      onChange={(e) => setNewActivityForm(prev => ({ ...prev, note: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={handleAddActivity}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              )}

              {selectedTab === 'deals' && (
                <div className="space-y-3 max-w-2xl">
                  {contactDeals.length === 0 ? (
                    <p className="text-gray-500 text-sm">Keine Deals für diesen Kontakt</p>
                  ) : (
                    contactDeals.map(deal => (
                      <div key={deal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <p className="font-medium text-gray-900">{deal.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{deal.company_name || 'Keine Firma'}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {STAGES.find(s => s.id === deal.stage)?.label || deal.stage}
                          </span>
                          <p className="font-bold text-blue-600">CHF {deal.value?.toLocaleString('de-CH') || '0'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Neuer Kontakt</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                <input
                  type="text"
                  value={newContactForm.first_name}
                  onChange={(e) => setNewContactForm(prev => ({ ...prev, first_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                <input
                  type="text"
                  value={newContactForm.last_name}
                  onChange={(e) => setNewContactForm(prev => ({ ...prev, last_name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={newContactForm.email}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={newContactForm.phone}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                value={newContactForm.position}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, position: e.target.value }))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
              <Typeahead
                items={companyOptions}
                value={newContactForm.company?.label || ''}
                onChange={(val) => {
                  const matching = companyOptions.find(c => c.label === val)
                  if (!matching) {
                    setNewContactForm(prev => ({ ...prev, company: null }))
                  }
                }}
                onSelect={(item) => {
                  setNewContactForm(prev => ({ ...prev, company: item }))
                }}
                onCreateNew={handleCreateCompany}
                createLabel="Neue Firma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
              <textarea
                value={newContactForm.notes}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowNewContactModal(false)
                  setNewContactForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    position: '',
                    company: null,
                    notes: '',
                  })
                }}
                className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateNewContact}
                disabled={!newContactForm.first_name || !newContactForm.last_name}
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

const STAGES = [
  { id: 'lead', label: 'Lead' },
  { id: 'beratung', label: 'Beratung' },
  { id: 'offerte', label: 'Offerte gesendet' },
  { id: 'gewonnen', label: 'Gewonnen' },
  { id: 'verloren', label: 'Verloren' },
]
