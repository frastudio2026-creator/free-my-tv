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
- **Sleep timer, 60/120 min:** A new native-Tizen alarm scheduling UI is present in the drawer, and an *experimental*, undocumented local Samsung remote WebSocket power-off command is wired to its alarm on app launch. The user must first select **Test spegnimento** and physically confirm that the TV really powered down, then choose **Conferma test riuscito** after turning it back on. **This is a prototype, not a validated system sleep timer.** A native Tizen alarm can launch this app at expiry, potentially interrupting Netflix or YouTube. It is not guaranteed that the on-device WebSocket loopback or alarm delivery will work with firmware T-NKMDEUC-2743.0. Never assume success without device testing. The timer cannot power off when the app has been removed, revoked, or suspended without alarm delivery.
- **Separate install:** The `tizen/config.xml` manifest now uses package `AuroraTV26`, application `AuroraTV26.AuroraHome`, separate from stock `FreeMyTVio.FreeMyTV`. Builds still require valid Samsung Tizen signing; verify actual coexistence on the TV before relying on it.

## How to make a preview build on a development machine
```sh
python3 tizen/build.py --generic --preview
```
This generates an **unsigned** `FreeMyTV-tizen.wgt` and a browser preview at `out/tizen/index.html`. Samsung installation requires valid signing and a separate device compatibility check.

## Safety
Leave firmware, Smart Hub, and the current app installation untouched until actual tests confirm compatibility and a rollback route exists.

## Test sequence
1. On Mac: `git pull origin feature/aurora-borealis-intense && python3 tizen/build.py --generic --preview`.
2. Verify browser UI with `http://localhost:8000/?aurora=1` and inspect the timer modal. The browser intentionally cannot arm a real TV timer.
3. Create a signed Tizen package with an authorized developer certificate; **unsigned WGT cannot be installed directly**. Test coexistence with original Free My TV.
4. In Aurora TV on the Samsung, open the drawer and choose **Timer 60/120 → Test spegnimento**. The TV may request remote-control pairing. If the TV stays on, do **not** confirm a successful test or arm the timer.
5. After a real successful power-off test, turn the TV on, launch Aurora TV, choose **Conferma test riuscito**, and arm a 60-minute timer. Verify with Netflix in the foreground. If any step fails, stop, cancel the alarm and use the stock TV timer until compatibility is resolved.
6. For rollback, launch the stock Free My TV from Samsung Apps. The stock app and TV firmware have not been modified.

## Technical risks and limitations
- Samsung Home is a **system-owned key** outside the app. It cannot be remapped globally by a normal Tizen Web app. Keep **Smart Hub Autorun OFF** and **Autorun Last App ON** (the latter already worked on this TV) to minimize Smart Hub on startup; Home still invokes Samsung UI. Never hide system settings without a tested recovery route.
- Sending `KEY_POWEROFF` through `ws://127.0.0.1:8001` is experimental and may be rejected by TV network restrictions, origin policy, or pairing. No promise of automated shutdown on this model before hardware tests.
