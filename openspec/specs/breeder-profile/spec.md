# breeder-profile Specification

## Purpose

Gives each signed-in breeder a private place to manage basic identity details and account access without making profile completion a prerequisite for using Litterly.

## Requirements

### Requirement: Manage optional private breeder details
The system SHALL let a signed-in breeder view and update their optional kennel name. The profile SHALL show the authenticated account email as read-only information and SHALL NOT collect or store a personal display name.

#### Scenario: View an account without saved profile details
- **WHEN** a signed-in breeder opens their profile before saving profile details
- **THEN** the kennel name is presented as empty and editable
- **AND** the authenticated account email is shown but cannot be edited there

#### Scenario: Save optional profile details
- **WHEN** a signed-in breeder saves a kennel name
- **THEN** the system stores the submitted details for that breeder
- **AND** the saved values are shown when the profile is viewed again

#### Scenario: Personal display name is not collected or retained
- **WHEN** the profile is viewed or updated
- **THEN** it contains no personal display-name field
- **AND** the system does not store personal display-name data

### Requirement: Keep profile details private to their owner
The system SHALL restrict profile reads and updates to the authenticated breeder who owns the profile, deriving ownership from verified authentication rather than client-supplied identifiers.

#### Scenario: Unauthenticated profile access
- **WHEN** a request to read or update a profile has no valid authenticated identity
- **THEN** the system rejects the request without returning or changing profile data

#### Scenario: Attempt to access another breeder's profile
- **WHEN** an authenticated breeder attempts to read or update another breeder's profile
- **THEN** the system prevents access without revealing whether that profile exists

### Requirement: Reach profile and sign out from the signed-in app
The signed-in app SHALL provide a profile control in its header on app screens. The profile screen SHALL provide sign-out, and profile access SHALL preserve the app's normal nested-screen back navigation.

#### Scenario: Open profile from a signed-in screen
- **WHEN** a breeder selects the profile control from a signed-in app screen
- **THEN** the app opens that breeder's profile
- **AND** the current screen's normal back navigation remains available on nested screens

#### Scenario: Sign out from profile
- **WHEN** a breeder selects sign out from their profile screen
- **THEN** the app ends the local signed-in session and returns to the sign-in screen
