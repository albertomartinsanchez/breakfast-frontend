import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { api } from './api.js'

// Check if running on native platform (Android/iOS)
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform()
}

// Initialize push notifications
export async function initPushNotifications(customerToken) {
  if (!isNativePlatform()) {
    console.log('Push notifications only available on native platforms')
    return null
  }

  try {
    // Request permission
    const permResult = await PushNotifications.requestPermissions()

    if (permResult.receive !== 'granted') {
      console.log('Push notification permission denied')
      return null
    }

    // Register with FCM
    await PushNotifications.register()

    // Listen for registration success
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', async (token) => {
        console.log('FCM Token:', token.value)

        // Register device with backend
        try {
          await api.registerDevice(customerToken, token.value, 'android')
          console.log('Device registered with backend')
        } catch (err) {
          console.error('Failed to register device with backend:', err)
        }

        resolve(token.value)
      })

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error)
        resolve(null)
      })
    })
  } catch (error) {
    console.error('Push notification init error:', error)
    return null
  }
}

// Set up notification listeners
export function setupNotificationListeners(onNotificationReceived, onNotificationAction) {
  if (!isNativePlatform()) return

  // Notification received while app is in foreground
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Notification received:', notification)
    if (onNotificationReceived) {
      onNotificationReceived(notification)
    }
  })

  // User tapped on notification
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Notification action:', action)
    if (onNotificationAction) {
      onNotificationAction(action)
    }
  })
}

// Unregister device
export async function unregisterPushNotifications(customerToken, deviceToken) {
  if (!isNativePlatform() || !deviceToken) return

  try {
    await api.unregisterDevice(customerToken, deviceToken)
    console.log('Device unregistered from backend')
  } catch (err) {
    console.error('Failed to unregister device:', err)
  }
}

// Remove all listeners
export function removePushListeners() {
  if (!isNativePlatform()) return
  PushNotifications.removeAllListeners()
}
