import React, { useState, useEffect } from 'react'; 
import { AlertCircle, LogOut, Plus, Edit2, Trash2, X } from 'lucide-react'; 
 
// IMPORTANT: Change this to your deployed API URL after deploying the backend 
const API_URL = 'http://localhost:8000'; 
 
export default function App() { 
  const [token, setToken] = useState(localStorage.getItem('token')); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [items, setItems] = useState([]); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [showAddForm, setShowAddForm] = useState(false); 
  const [editingItem, setEditingItem] = useState(null); 
  const [formData, setFormData] = useState({ name: '', description: '', price: '' }); 
 
  useEffect(()=>{ 
    if(token){ 
      fetchItems(); 
    } 
  },[token]); 
 
  const login = async ()=>{ 
    setError(''); 
    setLoading(true); 
    try{ 
      const response = await fetch(`${API_URL}/login`,{ 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body:JSON.stringify({username,password}) 
      }); 
      if(!response.ok)throw new Error('Invalid credentials'); 
      const data = await response.json(); 
      setToken(data.access_token); 
      localStorage.setItem('token',data.access_token); 
      setUsername(''); 
      setPassword(''); 
    }catch(err){ 
      setError(err.message); 
    }finally{ 
      setLoading(false); 
    } 
  }; 
 
  const logout = async ()=>{ 
    try{ 
      await fetch(`${API_URL}/logout`,{ 
        method:'POST', 
        headers:{'Authorization':`Bearer ${token}`} 
      }); 
    }catch(err){console.error('Logout error:',err);} 
    setToken(null); 
    localStorage.removeItem('token'); 
    setItems([]); 
  }; 
 
  const fetchItems = async ()=>{ 
    setLoading(true); 
    try{ 
      const response = await fetch(`${API_URL}/items`,{ 
        headers:{'Authorization':`Bearer ${token}`} 
      }); 
      if(!response.ok)throw new Error('Failed to fetch items'); 
      const data = await response.json(); 
      setItems(data); 
    }catch(err){ 
      setError(err.message); 
    }finally{ 
      setLoading(false); 
    } 
  }; 
 
  const createItem = async ()=>{ 
    setLoading(true); 
    try{ 
      const response = await fetch(`${API_URL}/items`,{ 
        method:'POST', 
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}, 
        body:JSON.stringify({name:formData.name,description:formData.description,price:parseFloat(formData.price)}) 
      }); 
      if(!response.ok)throw new Error('Failed to create item'); 
      await fetchItems(); 
      setFormData({name:'',description:'',price:''}); 
      setShowAddForm(false); 
    }catch(err){ 
      setError(err.message); 
    }finally{ 
      setLoading(false); 
    } 
  }; 
 
  const updateItem = async ()=>{ 
    setLoading(true); 
    try{ 
      const response = await fetch(`${API_URL}/items/${editingItem.id}`,{ 
        method:'PUT', 
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}, 
        body:JSON.stringify({name:formData.name,description:formData.description,price:parseFloat(formData.price)}) 
      }); 
      if(!response.ok)throw new Error('Failed to update item'); 
      await fetchItems(); 
      setFormData({name:'',description:'',price:''}); 
      setEditingItem(null); 
    }catch(err){ 
      setError(err.message); 
    }finally{ 
      setLoading(false); 
    } 
  }; 
 
  const deleteItem = async (id)=>{ 
    if(!confirm('Are you sure?'))return; 
    setLoading(true); 
    try{ 
      const response = await fetch(`${API_URL}/items/${id}`,{ 
        method:'DELETE', 
        headers:{'Authorization':`Bearer ${token}`} 
      }); 
      if(!response.ok)throw new Error('Failed to delete item'); 
      await fetchItems(); 
    }catch(err){ 
      setError(err.message); 
    }finally{ 
      setLoading(false); 
    } 
  }; 
 
  const startEdit=(item)=>{ 
    setEditingItem(item); 
    setFormData({name:item.name,description:item.description||'',price:item.price.toString()}); 
  }; 
 
  const cancelForm=()=>{ 
    setShowAddForm(false); 
    setEditingItem(null); 
    setFormData({name:'',description:'',price:''}); 
  }; 
 
  if(!token){ 
    return( 
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"> 
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"> 
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1> 
          {error&&<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"><AlertCircle size={20}/><span>{error}</span></div>} 
          <div className="space-y-4"> 
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Username</label><input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&login()} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required/></div> 
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&login()} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required/></div> 
            <button onClick={login} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50">{loading?'Loading...':'Login'}</button> 
          </div> 
          <div className="mt-4 text-sm text-gray-600 text-center"><p>Demo: admin / secret123</p></div> 
        </div> 
      </div> 
    ); 
  } 
 
  return( 
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4"> 
      <div className="max-w-6xl mx-auto"> 
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6"><div className="flex justify-between items-center"><h1 className="text-3xl font-bold text-gray-800">Items Management</h1><button onClick={logout} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"><LogOut size={20}/>Logout</button></div></div> 
        {error&&<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"><AlertCircle size={20}/><span>{error}</span></div>} 
        {!showAddForm&&!editingItem&&<button onClick={()=>setShowAddForm(true)} className="mb-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"><Plus size={20}/>Add New Item</button>} 
        {(showAddForm||editingItem)&&<div className="bg-white rounded-lg shadow-xl p-6 mb-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">{editingItem?'Edit Item':'Add New Item'}</h2><button onClick={cancelForm} className="text-gray-500 hover:text-gray-700"><X size={24}/></button></div><div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows="3"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Price</label><input type="number" step="0.01" value={formData.price} onChange={(e)=>setFormData({...formData,price:e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required/></div><div className="flex gap-2"><button onClick={editingItem?updateItem:createItem} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50">{loading?'Saving...':(editingItem?'Update':'Create')}</button><button onClick={cancelForm} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg">Cancel</button></div></div></div>} 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{items.map(item=><div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg"><h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3><p className="text-gray-600 mb-3">{item.description||'No description'}</p><p className="text-2xl font-bold text-blue-600 mb-4">${item.price.toFixed(2)}</p><div className="flex gap-2"><button onClick={()=>startEdit(item)} className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"><Edit2 size={16}/>Edit</button><button onClick={()=>deleteItem(item.id)} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"><Trash2 size={16}/>Delete</button></div></div>)}</div> 
        {items.length===0&&!loading&&<div className="bg-white rounded-lg shadow-xl p-12 text-center"><p className="text-gray-500 text-lg">No items yet. Click "Add New Item" to get started!</p></div>} 
      </div> 
    </div> 
  ); 
} 
