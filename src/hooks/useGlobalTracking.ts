import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useMixpanel } from './useMixpanel';
import { useAuth } from '../contexts/AuthContext';

interface TrackingElement {
  tagName: string;
  id?: string;
  className?: string;
  textContent?: string;
  href?: string;
  type?: string;
  role?: string;
  ariaLabel?: string;
  dataAttributes?: Record<string, string>;
  position?: {
    x: number;
    y: number;
  };
}

interface ClickEvent {
  element: TrackingElement;
  page: string;
  timestamp: string;
  sessionId: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  scrollPosition: {
    x: number;
    y: number;
  };
}

export const useGlobalTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { trackUserAction, trackButtonAnalytics, isTrackingEnabled } = useMixpanel();
  
  // Disable tracking on authentication pages to prevent refresh loops
  const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/register');
  const shouldTrack = isTrackingEnabled && !isAuthPage;

  // Utility function to safely convert className to string
  const safeClassNameToString = (className: string | DOMTokenList | undefined): string => {
    if (typeof className === 'string') return className;
    if (className && typeof className.toString === 'function') return className.toString();
    return '';
  };

  // Get or create persistent session ID from sessionStorage
  const getOrCreateSessionId = (): string => {
    const storageKey = 'mixpanel_session_id';
    const sessionStartKey = 'mixpanel_session_start';
    const sessionPagesKey = 'mixpanel_pages_visited';
    const sessionInteractionsKey = 'mixpanel_interactions_count';
    
    let sessionId = sessionStorage.getItem(storageKey);
    
    if (!sessionId) {
      // Create new session
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(storageKey, sessionId);
      sessionStorage.setItem(sessionStartKey, Date.now().toString());
      sessionStorage.setItem(sessionPagesKey, '1');
      sessionStorage.setItem(sessionInteractionsKey, '0');
      
      // Track session start
      if (shouldTrack && user?.id) {
        trackUserAction(
          'session_start',
          location.pathname,
          'session_tracking',
          'session_management',
          {
            sessionId,
            user_id: user.id,
            initial_page: location.pathname,
            timestamp: new Date().toISOString()
          }
        );
      }
    }
    
    return sessionId;
  };

  const sessionId = getOrCreateSessionId();

  // Track session end on unmount or before navigation
  useEffect(() => {
    const handleSessionEnd = () => {
      const sessionStartStr = sessionStorage.getItem('mixpanel_session_start');
      const pagesVisited = parseInt(sessionStorage.getItem('mixpanel_pages_visited') || '0');
      const interactions = parseInt(sessionStorage.getItem('mixpanel_interactions_count') || '0');
      
      if (sessionStartStr && shouldTrack && user?.id) {
        const sessionDuration = Date.now() - parseInt(sessionStartStr);
        
        trackUserAction(
          'session_end',
          location.pathname,
          'session_tracking',
          'session_management',
          {
            sessionId,
            user_id: user.id,
            session_duration_ms: sessionDuration,
            session_duration_seconds: Math.floor(sessionDuration / 1000),
            pages_per_session: pagesVisited,
            interactions_per_session: interactions,
            final_page: location.pathname,
            timestamp: new Date().toISOString()
          }
        );
      }
    };

    // Track session end before unload
    window.addEventListener('beforeunload', handleSessionEnd);
    
    return () => {
      window.removeEventListener('beforeunload', handleSessionEnd);
    };
  }, [shouldTrack, user?.id, sessionId, location.pathname, trackUserAction]);

  // Increment page count when location changes
  useEffect(() => {
    const currentPages = parseInt(sessionStorage.getItem('mixpanel_pages_visited') || '1');
    sessionStorage.setItem('mixpanel_pages_visited', (currentPages + 1).toString());
  }, [location.pathname]);

  // Extract element information for tracking
  const extractElementInfo = useCallback((element: HTMLElement): TrackingElement => {
    const rect = element.getBoundingClientRect();
    
    // Extract data attributes
    const dataAttributes: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        dataAttributes[attr.name] = attr.value;
      }
    });

    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: safeClassNameToString(element.className) || undefined,
      textContent: element.textContent?.trim() || undefined,
      href: (element as HTMLAnchorElement).href || undefined,
      type: (element as HTMLButtonElement).type || undefined,
      role: element.getAttribute('role') || undefined,
      ariaLabel: element.getAttribute('aria-label') || undefined,
      dataAttributes,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
    };
  }, []);

  // Determine element category and type
  const categorizeElement = useCallback((element: TrackingElement) => {
    const { tagName, className, role, type, href } = element;
    
    // Ensure className is a string for safe operations
    const classNameStr = safeClassNameToString(className);
    
    // Button categorization
    if (tagName === 'button' || role === 'button') {
      if (type === 'submit') return 'submit_button';
      if (classNameStr && (classNameStr.includes('primary') || classNameStr.includes('cta'))) return 'primary_button';
      if (classNameStr && classNameStr.includes('secondary')) return 'secondary_button';
      if (classNameStr && (classNameStr.includes('danger') || classNameStr.includes('delete'))) return 'danger_button';
      if (classNameStr && (classNameStr.includes('success') || classNameStr.includes('save'))) return 'success_button';
      return 'button';
    }
    
    // Link categorization
    if (tagName === 'a' || href) {
      if (href?.includes('http')) return 'external_link';
      if (href?.startsWith('#')) return 'anchor_link';
      if (classNameStr && (classNameStr.includes('nav') || classNameStr.includes('menu'))) return 'navigation_link';
      if (classNameStr && classNameStr.includes('social')) return 'social_link';
      return 'link';
    }
    
    // Input categorization
    if (tagName === 'input') {
      if (type === 'submit') return 'submit_input';
      if (type === 'button') return 'button_input';
      return 'input';
    }
    
    // Icon categorization
    if (classNameStr && (classNameStr.includes('icon') || classNameStr.includes('svg'))) return 'icon';
    
    // Card categorization
    if (classNameStr && classNameStr.includes('card')) return 'card';
    
    // Modal categorization
    if ((classNameStr && classNameStr.includes('modal')) || role === 'dialog') return 'modal';
    
    return 'other';
  }, []);

  // Determine element position on page
  const getElementPosition = useCallback((element: TrackingElement) => {
    const { tagName, className } = element;
    
    // Ensure className is a string for safe operations
    const classNameStr = safeClassNameToString(className);
    
    // Header elements
    if (classNameStr && (classNameStr.includes('header') || classNameStr.includes('nav'))) return 'header';
    
    // Sidebar elements
    if (classNameStr && (classNameStr.includes('sidebar') || classNameStr.includes('aside'))) return 'sidebar';
    
    // Footer elements
    if (classNameStr && classNameStr.includes('footer')) return 'footer';
    
    // Modal elements
    if (classNameStr && (classNameStr.includes('modal') || classNameStr.includes('dialog'))) return 'modal';
    
    // Content elements
    if (classNameStr && (classNameStr.includes('content') || classNameStr.includes('main'))) return 'content';
    
    // Form elements
    if (classNameStr && classNameStr.includes('form')) return 'form';
    
    // Table elements
    if (tagName === 'table' || (classNameStr && classNameStr.includes('table'))) return 'table';
    
    return 'content';
  }, []);

  // Track click event
  const trackClick = useCallback((event: MouseEvent) => {
    if (!shouldTrack) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    // Increment interaction count
    const currentInteractions = parseInt(sessionStorage.getItem('mixpanel_interactions_count') || '0');
    sessionStorage.setItem('mixpanel_interactions_count', (currentInteractions + 1).toString());

    // Skip tracking for certain elements
    const skipSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'textarea',
      'select',
      '[contenteditable="true"]',
      '.no-track',
      '[data-no-track]'
    ];

    const shouldSkip = skipSelectors.some(selector => {
      try {
        return target.matches(selector);
      } catch {
        return false;
      }
    });

    if (shouldSkip) return;

    const elementInfo = extractElementInfo(target);
    const category = categorizeElement(elementInfo);
    const position = getElementPosition(elementInfo);

    // Create click event data
    const clickEvent: ClickEvent = {
      element: elementInfo,
      page: location.pathname,
      timestamp: new Date().toISOString(),
      sessionId,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY
      }
    };

    // Generate comprehensive event name
    const eventName = `${elementInfo.tagName}_${category}_${position}_click`;
    const elementName = elementInfo.textContent || elementInfo.ariaLabel || elementInfo.id || `${elementInfo.tagName}_element`;
    
    // Track user action with detailed naming
    trackUserAction(
      eventName,
      location.pathname,
      'global_tracking',
      elementName,
      {
        element: elementInfo,
        category,
        position,
        sessionId,
        viewport: clickEvent.viewport,
        scrollPosition: clickEvent.scrollPosition,
        userEmail: user?.email,
        userName: user?.name,
        eventType: 'element_click',
        elementType: elementInfo.tagName,
        elementCategory: category,
        elementPosition: position
      }
    );

    // Track button analytics for buttons and links
    if (category.includes('button') || category.includes('link')) {
      const buttonId = elementInfo.id || `${category}_${Date.now()}`;
      const buttonText = elementInfo.textContent || elementInfo.ariaLabel || category;
      const buttonName = `${buttonText}_${category}_${position}`;
      
      trackButtonAnalytics(
        buttonId,
        buttonName,
        location.pathname,
        'global_tracking',
        position,
        1, // Single click
        sessionId,
        {
          category,
          element: elementInfo,
          viewport: clickEvent.viewport,
          scrollPosition: clickEvent.scrollPosition,
          userEmail: user?.email,
          userName: user?.name,
          buttonType: category,
          buttonPosition: position,
          buttonText: buttonText
        }
      );
    }

    // Log for debugging (only in development)
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('Tracked click:', {
        element: elementInfo,
        category,
        position,
        page: location.pathname
      });
    }
  }, [shouldTrack, location.pathname, sessionId, extractElementInfo, categorizeElement, getElementPosition, trackUserAction, trackButtonAnalytics, user?.email, user?.name]);

  // Track form submissions
  const trackFormSubmission = useCallback((event: Event) => {
    if (!shouldTrack) return;

    const form = event.target as HTMLFormElement;
    if (!form) return;

    const formData = new FormData(form);
    const formFields: Record<string, string> = {};
    
    // Extract form field names (without values for privacy)
    formData.forEach((_value, key) => {
      formFields[key] = 'submitted';
    });

    const formName = form.id || form.action || 'unknown_form';
    const formEventName = `form_${formName}_submit`;
    
    trackUserAction(
      formEventName,
      location.pathname,
      'form_submission',
      formName,
      {
        formId: form.id || 'unknown',
        formAction: form.action || 'unknown',
        formMethod: form.method || 'unknown',
        fieldCount: Object.keys(formFields).length,
        sessionId,
        userEmail: user?.email,
        userName: user?.name,
        eventType: 'form_submission',
        formFields: Object.keys(formFields)
      }
    );
  }, [shouldTrack, location.pathname, sessionId, trackUserAction, user?.email, user?.name]);

  // Track navigation events
  const trackNavigation = useCallback((_event: PopStateEvent) => {
    if (!shouldTrack) return;

    const navigationEventName = `navigation_${location.pathname.replace(/\//g, '_').substring(1)}_browser`;
    
    trackUserAction(
      navigationEventName,
      location.pathname,
      'navigation',
      'browser_navigation',
      {
        previousPath: document.referrer,
        currentPath: location.pathname,
        sessionId,
        userEmail: user?.email,
        userName: user?.name,
        eventType: 'browser_navigation',
        navigationType: 'popstate'
      }
    );
  }, [shouldTrack, location.pathname, sessionId, trackUserAction, user?.email, user?.name]);

  // Set up global event listeners
  useEffect(() => {
    if (!shouldTrack) return;

    // Track clicks
    document.addEventListener('click', trackClick, true);
    
    // Track form submissions
    document.addEventListener('submit', trackFormSubmission, true);
    
    // Track navigation
    window.addEventListener('popstate', trackNavigation);

    return () => {
      document.removeEventListener('click', trackClick, true);
      document.removeEventListener('submit', trackFormSubmission, true);
      window.removeEventListener('popstate', trackNavigation);
    };
  }, [shouldTrack, trackClick, trackFormSubmission, trackNavigation]);

  // Track page visibility changes
  useEffect(() => {
    if (!shouldTrack) return;

    const handleVisibilityChange = () => {
      const visibilityEventName = document.hidden ? 'page_hide' : 'page_show';
      const pageName = location.pathname.replace(/\//g, '_').substring(1) || 'home';
      
      trackUserAction(
        `${visibilityEventName}_${pageName}`,
        location.pathname,
        'page_visibility',
        'visibility_change',
        {
          hidden: document.hidden,
          sessionId,
          userEmail: user?.email,
          userName: user?.name,
          eventType: 'page_visibility',
          pageName: pageName
        }
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldTrack, location.pathname, sessionId, trackUserAction, user?.email, user?.name]);

  // Track scroll events (throttled)
  useEffect(() => {
    if (!shouldTrack) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        const scrollDepth = Math.round((currentScrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        
        if (Math.abs(currentScrollY - lastScrollY) > 100) { // Only track significant scrolls
          const scrollEventName = `scroll_${scrollDirection}_${Math.round(scrollDepth)}`;
          const pageName = location.pathname.replace(/\//g, '_').substring(1) || 'home';
          
          trackUserAction(
            `${scrollEventName}_${pageName}`,
            location.pathname,
            'scroll_tracking',
            'scroll',
            {
              scrollDirection,
              scrollDepth,
              scrollY: currentScrollY,
              sessionId,
              userEmail: user?.email,
              userName: user?.name,
              eventType: 'scroll',
              pageName: pageName,
              scrollPercentage: Math.round(scrollDepth)
            }
          );
          
          lastScrollY = currentScrollY;
        }
      }, 1000); // Throttle to 1 second
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [shouldTrack, location.pathname, sessionId, trackUserAction, user?.email, user?.name]);

  return {
    sessionId,
    isTrackingEnabled: shouldTrack
  };
}; 