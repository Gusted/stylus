/* global update */
'use strict';


setupLivePrefs([
  'show-badge',
  'popup.stylesFirst',
  'badgeNormal',
  'badgeDisabled',
  'popupWidth',
  'updateInterval',
]);
enforceInputRange($('#popupWidth'));

// overwrite the default URL if browser is Opera
$('[data-cmd="open-keyboard"]').href = configureCommands.url;

// actions
document.onclick = e => {
  const cmd = e.target.dataset.cmd;
  let total = 0;
  let updated = 0;

  function showProgress() {
    $('#update-counter').textContent = `${updated} / ${total}`;
  }

  function done(target) {
    target.disabled = false;
    window.setTimeout(() => {
      $('#update-counter').textContent = '';
    }, 750);
  }

  function check() {
    chrome.extension.getBackgroundPage().update.perform((cmd, value) => {
      switch (cmd) {
        case 'count':
          total = value;
          if (!total) {
            done(e.target);
          }
          break;
        case 'single-updated':
        case 'single-skipped':
          updated++;
          if (total && updated === total) {
            done(e.target);
          }
          break;
      }
      showProgress();
    });
    // notify the automatic updater to reset the next automatic update accordingly
    chrome.runtime.sendMessage({
      method: 'resetInterval'
    });
  }

  switch (cmd) {
    case 'open-manage':
      openURL({url: '/manage.html'});
      break;

    case 'check-updates':
      e.target.disabled = true;
      check();
      break;

    case 'open-keyboard':
      configureCommands.open();
      break;

    case 'reset':
      $$('input')
        .filter(input => input.id in prefs.readOnlyValues)
        .forEach(input => prefs.reset(input.id));
      break;
  }
};
