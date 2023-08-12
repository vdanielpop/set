function generate (cards) {
  for (let color in colors) {
    for (let amount in amounts) {
      for (let shape in shapes) {
        for (let filling in fillings) {
          cards.push({
            'color': colors[color], 'amount': amounts[amount], 'shape': shapes[shape], 'filling': fillings[filling],
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

function render (cards) {
  let displayedCards = []
  let container = document.getElementById('main')
  const l = cards.length - 1
  for (let i = l; i > l - 12; i--) {
    let c = document.createElement('div')
    c.setAttribute('class', 'card')
    let p1 = document.createElement('p')
    p1.append(cards[i].amount)
    let p2 = document.createElement('p')
    p2.append(cards[i].color)
    let p3 = document.createElement('p')
    p3.append(cards[i].shape)
    let p4 = document.createElement('p')
    p4.append(cards[i].filling)
    c.appendChild(p1)
    c.appendChild(p2)
    c.appendChild(p3)
    c.appendChild(p4)
    let input = document.createElement('input')
    input.setAttribute('type', 'checkbox')
    c.appendChild(input)
    container.appendChild(c)
    displayedCards.push(cards.pop())
  }

  return displayedCards
}

const colors = ['red', 'green', 'purple']
const amounts = [1, 2, 3]
const shapes = ['round', 'curve', 'diamond']
const fillings = ['empty', 'filled', 'striped']

cards = []

generate(cards)
randomize(cards)
displayedCards = render(cards)
// adauga contor
// cand dai check la 3, scoate elementele, mareste contorul, adauga inca 3
// adauga buton, cand apesi buton adauga inca 3, si scoate din lista
// IMAGINI

