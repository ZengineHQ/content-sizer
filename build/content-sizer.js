'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Based on: https://github.com/davidjbradshaw/iframe-resizer
// Goal is to make a simple resize system

/**
 * Get the int value of a property for an element
 * @param prop
 * @param element
 * @returns {number}
 */
var getComputedStyle = function getComputedStyle(prop, element) {
  var value = 0;
  element = element || document.body;
  value = document.defaultView.getComputedStyle(element, null);
  value = value !== null ? value[prop] : 0;
  return parseInt(value, 10);
};

/**
 * Get the largest element based on the target page side & given elements
 * @param {'right' | 'bottom'} side
 * @param {HTMLElement[]} elements
 * @returns {number}
 */
var getMaxElement = function getMaxElement(side, elements) {
  var elementsLength = elements.length;
  var elVal = 0;
  var maxVal = 0;

  var Side = capitalizeFirstLetter(side);

  for (var i = 0; i < elementsLength; i++) {
    if (elements[i].nodeType === 1) {
      elVal = elements[i].getBoundingClientRect()[side] + (elements[i].style['margin' + Side] === 'auto' ? 0 : getComputedStyle('margin' + Side, elements[i]));
    }

    if (elements[i].nodeType === 3) {
      var range = document.createRange();
      range.selectNode(elements[i]);

      elVal = range.getBoundingClientRect()[side];
    }

    if (elVal > maxVal) {
      maxVal = elVal;
    }
  }

  return maxVal;
};

var getSmallestOffsetLeft = function getSmallestOffsetLeft() {
  return Array.from(getTopLevelElements()).reduce(function (lowest, element) {
    return Math.min(element.offsetLeft, lowest);
  }, 0);
};

/**
 * Gets all the basic measurements from the dimension calculation object
 * @param dimCalc
 * @returns {(*|number)[]}
 */
var getAllMeasurements = function getAllMeasurements(dimCalc) {
  return [dimCalc.bodyOffset(), dimCalc.bodyScroll(), dimCalc.documentElementOffset(), dimCalc.documentElementScroll()];
};

/**
 * Gets all the elements on the page
 * @returns {NodeListOf<Element>}
 */
var getAllElements = function getAllElements() {
  return document.querySelectorAll('body *');
};

/**
 * Gets all the immediate children of the body
 * @returns {NodeListOf<Element>}
 */
var getTopLevelElements = function getTopLevelElements() {
  return document.querySelectorAll('body > *');
};

/**
 * Capitalizes the first letter of a string
 * @param string
 * @returns {string}
 */
var capitalizeFirstLetter = function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Determine if an element has its height set to something relative to its parent(s)
 * @param {HTMLElement} element
 */
var elementHasRelative = function elementHasRelative(dimension) {
  return function (element) {
    return ['%', 'vh', 'vw', 'vmin', 'vmax'].some(function (symbol) {
      return element.style[dimension].includes(symbol);
    });
  };
};

/**
 *
 * @param  {...HTMLElement} elements
 */
var recursivelyGetHeight = function recursivelyGetHeight(elements) {
  elements = Array.from(elements).filter(function (el) {
    return el.nodeName !== 'SCRIPT';
  });

  if (elements.length === 1 && elementHasRelative('height')(elements[0])) {
    return recursivelyGetHeight(elements[0].childNodes);
  }

  return getMaxElement('bottom', elements);
};

var recursivelyGetWidth = function recursivelyGetWidth(elements) {
  elements = Array.from(elements).filter(function (el) {
    return el.nodeName !== 'SCRIPT';
  });

  if (elements.length === 1) {
    return recursivelyGetWidth(elements[0].childNodes);
  }

  return getMaxElement('right', elements);
};

var heightCalc = {
  /**
   * Get the body.offsetHeight
   * @returns {number}
   */
  bodyOffset: function bodyOffset() {
    return document.body.offsetHeight + getComputedStyle('marginTop') + getComputedStyle('marginBottom');
  },
  /**
   * Get the body.scrollHeight
   * @returns {number}
   */
  bodyScroll: function bodyScroll() {
    return document.body.scrollHeight;
  },
  /**
   * Get the documentElement.offsetHeight
   * @returns {number}
   */
  documentElementOffset: function documentElementOffset() {
    return document.documentElement.offsetHeight;
  },
  /**
   * Get the documentElement.scrollHeight
   * @returns {number}
   */
  documentElementScroll: function documentElementScroll() {
    return document.documentElement.scrollHeight;
  },
  /**
   * Get the total width of the top-level elements on the page
   * @returns {number}
   */
  content: function content() {
    if (document.body.scrollHeight > document.body.clientHeight) {
      return document.body.scrollHeight;
    }

    return recursivelyGetHeight(getTopLevelElements());
  },
  /**
   * Get the height of the element that's closest to the bottom of the page
   * @returns {number}
   */
  furthestElement: function furthestElement() {
    return getMaxElement('bottom', getAllElements());
  },
  /**
   * Get the min value of all the base measurements
   * @returns {number}
   */
  min: function min() {
    return Math.min.apply(null, getAllMeasurements(heightCalc));
  },
  /**
   * Get the max value of all the base measurements
   * @returns {number}
   */
  max: function max() {
    return Math.max.apply(null, getAllMeasurements(heightCalc));
  }
};

var widthCalc = {
  /**
   * Get the body.offsetWidth
   * @returns {number}
   */
  bodyOffset: function bodyOffset() {
    return document.body.offsetWidth;
  },
  /**
   * Get the body.scrollWidth
   * @returns {number}
   */
  bodyScroll: function bodyScroll() {
    return document.body.scrollWidth;
  },
  /**
   * Get the documentElement.offsetWidth
   * @returns {number}
   */
  documentElementOffset: function documentElementOffset() {
    return document.documentElement.offsetWidth;
  },
  /**
   * Get the documentElement.scrollWidth
   * @returns {number}
   */
  documentElementScroll: function documentElementScroll() {
    return document.documentElement.scrollWidth;
  },
  /**
   * Get the width of the element that's furthest to the right of the page
   * @returns {number}
   */
  furthestElement: function furthestElement() {
    return getMaxElement('right', getTopLevelElements());
  },
  /**
   * Get the total width of the top-level elements on the page
   * @returns {number}
   */
  content: function content() {
    if (document.body.scrollWidth > document.body.clientWidth) {
      return getSmallestOffsetLeft() + document.body.scrollWidth;
    }

    return getSmallestOffsetLeft() + recursivelyGetWidth(getTopLevelElements());
  },
  /**
   * Get the min value of all the base measurements
   * @returns {number}
   */
  min: function min() {
    return Math.min.apply(null, getAllMeasurements(widthCalc));
  },
  /**
   * Get the max value of all the base measurements
   * @returns {number}
   */
  max: function max() {
    return Math.max.apply(null, getAllMeasurements(widthCalc));
  },
  /**
   * Gets the max of body.scrollWidth & documentElement.scrollWidth
   * @returns {number}
   */
  scroll: function scroll() {
    return Math.max(widthCalc.bodyScroll(), widthCalc.documentElementScroll());
  }
};

var ContentSizer = function () {
  /**
   * UpdateHandler Function
   *
   * @callback UpdateHandler
   * @param {{ width: string, height: string }} dimensions
   *
   * @returns {*}
   */

  /**
   * ContentSizer
   * Auto-detects sizing needs, and executes resizing on command
   *
   * @param {UpdateHandler} updateHandler
   * @param {Object} methods
   * @param {'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' | 'furthestElement' | 'min' | 'max'} methods.height
   * @param {'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' | 'furthestElement' | 'min' | 'max' | 'scroll'} methods.width
   */
  function ContentSizer() {
    var updateHandler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function (d) {};
    var methods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ContentSizer);

    this.updateHandler = updateHandler;
    this.heightMethod = typeof methods.height === 'string' ? methods.height : 'content';
    this.widthMethod = typeof methods.width === 'string' ? methods.width : 'content';
    this.observer = null;
    this.auto = false;
    this.currentWidth = 0;
    this.currentHeight = 0;
    this.events = ['animationstart', 'webkitAnimationStart', 'animationiteration', 'webkitAnimationIteration', 'animationend', 'webkitAnimationEnd', 'orientationchange', 'transitionstart', 'webkitTransitionStart', 'MSTransitionStart', 'oTransitionStart', 'otransitionstart', 'transitioniteration', 'webkitTransitionIteration', 'MSTransitionIteration', 'oTransitionIteration', 'otransitioniteration', 'transitionend', 'webkitTransitionEnd', 'MSTransitionEnd', 'oTransitionEnd', 'otransitionend'];
  }

  /**
   * Measures Page dimensions and calls updater function with dimensions if changed.
   */


  _createClass(ContentSizer, [{
    key: 'measureAndUpdate',
    value: function measureAndUpdate() {
      var height = this.currentHeight;
      var width = this.currentWidth;

      this.currentHeight = this.getHeight();
      this.currentWidth = this.getWidth();

      if (this.isSizeChanged(height, this.currentHeight, 2) || this.isSizeChanged(width, this.currentWidth, 2)) {
        this.updateHandler({
          width: this.currentWidth + 'px',
          height: this.currentHeight + 'px'
        });
      }
    }

    /**
     * Initialize autosizing via Mutation Observer
     */

  }, {
    key: 'autoSize',
    value: function autoSize() {
      if (this.auto) {
        return null;
      }

      this.auto = true;

      this.measureAndUpdate();
      this.observer = this.setupMutation();
      this.addEventHandlers();
    }
  }, {
    key: 'addEventHandlers',
    value: function addEventHandlers() {
      var _this = this;

      this.events.forEach(function (value) {
        window.addEventListener(value, _this.handleEvent.bind(_this));
      });
    }
  }, {
    key: 'removeEventHandlers',
    value: function removeEventHandlers() {
      var _this2 = this;

      this.events.forEach(function (value) {
        window.removeEventListener(value, _this2.handleEvent.bind(_this2));
      });
    }
  }, {
    key: 'stopAutoSize',
    value: function stopAutoSize() {
      this.auto = false;
      this.removeEventHandlers();

      if (!this.observer) return null;

      this.observer.disconnect();
      this.observer = false;
    }
  }, {
    key: 'handleEvent',
    value: function handleEvent(e) {
      this.measureAndUpdate();
    }

    /**
     * Get the page width
     * @param method
     * @returns {number}
     */

  }, {
    key: 'getWidth',
    value: function getWidth() {
      var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.widthMethod;

      return widthCalc[method]();
    }

    /**
     * Get the page height
     * @param method
     * @returns {number}
     */

  }, {
    key: 'getHeight',
    value: function getHeight() {
      var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.heightMethod;

      return heightCalc[method]();
    }

    /**
     * Sets up MutationObserver
     * @returns {MutationObserver}
     */

  }, {
    key: 'setupMutation',
    value: function setupMutation() {
      var _this3 = this;

      var MutationClass = window.MutationObserver || window.WebKitMutationObserver;

      var observer = new MutationClass(function (mutations, observer) {
        setTimeout(function () {
          _this3.measureAndUpdate();
        }, 16);
      });

      observer.observe(document.querySelector('body'), {
        attributes: true,
        attributeOldValue: false,
        characterData: true,
        characterDataOldValue: false,
        childList: true,
        subtree: true
      });

      return observer;
    }

    /**
     * Check if a size has changed
     * @param originalValue
     * @param newValue
     * @param tolerance
     * @returns {boolean}
     */

  }, {
    key: 'isSizeChanged',
    value: function isSizeChanged(originalValue, newValue) {
      var tolerance = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      return Math.abs(originalValue - newValue) >= tolerance;
    }
  }]);

  return ContentSizer;
}();

exports.default = ContentSizer;