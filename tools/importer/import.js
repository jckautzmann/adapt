/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const makeProxySrcs = (main, host) => {
  main.querySelectorAll('img').forEach((img) => {
    if (img.src.startsWith('/')) {
      // make absolute
      const cu = new URL(host);
      img.src = `${cu.origin}${img.src}`;
    }
    try {
      const u = new URL(img.src);
      u.searchParams.append('host', u.origin);
      img.src = `http://localhost:3001${u.pathname}${u.search}`;
    } catch (error) {
      console.warn(`Unable to make proxy src for ${img.src}: ${error.message}`);
    }
  });
};

const createStageHeader = (main, document) => {
  const img = document.querySelector('.stage-header img');
  const imgUrl = new URL(img.src);
  img.src = `https://adapt.to${imgUrl.pathname}${imgUrl.search}`;
  const u = new URL(img.src);
  u.searchParams.append('host', u.origin);
  img.src = `http://localhost:3001${u.pathname}${u.search}`;
  
  const title = document.querySelector('.stage-header .stage-title h2');
  const description = document.querySelector('.stage-header .stage-title div div');
  const ctas = document.querySelectorAll('.stage-header .stage-cta-box p');
  const cta1 = ctas[0];
  const cta2 = ctas[1];
  // put all elements in a cell
  const cell = document.createElement('div');
  cell.append(img, title, description, cta1, cta2);
  const cells = [
    ['Stage Header'],
    [ cell ],
  ];
  const table = WebImporter.DOMUtils.createTable(cells, document);
  main.prepend(table);
}

export default {
  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @returns {HTMLElement} The root element to be transformed
   */
  transformDOM: ({
                   // eslint-disable-next-line no-unused-vars
                   document, url, html, params,
                 }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;
    
    // attempt to remove non-content elements
    WebImporter.DOMUtils.remove(main, [
      'header',
      '.header',
      'nav',
      '.nav',
      'footer',
      '.footer',
      'iframe',
      'noscript',
    ]);
    
    const host = 'https://adapt.to';
    //makeProxySrcs(main, host);

    createStageHeader(main, document);
    
    return main;
  },
  
  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {HTMLDocument} document The document
   * @param {string} url The url of the page imported
   * @param {string} html The raw html (the document is cleaned up during preprocessing)
   * @param {object} params Object containing some parameters given by the import process.
   * @return {string} The path
   */
  generateDocumentPath: ({
                           // eslint-disable-next-line no-unused-vars
                           document, url, html, params,
                         }) => {
    let p = new URL(url).pathname;
    if (p.endsWith('/')) {
      p = `${p}index`;
    }
    return decodeURIComponent(p)
      .toLowerCase()
      .replace(/\.html$/, '')
      .replace(/[^a-z0-9/]/gm, '-');
  },
};