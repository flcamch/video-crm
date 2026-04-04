'use client'

import { useState, useEffect } from 'react'
import { Contact, Company } from '@/lib/types'

type TabType = 'contacts' | 'companies'

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('contacts')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalType, setModalType] = useState<'contact' | 'company'>('contact')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    company_id: '',
    notes: '',
    name: '',
    industry: '',
    website: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/companies'),
      ])
      const contactsData = await contactsRes.json()
      const companiesData = await companiesRes.json()
      setContacts(contactsData)
      setCompanies(companiesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
    setLoading(false)
  }

  function openModal(type: 'contact' | 'company', data?: any) {
    setModalType(type)
    if (data) {
      setEditingId(data.id)
      if (type === 'contact') {
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || '',
          position: data.position || '',
          company_id: data.company_id || '',
          notes: data.notes || '',
          name: '',
          industry: '',
          website: '',
        })
      } else {
        setFormData({
          name: data.name,
          industry: data.industry || '',
          website: data.website || '',
          notes: data.notes || '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          position: '',
          company_id: '',
        })
      }
    } else {
      setEditingId(null)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        company_id: '',
        notes: '',
        name: '',
        industry: '',
        website: '',
      })
    }
    setShowModal(true)
  }

  async function handleSave() {
    try {
      if (modalType === 'contact') {
        if (editingId) {
          await fetch(`/api/contacts/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })
        } else {
          await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })
        }
      } else {
        if (editingId) {
          await fetch(`/api/companies/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })
        } else {
          await fetch('/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          })
        }
      }
      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  async function handleDelete(id: number, type: 'contact' | 'company') {
    if (!confirm('Möchten Sie diesen Datensatz wirklich löschen?')) return

    try {
      const endpoint = type === 'contact' ? `/api/contacts/${id}` : `/api/companies/${id}`
      await fetch(endpoint, { method: 'DELETE' })
      loadData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const filteredContacts = contacts.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.website?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h1 className="text-3xl font-bold text-gray-900">Kontakte & Firmen</h1>
        <button
          onClick={() => openModal(activeTab === 'contacts' ? 'contact' : 'company')}
          className="btn-primary"
        >
          + Neu
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            activeTab === 'contacts'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Kontakte
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            activeTab === 'companies'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Firmen
        </button>
      </div>

      <div className="card overflow-hidden">
        {activeTab === 'contacts' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Firma</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">E-Mail</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Telefon</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                      Keine Kontakte vorhanden
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => (
                    <tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.company_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.email || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.position || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <button
                          onClick={() => openModal('contact', contact)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id, 'contact')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Branche</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Website</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-600">
                      Keine Firmen vorhanden
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map(company => (
                    <tr key={company.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{company.industry || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{company.website || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right space-x-2">
                        <button
                          onClick={() => openModal('company', company)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDelete(company.id, 'company')}
                          className="text-red-500 hover:text-red-600"
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full md:w-96 bg-white rounded-t-lg shadow-lg p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Bearbeiten' : 'Neu'}
            </h2>

            {modalType === 'contact' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
                  <select
                    value={formData.company_id}
                    onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Keine</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branche</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
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
