import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import SearchInput from '../components/SearchInput'
import './DataTable.css'

export default function Products() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', buy_price: '', sell_price: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const loadProducts = async () => {
    try {
      const data = await api.getProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData(product)
    } else {
      setEditingProduct(null)
      setFormData({ name: '', description: '', buy_price: '', sell_price: '' })
    }
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    try {
      const data = {
        ...formData,
        buy_price: parseFloat(formData.buy_price),
        sell_price: parseFloat(formData.sell_price)
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data)
      } else {
        await api.createProduct(data)
      }
      
      await loadProducts()
      setModalOpen(false)
    } catch (error) {
      setFormError(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.deleteProduct(id)
      await loadProducts()
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <Card 
        title="Products" 
        action={<Button onClick={() => openModal()}><Plus size={16} /> Add Product</Button>}
      >
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search products..." />
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Profit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.description || '-'}</td>
                  <td>€{product.buy_price.toFixed(2)}</td>
                  <td>€{product.sell_price.toFixed(2)}</td>
                  <td className="profit">€{(product.sell_price - product.buy_price).toFixed(2)}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => openModal(product)} className="action-btn"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="action-btn danger"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && <div className="empty-state">No products found</div>}
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {formError && <div className="error-message">{formError}</div>}
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Input label="Buy Price" type="number" step="0.01" value={formData.buy_price} onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })} required />
          <Input label="Sell Price" type="number" step="0.01" value={formData.sell_price} onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })} required />
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingProduct ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}