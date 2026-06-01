# License Activation Guide

## Overview

CS:GO 2 Live Voice Translation Mod requires a valid license key to run. Your license key was provided when you purchased the software.

## License Key Format

License keys follow this format:

```
XXXX-XXXX-XXXX-XXXX
```

Where each X is a hexadecimal character (0-9, A-F).

Example: `A1B2-C3D4-E5F6-7890`

## Activation Process

### First Launch

When you first run the application:

1. **License dialog appears automatically**

   - The dialog will be modal (you must activate to continue)
   - Enter your license key in the provided field
   - The key will auto-format as you type

2. **Enter your license key**

   - Type or paste your license key
   - Format: XXXX-XXXX-XXXX-XXXX
   - Case doesn't matter (automatically converted to uppercase)

3. **Click "Activate"**
   - The application validates your license key
   - If valid, the license is saved and encrypted on your computer
   - The application will start normally

### Manual Activation

If you need to activate or change your license later:

1. **Open the application**
2. **Click the "🔑 License" button** in the status bar
3. **Enter your license key**
4. **Click "Activate"**

### Check License Status

To verify your license status:

1. Click the "🔑 License" button
2. Click "Check License Status"
3. You'll see:
   - Active license with masked key (e.g., `A1B2-XXXX-XXXX-7890`)
   - Or "No valid license found" if not activated

## License Details

### Hardware Binding

- Your license is tied to your computer's hardware
- The license uses your CPU ID and system information to create a unique fingerprint
- This prevents sharing licenses between computers

### License Storage

- License data is stored in: `%USERPROFILE%\.csgo2_translation\license.dat`
- The license file is encrypted and tied to your hardware
- Do not share or modify this file

### Offline Validation

- The license validation works offline
- No internet connection required for license checks
- License is validated locally using cryptographic methods

## Troubleshooting

### "Invalid license key format"

**Problem**: The license key format is incorrect.

**Solution**:

- Make sure you're entering all 16 characters
- Format should be: XXXX-XXXX-XXXX-XXXX
- Only hexadecimal characters (0-9, A-F) are allowed
- Check for typos or extra spaces

### "License activation failed"

**Problem**: The license key could not be activated.

**Possible causes**:

- Invalid license key
- Corrupted license file
- File system permissions issue

**Solutions**:

1. Verify your license key is correct
2. Try running the application as Administrator
3. Check that you have write permissions in your user folder
4. Contact support if the problem persists

### "No license found" on startup

**Problem**: The application can't find a valid license.

**Solutions**:

1. Click "Activate License" when prompted
2. Enter your license key
3. If you've lost your license key, contact support with your purchase email

### License not working after system changes

**Problem**: License stopped working after hardware/OS changes.

**Note**: The license is tied to your hardware. Minor changes (RAM upgrade, etc.) should not affect it, but major changes (new motherboard, new computer) will require a new license or license transfer.

**Solution**: Contact support for license transfer assistance.

### Lost License Key

**Problem**: You've lost or forgotten your license key.

**Solution**:

1. Check your purchase confirmation email
2. Check your spam/junk folder
3. Log into your itch.io or Gumroad account to find your purchase
4. Contact support with your purchase email for license key recovery

## License Terms

- **Single User License**: One license per purchase
- **Hardware Bound**: License is tied to one computer
- **Non-Transferable**: Cannot be shared or transferred without authorization
- **No Refunds**: License activation is final (see refund policy)

## Support

If you're having trouble with license activation:

1. **Check this guide** for common issues
2. **Verify your license key** format and correctness
3. **Contact support** with:
   - Your purchase email
   - License key (if you have it)
   - Error message (if any)
   - System information (Windows version)

## Frequently Asked Questions

**Q: Can I use my license on multiple computers?**
A: No, each license is tied to one computer. You'll need a separate license for each computer.

**Q: What happens if I upgrade my computer?**
A: Minor upgrades (RAM, storage) won't affect your license. Major changes (new motherboard) may require license transfer - contact support.

**Q: Can I deactivate and reactivate on a different computer?**
A: Contact support for license transfer assistance.

**Q: Do I need internet for license activation?**
A: No, license activation works offline. However, the translation features require internet for the translation API.

**Q: How do I know if my license is valid?**
A: Click the "🔑 License" button and check the status. A valid license will show a masked key.

**Q: What if I format my hard drive?**
A: You'll need to reactivate your license. The license file will be deleted, but your license key remains valid for reactivation.
