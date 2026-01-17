import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, AlertCircle, Loader2 } from 'lucide-react'
import { Preferences } from '@capacitor/preferences'
import { api } from '../services/api.js'
import './CustomerKeyEntry.css'

const CUSTOMER_TOKEN_KEY = 'customer_token'

export default function CustomerKeyEntry() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState(null)

  // Check for saved token on mount
  useEffect(() => {
    checkSavedToken()
  }, [])

  const checkSavedToken = async () => {
    try {
      const { value } = await Preferences.get({ key: CUSTOMER_TOKEN_KEY })
      if (value) {
        // Validate the saved token
        await validateAndNavigate(value, true)
      }
    } catch (err) {
      console.error('Error checking saved token:', err)
    } finally {
      setLoading(false)
    }
  }

  const validateAndNavigate = async (tokenToValidate, isSaved = false) => {
    setValidating(true)
    setError(null)

    try {
      // Try to fetch customer data to validate token
      await api.getCustomerByToken(tokenToValidate)

      // Token is valid - save it if not already saved
      if (!isSaved) {
        await Preferences.set({ key: CUSTOMER_TOKEN_KEY, value: tokenToValidate })
      }

      // Navigate to customer home
      navigate(`/customer/${tokenToValidate}`, { replace: true })
    } catch (err) {
      // Invalid token
      if (isSaved) {
        // Clear invalid saved token
        await Preferences.remove({ key: CUSTOMER_TOKEN_KEY })
      }
      setError('Clave inválida. Por favor verifica e intenta de nuevo.')
      setValidating(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!token.trim()) {
      setError('Por favor ingresa tu clave de cliente')
      return
    }
    validateAndNavigate(token.trim())
  }

  // Show loading spinner while checking for saved token
  if (loading) {
    return (
      <div className="key-entry-container">
        <div className="key-entry-loading">
          <Loader2 className="spinner" size={48} />
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="key-entry-container">
      <div className="key-entry-card">
        <div className="key-entry-header">
          <div className="key-icon">
            <Key size={48} />
          </div>
          <h1>Breakfast Orders</h1>
          <p>Ingresa tu clave de cliente para acceder a tus pedidos</p>
        </div>

        <form onSubmit={handleSubmit} className="key-entry-form">
          <div className="input-group">
            <label htmlFor="token">Clave de cliente</label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                setError(null)
              }}
              placeholder="Ingresa tu clave aquí"
              disabled={validating}
              autoComplete="off"
              autoCapitalize="off"
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={validating} className="submit-button">
            {validating ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span>Verificando...</span>
              </>
            ) : (
              <span>Acceder</span>
            )}
          </button>
        </form>

        <div className="key-entry-footer">
          <p>¿No tienes una clave? Contacta a tu proveedor para obtenerla.</p>
        </div>
      </div>
    </div>
  )
}

// Helper function to clear saved token (for logout)
export async function clearSavedToken() {
  await Preferences.remove({ key: CUSTOMER_TOKEN_KEY })
}

// Helper function to get saved token
export async function getSavedToken() {
  const { value } = await Preferences.get({ key: CUSTOMER_TOKEN_KEY })
  return value
}
