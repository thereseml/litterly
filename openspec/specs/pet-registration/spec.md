# Pet registration

## Purpose

Register and maintain individual kittens or puppies within a born litter.

## Requirements

### Requirement: Register pets in a litter

The app SHALL let the litter owner register between 1 and 30 pets in one request. Each pet has a name, required sex, and optional notes. The litter's reported count is informational and is not a hard limit on the number of registered pets.

#### Scenario: Valid batch is registered

- **WHEN** the owner submits a valid batch for their litter
- **THEN** all pets in the batch are saved under that litter
- **AND** the API returns the created pets

#### Scenario: Invalid batch is rejected atomically

- **WHEN** a batch is empty, exceeds 30 pets, or contains a pet with invalid fields
- **THEN** the request is rejected
- **AND** no pet in the batch is created

### Requirement: View and edit pets

The app SHALL let the litter owner list, view, and edit pets in that litter. An edit MAY change a pet's name, sex, or notes, but SHALL NOT move it to another litter.

#### Scenario: Owner edits a pet

- **WHEN** the owner submits valid changes to an existing pet in their litter
- **THEN** the editable fields are updated

#### Scenario: Pet is outside the requested litter or is not owned by the requester

- **WHEN** the requester asks for or edits a pet outside their own litter
- **THEN** the API returns the same not-found response used for a missing resource
