# Kaely Suite Hotel - Multi-Tenant Frontend

A modern, multi-tenant hotel management system built with Next.js 14, TypeScript, and TailwindCSS. This frontend automatically detects tenant slugs from hostnames and connects to the appropriate backend API.

## 🏨 Supported Tenants

- **Ixtapa** → `https://apiixtapa.kaelytechnology.com`
- **Mazanillo** → `https://apimazanillo.kaelytechnology.com`
- **Huatulco** → `https://apihuatulco.kaelytechnology.com`

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios (tenant-aware)
- **Data Fetching**: React Query
- **Theming**: next-themes (dark/light)
- **Notifications**: react-hot-toast

## 📁 Project Structure

```
app/
├─ [tenant]/
│   ├─ page.tsx                 # Landing page
│   ├─ login/
│   │   └─ page.tsx             # Login form
│   └─ dashboard/
│       ├─ layout.tsx           # Sidebar layout
│       ├─ page.tsx             # Dashboard home
│       ├─ users/page.tsx       # User management
│       ├─ roles/page.tsx       # Role management
│       └─ permissions/page.tsx # Permission management
├─ globals.css
├─ layout.tsx
├─ not-found.tsx
└─ middleware.ts                # Tenant detection

components/
├─ ui/                          # shadcn/ui components
├─ sidebar.tsx                  # Navigation sidebar
├─ theme-provider.tsx           # Theme context
├─ theme-toggle.tsx             # Dark/light toggle
└─ query-provider.tsx           # React Query setup

stores/
├─ auth.ts                      # Authentication store
└─ tenant.ts                    # Tenant configuration store

lib/
├─ axios.ts                     # Tenant-aware HTTP client
└─ utils.ts                     # Utility functions
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kaely-suite-hotel-front
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE=https://api__TENANT__.kaelytechnology.com
   NEXT_PUBLIC_APP_NAME=Kaely Suite Hotel
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   - Visit `http://localhost:3000` (will default to Ixtapa tenant)
   - Or use tenant-specific URLs if you have local DNS setup

## 🌐 Development Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/kaely-suite-hotel-front)

1. **One-click deployment**
   - Click the "Deploy with Vercel" button above
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy!

2. **Manual deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   
   # Set environment variables
   vercel env add NEXT_PUBLIC_API_BASE
   vercel env add NEXT_PUBLIC_APP_NAME
   vercel env add NEXT_PUBLIC_APP_VERSION
   ```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_BASE=https://api__TENANT__.kaelytechnology.com
NEXT_PUBLIC_APP_NAME=Kaely Suite Hotel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🌍 Wildcard DNS Setup

To enable multi-tenant functionality with custom domains, you need to configure wildcard DNS.

### For Development (Local)

1. **Edit hosts file** (requires admin privileges)
   
   **Windows**: `C:\Windows\System32\drivers\etc\hosts`
   **macOS/Linux**: `/etc/hosts`
   
   Add these lines:
   ```
   127.0.0.1 ixtapa.localhost
   127.0.0.1 mazanillo.localhost
   127.0.0.1 huatulco.localhost
   ```

2. **Access tenant-specific URLs**
   - `http://ixtapa.localhost:3000`
   - `http://mazanillo.localhost:3000`
   - `http://huatulco.localhost:3000`

### For Production

1. **DNS Configuration**
   
   Add these DNS records to your domain:
   ```
   Type: A
   Name: ixtapa
   Value: [Your server IP]
   
   Type: A
   Name: mazanillo
   Value: [Your server IP]
   
   Type: A
   Name: huatulco
   Value: [Your server IP]
   ```

2. **Vercel Custom Domains**
   
   In your Vercel dashboard:
   - Go to Project Settings → Domains
   - Add custom domains:
     - `ixtapa.yourdomain.com`
     - `mazanillo.yourdomain.com`
     - `huatulco.yourdomain.com`

3. **Wildcard Domain (Advanced)**
   
   For automatic subdomain support:
   ```
   Type: CNAME
   Name: *
   Value: your-vercel-app.vercel.app
   ```

## 🏗️ Adding New Tenants

The system is designed to support dynamic tenant addition:

1. **Update middleware** (`middleware.ts`)
   ```typescript
   const validTenants = ['ixtapa', 'mazanillo', 'huatulco', 'newtenant']
   ```

2. **Add tenant configuration** (`stores/tenant.ts`)
   ```typescript
   const defaultConfigs: Record<string, TenantConfig> = {
     // ... existing tenants
     newtenant: {
       name: 'New Tenant Hotel',
       description: 'Beautiful beachfront resort',
       primaryColor: 'emerald',
       apiUrl: 'https://apinewtenant.kaelytechnology.com',
     },
   }
   ```

3. **Update environment**
   - Ensure API endpoint exists
   - Configure DNS records
   - Add custom domain in Vercel

## 🔐 Authentication

The app includes a complete authentication system:

- **Login/Register** forms with validation
- **JWT token** management with refresh
- **Protected routes** with automatic redirects
- **Persistent sessions** using localStorage
- **Multi-tenant** user isolation

### Demo Credentials

For testing purposes, use these demo credentials:
- **Email**: `admin@example.com`
- **Password**: `password123`

## 🎨 Theming

- **Dark/Light mode** toggle in header
- **Tenant-specific** color schemes
- **Responsive design** for all screen sizes
- **shadcn/ui** components for consistency

## 📱 Features

- ✅ **Multi-tenant** architecture
- ✅ **Responsive** design
- ✅ **Dark/Light** theme
- ✅ **Authentication** system
- ✅ **User management**
- ✅ **Role management**
- ✅ **Permission management**
- ✅ **Toast notifications**
- ✅ **Loading skeletons**
- ✅ **Form validation**
- ✅ **Error handling**
- ✅ **TypeScript** support

## 🐛 Troubleshooting

### Common Issues

1. **Tenant not detected**
   - Check hostname format
   - Verify middleware configuration
   - Ensure tenant exists in valid tenants list

2. **API connection failed**
   - Verify API endpoints are accessible
   - Check CORS configuration on backend
   - Confirm environment variables

3. **Authentication issues**
   - Clear localStorage and cookies
   - Check token expiration
   - Verify API authentication endpoints

### Development Tips

- Use browser dev tools to inspect network requests
- Check console for error messages
- Verify environment variables are loaded
- Test with different tenant subdomains

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: support@kaelytechnology.com
- Documentation: [docs.kaelytechnology.com](https://docs.kaelytechnology.com)