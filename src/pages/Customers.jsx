import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import SearchInput from '../components/SearchInput'
import './DataTable.css'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    const filtered = customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers()
      setCustomers(data)
      setFilteredCustomers(data)
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData(customer)
    } else {
      setEditingCustomer(null)
      setFormData({ name: '', address: '', phone: '' })
    }
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, formData)
      } else {
        await api.createCustomer(formData)
      }
      await loadCustomers()
      setModalOpen(false)
    } catch (error) {
      setFormError(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    try {
      await api.deleteCustomer(id)
      await loadCustomers()
    } catch (error) {
      alert('Failed to delete customer')
    }
  }

  const openCustomerPage = (customer) => {
    if (customer.access_token && customer.access_token.access_token) {
      const url = `/customer/${customer.access_token.access_token}`
      window.open(url, '_blank')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <Card 
        title="Customers" 
        action={<Button onClick={() => openModal()}><Plus size={16} /> Add Customer</Button>}
      >
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search customers..." />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.address || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>
                    <div className="actions">
                      {customer.access_token && (
                        <button 
                          onClick={() => openCustomerPage(customer)} 
                          className="action-btn success"
                          title="View customer page"
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}
                      <button onClick={() => openModal(customer)} className="action-btn"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(customer.id)} className="action-btn danger"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && <div className="empty-state">No customers found</div>}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {formError && <div className="error-message">{formError}</div>}
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingCustomer ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
