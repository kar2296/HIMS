import React from 'react';
import { createRoot, Root } from 'react-dom/client';

// Make sure angular is available
declare var angular: any;

angular.module('app.reactBridge', [])
  .directive('reactComponent', function() {
    return {
      restrict: 'E',
      scope: {
        name: '@',
        props: '<'
      },
      link: function(scope: any, element: any) {
        const componentName = scope.name;
        const Component = (window as any).ReactComponents?.[componentName];

        if (!Component) {
          console.error(`React component ${componentName} not found! Did you register it in window.ReactComponents?`);
          return;
        }

        const root = createRoot(element[0]);

        scope.$watch('props', (newProps: any) => {
          root.render(<Component {...(newProps || {})} />);
        }, true);

        scope.$on('$destroy', () => {
          // Wrap in a setTimeout to avoid React complaining about synchronous unmounts during renders
          setTimeout(() => {
            root.unmount();
          }, 0);
        });
      }
    };
  });
