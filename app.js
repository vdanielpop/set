import Card from './src/card.js'
import { CARD_COLORS, CARD_SHAPES, CARD_AMOUNTS, CARD_FILLINGS, CARD_ATTRIBUTES } from './src/constants.js'

/**
 * @returns {Card[]}
 */
function generate () {
  const cards = []

  for (const color in CARD_COLORS) {
    for (const amount in CARD_AMOUNTS) {
      for (const shape in CARD_SHAPES) {
        for (const filling in CARD_FILLINGS) {
          cards.push(new Card(color, amount, filling, shape))
        }
      }
    }
  }

  return cards
}

/**
 * @param cards {Card[]}
 */
function randomize (cards) {
  for (let i = cards.length - 1; i >= 0; i--) {
    let index1 = Math.floor(Math.random() * cards.length)
    let index2 = Math.floor(Math.random() * cards.length)
    const temp1 = cards[index1]
    cards[index1] = cards[index2]
    cards[index2] = temp1
  }
}

/**
 * @param card {Card}
 * @returns {SVGSVGElement}
 */
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
  svg.classList.add('svg-card')
  let g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('transform', 'translate(20,29)')
  let use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  use.setAttribute('class', svgFillingColorSelectors[card.filling + '_' + card.color])
  use.setAttribute('href', svgShapeAmountSelectors[card.shape + '_' + card.amount])
  g.appendChild(use)
  svg.appendChild(g)

  return svg
}

/**
 * @param cards {Card[]}
 */
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

/**
 * @param cardSvg {SVGSVGElement}
 * @param card {Card}
 * @returns {HTMLDivElement}
 */
function wrapAndDecorateCardWithCheckboxBehaviour (cardSvg, card) {
  // TODO Needed a unique id for the checkbox so this was the first thing that came to mind.
  //  Find a better way to do that in the future.
  const cid = card.toString()

  let div = document.createElement('div')
  div.setAttribute('class', 'svg-wrapper')
  // TODO Currently these data-attributes are used for validation, which is kinda ugly.
  //  In the future store the selected cards in the state and adjust the validation.
  CARD_ATTRIBUTES.map(key => {
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
    const svg = event.target.previousSibling.childNodes[0]
    svg.classList.toggle('selected')

    const selectedCard = Card.fromDivWithDataAttributes(event.target.parentElement)
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

        // updates displayed cards
        const newDisplayedCards = []
        for (card of window.gameState.displayedCards) {
          if (undefined === window.gameState.selectedCards.find(x => x.equals(card))) {
            newDisplayedCards.push(card)
          }
        }
        window.gameState.displayedCards = newDisplayedCards
        document.getElementById('existing-sets').value = getSetsFromCards(window.gameState.displayedCards).length
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

/**
 *
 * @param cards {Card[]}
 * @return {[Card, Card, Card][]}
 */
function getSetsFromCards (cards) {
  const n = cards.length
  const hashMap = []
  cards.forEach((card, index) => hashMap[card.toString()] = index)

  const setsMap = {}
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const complement = findSetComplement(cards[i], cards[j])
      if (undefined !== hashMap[complement.toString()]) {
        const t = [cards[i], cards[j], complement]
        const key = t.map(x => hashMap[x]).sort().reduce((prev, x) => prev + '-' + Number(x).toString(), '')
        setsMap[key] = t
      }
    }
  }

  return Object.values(setsMap)
}

/**
 *
 * @param card1 {Card}
 * @param card2 {Card}
 * @return {Card}
 */
function findSetComplement (card1, card2) {
  /**
   * @template A
   * @param v1 {A}
   * @param v2 {A}
   * @param values {A[]}
   * @return {A}
   */
  const getSameOrThird = (v1, v2, values) =>
    v1 === v2 ?
      v1 :
      values.filter(x => x !== v1 && x !== v2).pop()

  return new Card(
    getSameOrThird(card1.color, card2.color, Object.values(CARD_COLORS)),
    getSameOrThird(card1.amount, card2.amount, Object.values(CARD_AMOUNTS)),
    getSameOrThird(card1.filling, card2.filling, Object.values(CARD_FILLINGS)),
    getSameOrThird(card1.shape, card2.shape, Object.values(CARD_SHAPES)),
  )
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
    const checkbox = el.children.namedItem('checkbox')
    checkbox.checked = false
    const svg = el.childNodes[0].childNodes[0]
    svg.classList.toggle('selected')
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
  if (window.gameState.remainingCards.length === 0) {
    return
  }

  const cards = []
  for (let i = 0; i < 3; i++) {
    const card = window.gameState.remainingCards.pop()
    window.gameState.displayedCards.push(card)
    cards.push(card)
  }

  render(cards)
  document.getElementById('existing-sets').value = getSetsFromCards(window.gameState.displayedCards).length
}

function resetSelectionState () {
  window.gameState.selectedCardElements = []
  window.gameState.selectedCards = []
}

/**-----------------------*/
const cards = generate()
randomize(cards)
const cardsToDisplay = []
for (let i = 0; i < 12; i++) {
  cardsToDisplay.push(cards.pop())
}
initGameState(cardsToDisplay, cards)
document.getElementById('existing-sets').value = getSetsFromCards(cardsToDisplay).length
render(cardsToDisplay)
document.getElementById('add-more').addEventListener('click', (event => {addMoreCards()}))
document.getElementById('show-sets').addEventListener('click',
  (e => console.log(getSetsFromCards(window.gameState.displayedCards).map(x => x.toString()))))
