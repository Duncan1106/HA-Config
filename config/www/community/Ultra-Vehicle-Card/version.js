/**
 * Ultra Vehicle Card Version
 * v2.8.3.2
 * 
 * This file is auto-generated from src/version.ts
 * DO NOT MODIFY DIRECTLY
 */

let version = "undefined";

/**
 * Sets the current version string for the Ultra Vehicle Card.
 *
 * @param {string} value - The version to assign.
 */
function setVersion(value) {
  version = value;
}

// Set default version (will be overridden by card)
setVersion('2.8.3.2');

export { version, setVersion };