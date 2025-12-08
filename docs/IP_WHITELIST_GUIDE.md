# IP Whitelist Configuration Guide

## 📁 Location
`config/ip-whitelist.json`

## 🔧 Configuration

### Basic Setup

1. **Find Your IP Address**
   - Visit: https://whatismyipaddress.com/
   - Copy your IPv4 address (e.g., `203.0.113.45`)

2. **Edit the Configuration File**
   ```json
   {
     "ipWhitelist": {
       "enabled": true,
       "allowedIPs": [
         "127.0.0.1",
         "::1",
         "YOUR_IP_ADDRESS_HERE"
       ]
     }
   }
   ```

3. **Save and Restart**
   - The changes are applied immediately (no restart needed in development)
   - In production, restart your server

---

## 📝 Configuration Examples

### Development (Allow Localhost Only)
```json
{
  "ipWhitelist": {
    "enabled": false,
    "allowedIPs": [
      "127.0.0.1",
      "::1"
    ]
  }
}
```

### Single Office IP
```json
{
  "ipWhitelist": {
    "enabled": true,
    "allowedIPs": [
      "127.0.0.1",
      "::1",
      "203.0.113.45"
    ]
  }
}
```

### Multiple Office Locations
```json
{
  "ipWhitelist": {
    "enabled": true,
    "allowedIPs": [
      "127.0.0.1",
      "::1",
      "203.0.113.45",
      "198.51.100.23",
      "192.0.2.1"
    ]
  }
}
```

### Allow All (Not Recommended for Production)
```json
{
  "ipWhitelist": {
    "enabled": true,
    "allowedIPs": ["*"]
  }
}
```

### Disabled (Allow All)
```json
{
  "ipWhitelist": {
    "enabled": false,
    "allowedIPs": []
  }
}
```

---

## 🔒 How It Works

1. **Priority**: Configuration file takes priority over `.env` variable
2. **Fallback**: If config file doesn't exist, it checks `ADMIN_IP_WHITELIST` in `.env`
3. **Default**: If nothing is configured, all IPs are allowed

### Security Flow
```
Request to /admin
    ↓
Check config/ip-whitelist.json
    ↓
Is enabled = true?
    ↓ Yes
Check if client IP in allowedIPs
    ↓ No
403 Forbidden
```

---

## 🌐 IP Address Types

### IPv4 (Most Common)
```
203.0.113.45
192.168.1.100
10.0.0.5
```

### IPv6
```
::1 (localhost)
2001:0db8:85a3:0000:0000:8a2e:0370:7334
```

### Special Values
- `127.0.0.1` - Localhost IPv4
- `::1` - Localhost IPv6
- `*` - Wildcard (allow all)

---

## ⚠️ Important Notes

1. **Always Include Localhost**
   ```json
   "allowedIPs": [
     "127.0.0.1",  // For local development
     "::1",         // For local development (IPv6)
     "YOUR_IP"
   ]
   ```

2. **Dynamic IPs**
   - If your IP changes frequently, consider:
     - Using a VPN with static IP
     - Setting up IP ranges (coming soon)
     - Disabling IP whitelist and relying on other security measures

3. **Testing**
   - Before enabling in production, test from your actual location
   - Have a backup access method (server console, SSH)

4. **Corporate Networks**
   - Your office might use a NAT gateway
   - All employees might share the same public IP
   - Check with IT department

---

## 🚀 Quick Commands

### Get Your Current IP (Command Line)
```bash
# Windows
curl ifconfig.me

# Linux/Mac
curl ifconfig.me
```

### Test If You're Blocked
- Try accessing `/admin/login`
- If blocked, you'll see: `Access Denied` (403 error)

---

## 🔄 Hot Reload

The configuration file is read on each request, so you can update it without restarting the server in development.

**Note**: For better performance in production, consider caching the config and reloading only when the file changes.

---

## 🛡️ Security Best Practices

1. **Production Checklist**
   - [ ] Enable IP whitelist (`"enabled": true`)
   - [ ] Remove wildcard `*` if present
   - [ ] Add only necessary IPs
   - [ ] Test from all allowed locations
   - [ ] Document which IP belongs to which location

2. **Maintenance**
   - Review IP list quarterly
   - Remove IPs for employees who left
   - Update when office location changes
   - Keep backup of configuration

3. **Monitoring**
   - Check logs for blocked IP attempts
   - Monitor for unusual access patterns
   - Set up alerts for repeated blocks

---

## 📋 Troubleshooting

### "Access Denied" Error

**Problem**: Can't access admin panel  
**Solution**: 
1. Check your current IP: https://whatismyipaddress.com/
2. Add it to `allowedIPs` array in `config/ip-whitelist.json`
3. Or temporarily disable: `"enabled": false`

### Configuration Not Working

**Problem**: Changes not taking effect  
**Solutions**:
1. Check JSON syntax is valid
2. Restart dev server: `npm run dev`
3. Clear browser cache
4. Check file path: `config/ip-whitelist.json`

### Can't Find Your IP

**Problem**: Don't know what IP to add  
**Solutions**:
1. Visit: https://whatismyipaddress.com/
2. Run: `curl ifconfig.me`
3. Check router settings
4. Ask your network administrator

---

## 🔗 Related Files

- `lib/security.ts` - IP whitelist logic
- `middleware.ts` - IP check implementation
- `.env` - Fallback IP whitelist configuration

---

**Last Updated**: November 25, 2025
