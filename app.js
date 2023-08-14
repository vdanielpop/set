function generate () {
  const colors = ['red', 'green', 'purple']
  const amounts = [1, 2, 3]
  const shapes = ['round', 'curve', 'diamond']
  const fillings = ['empty', 'filled', 'striped']
  const cards = []

  for (let color in colors) {
    for (let amount in amounts) {
      for (let shape in shapes) {
        for (let filling in fillings) {
          cards.push({
            'color': colors[color],
            'amount': amounts[amount],
            'shape': shapes[shape],
            'filling': fillings[filling],
          })
        }
      }
    }
  }

  return cards
}

function randomize (cards) {
  for (let i = cards.length - 1; i >= 0; i--) {
    let index1 = Math.floor(Math.random() * cards.length)
    let index2 = Math.floor(Math.random() * cards.length)
    const temp1 = cards[index1]
    cards[index1] = cards[index2]
    cards[index2] = temp1
  }
}

function createCardElement (card) {
  let c = document.createElement('div')
  c.setAttribute('class', 'card')
  c.style.backgroundColor = CSS_COLORS[card.color]
  Object.keys(card).map(key => {
    c.setAttribute('data-' + key, card[key])
    let el = document.createElement('p')
    el.append(card[key])
    return el
  }).forEach(el => c.appendChild(el))

  return c
}

function render (cards) {
  let container = document.getElementById('main')
  for (let card of cards) {
    let cardElement = createCardElement(card)
    decorateCardWithCheckboxBehaviour(cardElement)
    container.appendChild(cardElement)
  }
}

function initGameState (cards) {
  window.gameState = {
    remainingCards: cards,
    selectedCardElements: [],
    selectedAmount: 0,
    score: 0
  }
}

function decorateCardWithCheckboxBehaviour (cardElement) {
  let input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  input.setAttribute('name', 'checkbox')
  cardElement.appendChild(input)

  input.addEventListener('click', (event) => {
    if (true === event.target.checked) {
      //TODO Figure out if we need to recreate the card object here
      // or if we need to save the displayed cards in state somewhere
      window.gameState.selectedCardElements.push(event.target.parentElement)
      window.gameState.selectedAmount++
    } else {
      const newList = []
      for (let element of window.gameState.selectedCardElements) {
        if (element !== event.target) {
          newList.push(element)
        }
      }
      window.gameState.selectedCardElements = newList
      window.gameState.selectedAmount--
    }

    if (window.gameState.selectedAmount === 3) {
      if (areSelectedCardsASet()) {
        incrementScore()
        removeSelectedCards()
      } else {
        //TODO Maybe play some sort of a sound?
        uncheckSelectedCards()
      }
      resetSelectionState()
    }
  })
}

function areSelectedCardsASet () {
  const attributes = ['color', 'amount', 'shape', 'filling']
  for (let attribute of attributes) {
    const valueSet = new Set()
    window.gameState.selectedCardElements.map(card => {
      valueSet.add(card.getAttribute('data-' + attribute))
    })

    if (valueSet.size === 2) {
      return false
    }
  }

  return true
}

function uncheckSelectedCards () {
  for (let el of window.gameState.selectedCardElements) {
    let checkbox = el.children.namedItem('checkbox')
    checkbox.checked = false
  }
}

function incrementScore () {
  window.gameState.score++
  document.getElementById('score').value = window.gameState.score
}

function removeSelectedCards () {
  for (let el of window.gameState.selectedCardElements) {
    el.remove()
  }
}

function addMoreCards () {
  const cards = []
  for (let i = 0; i < 3; i++) {
    cards.push(window.gameState.remainingCards.pop())
  }

  render(cards)
}

function resetSelectionState () {
  window.gameState.selectedCardElements = []
  window.gameState.selectedAmount = 0
}

/**-----------------------*/
const CSS_COLORS = {
  'red': '#b63e36',
  'green': '#a9d0ac',
  'purple': '#c2bfe3'
}
const cards = generate()
randomize(cards)
const cardsToDisplay = []
for (let i = 0; i < 12; i++) {
  cardsToDisplay.push(cards.pop())
}
render(cardsToDisplay)
initGameState(cards)
document.getElementById('add-more').addEventListener('click', (event => {addMoreCards()}))
// TODO TIME TO CSS BABYYYY
