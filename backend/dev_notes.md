# Development Notes

This file is for personal notes about important concepts, code explanations, or reminders during development.
It is configured to be ignored by Git and will not be pushed to the repository.

## Important Concepts:

##-------------------------------------------------------------------------------------------------------------
// req.params: For identifying specific resources within the URL path (e.g., /products/456). 
// req.query: For adding filter criteria or optional parameters to the URL (e.g., /products?color=blue&sort=asc). 
// req.body: For sending larger, often sensitive or structured, data from the client to the server, typically in POST or PUT requests. 
##-------------------------------------------------------------------------------------------------------------

### 1. ownerId vs. parentId in Folders:
*   **ownerId**: Identifies the user who created and owns the folder (primary administrative control).
*   **parentId**: Establishes the folder's hierarchical location by pointing to its immediate parent folder's 
ID. A `null` parentId means a top-level folder.

## Reminders:

*   **Authentication:** Always include `Authorization: Bearer YOUR_JWT_TOKEN` header for protected routes.
*   **Database Changes:** Always run `pnpm prisma migrate dev` after changing `schema.prisma`.
*   **Prisma Client:** Restart the backend server (`pnpm run dev`) after any database schema or Prisma client (`pnpm prisma generate`) changes to ensure the application uses the latest client.
*   **Postman Collection:** Organize your tests in a Postman Collection and use environment variables for `BASE_URL` and `JWT_TOKEN`.
*   **Edge Cases:** Always test for invalid inputs, unauthorized access, non-existent IDs, and other error conditions.
