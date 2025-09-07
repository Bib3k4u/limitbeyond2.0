import {
  Dumbbell,
  FileHeart,
  FolderHeartIcon,
  Heart,
  HeartHandshake,
  HeartHandshakeIcon,
  HeartIcon,
  HeartPulse,
  LucideHandHeart,
  LucideHeart,
  LucideMessageSquareHeart,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-lb-darker text-lb-text py-12 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-lb-accent" />
              <span className="text-xl font-bold gradient-text">
                LimitBeyond
              </span>
            </Link>
            <p className="text-lb-text-secondary text-sm">
              Your comprehensive gym management solution. Breaking the limits of
              what's possible in fitness administration.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://www.instagram.com/_zha_bibek_/"
                className="text-lb-text-secondary hover:text-lb-accent transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="https://x.com/zhabibek4u"
                className="text-lb-text-secondary hover:text-lb-accent transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/_zha_bibek_/"
                className="text-lb-text-secondary hover:text-lb-accent transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lb-text mb-4 text-lg">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-lb-text-secondary hover:text-lb-accent transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/#features"
                  className="text-lb-text-secondary hover:text-lb-accent transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/#about"
                  className="text-lb-text-secondary hover:text-lb-accent transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/signin"
                  className="text-lb-text-secondary hover:text-lb-accent transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/signup"
                  className="text-lb-text-secondary hover:text-lb-accent transition-colors"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lb-text mb-4 text-lg">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-lb-accent flex-shrink-0 mt-0.5" />
                <span className="text-lb-text-secondary">
                  I-31, LaxmiNagar, Lalita Park, Delhi, 110092
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-lb-accent flex-shrink-0" />
                <span className="text-lb-text-secondary">+91-8088620079</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-lb-accent flex-shrink-0" />
                <span className="text-lb-text-secondary">
                  zhabibek4u@gmail.com
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lb-text mb-4 text-lg">
              Newsletter
            </h3>
            <p className="text-lb-text-secondary text-sm mb-4">
              Subscribe to our newsletter for the latest updates and features.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email address"
                className="bg-lb-card text-lb-text px-4 py-2 rounded-l-md focus:outline-none focus:ring-1 focus:ring-lb-accent w-full"
              />
              <button className="bg-lb-accent text-white px-4 py-2 rounded-r-md hover:bg-lb-accent/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 text-center text-lb-text-secondary text-sm">
          <p>
            © {new Date().getFullYear()} LimitBeyond. All rights reserved.
            <p className="text-center text-md text-gray-200">
              Made with
              <HeartHandshakeIcon className="h-7 w-7 text-lb-accent animate-pulse inline-block mx-1" />
              for fitness enthusiasts — by{" "}
              <span className="text-lb-accent font-semibold tracking-widest">
                Bibek
              </span>
              .
            </p>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
