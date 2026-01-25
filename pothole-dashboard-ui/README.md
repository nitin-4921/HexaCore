# Smart Pothole Detection & Road Health Rover Dashboard

A comprehensive full-stack application for monitoring and managing pothole detection and road infrastructure health using IoT sensors and smart city technology.

## 🚀 Features

### Frontend (Next.js + TypeScript)
- **Interactive Dashboard** with real-time city selection
- **Clickable Summary Cards** that navigate to filtered views
- **City-based Filtering** across all components
- **Pothole Management** with advanced search and filtering
- **📸 Pothole Image Evidence** with professional viewer modal
- **Road Health Monitoring** with contractor accountability
- **Contractor Analytics** with performance metrics
- **📄 PDF Report Generation** for contractor documentation
- **Interactive Maps** with IoT sensor data visualization
- **Responsive Design** optimized for desktop and mobile

### Backend (Node.js + Express)
- **RESTful API** with comprehensive endpoints
- **IoT-Ready Data Structure** for real sensor integration
- **Multi-City Support** with scalable architecture
- **📷 Image Metadata Support** for camera integration
- **Realistic Mock Data** for development and testing
- **Error Handling** and validation
- **CORS Support** for frontend integration

## 🏗️ Architecture

```
pothole-dashboard-ui/
├── app/                    # Next.js App Router pages
│   ├── contractors/        # Contractor analytics page
│   ├── potholes/          # Pothole management page
│   ├── roads/             # Road health monitoring
│   └── page.tsx           # Main dashboard
├── components/            # Reusable UI components
│   ├── dashboard/         # Dashboard-specific components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── city-selector.tsx  # City selection dropdown
│   └── sidebar.tsx        # Navigation sidebar
├── contexts/             # React contexts
│   └── city-context.tsx  # City state management
├── lib/                  # Utilities and configurations
│   ├── api.ts            # API client and types
│   └── mock-data.ts      # Fallback mock data
└── backend/              # Express.js API server
    ├── routes/           # API route handlers
    ├── data/            # Mock data generation
    └── server.js        # Main server file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icon library
- **MapLibre GL** - Interactive maps
- **React Context** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pothole-dashboard-ui
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # Install new PDF generation libraries
   npm install jspdf jspdf-autotable
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:3001`

5. **Start the frontend development server**
   ```bash
   # In a new terminal, from the root directory
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

## 📊 API Endpoints

### Cities
- `GET /api/cities` - Get all cities with statistics
- `GET /api/cities/:id` - Get specific city details

### Potholes
- `GET /api/potholes` - Get potholes with filtering
- `GET /api/potholes/:id` - Get specific pothole details
- `GET /api/potholes/stats/summary` - Get pothole statistics

### Roads
- `GET /api/roads` - Get roads with filtering
- `GET /api/roads/:id` - Get specific road details
- `GET /api/roads/stats/summary` - Get road statistics

### Contractors
- `GET /api/contractors` - Get all contractors with statistics
- `GET /api/contractors/:id` - Get specific contractor details
- `GET /api/contractors/:id/roads` - Get roads built by contractor

### IoT Devices
- `GET /api/iot/devices` - Get IoT devices with filtering
- `GET /api/iot/stats` - Get IoT system statistics

## 🎯 Key Features Implemented

### 1. City Dropdown Selection
- **Location**: Main dashboard header
- **Cities**: Delhi, Noida, Mumbai, Pune, Kanpur
- **Behavior**: Updates map center and filters all data
- **Persistence**: Saves selection in localStorage

### 2. Clickable Summary Cards
- **Total Potholes** → Navigate to pothole list for selected city
- **High-Risk Potholes** → Filter by severity = high
- **Roads Needing Repair** → Filter by healthScore < 50
- **Avg Road Health** → Navigate to roads page

### 3. Enhanced Pothole Management
- **Advanced Filtering**: City, severity, status, search
- **Real-time Stats**: Updates based on filters
- **Detailed View**: Click any pothole for comprehensive details
- **URL Parameters**: Support for direct links with filters

### 4. 📸 **NEW: Pothole Image Evidence**
- **Photo Column**: Thumbnail images in pothole list
- **Full-Screen Viewer**: Professional image modal with metadata
- **Camera Information**: Sensor ID, capture time, resolution
- **IoT Ready**: Structured for real rover camera integration
- **Loading States**: Handles missing images gracefully

### 5. Contractor Analytics
- **Performance Metrics**: Rating, road health, total projects
- **Project History**: All roads built by each contractor
- **Contact Information**: Phone, email, address
- **Certifications**: ISO standards and approvals

### 6. 📄 **NEW: PDF Report Generation**
- **Professional Reports**: Government-style contractor documentation
- **Comprehensive Data**: Performance metrics, road portfolio, certifications
- **A4 Printable**: Clean layout suitable for official use
- **Download Buttons**: Available on contractor cards and detail view
- **Future Ready**: Structured for digital signatures and compliance

### 7. Road Health Monitoring
- **Health Score Visualization**: Color-coded progress bars
- **Maintenance History**: Track all repairs and updates
- **Contractor Accountability**: Link roads to builders
- **Pothole Correlation**: Show potholes per road

## 🔮 IoT Integration Ready

The system is architected for seamless IoT integration:

### Data Structure
- **GPS Coordinates**: Precise location tracking
- **Sensor IDs**: Link to physical IoT devices
- **Timestamps**: Real-time detection logging
- **Weather Conditions**: Environmental context
- **Traffic Impact**: Smart routing considerations

### API Design
- **Scalable Endpoints**: Handle high-frequency sensor data
- **Real-time Updates**: WebSocket-ready architecture
- **ML Integration**: Placeholder for AI predictions
- **Device Management**: Monitor rover status and battery

## 🎨 UI/UX Features

- **Professional Design**: Smart city / government tech aesthetic
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark Theme**: Modern dark UI with accent colors
- **Interactive Elements**: Hover effects and smooth transitions
- **Loading States**: Skeleton loaders and error handling
- **Empty States**: Helpful messages when no data is found

## 🔧 Development

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=development
```

### Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
npm run dev          # Start with nodemon
npm start            # Start production server
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy automatically on push

### Backend (Railway/Heroku)
1. Create new project
2. Connect repository
3. Set `PORT` environment variable
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Lucide** for the comprehensive icon set
- **MapLibre** for the mapping capabilities
- **Next.js** team for the excellent framework

---

**Built with ❤️ for Smart Cities**