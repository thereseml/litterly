# Authentication and data access

## Purpose

Protect breeder records while allowing each authenticated breeder to manage their own data.

## Requirements

### Requirement: Authenticate protected API requests

The API SHALL require a valid Supabase access token for litter and pet endpoints. Ownership SHALL be derived from the verified user identity, never from client-supplied ownership fields.

#### Scenario: Missing or invalid token

- **WHEN** a protected endpoint is called without a valid access token
- **THEN** the API rejects the request without returning protected data

#### Scenario: Client supplies ownership fields

- **WHEN** a create request includes a client-supplied owner identifier or another unsupported field
- **THEN** strict request validation rejects it

### Requirement: Enforce owner-scoped access in the database

Supabase Row Level Security SHALL restrict litter and pet access to the authenticated owner. API owner filters are defense in depth and SHALL NOT replace database policies.

#### Scenario: User attempts cross-account access

- **WHEN** an authenticated user attempts to read or change another user's litter or pets
- **THEN** the API and database policies prevent access
- **AND** the API does not reveal whether the other user's records exist
