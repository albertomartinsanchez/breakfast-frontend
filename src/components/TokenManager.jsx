import React, { useState } from 'react'
import { Link2, Copy, Check, RefreshCw } from 'lucide-react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { api } from '../services/api'
import './TokenManager.css'

export default function TokenManager({ saleId, saleStatus }) {
  const [showModal, setShowModal] = useState(false)
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(false)
  const [copiedToken, setCopiedToken] = useState(null)

  const canGenerateTokens = saleStatus === 'draft'

  const handleGenerateTokens = async () => {
    setLoading(true)
    try {
      const result = await api.generateTokens(saleId)
      setTokens(result.tokens)
      setShowModal(true)
    } catch (error) {
      alert('Failed to generate tokens: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewTokens = async () => {
    setLoading(true)
    try {
      const result = await api.getSaleTokens(saleId)
      setTokens(result)
      setShowModal(true)
    } catch (error) {
      alert('Failed to load tokens: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (token, url) => {
    const fullUrl = `${window.location.origin}${url}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (error) {
      alert('Failed to copy to clipboard')
    }
  }

  const copyAllUrls = async () => {
    const urls = tokens.map(t => {
      const fullUrl = `${window.location.origin}${t.access_url}`
      return `${t.customer_name}: ${fullUrl}`
    }).join('\n\n')
    
    try {
      await navigator.clipboard.writeText(urls)
      setCopiedToken('all')
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (error) {
      alert('Failed to copy to clipboard')
    }
  }

  return (
    <>
      <div className="token-manager-buttons">
        {canGenerateTokens ? (
          <Button 
            variant="primary" 
            onClick={handleGenerateTokens}
            disabled={loading}
          >
            <Link2 size={16} />
            {loading ? 'Generating...' : 'Generate Order Links'}
          </Button>
        ) : (
          <Button 
            variant="secondary" 
            onClick={handleViewTokens}
            disabled={loading}
          >
            <Link2 size={16} />
            {loading ? 'Loading...' : 'View Order Links'}
          </Button>
        )}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Customer Order Links"
        >
          <div className="token-modal-content">
            <p className="token-hint">
              Share these links with your customers so they can place their orders.
              {canGenerateTokens && ' Each customer gets a unique link.'}
            </p>

            <div className="token-actions">
              <Button 
                variant="secondary" 
                onClick={copyAllUrls}
                fullWidth
              >
                {copiedToken === 'all' ? <Check size={16} /> : <Copy size={16} />}
                {copiedToken === 'all' ? 'Copied!' : 'Copy All Links'}
              </Button>
            </div>

            <div className="tokens-list">
              {tokens.map(token => {
                const fullUrl = `${window.location.origin}${token.access_url}`
                const isCopied = copiedToken === token.access_token
                
                return (
                  <div key={token.access_token} className="token-item">
                    <div className="token-info">
                      <strong>{token.customer_name}</strong>
                      <code className="token-url">{fullUrl}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(token.access_token, token.access_url)}
                      className="copy-btn"
                      title="Copy link"
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                )
              })}
            </div>

            {canGenerateTokens && (
              <div className="token-warning">
                <RefreshCw size={16} />
                <span>
                  Generating tokens again will invalidate previous links. 
                  Only do this if needed.
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
