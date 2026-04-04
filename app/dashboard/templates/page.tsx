'use client'

import { useState, useEffect } from 'react'
import { EmailTemplate } from '@/lib/types'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    setLoading(true)
    try {
      const res = await fetch('/api/templates')
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
    setLoading(false)
  }

  function openModal(template?: EmailTemplate) {
    if (template) {
      setEditingId(template.id)
      setFormData({
        name: template.name,
        subject: template.subject,
        body: template.body,
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        subject: '',
        body: '',
      })
    }
    setShowModal(true)
  }

  async function handleSave() {
    try {
      if (editingId) {
        await fetch(`/api/templates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      setShowModal(false)
      loadTemplates()
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Möchten Sie diese Vorlage wirklich löschen?')) return

    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      loadTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
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
        <h1 className="text-3xl font-bold text-gray-900">E-Mail Vorlagen</h1>
        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          + Neue Vorlage
        </button>
      </div>

      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="card p-6 text-center text-gray-600">
            Keine Vorlagen vorhanden
          </div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="card p-4">
              <button
                onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                className="w-full text-left flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">Betreff: {template.subject}</p>
                </div>
                <span className="text-gray-400 ml-4">
                  {expandedId === template.id ? '▼' : '▶'}
                </span>
              </button>

              {expandedId === template.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-1">BETREFF</p>
                    <p className="text-gray-900">{template.subject}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-1">INHALT</p>
                    <p className="text-gray-900 whitespace-pre-wrap text-sm">{template.body}</p>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Verfügbare Platzhalter: {'{{'}{'{'}'}vorname{'{'}'}'}{'}}'}}, {'{{'}{'{'}'}nachname{'{'}'}{'}}'}}, {'{{'}{'{'}'}firma{'{'}'}{'}}'}}, {'{{'}{'{'}'}titel{'{}'}{'}}'}}'}}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(template)}
                      className="btn-secondary"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="btn-danger"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full md:w-96 bg-white rounded-t-lg shadow-lg p-6 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="z.B. Welcome Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Betreff</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                  placeholder="z.B. Willkommen {{vorname}}!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="input"
                  placeholder="Inhalt..."
                  rows={8}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Verfügbare Platzhalter: {'{{vorname}}'}, {'{{nachname}}'}, {'{{firma}}'}, {'{{titel}}'}
                </p>
              </div>
            </div>

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
