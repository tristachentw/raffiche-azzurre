/*
 * - 增加常用超連結 [appendHyperlink]
 * - 增加自動點選廣告功能 [appendAutoClickAdElement]
 *   - localStorage key: auto-ad-count
 *   - if (hasAdLink) {
 *       if (auto-ad-count > 0) {
 *         clickAdAndReload();
 *         renderAdToggleElement(off);
 *       } else {
 *         renderAdToggleElement(on);
 *       }
 *     }
 */

import css from '../../styles/index.styl';
import React from '../utils/react-like.js';
import * as utils from '../utils/common.js';
import * as request from '../utils/request.js';

const HYPERLINKS_MAP = {
  trainer   : '/facilities/trainer/train-goalkeeping',
  youth     : '/facilities/youth/log',
  scout     : '/facilities/scout/players',
  friendlies: '/friendlies/friendlies',
  bsquad    : '/players/bsquad'
};

const elContainer = document.querySelector('#content');

const appendHyperlink = () => {
  const paths = location.pathname.split('/'),
        prefixUrl = '{0}/{1}/{2}'.format(location.origin, paths[1], paths[2]),
        linkKeys = ['trainer', 'youth', 'scout', 'friendlies', 'bsquad'],
        elLinks = <div></div>;

  linkKeys.forEach(key => {
    const url = prefixUrl + HYPERLINKS_MAP[key],
          i18nKey = 'label_' + key;
    elLinks.appendChild(<a class='link' href={url}>{chrome.i18n.getMessage(i18nKey)}</a>);
  });
  elContainer.insertBefore(elLinks, elContainer.firstChild);
};

const appendAutoClickAdElement = () => {
  const STORAGE_KEY = 'auto-ad-count',
        elAdLinks = document.querySelectorAll('a.external');
  let elAdToggle, timer;

  const renderAdToggleElement = isAdEnabled => {
    const flag = isAdEnabled ? 'off' : 'on',
          i18nKey = 'label_auto_ad_{0}'.format(flag),
          btnLabel = chrome.i18n.getMessage(i18nKey),
          count = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    if (elAdToggle) {
      elAdToggle.parentNode.removeChild(elAdToggle);
    }
    elAdToggle = (
      <div>
        <button id='btn-toggle' data-toggle={flag}>{btnLabel}</button>
        <input id='input-ad-count' disabled={isAdEnabled} value={count}/>
        <span>{chrome.i18n.getMessage('label_times')}</span>
      </div>
    );
    elContainer.insertBefore(elAdToggle, elContainer.firstChild.nextElementSibling);
    document.querySelector('#btn-toggle').addEventListener('click', toggleAd);
  };

  const toggleAd = e => {
    const count = parseInt(document.querySelector('#input-ad-count').value, 10) || 0,
          isAdEnabled = (e.currentTarget.dataset.toggle === 'on') && count > 0;
    if (isAdEnabled) {
      localStorage.setItem(STORAGE_KEY, count);
      clickAdAndReload();
    } else {
      if (timer) {
        clearTimeout(timer);
      }
      localStorage.setItem(STORAGE_KEY, 0);
    }
    renderAdToggleElement(isAdEnabled);
  };

  const clickAdAndReload = () => {
    const count = parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    localStorage.setItem(STORAGE_KEY, count - 1);
    elAdLinks.forEach(el => request.get(el.href, { mode: 'no-cors' }));
    timer = setTimeout(() => location.reload(), 1000);
  };

  if (elAdLinks.length > 0) {
    const isAdEnabled = parseInt(localStorage.getItem(STORAGE_KEY), 10) > 0;
    if (isAdEnabled) {
      clickAdAndReload();
    }
    renderAdToggleElement(isAdEnabled);
  }
};

//if logined
if (elContainer) {
  appendHyperlink();
  appendAutoClickAdElement();
}
