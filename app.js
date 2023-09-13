class Card {
  color
  amount
  filling
  shape

  constructor (color, amount, filling, shape) {
    this.color = color
    this.amount = amount
    this.filling = filling
    this.shape = shape
  }

  equals (c) {
    return c.color === this.color && c.amount === this.amount && c.filling === this.filling && c.shape === this.shape
  }

  static fromElementWithDataAttributes (el) {
    return new Card(
      el.getAttribute('data-color'),
      el.getAttribute('data-amount'),
      el.getAttribute('data-filling'),
      el.getAttribute('data-shape'),
    )
  }
}

//TODO Move the class in a separate file.
/**************************************************************/

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
          cards.push(new Card(
            colors[color],
            amounts[amount],
            fillings[filling],
            shapes[shape],
          ))
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

function createCardSvg (card) {
  const svgShapeAmountSelectors = {
    'diamond_1': '#a1',
    'diamond_2': '#a2',
    'diamond_3': '#a3',
    'curve_1': '#b1',
    'curve_2': '#b2',
    'curve_3': '#b3',
    'round_1': '#c1',
    'round_2': '#c2',
    'round_3': '#c3',
  }
  const svgFillingColorSelectors = {
    'empty_green': 'xi',
    'empty_purple': 'xj',
    'empty_red': 'xk',
    'striped_green': 'yi',
    'striped_purple': 'yj',
    'striped_red': 'yk',
    'filled_green': 'zi',
    'filled_purple': 'zj',
    'filled_red': 'zk',
  }
  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 40 58')
  let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('transform', 'translate(20,29)')
  let use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttribute('class', svgFillingColorSelectors[card.filling + '_' + card.color])
  use.setAttribute('href', svgShapeAmountSelectors[card.shape + '_' + card.amount])
  g.appendChild(use)
  svg.appendChild(g)

  return svg
}

function render (cards) {
  let container = document.getElementById('main')
  for (let card of cards) {
    let cardSvg = createCardSvg(card)
    const cardElement = wrapAndDecorateCardWithCheckboxBehaviour(cardSvg, card)
    container.appendChild(cardElement)
  }
}

function initGameState (displayedCards, cards) {
  window.gameState = {
    remainingCards: cards,
    displayedCards: displayedCards,
    selectedCards: [],
    selectedCardElements: [],
    score: 0,
  }
}

function wrapAndDecorateCardWithCheckboxBehaviour (cardSvg, card) {
  // TODO Needed a unique id for the checkbox so this was the first thing that came to mind.
  //  Find a better way to do that in the future.
  const cid = card.color + card.amount + card.shape + card.filling

  let div = document.createElement('div')
  div.setAttribute('class', 'svg-card')
  // TODO Currently these data-attributes are used for validation, which is kinda ugly.
  //  In the future store the selected cards in the state and adjust the validation.
  Object.keys(card).map(key => {
    div.setAttribute('data-' + key, card[key])
  })

  let label = document.createElement('label')
  label.setAttribute('for', 'cx-' + cid)
  label.appendChild(cardSvg)
  div.appendChild(label)

  let input = document.createElement('input')
  input.setAttribute('type', 'checkbox')
  input.setAttribute('name', 'checkbox')
  input.setAttribute('id', 'cx-' + cid)
  input.setAttribute('style', 'display: none')
  input.addEventListener('click', (event) => {
    event.target.parentElement.classList.toggle('selected')
    const selectedCard = Card.fromElementWithDataAttributes(event.target.parentElement)
    if (true === event.target.checked) {
      window.gameState.selectedCards.push(selectedCard)
      window.gameState.selectedCardElements.push(event.target.parentElement)
    } else {
      window.gameState.selectedCardElements =
        window.gameState.selectedCardElements.filter(el => el !== event.target.parentElement)
      window.gameState.selectedCards =
        window.gameState.selectedCards.filter(card => !card.equals(selectedCard))
    }

    if (window.gameState.selectedCards.length === 3) {
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
  div.appendChild(input)

  return div
}

function areSelectedCardsASet () {
  for (const attribute of CARD_ATTRIBUTES) {
    const valueSet = new Set()
    window.gameState.selectedCards.map(card => valueSet.add(card[attribute]))
    if (valueSet.size === 2) {
      return false
    }
  }

  return true
}

function uncheckSelectedCards () {
  for (const el of window.gameState.selectedCardElements) {
    let checkbox = el.children.namedItem('checkbox')
    checkbox.checked = false
    checkbox.parentElement.classList.toggle('selected')
  }
}

function incrementScore () {
  window.gameState.score++
  document.getElementById('score').value = window.gameState.score
}

function removeSelectedCards () {
  for (const el of window.gameState.selectedCardElements) {
    el.remove()
  }
}

function addMoreCards () {
  const cards = []
  for (let i = 0; i < 3; i++) {
    const card = window.gameState.remainingCards.pop()
    window.gameState.displayedCards.push(card)
    cards.push(card)
  }

  render(cards)
}

function resetSelectionState () {
  window.gameState.selectedCardElements = []
  window.gameState.selectedCards = []
}

/**-----------------------*/
const CSS_COLORS = {
  'red': '#b63e36',
  'green': '#a9d0ac',
  'purple': '#c2bfe3',
}
const CARD_ATTRIBUTES = [
  'color',
  'amount',
  'shape',
  'filling',
]
const cards = generate()
randomize(cards)
const cardsToDisplay = []
for (let i = 0; i < 12; i++) {
  cardsToDisplay.push(cards.pop())
}
render(cardsToDisplay)
initGameState(cardsToDisplay, cards)
document.getElementById('add-more').addEventListener('click', (event => {addMoreCards()}))
