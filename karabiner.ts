import { FromEvent, map, rule, withMapper, writeToProfile } from 'karabinerts';


const useCommandAsKanaEisuu = () => {
  return rule('Tap command to toggle Kana/Eisuu').manipulators([
    withMapper({
      'left_command': 'japanese_eisuu',
      'right_command': 'japanese_kana',
    } as const)((cmd, lang) =>
      map({ key_code: cmd, modifiers: { optional: ['any'] } })
        .to({ key_code: cmd, lazy: true })
        .toIfAlone({ key_code: lang })
        .toIfHeldDown({ key_code: cmd })
        .parameters({ 'basic.to_if_held_down_threshold_milliseconds': 100 })
    ),
  ]);
}

const quitAppByPressingCommandQTwice = () => {
  const commandQ = {
    key_code: 'q',
    modifiers: { mandatory: ['command'], optional: ['caps_lock'] }
  } as const satisfies FromEvent;
  const id = 'command-q';
  const pressedOnce = 1;
  const neverPressed = 0;
  return rule('Quit app by pressing command + q twice',).manipulators([
    map(commandQ)
      .condition({
        name: 'command-q',
        type: 'variable_if',
        value: pressedOnce,
      })
      .to({ key_code: 'q', modifiers: ['left_command'] }),
    map(commandQ)
      .to({ set_variable: { name: id, value: pressedOnce } })
      .toDelayedAction([{
        set_variable: { name: id, value: neverPressed }
      }],
        [{
          set_variable: { name: id, value: neverPressed }
        }]
      )
  ]);
}

const swapCapsLockAndLeftControl = () => {
  return rule('Swap Caps Lock and Left Control',).manipulators([
    withMapper({
      'caps_lock': 'left_control',
      'left_control': 'caps_lock',
    } as const)((keyFrom, keyTo) =>
      map({ key_code: keyFrom, modifiers: { optional: ['any'] } }).to({ key_code: keyTo })
    ),
  ]);
}

const enableLayer2 = () => {
  const id = 'Layer2';
  const activated = 1;
  const deactivated = 0;
  return rule('Enable Layer 2').manipulators([
    withMapper([
      'n',                // 0
      ...['m', ',', '.'], // 1 2 3
      ...['j', 'k', 'l'], // 4 5 6
      ...['u', 'i', 'o'], // 7 8 9
    ] as const)((k, i) =>
      map(k)
        .to(`keypad_${i as 0}`)
        .condition({
          name: id,
          type: 'variable_if',
          value: activated,
        })),

    map({
      key_code: 'right_option',
    })
      .to([{
        set_notification_message: { id, text: `${id} activated` },
      }, {
        set_variable: { name: id, value: activated },
      }])
      .toAfterKeyUp([{
        set_notification_message: { id, text: '' },
      }, {
        set_variable: { name: id, value: deactivated },
      }]),
  ]);
}

writeToProfile('karabiner_ts', [
  useCommandAsKanaEisuu(),
  quitAppByPressingCommandQTwice(),
  swapCapsLockAndLeftControl(),
  enableLayer2(),
]);