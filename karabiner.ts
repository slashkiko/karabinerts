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

const enableLayer1 = () => {
  const id = 'Layer1';
  const activated = 1;
  const deactivated = 0;
  const trigger = 'right_option';
  return rule(id).manipulators([
    withMapper([
      'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
    ] as const)((k, i) =>
      map(k)
        .to(`keypad_${k === 'p' ? 0 : i + 1 as 0}`)
        .condition({
          name: id,
          type: 'variable_if',
          value: activated,
        })),
    withMapper({
      'open_bracket': 'hyphen',  // [
      'close_bracket': 'equal_sign', // ]
    } as const)((keyFrom, keyTo) =>
      map({ key_code: keyFrom })
        .to({ key_code: keyTo })
        .condition({
          name: id,
          type: 'variable_if',
          value: activated,
        })),
    withMapper([
      'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'semicolon', 'quote', 'slash',
    ] as const)((k, i) =>
      map(k)
        .to({ key_code: `${k === 'semicolon' ? 0 : (k === 'quote' ? 'hyphen' : (k === 'slash' ? 'equal_sign' : i + 1 as 0))}`, modifiers: ['shift'] })
        .condition({
          name: id,
          type: 'variable_if',
          value: activated,
        })),
    map({
      key_code: trigger,
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

const alwaysHalfSpace = () => {
  return rule('Always half space').manipulators([
    map({
      key_code: 'spacebar',
    })
      .to(
        {
          key_code: 'spacebar',
          modifiers: ['left_shift']
        }
      )
      .condition({
        type: 'input_source_if',
        input_sources: [{
          input_mode_id: "com.apple.inputmethod.Japanese",
          language: "ja"
        }]
      }),
    map({
      key_code: 'spacebar',
      modifiers: { mandatory: ['left_shift'] }
    })
      .to(
        {
          key_code: 'spacebar',
        }
      )
      .condition({
        type: 'input_source_if',
        input_sources: [{
          input_mode_id: "com.apple.inputmethod.Japanese",
          language: "ja"
        }]
      }),
  ]);
}

writeToProfile('karabiner_ts', [
  useCommandAsKanaEisuu(),
  quitAppByPressingCommandQTwice(),
  swapCapsLockAndLeftControl(),
  enableLayer1(),
  alwaysHalfSpace(),
]);
