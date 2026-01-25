# Installing New Dependencies

To use the new features (Pothole Images & PDF Reports), you need to install additional dependencies:

## 📦 Install PDF Generation Libraries

```bash
npm install jspdf jspdf-autotable
```

## 🎯 What These Libraries Do

### jsPDF
- **Purpose**: Client-side PDF generation
- **Use**: Creating professional contractor reports
- **Size**: Lightweight (~200KB)
- **Government Ready**: Suitable for official documentation

### jsPDF AutoTable
- **Purpose**: Professional table generation in PDFs
- **Use**: Road portfolio tables in contractor reports
- **Features**: Auto-sizing, styling, pagination

## 🚀 After Installation

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the new features**:
   - **Pothole Images**: Go to Potholes page, click photo thumbnails
   - **PDF Reports**: Go to Contractors page, click "Download Report" buttons

## 🔮 Future IoT Integration

These libraries are chosen for future compatibility:
- **Images**: Ready for real camera feeds from IoT rovers
- **PDFs**: Ready for government compliance and digital signatures

## 📋 Dependencies Added

```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2"
}
```

## ✅ Verification

After installation, you should be able to:
1. See photo thumbnails in the pothole list
2. Click thumbnails to open full-screen image viewer
3. Download PDF reports from contractor pages
4. Generate professional government-style reports

If you encounter any issues, ensure you're using Node.js 18+ and restart your development server.