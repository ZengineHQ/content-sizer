// Based on: https://github.com/davidjbradshaw/iframe-resizer
// Goal is to make a simple resize system

/**
 * Get the int value of a property for an element
 * @param prop
 * @param element
 * @returns {number}
 */
const getComputedStyle = (prop, element) => {
  let value = 0
  element = element || document.body
  value = document.defaultView.getComputedStyle(element, null)
  value = value !== null ? value[prop] : 0
  return parseInt(value, 10)
}

/**
 * Get the largest element based on the target page side & given elements
 * @param {'right' | 'bottom'} side
 * @param {HTMLElement[]} elements
 * @returns {number}
 */
const getMaxElement = (side, elements) => {
  let elementsLength = elements.length
  let elVal = 0
  let maxVal = 0

  let Side = capitalizeFirstLetter(side)

  for (let i = 0; i < elementsLength; i++) {
    if (elements[i].nodeType === 1) {
      elVal = elements[i].getBoundingClientRect()[side] + (
        elements[i].style[`margin${Side}`] === 'auto'
          ? 0
          : getComputedStyle(`margin${Side}`, elements[i])
      )
    }

    if (elements[i].nodeType === 3) {
      const range = document.createRange()
      range.selectNode(elements[i])

      elVal = range.getBoundingClientRect()[side]
    }

    if (elVal > maxVal) {
      maxVal = elVal
    }
  }

  return maxVal
}

const getSmallestOffsetLeft = () => {
  return Array.from(getTopLevelElements())
    .reduce((lowest, element) => Math.min(element.offsetLeft, lowest), 0)
}

/**
 * Gets all the basic measurements from the dimension calculation object
 * @param dimCalc
 * @returns {(*|number)[]}
 */
const getAllMeasurements = (dimCalc) => {
  return [
    dimCalc.bodyOffset(),
    dimCalc.bodyScroll(),
    dimCalc.documentElementOffset(),
    dimCalc.documentElementScroll()
  ]
}

/**
 * Gets all the elements on the page
 * @returns {NodeListOf<Element>}
 */
const getAllElements = () => {
  return document.querySelectorAll('body *')
}

/**
 * Gets all the immediate children of the body
 * @returns {NodeListOf<Element>}
 */
const getTopLevelElements = () => {
  return document.querySelectorAll('body > *')
}

/**
 * Capitalizes the first letter of a string
 * @param string
 * @returns {string}
 */
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Determine if an element has its height set to something relative to its parent(s)
 * @param {HTMLElement} element
 */
const elementHasRelative = dimension => element => ['%', 'vh', 'vw', 'vmin', 'vmax'].some(symbol => element.style[dimension].includes(symbol))

/**
 * 
 * @param  {...HTMLElement} elements 
 */
const recursivelyGetHeight = elements => {
  elements = Array.from(elements).filter(el => el.nodeName !== 'SCRIPT')

  if (elements.length === 1 && elementHasRelative('height')(elements[0])) {
    return recursivelyGetHeight(elements[0].childNodes)
  }

  return getMaxElement('bottom', elements)
}

const recursivelyGetWidth = elements => {
  elements = Array.from(elements).filter(el => el.nodeName !== 'SCRIPT')

  if (elements.length === 1) {
    return recursivelyGetWidth(elements[0].childNodes)
  }

  return getMaxElement('right', elements)
}

const heightCalc = {
  /**
   * Get the body.offsetHeight
   * @returns {number}
   */
  bodyOffset: () => {
    return document.body.offsetHeight + getComputedStyle('marginTop') + getComputedStyle('marginBottom')
  },
  /**
   * Get the body.scrollHeight
   * @returns {number}
   */
  bodyScroll: () => {
    return document.body.scrollHeight
  },
  /**
   * Get the documentElement.offsetHeight
   * @returns {number}
   */
  documentElementOffset: () => {
    return document.documentElement.offsetHeight
  },
  /**
   * Get the documentElement.scrollHeight
   * @returns {number}
   */
  documentElementScroll: () => {
    return document.documentElement.scrollHeight
  },
  /**
   * Get the total width of the top-level elements on the page
   * @returns {number}
   */
  content: () => {
    if (document.body.scrollHeight > document.body.clientHeight) {
      return document.body.scrollHeight
    }

    return recursivelyGetHeight(getTopLevelElements())
  },
  /**
   * Get the height of the element that's closest to the bottom of the page
   * @returns {number}
   */
  furthestElement: () => {
    return getMaxElement('bottom', getAllElements())
  },
  /**
   * Get the min value of all the base measurements
   * @returns {number}
   */
  min: () => {
    return Math.min.apply(null, getAllMeasurements(heightCalc))
  },
  /**
   * Get the max value of all the base measurements
   * @returns {number}
   */
  max: () => {
    return Math.max.apply(null, getAllMeasurements(heightCalc))
  }
}

const widthCalc = {
  /**
   * Get the body.offsetWidth
   * @returns {number}
   */
  bodyOffset: () => {
    return document.body.offsetWidth
  },
  /**
   * Get the body.scrollWidth
   * @returns {number}
   */
  bodyScroll: () => {
    return document.body.scrollWidth
  },
  /**
   * Get the documentElement.offsetWidth
   * @returns {number}
   */
  documentElementOffset: () => {
    return document.documentElement.offsetWidth
  },
  /**
   * Get the documentElement.scrollWidth
   * @returns {number}
   */
  documentElementScroll: () => {
    return document.documentElement.scrollWidth
  },
  /**
   * Get the width of the element that's furthest to the right of the page
   * @returns {number}
   */
  furthestElement: () => {
    return getMaxElement('right', getTopLevelElements())
  },
  /**
   * Get the total width of the top-level elements on the page
   * @returns {number}
   */
  content: () => {
    if (document.body.scrollWidth > document.body.clientWidth) {
      return getSmallestOffsetLeft() + document.body.scrollWidth
    }

    return getSmallestOffsetLeft() + recursivelyGetWidth(getTopLevelElements())
  },
  /**
   * Get the min value of all the base measurements
   * @returns {number}
   */
  min: () => {
    return Math.min.apply(null, getAllMeasurements(widthCalc))
  },
  /**
   * Get the max value of all the base measurements
   * @returns {number}
   */
  max: () => {
    return Math.max.apply(null, getAllMeasurements(widthCalc))
  },
  /**
   * Gets the max of body.scrollWidth & documentElement.scrollWidth
   * @returns {number}
   */
  scroll: () => {
    return Math.max(widthCalc.bodyScroll(), widthCalc.documentElementScroll())
  }
}

export default class ZnSize {
  /**
   * UpdateRequester Function
   *
   * @callback UpdateRequester
   * @param {{ width: string, height: string }} dimensions
   *
   * @returns {*}
   */

  /**
   * ZnSize
   * Auto-detects sizing needs, and executes resizing on command
   * 
   * @param {UpdateRequester} updateRequester
   * @param {Object} methods
   * @param {'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' | 'furthestElement' | 'min' | 'max'} methods.height
   * @param {'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' | 'furthestElement' | 'min' | 'max' | 'scroll'} methods.width
   */
  constructor (updateRequester = d => {}, methods = {}) {
    this.updateRequester = updateRequester
    this.heightMethod = typeof methods.height === 'string' ? methods.height : 'content'
    this.widthMethod = typeof methods.width === 'string' ? methods.width : 'content'
    this.observer = null
    this.auto = false
    this.currentWidth = 0
    this.currentHeight = 0
    this.events = [
      'animationstart',
      'webkitAnimationStart',
      'animationiteration',
      'webkitAnimationIteration',
      'animationend',
      'webkitAnimationEnd',
      'orientationchange',
      'transitionstart',
      'webkitTransitionStart',
      'MSTransitionStart',
      'oTransitionStart',
      'otransitionstart',
      'transitioniteration',
      'webkitTransitionIteration',
      'MSTransitionIteration',
      'oTransitionIteration',
      'otransitioniteration',
      'transitionend',
      'webkitTransitionEnd',
      'MSTransitionEnd',
      'oTransitionEnd',
      'otransitionend'
    ]
  }

  /**
   * Measures Page dimensions and calls updater function with dimensions if changed.
   */
  measureAndUpdate () {
    const height = this.currentHeight
    const width = this.currentWidth

    this.currentHeight = this.getHeight()
    this.currentWidth = this.getWidth()

    if (this.isSizeChanged(height, this.currentHeight, 2) || this.isSizeChanged(width, this.currentWidth, 2)) {
      this.updateRequester({
        width: `${this.currentWidth}px`,
        height: `${this.currentHeight}px`
      })
    }
  }

  /**
   * Initialize autosizing via Mutation Observer
   */
  autoSize () {
    if (this.auto) {
      return null
    }

    this.auto = true

    this.measureAndUpdate()
    this.observer = this.setupMutation()
    this.addEventHandlers()
  }

  addEventHandlers () {
    this.events.forEach(value => {
      window.addEventListener(value, this.handleEvent.bind(this))
    })
  }

  removeEventHandlers () {
    this.events.forEach(value => {
      window.removeEventListener(value, this.handleEvent.bind(this))
    })
  }

  stopAutoSize () {
    this.auto = false
    this.removeEventHandlers()

    if (!this.observer) return null
    
    this.observer.disconnect()
    this.observer = false
  }

  handleEvent (e) {
    this.measureAndUpdate()
  }

  /**
   * Get the page width
   * @param method
   * @returns {number}
   */
  getWidth (method = this.widthMethod) {
    return widthCalc[method]()
  }

  /**
   * Get the page height
   * @param method
   * @returns {number}
   */
  getHeight (method = this.heightMethod) {
    return heightCalc[method]()
  }

  /**
   * Sets up MutationObserver
   * @returns {MutationObserver}
   */
  setupMutation () {
    const MutationClass = window.MutationObserver || window.WebKitMutationObserver

    const observer = new MutationClass((mutations, observer) => {
      setTimeout(() => {
        this.measureAndUpdate()
      }, 16)
    })

    observer.observe(document.querySelector('body'), {
      attributes: true,
      attributeOldValue: false,
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true
    })

    return observer
  }

  /**
   * Check if a size has changed
   * @param originalValue
   * @param newValue
   * @param tolerance
   * @returns {boolean}
   */
  isSizeChanged (originalValue, newValue, tolerance = 0) {
    return Math.abs(originalValue - newValue) >= tolerance
  }
}
