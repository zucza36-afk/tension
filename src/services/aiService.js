const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

class AIService {
  constructor() {
    this.conversationHistory = []
    this.gameContext = null
  }

  // Ustaw kontekst gry
  setGameContext(context) {
    this.gameContext = {
      players: context.players,
      currentCard: context.currentCard,
      currentRound: context.currentRound,
      gamePhase: context.gamePhase,
      playerScores: context.playerScores
    }
  }

  // Dodaj wiadomość do historii
  addToHistory(role, content) {
    this.conversationHistory.push({ role, content })
    // Ogranicz historię do ostatnich 20 wiadomości
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20)
    }
  }

  // Generuj komentarz do gry
  async generateGameComment(event) {
    if (!OPENAI_API_KEY) {
      return 'Bot AI jest wyłączony. Dodaj VITE_OPENAI_API_KEY do zmiennych środowiskowych.'
    }

    const playersList = this.gameContext?.players?.map(p => p.nickname).join(', ') || 'Nieznani'
    const systemPrompt = `Jesteś wesołym i dowcipnym botem prowadzącym grę towarzyską. 
    Twoim zadaniem jest komentować wydarzenia w grze w sposób zabawny, ale nie obraźliwy.
    Bądź pozytywny i zachęcający. Komentarze powinny być krótkie (max 2 zdania).
    Odpowiadaj po polsku.
    
    Kontekst gry:
    - Gracze: ${playersList}
    - Runda: ${this.gameContext?.currentRound || 0}
    - Faza: ${this.gameContext?.gamePhase || 'draw'}
    - Aktualna karta: ${this.gameContext?.currentCard?.title || 'Brak'}
    
    Wydarzenie: ${event}`

    return await this.callOpenAI(systemPrompt, 'user', `Skomentuj to wydarzenie: ${event}`)
  }

  // Poproś o podpowiedź
  async requestHint(question, playerName) {
    if (!OPENAI_API_KEY) {
      return 'Bot AI jest wyłączony. Dodaj VITE_OPENAI_API_KEY do zmiennych środowiskowych.'
    }

    const systemPrompt = `Jesteś pomocnym botem w grze. Gracz ${playerName} prosi o podpowiedź do pytania.
    Pamiętaj: jeśli dasz podpowiedź, gracz straci 2 punkty, a przeciwnik zostanie powiadomiony.
    Daj delikatną, nieoczywistą podpowiedź (max 1 zdanie), która pomoże, ale nie zdradzi odpowiedzi.
    Odpowiadaj po polsku.`

    const hint = await this.callOpenAI(
      systemPrompt,
      'user',
      `Pytanie: "${question}". Daj delikatną podpowiedź.`
    )

    return hint
  }

  // Wywołanie API OpenAI
  async callOpenAI(systemPrompt, role, userMessage) {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY nie jest ustawiony')
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.conversationHistory,
      { role: role || 'user', content: userMessage }
    ]

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 150
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      const aiMessage = data.choices[0].message.content

      // Zapisz w historii
      this.addToHistory('user', userMessage)
      this.addToHistory('assistant', aiMessage)

      return aiMessage
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }

  // Reset historii
  resetHistory() {
    this.conversationHistory = []
  }
}

export default new AIService()

