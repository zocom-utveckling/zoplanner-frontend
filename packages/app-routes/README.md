# app-routes

This package was started as a routing refactor to replace the current flat route setup in `packages/core/router` with a nested React Router structure.

## Purpose

The goal is to move shared application concerns into a centralized layout route instead of handling them separately in each page.

Intended improvements:

- Shared authenticated app layout
- Centralized user/auth handling
- Shared Navbar + Sidebar rendering
- Reduced duplicated user-fetch logic
- Centralized route path constants
- Cleaner route/domain grouping
- Easier long-term scaling of dashboard features

The intended structure is based on nested routes using `DashboardLayout` + `<Outlet />`.

## Current state

`packages/core/router` is still the active router used by the application.

`app-routes` is only partially wired in and currently acts as a started abstraction layer/refactor foundation.

Some files (such as `appRoutes.config.js`) may already be imported by parts of the UI, but the nested route structure itself is not yet connected to the active `createBrowserRouter()` setup.

## Migration required to fully switch over

To complete the migration:

1. Replace the flat route array in `packages/core/router`
2. Introduce nested routes using `DashboardLayout`
3. Move authenticated/dashboard pages into `children`
4. Render shared layout/UI through `<Outlet />`
5. Move shared user-loading/auth logic into layout-level components/hooks
6. Verify navigation paths and relative route behavior
7. Remove duplicated layout/user-fetch logic from individual pages after migration

## Important

This refactor was started to improve maintainability and routing structure, but was not completed or activated in production routing.