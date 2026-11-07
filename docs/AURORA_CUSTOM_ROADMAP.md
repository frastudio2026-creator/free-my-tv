# Free My TV Custom — Samsung Q74T roadmap

Target: Samsung QE55Q74TATXZT, T-NKMDEUC-2743.0 (Tizen 2020).

## Implemented on this development branch
- Aurora Borealis Intense static, high-contrast theme for Samsung Tizen only.
- No extra image downloads, frame-loop animations, or timers; old-engine compatible CSS gradients.
- Theme is isolated to `body.aurora-theme` and the stock LG/browser appearance is preserved.
- The dark UI styling remains active throughout the day.

## Not yet implemented / requires physical TV testing
- **Home key / Samsung Smart Hub:** The Samsung Home key is handled by the system. An ordinary Tizen web app cannot claim permanent ownership of the Home key outside its foreground. `tizen/config.xml` currently declares `background-support="disable"`. Do not disable the OS home app or use service-menu/root hacks.
- **Return from Netflix/YouTube:** Requires an independently validated and reversible supported platform integration; do not claim it is solved by CSS/JavaScript focus handlers.
- **Sleep timer, 60/120 min:** A JavaScript timer running inside the launcher will not reliably survive when another app has focus or when Tizen suspends the launcher. A real TV-wide sleep timer needs a tested Samsung-native capability, or use the Samsung's built-in Sleep Timer instead. Do not implement a fake global timer.
- **Separate install:** Before building and sideloading, decide whether the custom package should replace the installed Free My TV or coexist. Coexistence requires a unique Tizen package/app ID and signing. Do not overwrite a working install prematurely.

## How to make a preview build on a development machine
```sh
python3 tizen/build.py --generic --preview
```
This generates an **unsigned** `FreeMyTV-tizen.wgt` and a browser preview at `out/tizen/index.html`. Samsung installation requires valid signing and a separate device compatibility check.

## Safety
Leave firmware, Smart Hub, and the current app installation untouched until actual tests confirm compatibility and a rollback route exists.
