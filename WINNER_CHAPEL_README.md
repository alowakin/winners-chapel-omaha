# Winner Chapel Website

A modern, responsive website for Winner Chapel with dynamic event management and an admin panel. Built with vanilla HTML, CSS, JavaScript, and Supabase for real-time data persistence.

## 🎯 Features

### Public Features
- **Home Page**: Welcoming landing page with chapel information and key details
- **Events Listing**: Display all upcoming church events in an organized, easy-to-browse format
- **Event Registration**: Users can register for events directly through the website
  - Form validation and user-friendly error handling
  - Registration data saved to Supabase in real-time
  - Confirmation feedback after successful registration

### Admin Features
- **Admin Authentication**: Secure login system for authorized chapel administrators
- **Event Management Dashboard**: Full CRUD operations for events
  - Create new events with details (date, time, description, capacity)
  - Read/view all events and registrations
  - Update event information
  - Delete events and manage registrations
- **Registration Tracking**: View all user registrations for each event
- **Real-time Updates**: Changes reflected instantly across the website

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Styling** | Bootstrap/Tailwind CSS (responsive design) |
| **Backend** | Supabase (PostgreSQL database + Auth) |
| **Hosting** | GitHub Pages |
| **Version Control** | Git & GitHub |

## 📋 Project Structure

```
winner-chapel-website/
├── index.html              # Home page
├── events.html             # Events listing page
├── register.html           # Event registration page
├── admin/
│   ├── login.html          # Admin login page
│   ├── dashboard.html      # Admin dashboard
│   └── admin.js            # Admin logic
├── css/
│   ├── styles.css          # Main stylesheet
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── app.js              # Main application logic
│   ├── events.js           # Event management functions
│   └── supabase-config.js  # Supabase initialization
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account (for backend setup)

### Deploy to GitHub Pages

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy Winner Chapel website"
   git push origin main
   ```

2. Enable GitHub Pages:
   - Go to **Settings → Pages**
   - Select **main** branch as source
   - Save

3. Your site will be live at: `https://alowakin.github.io/ChurchProject`

### Deploy to Vercel (Alternative)

1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Vercel automatically deploys on every push
3. Get a URL like: `winner-chapel.vercel.app`

## Responsive Design

- **Mobile-first approach** using Bootstrap/Tailwind
- Fully responsive on:
  - Mobile devices (320px and up)
  - Tablets (768px and up)
  - Desktops (1024px and up)
- Touch-friendly buttons and forms

## Security Considerations

- Admin credentials stored securely via Supabase Authentication
- Environment variables kept in `.gitignore` (API keys not committed)
- Form validation on both client and server side
- SQL injection protection through Supabase parameterized queries

## Customization

### Change Colors/Styling
- Edit `css/styles.css` to customize the chapel branding
- Update Bootstrap/Tailwind configuration as needed

### Add New Pages
- Create new `.html` files in the root directory
- Link them in the navigation menu
- Add corresponding JavaScript logic if needed

### Modify Events Schema
- Update Supabase table structure in database
- Update JavaScript functions in `js/events.js` to match new fields

## 📸 Features Highlight

### Event Registration Flow
1. User visits events page
2. Selects an event and clicks "Register"
3. Fills out registration form (name, email, etc.)
4. Data saved to Supabase in real-time
5. User receives confirmation message

### Admin Management Flow
1. Admin logs in with credentials
2. Dashboard shows all events and registrations
3. Can create/edit/delete events
4. Can view registered users per event
5. Real-time updates across the platform

## Testing

### Manual Testing Checklist
- [ ] Home page loads correctly
- [ ] Events list displays all events
- [ ] Event registration form submits successfully
- [ ] Admin login works with correct credentials
- [ ] Admin can create a new event
- [ ] Admin can view registrations
- [ ] Mobile responsive on phone/tablet
- [ ] All links navigate correctly

## Future Enhancements

- [ ] Email notifications for event registrations
- [ ] Event categories/filtering
- [ ] User account dashboard (track my registrations)
- [ ] Payment integration for ticketed events
- [ ] Calendar view for events
- [ ] Social media sharing
- [ ] Multi-language support

## Contributing

This is a portfolio project. For suggestions or improvements, feel free to open an issue or contact the developer.

##  License

This project is open source under the MIT License. See LICENSE file for details.

## 👨‍💻 Developer

**Isaac** - Full-stack developer based in Omaha, NE
- GitHub: [Isaac Dossavou](https://github.com/alowakin)
- LinkedIn: https://www.linkedin.com/in/isaac-dossavou-1970b8191

---

## About Winner Chapel

Winner Chapel is [add a brief mission statement or description about the chapel].

---

**Last Updated**: June 2026
