# Quick Start: Accessing New Integrations Features

## The Integrations Button

The **Integrations** button should appear in the top toolbar, next to the History, Statistics, and Privacy buttons.

## If You Don't See the Button

### Option 1: Restart the Application

**Close and restart the app** - The button was added to the code, but you need to restart to see it.

### Option 2: Use Keyboard Shortcut

Press **Ctrl+I** (or **Ctrl+Shift+I**) to open the Integrations dialog directly.

### Option 3: Check Console Output

When you start the app, look for this message in the console:

```
[UI] Integrations button created successfully
```

If you see an error instead, that will tell us what's wrong.

## What's in the Integrations Dialog

Once you open it (via button or Ctrl+I), you'll see:

1. **Discord Integration**

   - Status: Available/Not Available
   - Rich Presence connection status
   - Connect button if not connected

2. **Steam Integration**

   - Status: Available/Not Available
   - Number of friends detected
   - Language preferences

3. **OBS Studio Integration**

   - Status: Available/Not Available
   - Connection status
   - Connect button to link with OBS

4. **Voice Cloning**
   - Status: Available/Not Available
   - Initialization status
   - Initialize button if not initialized

## Testing the Features

1. **Restart the app** (important!)
2. Look for the **Integrations** button (🔌 icon) in the toolbar
3. OR press **Ctrl+I** to open the dialog
4. Check the status of each integration
5. Connect/initialize the ones you want to use

## Troubleshooting

If the button still doesn't appear after restarting:

1. Check the console for errors starting with `[ERROR] Failed to create Integrations button`
2. Try the keyboard shortcut **Ctrl+I** instead
3. The integrations will still work even if the button doesn't show - they initialize automatically

## What Works Automatically

Even without the button, these features work automatically:

- Discord Rich Presence (if Discord is running)
- Steam friend detection (if Steam is installed)
- Collaboration server (starts when translation begins)
- OBS integration (needs manual connection)

The button just provides a convenient way to see status and configure them.
