let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Create a pleasant two-tone chime
    const frequencies = [523.25, 659.25] // C5 and E5

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      const startTime = now + i * 0.15
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.5)
    })
  } catch (err) {
    console.warn('Could not play notification sound:', err)
  }
}
