// ==UserScript==
// @name        Hidive - Signs Only Subtitles
// @namespace   com.toadking.hidive.signsonly
// @match       https://www.hidive.com/*
// @grant       GM.setValue
// @grant       GM.getValue
// @version     1.1
// @author      Toad King
// @description Add an option to show only sign subtitles
// ==/UserScript==

(async () => {

const hideStyle = `
.ds-text-track__wrapper:not([style~="left:"]):not([style~="right:"]) {
  display: none !important;
}
`

let clickNode
let styleNode
let signsOnly = await GM.getValue('signsOnly', false)

function makeCheckSVG() {
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', '0 0 32 32')
  svg.setAttribute('height', '14')
  svg.setAttribute('width', '14')
  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', 'M29.813 10.125c0 0.438-0.125 0.875-0.5 1.188l-15.313 15.375c-0.375 0.313-0.75 0.5-1.25 0.5-0.438 0-0.875-0.188-1.188-0.5l-8.875-8.875c-0.375-0.375-0.5-0.75-0.5-1.25 0-0.438 0.125-0.875 0.5-1.188l2.375-2.438c0.375-0.313 0.75-0.5 1.25-0.5 0.438 0 0.875 0.188 1.188 0.5l5.25 5.25 11.75-11.75c0.313-0.313 0.75-0.5 1.188-0.5 0.5 0 0.875 0.188 1.25 0.5l2.375 2.438c0.375 0.375 0.5 0.75 0.5 1.25z')
  svg.appendChild(path)
  return svg
}

function addCheck() {
  if (clickNode) {
    clickNode.classList.add('preferences-panel__option--selected')
    const check = document.createElement('span')
    check.classList.add('preferences-panel__selected-mark')
    check.appendChild(makeCheckSVG())
    clickNode.appendChild(check)
  }
}

function addStyle() {
  if (styleNode) {
    styleNode.remove()
  }
  styleNode = document.createElement('style')
  styleNode.textContent = hideStyle
  document.head.appendChild(styleNode)
}

function removeCheck() {
  if (clickNode) {
    clickNode.classList.remove('preferences-panel__option--selected')
    const check = clickNode.querySelector('.preferences-panel__selected-mark')
    if (check) {
      check.remove()
    }
  }
}

function removeStyle() {
  if (styleNode) {
    styleNode.remove()
    styleNode = null
  }
}

function toggleSignsOnly() {
  if (signsOnly) {
    // toggle off
    removeCheck()
    removeStyle()
  } else {
    // toggle on
    addCheck()
    addStyle()
  }

  signsOnly = !signsOnly
  GM.setValue('signsOnly', signsOnly)
}

const config = { attributes: false, childList: true, subtree: true }

const callback = (mutationList, observer) => {
  // already added and still exists, return
  if (document.body.contains(clickNode)) {
    return
  }

  // element not in document but defined. remove it and any styles that may be added. fixes sign
  // removal style being applied to episodes with no language selection
  if (clickNode) {
    clickNode = null
    removeStyle()
  }

  const options = [...document.querySelectorAll('.preferences-panel__entry')]
  for (const option of options) {
    const header = option.querySelector('.preferences-panel__title')
    if (header && header.textContent === 'Subtitles') {
      clickNode = document.createElement('li')
      clickNode.classList.add('preferences-panel__option')
      const label = document.createElement('span')
      label.classList.add('preferences-panel__option__label')
      label.textContent = 'Signs Only'
      label.addEventListener('click', toggleSignsOnly)
      clickNode.appendChild(label)
      if (signsOnly) {
        addCheck()
        addStyle()
      }
      const list = document.createElement('ul')
      list.classList.add('preferences-panel__options')
      list.appendChild(clickNode)
      option.appendChild(list)
      break
    }
  }
}

const observer = new MutationObserver(callback)
callback(null, null)

observer.observe(document.body, config)

})()