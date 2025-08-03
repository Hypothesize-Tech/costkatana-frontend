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

  // Generate session ID for this session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
      className: element.className || undefined,
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
    
    // Button categorization
    if (tagName === 'button' || role === 'button') {
      if (type === 'submit') return 'submit_button';
      if (className?.includes('primary') || className?.includes('cta')) return 'primary_button';
      if (className?.includes('secondary')) return 'secondary_button';
      if (className?.includes('danger') || className?.includes('delete')) return 'danger_button';
      if (className?.includes('success') || className?.includes('save')) return 'success_button';
      return 'button';
    }
    
    // Link categorization
    if (tagName === 'a' || href) {
      if (href?.includes('http')) return 'external_link';
      if (href?.startsWith('#')) return 'anchor_link';
      if (className?.includes('nav') || className?.includes('menu')) return 'navigation_link';
      if (className?.includes('social')) return 'social_link';
      return 'link';
    }
    
    // Input categorization
    if (tagName === 'input') {
      if (type === 'submit') return 'submit_input';
      if (type === 'button') return 'button_input';
      return 'input';
    }
    
    // Icon categorization
    if (className?.includes('icon') || className?.includes('svg')) return 'icon';
    
    // Card categorization
    if (className?.includes('card')) return 'card';
    
    // Modal categorization
    if (className?.includes('modal') || role === 'dialog') return 'modal';
    
    return 'other';
  }, []);

  // Determine element position on page
  const getElementPosition = useCallback((element: TrackingElement) => {
    const { tagName, className } = element;
    
    // Header elements
    if (className?.includes('header') || className?.includes('nav')) return 'header';
    
    // Sidebar elements
    if (className?.includes('sidebar') || className?.includes('aside')) return 'sidebar';
    
    // Footer elements
    if (className?.includes('footer')) return 'footer';
    
    // Modal elements
    if (className?.includes('modal') || className?.includes('dialog')) return 'modal';
    
    // Content elements
    if (className?.includes('content') || className?.includes('main')) return 'content';
    
    // Form elements
    if (className?.includes('form')) return 'form';
    
    // Table elements
    if (tagName === 'table' || className?.includes('table')) return 'table';
    
    return 'content';
  }, []);

  // Track click event
  const trackClick = useCallback((event: MouseEvent) => {
    if (!isTrackingEnabled) return;

    const target = event.target as HTMLElement;
    if (!target) return;

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
      console.log('Tracked click:', {
        element: elementInfo,
        category,
        position,
        page: location.pathname
      });
    }
  }, [isTrackingEnabled, location.pathname, sessionId, extractElementInfo, categorizeElement, getElementPosition, trackUserAction, trackButtonAnalytics]);

  // Track form submissions
  const trackFormSubmission = useCallback((event: Event) => {
    if (!isTrackingEnabled) return;

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
  }, [isTrackingEnabled, location.pathname, sessionId, trackUserAction]);

  // Track navigation events
  const trackNavigation = useCallback((_event: PopStateEvent) => {
    if (!isTrackingEnabled) return;

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
  }, [isTrackingEnabled, location.pathname, sessionId, trackUserAction]);

  // Set up global event listeners
  useEffect(() => {
    if (!isTrackingEnabled) return;

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
  }, [isTrackingEnabled, trackClick, trackFormSubmission, trackNavigation]);

  // Track page visibility changes
  useEffect(() => {
    if (!isTrackingEnabled) return;

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
  }, [isTrackingEnabled, location.pathname, sessionId, trackUserAction]);

  // Track scroll events (throttled)
  useEffect(() => {
    if (!isTrackingEnabled) return;

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
  }, [isTrackingEnabled, location.pathname, sessionId, trackUserAction]);

  return {
    sessionId,
    isTrackingEnabled
  };
}; 