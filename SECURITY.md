# Security Guidelines for Git Nacht

## 🔒 Security by Design

Git Nacht is designed with security as a top priority. Here's how we ensure your data stays safe:

### Database Security

**✅ What's Safe:**
- Each user runs their own local MySQL instance
- Database credentials are stored in local `.env` files only
- No shared databases or cloud services
- Complete isolation between installations

**❌ What's Never Shared:**
- Database credentials (`.env` files)
- Screenshot files
- User data
- Authentication tokens

### Distribution Security

When you distribute Git Nacht via pip or GitHub:

**✅ Included in distribution:**
```
src/                    # Source code (no secrets)
requirements.txt        # Dependencies
.env.example           # Template only (fake credentials)
README.md              # Documentation
setup.py               # Installation script
.gitignore             # Prevents accidental commits
```

**❌ Never included:**
```
.env                   # Real credentials (gitignored)
screenshots/           # User screenshots (gitignored)
*.db files            # Database files (gitignored)
logs/                  # Log files (gitignored)
```

### Authentication Security

- **JWT tokens**: Expire after 24 hours (configurable)
- **Password hashing**: Uses bcrypt with salt
- **Role-based access**: Admin/User separation
- **Local only**: No external authentication services

### Screenshot Security

- **Local storage**: Screenshots saved to local filesystem
- **No cloud upload**: Images never leave your machine
- **Access control**: API requires authentication to view images
- **Path validation**: Prevents directory traversal attacks

## 🚀 Safe Distribution Checklist

Before publishing to PyPI or GitHub:

1. **✅ Verify .gitignore** - Ensures sensitive files aren't committed
2. **✅ Check .env.example** - Only contains placeholder values
3. **✅ Review source code** - No hardcoded credentials
4. **✅ Test clean install** - Works without your personal config

## 🛡️ User Security Best Practices

### For End Users:
1. **Never commit .env files** to version control
2. **Use strong database passwords**
3. **Keep JWT secrets secure**
4. **Regularly update dependencies**

### For Contributors:
1. **Never commit real credentials**
2. **Use .env.example for documentation**
3. **Test with fresh database instances**
4. **Follow secure coding practices**

## 🔍 Security Audit

The codebase includes these security measures:

```python
# Example: No hardcoded credentials
self.host = os.getenv('DB_HOST', 'localhost')  # ✅ Environment variable
# NOT: self.host = 'my-secret-server.com'     # ❌ Hardcoded

# Example: SQL injection protection
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))  # ✅ Parameterized
# NOT: cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")  # ❌ Injectable

# Example: Password hashing
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())  # ✅ Hashed
# NOT: password_plain = password  # ❌ Plain text
```

## 📞 Reporting Security Issues

If you find a security vulnerability:

1. **Don't** create a public GitHub issue
2. **Do** email security concerns privately
3. **Include** steps to reproduce
4. **Wait** for acknowledgment before public disclosure

## 🎯 Summary

**Git Nacht is 100% safe to distribute** because:
- No shared infrastructure
- Local-only data storage  
- Environment-based configuration
- Proper gitignore protection
- Security-first design

Your database credentials and screenshots remain completely private to your installation.
