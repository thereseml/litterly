# Spec Delta

## ADDED Requirements

### Requirement: Record dated offspring weights
The app SHALL let a litter owner add positive whole-number weight measurements in grams for any subset of offspring in a litter, using one shared date for each bulk entry. Each supplied weight SHALL be recorded as a separate measurement; offspring without a supplied weight SHALL remain unchanged.

#### Scenario: Owner records weights for a subset of offspring
- **WHEN** the owner submits weights for some offspring using a shared date
- **THEN** a dated measurement in grams is added for each offspring with a supplied weight
- **AND** no measurement is added for offspring with blank weights

#### Scenario: Owner records multiple measurements for one offspring on one date
- **WHEN** the owner submits another weight for an offspring on a date that already has a measurement
- **THEN** the new measurement is recorded separately without replacing the earlier measurement

#### Scenario: Invalid weight is rejected
- **WHEN** the owner submits a supplied weight that is not a positive whole number of grams
- **THEN** the weight entry is rejected
- **AND** no invalid measurement is recorded

### Requirement: Present weight entry as a dismissible bottom sheet
The litter-level weight-entry dialog SHALL slide up from the bottom of the screen and allow the owner to dismiss it with a downward swipe on its handle without saving unsent weights.

#### Scenario: Owner opens and dismisses weight entry
- **WHEN** the owner opens the weight-entry dialog and swipes down on its handle
- **THEN** the dialog closes
- **AND** no measurements are recorded for the unsent entries

### Requirement: View offspring weight history
The app SHALL show the litter owner all recorded weight measurements for an offspring, including multiple measurements on the same date, in chronological order.

#### Scenario: Owner views an offspring's weight history
- **WHEN** the owner opens an offspring with recorded weight measurements
- **THEN** the app shows each measurement with its date and weight in grams
- **AND** measurements are ordered by date from oldest to newest

#### Scenario: Offspring has no weight measurements
- **WHEN** the owner opens an offspring with no recorded weight measurements
- **THEN** the app indicates that no weights have been recorded

#### Scenario: Requester accesses weight history outside their own litter
- **WHEN** a requester asks to view weight measurements for an offspring in a litter they do not own
- **THEN** the request returns the same not-found behavior used for an inaccessible or missing offspring

### Requirement: List offspring oldest-added first
The app SHALL list a litter's offspring in order of when they were added, with the oldest offspring first. Offspring registered in the same batch SHALL retain their submitted order.

#### Scenario: Owner views offspring registered at different times
- **WHEN** the owner views the offspring list for a litter
- **THEN** offspring added earlier appear before offspring added later

#### Scenario: Owner views offspring registered in one batch
- **WHEN** the owner views offspring that were registered together
- **THEN** those offspring appear in the same order in which they were submitted
