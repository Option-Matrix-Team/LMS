export const routes = {
    // Auth routes
    login: "/login",

    // Dashboard
    dashboard: "/dashboard",

    // Catalog management
    catalog: "/catalog",

    // Member management
    members: "/members",

    // Borrowing
    borrowings: "/borrowings",
    overdue: "/overdue",

    // System Operator routes
    libraries: "/libraries",
    users: "/users",

    // Library Admin routes
    librarians: "/librarians",
    policies: "/policies",
} as const;
