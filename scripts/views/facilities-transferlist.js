/*
 * - 加上額外資訊 [appendExtraInfo]
 * - localStorage key: transfer-check-items
 */

import React from '../utils/react-like.js';
import * as request from '../utils/request.js';
import htmlParser from '../helpers/htmlParser.js';
import * as playerDom from '../helpers/player-dom.js';

const PROP_KEYS = [
  'age',

  'talent',
  'scoring',
  'attack',

  'endurance',
  'passing',
  'midfield',

  'power',
  'dueling',
  'defense',

  'speed',
  'blocking',
  'goalkeeping',

  'tactics',
  'flank',

  'main_fixed_feature',
  'main_trainable_feature',
  'total_exp',
  'player_score',
  'premium_rate',
  'born'
];
let keys;

const appendCheckItems = () => {
  const target = document.querySelector('.subtab-content');
  const el = (
    <div>
      <div></div>
      <button id='btnCheck'>{'OK'}</button>
    </div>
  );

  PROP_KEYS.forEach(key => {
    const elCheck = (
      <span>
        <input type='checkbox' name='items[]' value={key}/>
        {chrome.i18n.getMessage('player_' + key)}
      </span>
    );
    el.firstChild.appendChild(elCheck);
  });

  keys = localStorage.getItem('transfer-check-items');
  keys = keys ? JSON.parse(keys) : [];
  keys.forEach(key => {
    el.querySelector('input[value={0}]'.format(key)).checked = true;
  });

  el.querySelector('#btnCheck').onclick = e => {
    keys = [].map.call(document.querySelectorAll('input[name*=items]:checked'), el => el.value);
    localStorage.setItem('transfer-check-items', JSON.stringify(keys));
    location.reload();
  };
  target.insertBefore(el, target.children[1]);
};

const appendExtraInfo = () => {
  const elHeadRow = document.querySelector('.horizontal_table thead tr'),
        elBodyRow = document.querySelectorAll('.horizontal_table tbody tr'),
        playerNum = elBodyRow.length,
        players = [];

  //head
  keys.forEach(key => {
    elHeadRow.appendChild(<th>{chrome.i18n.getMessage('player_' + key)}</th>);
  });

  //body
  elBodyRow.forEach(el => {
    const playerUrl = el.querySelector('td:first-child a:nth-child(2)').href,
          employmentUrl = playerUrl + '/employment';
    request.get(playerUrl).then(doc => {
      const player = htmlParser(doc.querySelector('.center'));
      player.bid_price = el.children[4].textContent.replace(/\D/ig, '');
      player.premium_rate = Math.round(player.bid_price * 100 / player.market_value) + '%';


      request.get(employmentUrl).then(doc => {
        const note = doc.querySelector('.footnote').textContent;
        player.born = ((note.match(/\d* 青訓中心/g) || note.match(/用 \d*/g) || [])[0]).replace(/\D/ig, '');

        keys.forEach(key => el.appendChild(<td>{player[key]}</td>));
      });
    });

  });
};

appendCheckItems();
appendExtraInfo();
playerDom.addTooltips();
