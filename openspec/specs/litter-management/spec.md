# Litter management

## Purpose

Record and review a breeder's born cat or dog litters.

## Requirements

### Requirement: Create a litter

The app SHALL let an authenticated breeder create a litter with species, name, birth date, and reported litter size. The breeder MAY also provide parent names and notes.

#### Scenario: Valid litter is created

- **WHEN** an authenticated breeder submits valid litter details
- **THEN** the litter is saved under that breeder's account
- **AND** the app shows the created litter

#### Scenario: Invalid litter details are rejected

- **WHEN** a breeder submits an unsupported species, invalid or future date, empty name, or count outside the supported range
- **THEN** the request is rejected with a validation error
- **AND** no litter is created

### Requirement: List and view own litters

The app SHALL show a breeder only their own litters and allow them to open a litter's details.

#### Scenario: Breeder opens their litter list

- **WHEN** an authenticated breeder requests their litters
- **THEN** the response contains only litters owned by that breeder
- **AND** the list is ordered by birth date, newest first
- **AND** the response contains no more than 100 litters

#### Scenario: Breeder requests another user's or a missing litter

- **WHEN** a breeder requests a litter they do not own, or a litter that does not exist
- **THEN** the API returns the same not-found response
