import { useLocation } from 'react-router-dom';

export function useActiveNavItem() {
    const location = useLocation();
    
    const routeToNameMap = {
        '/': 'Schema',
        '/home-page': 'Schema',
        '/schema': 'Schema',
        '/visualise': 'Visualise', 
        '/sources': 'Sources',
        '/products': 'Products',
        '/transactions': 'Transactions',
        '/clients': 'Clients',
        '/routines': 'Routines',
        '/alerts': 'Alerts'
    };

    const path = location.pathname;
    
    // Check exact matches first
    if (routeToNameMap[path]) {
        return routeToNameMap[path];
    }
    
    // Check if it's a coming-soon page for a specific feature
    if (path.startsWith('/coming-soon')) {
        // Extract the intended feature from the path
        const featureMatch = path.match(/\/coming-soon\/(.+)/);
        if (featureMatch && featureMatch[1]) {
            const feature = featureMatch[1];
            const featureName = feature.charAt(0).toUpperCase() + feature.slice(1);
            // Check if this feature exists in our route map
            if (Object.values(routeToNameMap).includes(featureName)) {
                return featureName;
            }
        }
        
        // If no specific feature, try to determine from URL structure
        // or query parameters, or default based on common patterns
        console.log(path);
        if (path.includes('visualise')) {
            return 'Visualise';
        } else if (path.includes('sources')) {
            return 'Sources';
        } else if (path.includes('products')) {
            return 'Products';
        } else if (path.includes('transactions')) {
            return 'Transactions';
        } else if (path.includes('clients')) {
            return 'Clients';
        } else if (path.includes('routines')) {
            return 'Routines';
        } else if (path.includes('alerts')) {
            return 'Alerts';
        }
    }
}