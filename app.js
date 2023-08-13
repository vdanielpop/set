function generate (cards) {
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
  Object.keys(card).map(key => {
    c.setAttribute('data-' + key, card[key])
    let el = document.createElement('p')
    el.append(card[key])
    return el
  }).forEach(el => c.appendChild(el))

  return c
}

function render (cards) {
  let displayedCards = []
  let container = document.getElementById('main')
  const l = cards.length - 1
  for (let i = l; i > l - 12; i--) {
    let cardElement = createCardElement(cards[i])
    decorateCardWithCheckboxBehaviour(cardElement)
    container.appendChild(cardElement)
    // TODO kinda unintuitive and hidden, maybe rewrite
    displayedCards.push(cards.pop())
  }

  return displayedCards
}

function decorateCardWithCheckboxBehaviour (cardElement) {
  let input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  cardElement.appendChild(input)

  input.addEventListener('click', (event) => {
    if (true === event.target.checked) {
      //TODO Figure out if we need to recreate the card object here
      // or if we need to save the displayed cards in state somewhere
      window.gameState.selectedCards.push(event.target)
      window.gameState.selectedAmount++
    } else {
      const newList = []
      for (let element of window.gameState.selectedCards) {
        if (element !== event.target) {
          newList.push(element)
        }
      }
      window.gameState.selectedCards = newList
      window.gameState.selectedAmount--
    }

    if (window.gameState.selectedAmount === 3) {
      if (areSelectedCardsASet()) {
        incrementScore()
        replaceSelectedCards()
        resetState()

        // TODO Not sure about this, gotta read more about the event system
        event.preventDefault()
        event.stopImmediatePropagation()
      }
    }
  })
}

function areSelectedCardsASet () {
  const attributes = ['color', 'amount', 'shape', 'filling']
  const gameIsSet = false
  for (let attribute of attributes) {
    const valueSet = new Set()
    window.gameState.selectedCards.map(card => {
      valueSet.add(card.parentElement.getAttribute('data-' + attribute))
    })

    if (valueSet.size === 2) {
      console.log('NOT SET')
      return false
    }
  }

  console.log('IT IS A SET')
  return true
}

const colors = ['red', 'green', 'purple']
const amounts = [1, 2, 3]
const shapes = ['round', 'curve', 'diamond']
const fillings = ['empty', 'filled', 'striped']
window.gameState = {
  selectedCards: [],
  selectedAmount: 0
}

cards = []

generate(cards)
randomize(cards)
displayedCards = render(cards)
// adauga contor
// cand dai check la 3, scoate elementele, mareste contorul, adauga inca 3
// adauga buton, cand apesi buton adauga inca 3, si scoate din lista
// IMAGINI

