import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { api } from '../services/api'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import SearchInput from '../components/SearchInput'

export default function CreateSale() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, customersData] = await Promise.all([
        api.getProducts(),
        api.getCustomers()
      ])
      setProducts(productsData)
      setCustomers(customersData)

      if (id) {
        const sale = await api.getSale(id)
        setDate(sale.date)
        const customerSales = sale.customer_sales.map(cs => {
          const customer = customersData.find(c => c.id === cs.customer_id)
          return {
            customer,
            products: cs.products.map(p => ({
              product_id: p.product_id,
              quantity: p.quantity,
              product: productsData.find(pr => pr.id === p.product_id)
            }))
          }
        })
        setSelectedCustomers(customerSales)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const addCustomer = (customer) => {
    if (selectedCustomers.find(sc => sc.customer.id === customer.id)) return
    setSelectedCustomers([...selectedCustomers, { customer, products: [] }])
    setCustomerSearch('')
  }

  const removeCustomer = (customerId) => {
    setSelectedCustomers(selectedCustomers.filter(sc => sc.customer.id !== customerId))
  }

  const addProduct = (customerIndex, product) => {
    const updated = [...selectedCustomers]
    if (!updated[customerIndex].products.find(p => p.product_id === product.id)) {
      updated[customerIndex].products.push({ product_id: product.id, quantity: 1, product })
      setSelectedCustomers(updated)
    }
  }

  const updateQuantity = (customerIndex, productIndex, quantity) => {
    const updated = [...selectedCustomers]
    updated[customerIndex].products[productIndex].quantity = parseInt(quantity) || 0
    setSelectedCustomers(updated)
  }

  const removeProduct = (customerIndex, productIndex) => {
    const updated = [...selectedCustomers]
    updated[customerIndex].products.splice(productIndex, 1)
    setSelectedCustomers(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = {
      date,
      customer_sales: selectedCustomers.map(sc => ({
        customer_id: sc.customer.id,
        products: sc.products.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity
        }))
      }))
    }

    try {
      if (id) {
        await api.updateSale(id, data)
      } else {
        await api.createSale(data)
      }
      navigate('/sales')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c =>
    !selectedCustomers.find(sc => sc.customer.id === c.id) &&
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <Link to="/sales"><Button variant="secondary"><ArrowLeft size={16} /> Back</Button></Link>
      </div>

      <Card title={id ? 'Edit Sale' : 'Create Sale'}>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <Input type="date" label="Sale Date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <h3>Add Customers</h3>
            <SearchInput value={customerSearch} onChange={setCustomerSearch} placeholder="Search customers..." />
            {customerSearch && filteredCustomers.length > 0 && (
              <div className="search-results">
                {filteredCustomers.slice(0, 5).map(customer => (
                  <div key={customer.id} className="search-result-item" onClick={() => addCustomer(customer)}>
                    {customer.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedCustomers.map((sc, cidx) => (
            <div key={sc.customer.id} className="customer-block">
              <div className="customer-block-header">
                <h4>{sc.customer.name}</h4>
                <button type="button" onClick={() => removeCustomer(sc.customer.id)} className="remove-btn">
                  <X size={16} />
                </button>
              </div>

              <div className="products-section">
                <select onChange={(e) => {
                  const product = products.find(p => p.id === parseInt(e.target.value))
                  if (product) addProduct(cidx, product)
                  e.target.value = ''
                }} className="product-select">
                  <option value="">Select product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.sell_price}</option>
                  ))}
                </select>

                <div className="selected-products">
                  {sc.products.map((sp, pidx) => (
                    <div key={pidx} className="product-item">
                      <span>{sp.product.name}</span>
                      <input
                        type="number"
                        min="1"
                        value={sp.quantity}
                        onChange={(e) => updateQuantity(cidx, pidx, e.target.value)}
                        className="quantity-input"
                      />
                      <button type="button" onClick={() => removeProduct(cidx, pidx)} className="remove-btn">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/sales')}>Cancel</Button>
            <Button type="submit" loading={loading}>{id ? 'Update Sale' : 'Create Sale'}</Button>
          </div>
        </form>
      </Card>

      <style>{`
        .page-header { margin-bottom: var(--spacing-xl); }
        .error-message { padding: var(--spacing-md); background: var(--color-danger-bg); color: var(--color-danger); border-radius: var(--radius-md); margin-bottom: var(--spacing-lg); }
        .search-results { background: var(--color-surface-hover); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-top: var(--spacing-sm); max-height: 200px; overflow-y: auto; }
        .search-result-item { padding: var(--spacing-md); cursor: pointer; border-bottom: 1px solid var(--color-border); }
        .search-result-item:hover { background: var(--color-surface); }
        .customer-block { background: var(--color-surface-hover); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--spacing-lg); margin-bottom: var(--spacing-md); }
        .customer-block-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); }
        .customer-block-header h4 { margin: 0; }
        .remove-btn { background: var(--color-danger-bg); color: var(--color-danger); padding: var(--spacing-xs); border-radius: var(--radius-sm); }
        .remove-btn:hover { background: var(--color-danger); color: white; }
        .product-select { width: 100%; padding: var(--spacing-md); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text); margin-bottom: var(--spacing-md); }
        .selected-products { display: flex; flex-direction: column; gap: var(--spacing-sm); }
        .product-item { display: flex; align-items: center; gap: var(--spacing-md); background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-sm); }
        .product-item span { flex: 1; }
        .quantity-input { width: 80px; padding: var(--spacing-sm); background: var(--color-surface-hover); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text); }
      `}</style>
    </div>
  )
}
