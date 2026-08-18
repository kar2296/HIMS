import React from 'react';
import { createRoot } from 'react-dom/client';

// Make sure angular is available
declare var angular: any;

function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}

function clonePropsSnapshot(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const clone: any = { ...obj };
  if (obj.reactProps && typeof obj.reactProps === 'object') {
    clone.reactProps = { ...obj.reactProps };
    if (obj.reactProps.privileges && typeof obj.reactProps.privileges === 'object') {
      clone.reactProps.privileges = { ...obj.reactProps.privileges };
    }
  }
  return clone;
}

function isPropsSnapshotEqual(objA: any, objB: any): boolean {
  try {
    return JSON.stringify(objA) === JSON.stringify(objB);
  } catch (e) {
    return false;
  }
}

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
        let prevSnapshot: any = null;

        const renderComponent = (currentProps: any) => {
          const validProps = currentProps || {};
          const newSnapshot = clonePropsSnapshot(validProps);
          if (prevSnapshot && isPropsSnapshotEqual(prevSnapshot, newSnapshot)) {
            return;
          }
          prevSnapshot = newSnapshot;
          root.render(<Component {...validProps} />);
        };

        // Render immediately on mount
        renderComponent(scope.props || {});

        scope.$watch('props', (newProps: any) => {
          renderComponent(newProps || {});
        }, true);

        scope.$on('$destroy', () => {
          setTimeout(() => {
            root.unmount();
          }, 0);
        });
      }
    };
  })
  .directive('reactButton', function() {
    return {
      restrict: 'E',
      scope: {
        text: '@',
        variant: '@',
        size: '@',
        icon: '@',
        iconPosition: '@',
        disabled: '<',
        loading: '<',
        loadingText: '@',
        title: '@',
        onClick: '&',
        badgeCount: '<',
        fullWidth: '<',
        rounded: '@',
        className: '@',
        style: '<'
      },
      link: function(scope: any, element: any) {
        const Component = (window as any).ReactComponents?.Button;
        if (!Component) {
          console.error('React Button component not registered in window.ReactComponents!');
          return;
        }

        const root = createRoot(element[0]);

        const render = () => {
          const props = {
            text: scope.text,
            variant: scope.variant || 'primary',
            size: scope.size || 'md',
            icon: scope.icon,
            iconPosition: scope.iconPosition || 'left',
            disabled: scope.disabled,
            loading: scope.loading,
            loadingText: scope.loadingText,
            title: scope.title,
            badgeCount: scope.badgeCount,
            fullWidth: scope.fullWidth,
            rounded: scope.rounded || 'md',
            className: scope.className,
            style: scope.style,
            onClick: (e: any) => {
              if (scope.onClick) {
                scope.$apply(() => scope.onClick({ $event: e }));
              }
            }
          };
          root.render(<Component {...props} />);
        };

        scope.$watchGroup([
          'text', 'variant', 'size', 'icon', 'iconPosition',
          'disabled', 'loading', 'loadingText', 'title', 'badgeCount',
          'fullWidth', 'rounded', 'className'
        ], render);
        scope.$watch('style', render, true);

        scope.$on('$destroy', () => {
          setTimeout(() => {
            root.unmount();
          }, 0);
        });
      }
    };
  });


